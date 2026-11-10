"use client";

import { useEffect } from "react";

/**
 * One listener for the whole page: whatever card the pointer is over gets a
 * spotlight that follows it (`--mx`/`--my`, read by CSS in `.spot::before`).
 *
 * Behaviour-only — it renders nothing, so the cards stay server components.
 * Fine pointers only: on touch there is no hover to track.
 */
export default function SpotlightCursor() {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return;
    }

    let frame = 0;

    function onMove(event: PointerEvent) {
      if (frame) return;

      const x = event.clientX;
      const y = event.clientY;
      const target = event.target as Element | null;

      frame = requestAnimationFrame(() => {
        frame = 0;
        const card = target?.closest?.(".spot") as HTMLElement | null;
        if (!card) return;
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${x - rect.left}px`);
        card.style.setProperty("--my", `${y - rect.top}px`);
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
    };
  }, []);

  return null;
}
