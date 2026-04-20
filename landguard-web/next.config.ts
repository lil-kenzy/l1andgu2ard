import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Resolve the backend origin for CSP connect-src.
// NEXT_PUBLIC_BACKEND_URL is the server root (no trailing slash, no /api suffix).
// In production this should be e.g. https://api.landguard.gov.gh
const backendOrigin = (() => {
  const raw =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "";
  if (!raw) return "";
  // Strip any /api suffix and trailing slash to get just the origin
  return raw.replace(/\/api$/, "").replace(/\/$/, "");
})();

// Content-Security-Policy directives
const cspDirectives = [
  "default-src 'self'",
  // Scripts: self + inline for Next.js hydration (nonce-based ideal but hash fallback)
  `script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval'" : ""}`.trimEnd(),
  // Styles: self + inline for Tailwind + third-party map tiles
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  // Fonts
  "font-src 'self' https://fonts.gstatic.com data:",
  // Images: self + data URIs + OpenStreetMap/Mapbox tiles + S3 hosted assets
  "img-src 'self' data: blob: https://*.tile.openstreetmap.org https://*.openstreetmap.org https://nominatim.openstreetmap.org https://*.amazonaws.com",
  // Connect: self (for /api/* proxy routes) + backend origin + socket.io (wss/ws) + OSM nominatim
  [
    "connect-src 'self'",
    "wss:",
    "ws:",
    "https://nominatim.openstreetmap.org",
    backendOrigin,
  ]
    .filter(Boolean)
    .join(" "),
  // Frames: deny by default
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // Upgrade insecure requests in production
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
]
  .filter(Boolean)
  .join("; ");

const securityHeaders = [
  // HSTS – 2-year max-age, include subdomains, preload
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  // Prevent MIME-type sniffing
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Block framing (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Enable XSS filter in legacy browsers
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // Referrer policy
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Permissions policy – restrict sensitive browser features
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=()",
  },
  // CSP
  { key: "Content-Security-Policy", value: cspDirectives },
  // Cross-Origin policies
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Embedder-Policy", value: "unsafe-none" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Required for the Docker multi-stage build: copies only the minimal server
  // bundle into the runtime image (~10x smaller than a full install).
  output: "standalone",

  // Apply security headers to every route
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },

  // Image optimisation – allow remote patterns for user avatars / property photos
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "**.s3.amazonaws.com" },
    ],
  },

  // Compress responses
  compress: true,

  // Powered-by header removal
  poweredByHeader: false,
};

export default nextConfig;
