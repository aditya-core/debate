import type { ReactNode } from "react";
import localFont from "next/font/local";
import MobileTabs from "@/components/studio/MobileTabs";
import Sidebar from "@/components/studio/Sidebar";
import Topbar from "@/components/studio/Topbar";
import { getAccountContext } from "@/lib/auth/guard";

/**
 * Fraunces, self-hosted.
 *
 * It used to come from `@fontsource-variable/fraunces`, which meant the studio
 * would not build on a machine whose `node_modules` predated the install — the
 * exact "Module not found" a deploy or a colleague hits after a pull. One 36 KB
 * wght-only latin file, committed, and the build no longer depends on an install
 * step going right. Licence: SIL OFL 1.1, `web/fonts/OFL-Fraunces.txt`.
 */
const fraunces = localFont({
  src: "../../fonts/fraunces-latin-wght.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-serif-display",
  fallback: ["ui-serif", "Georgia", "Times New Roman", "serif"],
});

/**
 * The studio.
 *
 * Dark, amber-lit, and scoped (`.studio`) so the marketing pages keep their own
 * light identity. Rail on large screens, thumb bar on phones, and a single top
 * bar — the previous shell stacked two sticky rows before the first sentence.
 */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const ctx = await getAccountContext();
  const name = ctx?.account?.full_name?.trim() ?? null;
  const displayId = ctx?.account?.display_id ?? "—";
  const initials = (name ?? "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className={`studio min-h-[100svh] ${fraunces.variable}`}>
      <div className="flex w-full">
        <Sidebar initials={initials} />
        <div className="min-w-0 flex-1">
          <Topbar initials={initials} name={name} displayId={displayId} />
          <main id="main">{children}</main>
        </div>
      </div>
      <MobileTabs />
    </div>
  );
}
