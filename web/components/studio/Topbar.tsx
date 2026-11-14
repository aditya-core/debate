import Link from "next/link";
import { ForgeMark } from "@/components/studio/Sidebar";

/**
 * The bar above everything.
 *
 * The search field is real markup but *disabled*: there is no lesson library to
 * search yet, and a box that accepts a query and returns nothing is worse than a
 * box that says it is not open. Same for the bell — decorative until there is
 * something to notify about.
 */
export default function Topbar({
  initials,
  name,
  displayId,
}: {
  initials: string;
  name: string | null;
  displayId: string;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--s-line)] bg-[var(--s-bg)]/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard" className="flex items-center gap-2 lg:hidden">
          <ForgeMark size={20} />
          <span className="font-display text-[0.86rem] font-semibold tracking-[-0.01em]">
            Gift of Words
          </span>
        </Link>

        <label className="relative hidden min-w-0 flex-1 items-center md:flex lg:max-w-[34rem]">
          <span className="sr-only">Search topics, lessons and skills</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 h-4 w-4 text-[var(--s-faint)]"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4 4" strokeLinecap="round" />
          </svg>
          <input
            type="search"
            disabled
            placeholder="Search topics, lessons, or skills…"
            title="Search opens with the lesson library"
            className="s-input h-10 w-full cursor-not-allowed rounded-xl pl-10 pr-16 text-[0.82rem] placeholder:text-[var(--s-faint)]"
          />
          <span className="pointer-events-none absolute right-3 rounded-md border border-[var(--s-line)] px-1.5 py-0.5 font-display text-[0.6rem] text-[var(--s-faint)]">
            ⌘K
          </span>
        </label>

        <div className="ml-auto flex items-center gap-2.5">
          <span
            aria-hidden="true"
            title="Notifications arrive with the arena"
            className="grid h-9 w-9 place-items-center rounded-full border border-[var(--s-line)] text-[var(--s-muted)]"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-[18px] w-[18px]">
              <path d="M18 15.5V11a6 6 0 1 0-12 0v4.5L4.5 18h15z" strokeLinejoin="round" />
              <path d="M10 21h4" strokeLinecap="round" />
            </svg>
          </span>

          <Link
            href="/account"
            className="flex items-center gap-2 rounded-full border border-[var(--s-line)] py-1 pl-1 pr-3 transition-colors hover:border-[var(--s-line-2)]"
          >
            <span className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-[var(--s-amber-hi)] to-[var(--s-amber-lo)] font-display text-[0.6rem] font-semibold text-[#1a1206]">
              {initials || "GW"}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block font-display text-[0.72rem] leading-tight">{name ?? "You"}</span>
              <span className="block font-display text-[0.55rem] uppercase tracking-[0.12em] text-[var(--s-faint)]">
                {displayId}
              </span>
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
