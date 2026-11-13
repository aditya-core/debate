import type { ReactNode } from "react";
import Link from "next/link";
import AppNav from "@/components/app/AppNav";
import { Mark } from "@/components/Mark";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * The signed-in shell.
 *
 * Marketing chrome is gone the moment there is an account: no nav that sells the
 * product to someone already using it. Two shapes of the same three destinations
 * — a rail on desktop, a thumb bar on phones.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-[100svh] bg-canvas">
      <div className="mx-auto flex w-full max-w-[1180px]">
        <aside className="sticky top-0 hidden h-[100svh] w-56 shrink-0 flex-col border-r border-line px-3 py-6 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2 px-2">
            <Mark size={22} />
            <span className="font-display text-[0.86rem] font-medium tracking-[-0.01em] text-fg">
              Gift of Words
            </span>
          </Link>

          <AppNav variant="side" />

          <div className="mt-auto flex items-center justify-between px-2 pt-6">
            <span className="font-display text-[0.58rem] uppercase tracking-[0.16em] text-faint">
              Theme
            </span>
            <ThemeToggle />
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-canvas/85 px-5 py-3 backdrop-blur-md md:hidden">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Mark size={20} />
              <span className="font-display text-[0.8rem] font-medium tracking-[-0.01em] text-fg">
                Gift of Words
              </span>
            </Link>
            <ThemeToggle />
          </header>

          {children}
        </div>
      </div>

      <AppNav variant="bottom" />
    </div>
  );
}
