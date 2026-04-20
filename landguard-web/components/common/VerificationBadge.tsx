"use client";

import { useEffect, useRef, useState } from "react";
import { CheckCircle } from "lucide-react";

interface VerificationBadgeProps {
  /** Whether the entity is verified */
  verified: boolean;
  /** Animate the stamp on mount */
  animate?: boolean;
  /** Optional extra className */
  className?: string;
}

/**
 * A "stamp" badge that plays a scale+rotate animation on mount
 * to give the impression of an official ink stamp.
 * – Accessible: includes aria-label describing the state.
 * – Respects prefers-reduced-motion.
 */
export function VerificationBadge({
  verified,
  animate = true,
  className = "",
}: VerificationBadgeProps) {
  const [playing, setPlaying] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!verified || !animate) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return;

    // Observe when badge enters viewport, then trigger animation
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlaying(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [verified, animate]);

  if (!verified) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded
          bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400 ${className}`}
        aria-label="Not verified"
      >
        Unverified
      </span>
    );
  }

  return (
    <span
      ref={ref}
      className={`badge-stamp ${playing ? "animate" : ""} ${className}`}
      aria-label="Verified property"
      role="img"
    >
      <CheckCircle size={12} aria-hidden="true" />
      Verified
    </span>
  );
}
