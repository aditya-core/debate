"use client";

import { useEffect, useRef, useState } from "react";
import { detectTier, TIER_CONFIG, type Tier } from "@/lib/tiers";

/**
 * The hero's signature artwork: three interweaving streams of light.
 *
 * Deliberately NOT a Three.js scene in this pass. A hand-tuned 2D particle
 * field costs ~0 KB of dependencies, holds 60fps on a mid-range Android, and
 * — because every particle follows a continuous velocity field rather than a
 * linear tween — produces the organic, non-repeating drift that pre-set
 * particle systems never do.
 *
 * Storyboard, compressed to what actually reads on screen:
 *   1. a single horizontal thread of light appears at the centre
 *   2. the thread dissolves into particles
 *   3. the particles fan into their own bands
 *   4. it settles into continuous, slow, breathing motion
 */

const INK = [16, 17, 29] as const;

type ColourSet = { rgb: [number, number, number] };

const STREAMS: ColourSet[] = [
  { rgb: [121, 69, 232] }, // brand violet
  { rgb: [37, 139, 255] }, // sky
  { rgb: [83, 216, 232] }, // aqua
  { rgb: [227, 79, 191] }, // flare
];

const BAND_CENTRE = [0.36, 0.52, 0.63, 0.45];
const BAND_PHASE = [0, 1.9, 3.6, 5.2];
const STREAM_PICK = [0, 0, 0, 1, 1, 1, 2, 2, 3]; // weighted toward violet/sky

const BUCKETS: Particle[][] = [[], [], [], []];

