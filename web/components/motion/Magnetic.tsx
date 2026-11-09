"use client";

import { useRef, type ReactNode } from "react";

/**
 * Pulls its child toward the pointer. Desktop-only by design: on touch there
 * is no hover, and on a phone the gesture would just fight the scroll.
 *
 * The transform is written straight to the node — no state, no re-render.
 */
export default function Magnetic({
  children,
  strength = 0.22,
  className = "",
}: {
  children: ReactNode;
  strength?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const origin = useRef<{ x: number; y: number } | null>(null);

  function onEnter() {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    origin.current = { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function onMove(e: React.PointerEvent<HTMLSpanElement>) {
    const el = ref.current;
    if (!el || !origin.current || e.pointerType !== "mouse") return;
    const dx = e.clientX - origin.current.x;
    const dy = e.clientY - origin.current.y;
    el.style.transform = `translate3d(${dx * strength}px, ${dy * strength * 0.7}px, 0)`;
  }

  function onLeave() {
    const el = ref.current;
    origin.current = null;
    if (el) el.style.transform = "translate3d(0, 0, 0)";
  }

  return (
    <span
      ref={ref}
      onPointerEnter={onEnter}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`magnetic ${className}`}
    >
      {children}
    </span>
  );
}
