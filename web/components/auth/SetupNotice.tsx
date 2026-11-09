import Link from "next/link";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Shown only when the deployment has no Supabase credentials. Registration is
 * deliberately inert in that state rather than silently pretending to work —
 * this banner is what the person filling the form sees instead.
 */
export default function SetupNotice() {
  if (isSupabaseConfigured) return null;

  return (
    <div className="mb-6 rounded-xl border border-line bg-surface-2 px-3.5 py-3">
      <p className="font-display text-[0.68rem] uppercase tracking-[0.16em] text-faint">
        Preview build
      </p>
      <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">
        The database isn&apos;t connected in this environment, so accounts
        can&apos;t be created yet. The form below is the real thing — it will
        work the moment credentials are added.{" "}
        <Link href="/develop" className="link-underline text-fg">
          Build status
        </Link>
      </p>
    </div>
  );
}
