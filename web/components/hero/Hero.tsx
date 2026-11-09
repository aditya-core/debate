"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import RibbonCanvas from "./RibbonCanvas";
import { prefersReducedMotion } from "@/lib/tiers";

export default function Hero() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const artRef = useRef<HTMLDivElement | null>(null);
  const eyebrowRef = useRef<HTMLParagraphElement | null>(null);
  const subRef = useRef<HTMLParagraphElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const introRef = useRef(0);

  /* ---------------------------------------------------------------
     Entrance choreography.
     One timeline drives both the DOM and the canvas, so the thread of
     light and the first line of type arrive together.
  ---------------------------------------------------------------- */
  useEffect(() => {
    const reduced = prefersReducedMotion();

    if (reduced) {
      introRef.current = 1;
      const nodes = [
        eyebrowRef.current,
        subRef.current,
        descRef.current,
        ctaRef.current,
        bottomRef.current,
      ];
      nodes.forEach((n) => n && ((n.style.opacity = "1"), (n.style.transform = "none")));
      sectionRef.current
        ?.querySelectorAll<HTMLElement>(".js-mask-inner")
        .forEach((n) => (n.style.transform = "none"));
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.12 });

      // The artwork blooms while the type arrives.
      tl.to(introRef, { current: 1, duration: 2.9, ease: "power2.inOut" }, 0);

      tl.fromTo(
        eyebrowRef.current,
        { opacity: 0, y: 10 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
        0.25,
      );

      tl.fromTo(
        ".js-mask-inner",
        { yPercent: 112 },
        {
          yPercent: 0,
          duration: 1.5,
          ease: "expo.out",
          stagger: 0.13,
        },
        0.45,
      );

      tl.fromTo(
        subRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
        1.05,
      );

      tl.fromTo(
        descRef.current,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
        1.25,
      );

      tl.fromTo(
        ctaRef.current,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power3.out" },
        1.45,
      );

      tl.fromTo(
        bottomRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.4, ease: "power2.out" },
        1.9,
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  /* ---------------------------------------------------------------
     Scroll: the artwork recedes rather than disappearing, and the copy
     lifts away — a transition, not a cut.
  ---------------------------------------------------------------- */
  useEffect(() => {
    if (prefersReducedMotion()) return;

    let ticking = false;

    const update = () => {
      ticking = false;
      const section = sectionRef.current;
      if (!section) return;

      const vh = window.innerHeight;
      const y = Math.min(window.scrollY, vh);
      const p = y / vh; // 0 → 1 across the first viewport

      if (contentRef.current) {
        contentRef.current.style.opacity = String(Math.max(0, 1 - p * 1.15));
        contentRef.current.style.transform = `translate3d(0, ${-p * 56}px, 0)`;
      }
      if (artRef.current) {
        artRef.current.style.opacity = String(Math.max(0.18, 1 - p * 0.75));
        artRef.current.style.transform = `scale(${1 + p * 0.1}) translate3d(0, ${p * 40}px, 0)`;
      }
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      id="top"
      ref={sectionRef}
      className="hero-shell relative isolate w-full overflow-hidden"
    >
      {/* Atmosphere — depth behind the artwork, never competing with it. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(120%_90%_at_78%_45%,rgba(121,69,232,0.16),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_18%_18%,rgba(37,139,255,0.10),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_105%,rgba(83,216,232,0.08),transparent_60%)]" />
        {/* Legibility scrim under the copy; keeps the H1 crisp over motion. */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(16,17,29,0.96)_0%,rgba(16,17,29,0.86)_40%,rgba(16,17,29,0.5)_60%,rgba(16,17,29,0)_84%)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(180deg,transparent,rgba(16,17,29,0.95))]" />
      </div>

      <div ref={artRef} className="absolute inset-0 will-change-transform">
        <RibbonCanvas intro={introRef} />
      </div>

      <div
        ref={contentRef}
        className="hero-shell relative z-10 mx-auto flex w-full max-w-[1440px] flex-col justify-center px-6 pt-28 pb-32 sm:px-8 lg:px-14 lg:pb-28"
      >
        <div className="max-w-[54rem]">
          <p ref={eyebrowRef} className="eyebrow mb-7 flex items-center gap-3">
            <span className="inline-block h-[1px] w-8 bg-aqua/60" />
            The power of communication
          </p>

          <h1 className="font-display text-[clamp(2.2rem,7.1vw,6.5rem)] font-medium leading-[0.94] tracking-[-0.035em] text-paper">
            <span className="js-mask">
              <span className="js-mask-inner block">Unlock the power</span>
            </span>
            <span className="js-mask">
              <span className="js-mask-inner block gradient-text">
                of your words.
              </span>
            </span>
          </h1>

          <p
            ref={subRef}
            className="js-reveal mt-8 max-w-[36ch] font-display text-[clamp(1.05rem,1.7vw,1.4rem)] font-normal leading-[1.45] text-paper/90"
          >
            Think clearly. Speak confidently.{" "}
            <span className="text-paper">Communicate exceptionally.</span>
          </p>

          <p
            ref={descRef}
            className="js-reveal mt-5 max-w-[52ch] text-[0.975rem] leading-[1.7] text-paper/55 sm:text-base"
          >
            An intelligent communication training experience designed to help you
            sharpen your thinking, strengthen your expression and make your voice
            matter.
          </p>

          <div ref={ctaRef} className="js-reveal mt-10 flex flex-wrap items-center gap-x-7 gap-y-4">
            <a href="/signup" className="btn-primary">
              Begin your journey
              <span aria-hidden="true" className="text-[1.05em] leading-none">
                ↗
              </span>
            </a>
            <a href="#explore" className="btn-ghost">
              Discover the experience
              <span aria-hidden="true" className="arrow text-[0.9em]">
                ↓
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom rail */}
      <div
        ref={bottomRef}
        className="js-reveal pointer-events-none absolute inset-x-0 bottom-0 z-10 mx-auto hidden w-full max-w-[1440px] items-end justify-between px-6 pb-8 sm:flex sm:px-8 lg:px-14"
      >
        <div className="flex items-center gap-4 font-display text-[0.7rem] uppercase tracking-[0.34em] text-paper/70">
          <span className="stage-word">Think</span>
          <span aria-hidden="true" className="text-aqua/40">
            ·
          </span>
          <span className="stage-word">Express</span>
          <span aria-hidden="true" className="text-aqua/40">
            ·
          </span>
          <span className="stage-word">Impact</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="font-display text-[0.7rem] uppercase tracking-[0.34em] text-paper/50">
            Scroll to explore
          </span>
          <span aria-hidden="true" className="scroll-cue-line" />
        </div>
      </div>
    </section>
  );
}
