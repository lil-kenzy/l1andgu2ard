"use client";

/**
 * DocumentViewer.tsx
 * Secure document viewer with:
 *  - Dynamic watermark overlay (userId + timestamp)
 *  - Right-click / context-menu disabled
 *  - Drag-and-drop disabled
 *  - Keyboard Save shortcut (Ctrl/Cmd+S) blocked
 *
 * Usage:
 *   <DocumentViewer
 *     documentId="abc123"
 *     fileName="land-title.pdf"
 *     mimeType="application/pdf"
 *   />
 */

import { useEffect, useRef, useState } from "react";
import { documentsAPI } from "@/lib/api/client";
import { getClientSession } from "@/lib/auth/session";

interface DocumentViewerProps {
  documentId: string;
  fileName?: string;
  mimeType?: string;
  className?: string;
}

export default function DocumentViewer({
  documentId,
  fileName,
  mimeType,
  className = "",
}: DocumentViewerProps) {
  const [accessUrl, setAccessUrl] = useState<string | null>(null);
  const [watermark, setWatermark] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLoading(true);
    documentsAPI
      .viewDocument(documentId)
      .then((res) => {
        const data = res.data?.data;
        setAccessUrl(data?.accessUrl || null);
        if (data?.watermark?.text) {
          setWatermark(data.watermark.text);
        } else {
          // Fallback watermark from local session
          const { token } = getClientSession();
          setWatermark(`LANDGUARD | ${new Date().toISOString()}`);
        }
      })
      .catch(() => setError("Unable to load document. Please try again."))
      .finally(() => setLoading(false));
  }, [documentId]);

  // Block right-click context menu, drag, and Ctrl/Cmd+S
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventDrag = (e: DragEvent) => e.preventDefault();
    const preventSaveShortcut = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
      }
    };

    el.addEventListener("contextmenu", preventContextMenu);
    el.addEventListener("dragstart", preventDrag);
    document.addEventListener("keydown", preventSaveShortcut);

    return () => {
      el.removeEventListener("contextmenu", preventContextMenu);
      el.removeEventListener("dragstart", preventDrag);
      document.removeEventListener("keydown", preventSaveShortcut);
    };
  }, []);

  const isPdf =
    mimeType === "application/pdf" ||
    (fileName ?? "").toLowerCase().endsWith(".pdf");

  const isImage =
    mimeType?.startsWith("image/") ||
    /\.(jpe?g|png|gif|webp)$/i.test(fileName ?? "");

  if (loading) {
    return (
      <div className={`flex items-center justify-center min-h-64 bg-slate-100 dark:bg-slate-800 rounded-xl ${className}`}>
        <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Loading document…</p>
      </div>
    );
  }

  if (error || !accessUrl) {
    return (
      <div className={`flex items-center justify-center min-h-64 bg-red-50 dark:bg-red-900/20 rounded-xl ${className}`}>
        <p className="text-sm text-red-600 dark:text-red-400">{error || "Document unavailable."}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative select-none overflow-hidden rounded-xl bg-slate-900 ${className}`}
      style={{ userSelect: "none", WebkitUserSelect: "none" }}
    >
      {/* Watermark overlay — diagonal repeating pattern */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center"
        style={{ overflow: "hidden" }}
      >
        {Array.from({ length: 9 }).map((_, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap text-white/10 font-mono text-xs font-semibold"
            style={{
              transform: `rotate(-30deg) translate(${((i % 3) - 1) * 260}px, ${(Math.floor(i / 3) - 1) * 180}px)`,
              letterSpacing: "0.05em",
            }}
          >
            {watermark}
          </span>
        ))}
      </div>

      {/* Document content */}
      {isPdf && (
        <iframe
          src={`${accessUrl}#toolbar=0&navpanes=0&scrollbar=0`}
          className="w-full min-h-[600px] border-0"
          title={fileName || "Document"}
          // Prevent the browser's built-in download button (best-effort via sandbox)
          sandbox="allow-scripts allow-same-origin"
        />
      )}

      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={accessUrl}
          alt={fileName || "Document"}
          className="w-full object-contain"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          onDragStart={(e) => e.preventDefault()}
        />
      )}

      {!isPdf && !isImage && (
        <div className="flex items-center justify-center min-h-64 text-slate-400 text-sm">
          Preview not available for this file type.
          <br />
          <span className="text-xs mt-1">{fileName}</span>
        </div>
      )}
    </div>
  );
}
