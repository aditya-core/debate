"use client";

import { useEffect, useState } from "react";

const LINKS = [
  { label: "Explore", href: "#explore" },
  { label: "Our Vision", href: "#vision" },
];

function Mark() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className="shrink-0"
    >
      <defs>
        <linearGradient id="gow-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7945E8" />
          <stop offset="55%" stopColor="#258BFF" />
          <stop offset="100%" stopColor="#53D8E8" />
        </linearGradient>
      </defs>
      {/* Three lines of text resolving into one voice. */}
      <path
        d="M3.2 17.4h7.2"
        stroke="url(#gow-mark)"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      <path
        d="M6.4 12h8.6"
        stroke="url(#gow-mark)"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.85"
      />
      <path
        d="M9.8 6.6H21"
        stroke="url(#gow-mark)"
        strokeWidth="2.1"
        strokeLinecap="round"
        opacity="0.7"
      />
    </svg>
  );
}

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
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
    <header
      className={[
        "fixed inset-x-0 top-0 z-40 transition-all duration-700",
        scrolled
          ? "border-b border-paper/[0.07] bg-ink/70 backdrop-blur-xl"
          : "border-b border-transparent bg-transparent",
      ].join(" ")}
    >
      <nav
        aria-label="Primary"
        className="mx-auto flex h-[68px] w-full max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-14"
      >
        <a
          href="#top"
          className="group flex items-center gap-2.5"
          aria-label="Gift of Words — home"
        >
          <Mark />
          <span className="font-display text-[0.78rem] font-medium uppercase tracking-[0.28em] text-paper/85 transition-colors duration-500 group-hover:text-paper">
            Gift of Words
          </span>
        </a>

        <div className="hidden items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <a key={link.href} href={link.href} className="nav-link">
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <a href="/signin" className="nav-link">
            Sign in
          </a>
          <a href="/signup" className="btn-nav">
            Get started
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          className="relative z-50 flex h-10 w-10 flex-col items-center justify-center gap-[5px] md:hidden"
        >
          <span
            className={[
              "block h-[1.5px] w-5 bg-paper transition-all duration-500",
              open ? "translate-y-[6.5px] rotate-45" : "",
            ].join(" ")}
          />
          <span
            className={[
              "block h-[1.5px] w-5 bg-paper transition-all duration-300",
              open ? "opacity-0" : "opacity-100",
            ].join(" ")}
          />
          <span
            className={[
              "block h-[1.5px] w-5 bg-paper transition-all duration-500",
              open ? "-translate-y-[6.5px] -rotate-45" : "",
            ].join(" ")}
          />
        </button>
      </nav>

      {/* Full-screen mobile panel */}
      <div
        id="mobile-menu"
        className={[
          "fixed inset-0 z-40 flex flex-col justify-center bg-ink/97 px-8 backdrop-blur-2xl transition-all duration-500 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      >
        <div className="flex flex-col gap-2">
          {LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              style={{ transitionDelay: open ? `${80 + i * 60}ms` : "0ms" }}
              className={[
                "border-b border-paper/[0.07] py-5 font-display text-3xl tracking-tight text-paper/85 transition-all duration-500",
                open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
              ].join(" ")}
            >
              {link.label}
            </a>
          ))}
          <a
            href="/signin"
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? "200ms" : "0ms" }}
            className={[
              "border-b border-paper/[0.07] py-5 font-display text-3xl tracking-tight text-paper/85 transition-all duration-500",
              open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            ].join(" ")}
          >
            Sign in
          </a>
        </div>

        <a
          href="/signup"
          onClick={() => setOpen(false)}
          className="btn-primary mt-10 w-fit"
        >
          Begin your journey <span aria-hidden="true">↗</span>
        </a>
      </div>
    </header>
  );
}
