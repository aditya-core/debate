"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** The flame mark, amber, so the studio has its own identity. */
export function ForgeMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="forge-flame" gradientUnits="userSpaceOnUse" x1="6" y1="21" x2="19" y2="4">
          <stop offset="0%" style={{ stopColor: "var(--s-amber-lo)" }} />
          <stop offset="60%" style={{ stopColor: "var(--s-amber)" }} />
          <stop offset="100%" style={{ stopColor: "var(--s-amber-hi)" }} />
        </linearGradient>
      </defs>
      <path
        d="M13.7 2.4c.5 3.1-1.3 4.4-2.6 5.9-1.5 1.7-2.7 3.2-2.7 5.6a5.6 5.6 0 0 0 11.2 0c0-2.2-1-3.6-2-5"
        stroke="url(#forge-flame)"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.4 9.6C7.6 11.4 6.4 13.2 6.4 15.4A5.6 5.6 0 0 0 12 21"
        stroke="url(#forge-flame)"
        strokeWidth="1.7"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

const ICONS = {
  home: (
    <path d="M3.5 10.5 12 3.6l8.5 6.9V20a1 1 0 0 1-1 1h-4.6v-6.2H9.1V21H4.5a1 1 0 0 1-1-1z" />
  ),
  book: (
    <>
      <path d="M4 4.8h6.2a2 2 0 0 1 2 2V21a2 2 0 0 0-2-1.8H4z" />
      <path d="M20 4.8h-5.8a2 2 0 0 0-2 2V21a2 2 0 0 1 2-1.8H20z" />
    </>
  ),
  arena: (
    <>
      <circle cx="12" cy="12" r="7.5" />
      <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20h16" />
      <path d="M7 20v-6M12 20V8M17 20v-9" />
    </>
  ),
  history: (
    <>
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="2.8" />
      <path d="M19.4 14.4a7.6 7.6 0 0 0 0-4.8l1.6-1.2-1.9-3.3-1.9.8a7.6 7.6 0 0 0-4.1-2.4L12.8 1.5h-3.8l-.3 2a7.6 7.6 0 0 0-4.1 2.4l-1.9-.8L.8 8.4l1.6 1.2a7.6 7.6 0 0 0 0 4.8L.8 15.6l1.9 3.3 1.9-.8a7.6 7.6 0 0 0 4.1 2.4l.3 2h3.8l.3-2a7.6 7.6 0 0 0 4.1-2.4l1.9.8 1.9-3.3z" />
    </>
  ),
} as const;

const ITEMS: Array<{
  label: string;
  href?: string;
  icon: keyof typeof ICONS;
  soon?: boolean;
}> = [
  { label: "Home", href: "/dashboard", icon: "home" },
  { label: "Learn", icon: "book", soon: true },
  { label: "AI Arena", href: "/welcome", icon: "arena" },
  { label: "My Progress", href: "/dashboard#progress", icon: "chart" },
  { label: "Practice History", icon: "history", soon: true },
];

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-[18px] w-[18px] shrink-0"
    >
      {ICONS[name]}
    </svg>
  );
}

/**
 * The studio rail.
 *
 * Two of these five destinations do not exist yet, and they are rendered as
 * disabled rows rather than links that pretend: a nav that 404s is worse than a
 * nav that says "later".
 */
export default function Sidebar({ initials = "GW" }: { initials?: string }) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 hidden h-[100svh] w-[15.5rem] shrink-0 flex-col border-r border-[var(--s-line)] px-4 py-6 lg:flex">
      <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
        <ForgeMark />
        <span className="font-display text-[0.95rem] font-semibold tracking-[-0.01em] text-[var(--s-fg)]">
          Gift of Words
        </span>
      </Link>

      <nav aria-label="Main" className="mt-8 flex flex-col gap-1">
        {ITEMS.map((item) => {
          const active = item.href ? pathname === item.href.split("#")[0] : false;

          if (!item.href || item.soon) {
            return (
              <span
                key={item.label}
                aria-disabled="true"
                title="Arrives with the lesson library"
                className="flex cursor-default items-center gap-3 rounded-xl px-3 py-2.5 text-[0.85rem] text-[var(--s-faint)]"
              >
                <Icon name={item.icon} />
                {item.label}
                <span className="ml-auto rounded-full border border-[var(--s-line)] px-1.5 py-0.5 font-display text-[0.5rem] uppercase tracking-[0.12em]">
                  soon
                </span>
              </span>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.85rem] transition-colors",
                active
                  ? "s-nav-active font-medium"
                  : "text-[var(--s-muted)] hover:bg-white/[0.04] hover:text-[var(--s-fg)]",
              ].join(" ")}
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-1 border-t border-[var(--s-line)] pt-4">
        <Link
          href="/account"
          className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.85rem] text-[var(--s-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--s-fg)]"
        >
          <Icon name="settings" />
          Settings
        </Link>
        <Link
          href="/account"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-[0.85rem] text-[var(--s-muted)] transition-colors hover:bg-white/[0.04] hover:text-[var(--s-fg)]"
        >
          <span className="grid h-[26px] w-[26px] shrink-0 place-items-center rounded-full bg-[var(--s-panel-2)] font-display text-[0.6rem] text-[var(--s-fg)]">
            {initials || "GW"}
          </span>
          Profile
        </Link>
      </div>
    </aside>
  );
}
