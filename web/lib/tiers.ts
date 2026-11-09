/**
 * Device tiering.
 *
 * The hero must feel alive on a ₹15k Android and cinematic on a desktop.
 * Those are not the same renderer. We decide at boot, cheaply, and we are
 * honest about the signals we trust:
 *
 *  - `deviceMemory` / `hardwareConcurrency` are useful but absent on Safari.
 *  - User-agent sniffing is not used. It lies, and it ages badly.
 *  - The only ground truth is measuring the actual frame loop, which we do
 *    after mount and use to downgrade if reality disagrees with the guess.
 *
 * Tier 1 — full particle field, 2x DPR cap
 * Tier 2 — reduced field, 1x DPR
 * Tier 3 — no canvas at all; CSS/SVG atmosphere only
 */

export type Tier = 1 | 2 | 3;

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: {
    effectiveType?: string;
    saveData?: boolean;
  };
};

export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function detectTier(): Tier {
  if (typeof window === "undefined") return 2;

  // Accessibility wins over ambition, always.
  if (prefersReducedMotion()) return 3;

  const nav = navigator as NavigatorWithHints;
  const memory = nav.deviceMemory ?? 8;
  const cores = nav.hardwareConcurrency ?? 8;
  const conn = nav.connection?.effectiveType;
  const saveData = nav.connection?.saveData === true;

  // Data saver or a genuinely slow network: don't ship motion.
  if (saveData) return 3;
  if (conn === "slow-2g" || conn === "2g") return 3;

  // WebGL/canvas unavailable → static.
  const probe = document.createElement("canvas");
  const has2d = Boolean(probe.getContext("2d"));
  if (!has2d) return 3;

  if (memory <= 3) return 3;
  if (cores <= 4) return 2;
  if (memory <= 6) return 2;
  if (conn === "3g") return 2;

  return 1;
}

export const TIER_CONFIG: Record<
  Tier,
  { particles: number; dprCap: number; trailFade: number; lineWidth: number }
> = {
  1: { particles: 2400, dprCap: 2, trailFade: 0.085, lineWidth: 1.35 },
  2: { particles: 900, dprCap: 1, trailFade: 0.12, lineWidth: 1.15 },
  3: { particles: 0, dprCap: 1, trailFade: 0, lineWidth: 0 },
};
