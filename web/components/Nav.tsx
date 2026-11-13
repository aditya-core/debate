"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Mark } from "./Mark";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Worlds", href: "/#worlds" },
  { label: "Progress", href: "/develop" },
  { label: "Vision", href: "/#vision" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const progress = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // One listener drives both the header state and the progress hairline.
    // The bar is written straight to the node so scrolling never re-renders.
    const onScroll = () => {
      setScrolled(window.scrollY > 12);
      const el = progress.current;
      if (!el) return;
      const doc = document.documentElement;
      const max = doc.scrollHeight - doc.clientHeight;
      el.style.transform = `scaleX(${max > 0 ? Math.min(1, doc.scrollTop / max) : 0})`;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* how far through the page you are — a hairline, not a widget */}
      <span aria-hidden="true" className="scroll-progress">
        <span ref={progress} className="scroll-progress-bar" />
      </span>

      <header
        className={[
        "sticky top-0 z-50 transition-all duration-500",
        scrolled
          ? "border-b border-line bg-canvas/80 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
        <nav
          aria-label="Primary"
          className="shell flex h-[70px] items-center justify-between gap-6"
        >
        <Link href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-[0.8rem] font-medium uppercase tracking-[0.24em] text-fg">
            Gift of Words
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="link-underline font-display text-[0.85rem] text-muted hover:text-fg"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link
            href="/signin"
            className="link-underline px-1 font-display text-[0.85rem] text-muted hover:text-fg"
          >
            Sign in
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Get started
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-full border border-line"
          >
            <span
              className={[
                "block h-[1.5px] bg-fg transition-all duration-300",
                open ? "translate-y-[6.5px] rotate-45" : "",
              ].join(" ")}
              style={{ width: 18 }}
            />
            <span
              className={[
                "block h-[1.5px] bg-fg transition-all duration-300",
                open ? "opacity-0" : "opacity-100",
              ].join(" ")}
              style={{ width: 18 }}
            />
            <span
              className={[
                "block h-[1.5px] bg-fg transition-all duration-300",
                open ? "-translate-y-[6.5px] -rotate-45" : "",
              ].join(" ")}
              style={{ width: 18 }}
            />
          </button>
        </div>
        </nav>
      </header>

      {/* Mobile panel — outside <header>: when the header has a backdrop
          filter, it becomes the containing block for fixed children. */}
      <div
        id="mobile-menu"
        className={[
          "fixed inset-0 z-40 flex flex-col justify-between bg-canvas px-6 pb-10 pt-24 transition-all duration-300 md:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="flex flex-col">
          {LINKS.map((l, i) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${70 + i * 55}ms` : "0ms" }}
              className={[
                "border-b border-line py-4 font-display text-2xl tracking-tight text-fg transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/signin"
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? "290ms" : "0ms" }}
            className={[
              "border-b border-line py-4 font-display text-2xl tracking-tight text-muted transition-all duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
            ].join(" ")}
          >
            Sign in
          </Link>
        </div>

        <Link
          href="/signup"
          onClick={() => setOpen(false)}
          className="btn btn-primary w-full"
        >
          Begin your journey <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </>
  );
}
