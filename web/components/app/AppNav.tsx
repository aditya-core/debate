"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS = [
  {
    href: "/dashboard",
    label: "Home",
    icon: (
      <path
        d="M3 10.5 12 3l9 7.5M5.5 9.5V21h13V9.5"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: "/welcome",
    label: "Practice",
    icon: (
      <>
        <rect x="9" y="2.5" width="6" height="11" rx="3" strokeWidth="1.6" />
        <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
  {
    href: "/account",
    label: "Account",
    icon: (
      <>
        <circle cx="12" cy="8" r="3.6" strokeWidth="1.6" />
        <path d="M4.8 20.2c1.1-3.6 3.8-5.4 7.2-5.4s6.1 1.8 7.2 5.4" strokeWidth="1.6" strokeLinecap="round" />
      </>
    ),
  },
] as const;

/**
 * The two shapes of the same navigation.
 *
 * Desktop gets a rail, phones get a thumb-reachable bar at the bottom. Both are
 * rendered from one list so they cannot drift apart — the previous failure mode
 * with a separate mobile menu is a link that exists in one and not the other.
 */
export default function AppNav({ variant }: { variant: "side" | "bottom" }) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(`${href}/`));

  if (variant === "side") {
    return (
      <nav aria-label="Main" className="mt-7 flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center gap-2.5 rounded-xl px-3 py-2 font-display text-[0.82rem] transition-colors",
                active
                  ? "border border-brand/30 bg-brand-soft text-fg"
                  : "border border-transparent text-muted hover:bg-surface-2 hover:text-fg",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className="h-4 w-4 shrink-0">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>
    );
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-canvas/95 backdrop-blur-md md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-3">
        {ITEMS.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-col items-center gap-1 py-2.5 text-[0.62rem] font-display uppercase tracking-[0.12em] transition-colors",
                active ? "text-fg" : "text-faint",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true" className="h-5 w-5">
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
