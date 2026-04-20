"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff } from "lucide-react";

/**
 * Displays a fixed bottom bar showing online/offline status.
 * – Slides up when network changes.
 * – Auto-hides the "back online" notice after 3 s.
 * – WCAG: uses role="status" and aria-live="polite".
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Initialise from current state
    setIsOnline(navigator.onLine);

    let hideTimer: ReturnType<typeof setTimeout>;

    const handleOnline = () => {
      setIsOnline(true);
      setVisible(true);
      // Auto-hide the "back online" banner after 3 s
      hideTimer = setTimeout(() => setVisible(false), 3000);
    };

    const handleOffline = () => {
      clearTimeout(hideTimer);
      setIsOnline(false);
      setVisible(true);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={`offline-bar ${isOnline ? "online" : "offline"}`}
    >
      {isOnline ? (
        <>
          <Wifi size={16} aria-hidden="true" />
          <span>Back online – syncing your data…</span>
        </>
      ) : (
        <>
          <WifiOff size={16} aria-hidden="true" />
          <span>You're offline. Actions will sync when reconnected.</span>
        </>
      )}
    </div>
  );
}