type Particle = {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  c: number;
  speed: number;
};

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export default function RibbonCanvas({
  intro,
}: {
  intro: { current: number };
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);

  // Decide the tier once, on the client.
  useEffect(() => {
    setTier(detectTier());
  }, []);

  useEffect(() => {
    if (tier === null || tier === 3) return;

    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const config = TIER_CONFIG[tier];
    let width = 0;
    let height = 0;
    let dpr = 1;
    let seeded = false;

    const particles: Particle[] = [];
    let activeCount = config.particles;

    const pointer = { tx: 0, ty: 0, x: 0, y: 0 };
    let raf = 0;
    let running = true;
    let last = performance.now();
    let elapsed = 0;

    // Frame-time watchdog: if the device lies about its tier, believe the
    // device. We degrade rather than stutter.
    let frameSum = 0;
    let frameSamples = 0;

    function spawn(p: Particle, atCentre: boolean) {
      p.x = Math.random() * width;
      p.y = atCentre
        ? height * 0.5 + (Math.random() - 0.5) * 10
        : height * (BAND_CENTRE[p.c] + (Math.random() - 0.5) * 0.22);
      p.px = p.x;
      p.py = p.y;
      p.vx = (Math.random() - 0.5) * 0.6;
      p.vy = (Math.random() - 0.5) * 0.6;
      p.speed = 0.55 + Math.random() * 1.15;
    }

    function seed() {
      particles.length = 0;
      for (let i = 0; i < config.particles; i++) {
        const c = STREAM_PICK[Math.floor(Math.random() * STREAM_PICK.length)];
        const p: Particle = {
          x: 0,
          y: 0,
          px: 0,
          py: 0,
          vx: 0,
          vy: 0,
          c,
          speed: 1,
        };
        spawn(p, true);
        particles.push(p);
      }
    }

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      const nextW = Math.round(rect.width);
      const nextH = Math.round(rect.height);

      // Layout has not produced a box yet — seeding at zero width would
      // collapse every particle onto x=0.
      if (nextW < 2 || nextH < 2) return;

      const nextDpr = Math.min(window.devicePixelRatio || 1, config.dprCap);

      if (nextW === width && nextH === height && nextDpr === dpr) return;

      const sx = width > 0 ? nextW / width : 1;
      const sy = height > 0 ? nextH / height : 1;

      width = nextW;
      height = nextH;
      dpr = nextDpr;

      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (!seeded) {
        seed();
        seeded = true;
      } else {
        for (const p of particles) {
          p.x *= sx;
          p.y *= sy;
          p.px = p.x;
          p.py = p.y;
        }
      }

      ctx!.fillStyle = `rgb(${INK[0]},${INK[1]},${INK[2]})`;
      ctx!.fillRect(0, 0, width, height);
    }

    /**
     * A continuous velocity field. Sum of three waves at different
     * frequencies so the motion never visibly repeats.
     */
    function angleAt(x: number, y: number, t: number): number {
      const nx = x / width;
      const ny = y / height;
      return (
        Math.sin(nx * 3.4 + t * 0.24) * 1.7 +
        Math.cos(ny * 2.6 - t * 0.19) * 1.45 +
        Math.sin((nx + ny) * 2.2 + t * 0.13) * 1.05
      );
    }

    function draw(now: number) {
      raf = requestAnimationFrame(draw);
      if (!running) {
        last = now;
        return;
      }

      const dtMs = Math.min(48, now - last);
      last = now;
      const dt = dtMs / 16.6667;
      elapsed += dtMs / 1000;

      frameSum += dtMs;
      frameSamples += 1;
      if (frameSamples >= 90) {
        const avg = frameSum / frameSamples;
        if (avg > 24 && activeCount > 420) {
          activeCount = Math.round(activeCount * 0.6);
        }
        frameSum = 0;
        frameSamples = 0;
      }

      // Pointer parallax, eased.
      pointer.x += (pointer.tx - pointer.x) * 0.045;
      pointer.y += (pointer.ty - pointer.y) * 0.045;

      // Fade the previous frame instead of clearing it — this is what turns
      // points into ribbons.
      ctx!.globalCompositeOperation = "source-over";
      ctx!.fillStyle = `rgba(${INK[0]},${INK[1]},${INK[2]},${config.trailFade})`;
      ctx!.fillRect(0, 0, width, height);

      ctx!.save();
      ctx!.translate(pointer.x, pointer.y);

      const raw = Math.max(0, Math.min(1, intro.current));
      const bloom = easeOutCubic(raw);
      const centreY = height * 0.5;

      ctx!.globalCompositeOperation = "lighter";
      ctx!.lineCap = "round";

      const step = Math.max(1, Math.floor(particles.length / activeCount));
      for (let b = 0; b < BUCKETS.length; b++) BUCKETS[b].length = 0;

      for (let i = 0; i < particles.length; i += step) {
        const p = particles[i];
        p.px = p.x;
        p.py = p.y;

        const a = angleAt(p.x, p.y, elapsed);
        p.vx += Math.cos(a) * 0.055 * p.speed * dt;
        p.vy += Math.sin(a) * 0.055 * p.speed * dt;

        // Gentle attraction toward this particle's own stream so the field
        // reads as three ribbons rather than one cloud of noise.
        const bandY =
          height *
          (BAND_CENTRE[p.c] +
            0.05 * Math.sin(p.x * 0.0016 + elapsed * 0.5 + BAND_PHASE[p.c]));
        p.vy += (bandY - p.y) * 0.00042 * dt;

        p.vx *= Math.pow(0.975, dt);
        p.vy *= Math.pow(0.975, dt);

        p.x += p.vx * dt * 1.35;
        p.y += p.vy * dt * 1.35;

        // Wrap, but never draw the wrap-around segment.
        let wrapped = false;
        const margin = 30;
        if (p.x < -margin) {
          p.x = width + margin;
          wrapped = true;
        } else if (p.x > width + margin) {
          p.x = -margin;
          wrapped = true;
        }
        if (p.y < -margin) {
          p.y = height + margin;
          wrapped = true;
        } else if (p.y > height + margin) {
          p.y = -margin;
          wrapped = true;
        }
        if (wrapped) {
          p.px = p.x;
          p.py = p.y;
          continue;
        }

        BUCKETS[p.c].push(p);
      }

      // Draw per stream: four paths per frame instead of 2,400.
      for (let c = 0; c < BUCKETS.length; c++) {
        const bucket = BUCKETS[c];
        if (bucket.length === 0) continue;
        const { rgb } = STREAMS[c];
        ctx!.beginPath();
        for (const p of bucket) {
          // Before the bloom completes, everything is compressed toward the
          // centre line: one thread of light opening into three streams.
          const k = 0.02 + 0.98 * bloom;
          const y0 = centreY + (p.py - centreY) * k;
          const y1 = centreY + (p.y - centreY) * k;
          ctx!.moveTo(p.px, y0);
          ctx!.lineTo(p.x, y1);
        }
        ctx!.strokeStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${0.42 * bloom})`;
        ctx!.lineWidth = config.lineWidth;
        ctx!.stroke();
      }

      // The seed thread: brightest at the very start, gone once the
      // streams exist on their own.
      const beamLife = 1 - Math.min(1, raw / 0.55);
      if (beamLife > 0.01) {
        const halfWidth = width * (0.06 + 0.44 * bloom);
        const grad = ctx!.createLinearGradient(
          width / 2 - halfWidth,
          0,
          width / 2 + halfWidth,
          0,
        );
        grad.addColorStop(0, "rgba(121,69,232,0)");
        grad.addColorStop(0.35, `rgba(121,69,232,${0.5 * beamLife})`);
        grad.addColorStop(0.5, `rgba(248,248,252,${0.85 * beamLife})`);
        grad.addColorStop(0.65, `rgba(83,216,232,${0.5 * beamLife})`);
        grad.addColorStop(1, "rgba(83,216,232,0)");

        ctx!.strokeStyle = grad;
        ctx!.lineWidth = 1.4;
        ctx!.beginPath();
        ctx!.moveTo(width / 2 - halfWidth, centreY);
        ctx!.lineTo(width / 2 + halfWidth, centreY);
        ctx!.stroke();
      }

      ctx!.restore();
    }

    const onPointerMove = (event: PointerEvent) => {
      const rect = wrap!.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width - 0.5;
      const ny = (event.clientY - rect.top) / rect.height - 0.5;
      pointer.tx = nx * 26;
      pointer.ty = ny * 18;
    };

    const onVisibility = () => {
      running = document.visibilityState === "visible";
      last = performance.now();
    };

    const onResize = () => resize();

    const ro = new ResizeObserver(onResize);
    ro.observe(wrap);
    resize();

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("resize", onResize);

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("resize", onResize);
    };
  }, [tier, intro]);

  if (tier === 3) return null;

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block h-full w-full opacity-60 sm:opacity-90" />
    </div>
  );
}
