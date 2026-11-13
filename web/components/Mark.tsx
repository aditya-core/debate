"use client";

import { useId } from "react";

/**
 * The wordmark, on its own.
 *
 * It lives here rather than in Nav because the signed-in app shells import it
 * and must not pull a scroll listener along with it.
 *
 * The gradient id is per-instance (useId) because two Marks can be on one page —
 * the desktop rail and the mobile bar both render one, and the hidden copy used
 * to win the `url(#…)` lookup, painting nothing at all.
 */
export function Mark({ size = 26 }: { size?: number }) {
  const gradientId = `gow-mark-${useId().replace(/:/g, "")}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        {/* userSpaceOnUse, not the default objectBoundingBox: every path in this
            mark is a horizontal line, so its bounding box has zero height and an
            objectBoundingBox gradient has nothing to paint across. */}
        <linearGradient
          id={gradientId}
          gradientUnits="userSpaceOnUse"
          x1="2"
          y1="19"
          x2="22"
          y2="5"
        >
          {/* style, not attribute: CSS custom properties are not resolved in
              SVG presentation attributes. */}
          <stop offset="0%" style={{ stopColor: "var(--c-brand)" }} />
          <stop offset="55%" style={{ stopColor: "var(--c-sky)" }} />
          <stop offset="100%" style={{ stopColor: "var(--c-aqua)" }} />
        </linearGradient>
      </defs>
      <path d="M2.6 18.2h7.6" stroke={`url(#${gradientId})`} strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 12h9" stroke={`url(#${gradientId})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <path d="M9.6 5.8h11.8" stroke={`url(#${gradientId})`} strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}
