/**
 * LandGuard Service Worker
 * - Caches static assets and map tiles for offline use
 * - Intercepts failed requests and serves cached versions
 * - Syncs queued offline actions when back online
 */

const CACHE_VERSION = "v1";
const STATIC_CACHE = `landguard-static-${CACHE_VERSION}`;
const MAP_TILE_CACHE = `landguard-tiles-${CACHE_VERSION}`;
const API_CACHE = `landguard-api-${CACHE_VERSION}`;

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  "/",
  "/offline",
  "/favicon.ico",
  "/robots.txt",
];

// Maximum number of map tiles to cache (to avoid excessive storage use)
const MAX_TILE_ENTRIES = 500;
// API cache duration: 5 minutes
const API_CACHE_SECONDS = 300;

// ── Install ────────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(STATIC_ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ───────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) =>
                key !== STATIC_CACHE &&
                key !== MAP_TILE_CACHE &&
                key !== API_CACHE
            )
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ──────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests we don't handle
  if (request.method !== "GET") return;

  // Map tile caching (OpenStreetMap)
  if (
    url.hostname.endsWith("tile.openstreetmap.org") ||
    url.hostname.endsWith("openstreetmap.org")
  ) {
    event.respondWith(cacheFirstWithLimit(request, MAP_TILE_CACHE, MAX_TILE_ENTRIES));
    return;
  }

  // Same-origin navigation: network-first, fall back to cached shell
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/").then((r) => r || new Response("Offline", { status: 503 }))
      )
    );
    return;
  }

  // Static assets (_next/static, images, fonts): cache-first
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/img/") ||
    url.pathname.match(/\.(woff2?|ttf|otf|eot|svg|ico|png|jpg|jpeg|webp|avif)$/)
  ) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // Everything else: network only
});

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Cache-first: return cache hit; otherwise fetch + cache. */
async function cacheFirstStrategy(request, cacheName) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

/** Cache-first with a max entry limit (LRU-style via timestamp metadata). */
async function cacheFirstWithLimit(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (!response.ok) return response;

    // Prune oldest entries if over the limit
    const keys = await cache.keys();
    if (keys.length >= maxEntries) {
      await cache.delete(keys[0]);
    }
    cache.put(request, response.clone());
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

// ── Background sync ────────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "landguard-offline-sync") {
    event.waitUntil(flushOfflineQueue());
  }
});

async function flushOfflineQueue() {
  // Notify all open clients to flush their IndexedDB queue
  const clients = await self.clients.matchAll({ type: "window" });
  clients.forEach((client) =>
    client.postMessage({ type: "FLUSH_OFFLINE_QUEUE" })
  );
}
