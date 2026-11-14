"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

type Tab = { label: string; href?: string; icon: ReactNode; soon?: boolean };

const TABS: Tab[] = [
  {
    label: "Home",
    href: "/dashboard",
    icon: <path d="M3.5 10.5 12 3.6l8.5 6.9V20a1 1 0 0 1-1 1h-4.6v-6.2H9.1V21H4.5a1 1 0 0 1-1-1z" />,
  },
  {
    label: "Learn",
    icon: (
      <>
        <path d="M4 4.8h6.2a2 2 0 0 1 2 2V21a2 2 0 0 0-2-1.8H4z" />
        <path d="M20 4.8h-5.8a2 2 0 0 0-2 2V21a2 2 0 0 1 2-1.8H20z" />
      </>
    ),
    soon: true,
  },
  {
    label: "Arena",
    href: "/welcome",
    icon: (
      <>
        <circle cx="12" cy="12" r="7.5" />
        <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
      </>
    ),
  },
  {
    label: "Progress",
    href: "/dashboard#progress",
    icon: (
      <>
        <path d="M4 20h16" />
        <path d="M7 20v-6M12 20V8M17 20v-9" />
      </>
    ),
  },
];

export default function MobileTabs() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--s-line)] bg-[var(--s-bg)]/95 backdrop-blur-md lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-md grid-cols-4">
        {TABS.map((tab) => {
          const href = tab.href;
          const active = href ? pathname === href.split("#")[0] : false;

          if (tab.soon || !href) {
            return (
              <span
                key={tab.label}
                aria-disabled="true"
                className="flex flex-col items-center gap-1 py-2.5 text-[0.6rem] text-[var(--s-faint)]"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[19px] w-[19px]" strokeLinecap="round" strokeLinejoin="round">
                  {tab.icon}
                </svg>
                {tab.label}
              </span>
            );
          }

          return (
            <Link
              key={tab.label}
              href={href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex flex-col items-center gap-1 py-2.5 text-[0.6rem] transition-colors",
                active ? "text-[var(--s-amber)]" : "text-[var(--s-muted)]",
              ].join(" ")}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[19px] w-[19px]" strokeLinecap="round" strokeLinejoin="round">
                {tab.icon}
              </svg>
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
