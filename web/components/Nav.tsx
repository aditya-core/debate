"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";

const LINKS = [
  { label: "How it works", href: "/#how" },
  { label: "Worlds", href: "/#worlds" },
  { label: "Progress", href: "/develop" },
  { label: "Vision", href: "/#vision" },
];

export function Mark({ size = 26 }: { size?: number }) {
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
        <linearGradient id="gow-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-brand)" />
          <stop offset="55%" stopColor="var(--c-sky)" />
          <stop offset="100%" stopColor="var(--c-aqua)" />
        </linearGradient>
      </defs>
      <path d="M2.6 18.2h7.6" stroke="url(#gow-mark)" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M6 12h9" stroke="url(#gow-mark)" strokeWidth="2.4" strokeLinecap="round" opacity="0.8" />
      <path d="M9.6 5.8h11.8" stroke="url(#gow-mark)" strokeWidth="2.4" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
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
