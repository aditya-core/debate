"use client";

import { useEffect, useRef } from "react";

/**
 * Counts to a number once, when it scrolls into view. Reduced motion gets the
 * final value immediately — the number is information, not decoration.
 */
export default function CountUp({
  to,
  from = 0,
  decimals = 0,
  duration = 1500,
  prefix = "",
  suffix = "",
  className = "",
}: {
  to: number;
  from?: number;
  decimals?: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const format = (v: number) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || !("IntersectionObserver" in window)) {
      el.textContent = format(to);
      return;
    }

    let frame = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        io.disconnect();

        const start = performance.now();
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration);
          // ease-out cubic — lands softly, never overshoots
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(from + (to - from) * eased);
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );

    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [to, from, decimals, duration, prefix, suffix]);

  return (
    <span ref={ref} className={className}>
      {format(from)}
    </span>
  );
}
