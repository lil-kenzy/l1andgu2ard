/**
 * offlineQueue.ts
 *
 * IndexedDB-backed offline action queue for the web app.
 *
 * Usage:
 *   import { useOfflineQueue } from "@/lib/offlineQueue";
 *
 *   const { isOnline, enqueue, flush } = useOfflineQueue({
 *     onFlush: async (action) => { await api.doSomething(action.payload); }
 *   });
 */

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type QueuedAction = {
  id: string;
  type: string;
  payload: unknown;
  createdAt: number;
  retries: number;
};

const DB_NAME = "landguard-offline";
const STORE_NAME = "queue";
const DB_VERSION = 1;

// ── IndexedDB helpers ──────────────────────────────────────────────────────────

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbPut(action: QueuedAction): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(action);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function dbGetAll(): Promise<QueuedAction[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export type UseOfflineQueueOptions = {
  /** Called for each action when flushing. Throw to keep action in the queue. */
  onFlush: (action: QueuedAction) => Promise<void>;
  /** Max retry count before discarding a failed action (default: 5). */
  maxRetries?: number;
};

export function useOfflineQueue({ onFlush, maxRetries = 5 }: UseOfflineQueueOptions) {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const [queueLength, setQueueLength] = useState(0);
  const flushing = useRef(false);
  const onFlushRef = useRef(onFlush);
  onFlushRef.current = onFlush;

  // Sync queue length counter
  const refreshCount = useCallback(async () => {
    if (typeof indexedDB === "undefined") return;
    const items = await dbGetAll();
    setQueueLength(items.length);
  }, []);

  // Flush all queued actions in order
  const flush = useCallback(async () => {
    if (flushing.current || !navigator.onLine) return;
    flushing.current = true;
    try {
      const actions = await dbGetAll();
      for (const action of actions) {
        try {
          await onFlushRef.current(action);
          await dbDelete(action.id);
        } catch {
          // Increment retry count; discard if over limit
          const updated = { ...action, retries: action.retries + 1 };
          if (updated.retries >= maxRetries) {
            await dbDelete(action.id);
          } else {
            await dbPut(updated);
          }
        }
      }
    } finally {
      flushing.current = false;
      refreshCount();
    }
  }, [maxRetries, refreshCount]);

  // Enqueue a new action
  const enqueue = useCallback(
    async (type: string, payload: unknown) => {
      if (typeof indexedDB === "undefined") return;
      const action: QueuedAction = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        type,
        payload,
        createdAt: Date.now(),
        retries: 0,
      };
      await dbPut(action);
      refreshCount();

      // If already online, try to flush immediately
      if (navigator.onLine) {
        flush();
      } else if ("serviceWorker" in navigator && "SyncManager" in window) {
        // Register background sync
        const reg = await navigator.serviceWorker.ready;
        await (reg as ServiceWorkerRegistration & { sync?: { register: (tag: string) => Promise<void> } }).sync?.register("landguard-offline-sync");
      }
    },
    [flush, refreshCount]
  );

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      flush();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    refreshCount();

    // Listen for service worker FLUSH_OFFLINE_QUEUE message
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === "FLUSH_OFFLINE_QUEUE") flush();
    };
    navigator.serviceWorker?.addEventListener("message", handleMessage);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      navigator.serviceWorker?.removeEventListener("message", handleMessage);
    };
  }, [flush, refreshCount]);

  return { isOnline, queueLength, enqueue, flush };
}
