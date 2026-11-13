import type { ReactNode } from "react";
import Link from "next/link";
import AppNav from "@/components/app/AppNav";
import { getAccountContext } from "@/lib/auth/guard";
import { Mark } from "@/components/Mark";
import ThemeToggle from "@/components/ThemeToggle";

/**
 * The signed-in shell.
 *
 * Marketing chrome is gone the moment there is an account: no nav that sells the
 * product to someone already using it. Two shapes of the same three destinations
 * — a rail on desktop, a thumb bar on phones.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  // Cheap, and it keeps the rail honest: a name and an account id, or nothing.
  const ctx = await getAccountContext();
  const userName = ctx?.account?.full_name?.trim() ?? null;
  const accountId = ctx?.account?.display_id ?? null;
  const initials = (userName ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="min-h-[100svh] bg-canvas">
      <div className="flex w-full">
        <aside className="sticky top-0 hidden h-[100svh] w-[15rem] shrink-0 flex-col border-r border-line px-5 py-7 md:flex">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Mark size={22} />
            <span className="font-display text-[0.86rem] font-medium tracking-[-0.01em] text-fg">
              Gift of Words
            </span>
          </Link>

          <AppNav variant="side" />

          {/* Identity where a rail usually puts it: the bottom. The theme toggle
              moved to the top bar so it is in the same place on every screen. */}
          <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-4">
            <span
              aria-hidden="true"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-soft font-display text-[0.72rem] text-fg"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate font-display text-[0.76rem] text-fg">{userName ?? "You"}</p>
              <p className="truncate font-display text-[0.6rem] uppercase tracking-[0.12em] text-faint">
                {accountId ?? "signed in"}
              </p>
            </div>
          </div>
        </aside>

        {/* No mobile header here: the dashboard's own bar carries the mark, the
            world switch and the theme toggle. Two stacked sticky rows on a phone
            is 96px of chrome before the first sentence. */}
        <div className="mx-auto min-w-0 w-full max-w-[1120px] flex-1">{children}</div>
      </div>

      <AppNav variant="bottom" />
    </div>
  );
}
