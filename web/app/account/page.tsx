import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/env";
import { createServerSupabase, getSessionUser } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Your account — Gift of Words",
  robots: { index: false, follow: false },
};

// Session-dependent: never prerender, never cache.
export const dynamic = "force-dynamic";

type AccountRow = {
  id: string;
  display_id: string;
  email: string;
  full_name: string | null;
  status: "active" | "pending_guardian_consent" | "suspended";
  created_at: string;
};

type WorldRow = {
  display_id: string;
  rating: number;
  xp: number;
};

export default async function AccountPage() {
  if (!isSupabaseConfigured) {
    return (
      <Notice
        title="Accounts aren't connected yet."
        body="This build has no database credentials, so there is nothing to sign into. The account page is finished — it needs a Supabase project to read from."
      />
    );
  }

  const user = await getSessionUser();
  if (!user) redirect("/signin");

  const supabase = await createServerSupabase();
  const { data: account } = await supabase
    .from("accounts")
    .select("id, display_id, email, full_name, status, created_at")
    .eq("auth_user_id", user.id)
    .maybeSingle<AccountRow>();

  if (!account) {
    return (
      <Notice
        title="Your login exists, your profile doesn't."
        body="The auth record was created but the identity migration hasn't provisioned the account and its two world profiles. Run supabase/migrations/0001_identity.sql on the project."
      />
    );
  }

  const [{ data: debate }, { data: extempore }] = await Promise.all([
    supabase
      .from("debate_profiles")
      .select("display_id, rating, xp")
      .eq("account_id", account.id)
      .maybeSingle<WorldRow>(),
    supabase
      .from("extempore_profiles")
      .select("display_id, rating, xp")
      .eq("account_id", account.id)
      .maybeSingle<WorldRow>(),
  ]);

  const firstName = account.full_name?.trim().split(/\s+/)[0];

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8 sm:py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-faint">
            Your account
          </p>
          <h1 className="mt-2 font-display text-[clamp(1.8rem,3.4vw,2.6rem)] font-medium leading-tight tracking-[-0.03em] text-fg">
            {firstName ? `Hello, ${firstName}.` : "Hello."}
          </h1>
        </div>
        <form action="/auth/signout" method="post">
          <button type="submit" className="btn btn-outline btn-sm">
            Sign out
          </button>
        </form>
      </header>

      {account.status === "pending_guardian_consent" ? (
        <div className="mt-6 rounded-xl border border-line bg-surface-2 px-4 py-3.5">
          <p className="font-display text-[0.68rem] uppercase tracking-[0.16em] text-sun-text">
            Waiting on a guardian
          </p>
          <p className="mt-1.5 text-[0.86rem] leading-relaxed text-muted">
            We&apos;ve emailed your parent or guardian. Your account and both
            identities are ready — practice unlocks as soon as they approve.
          </p>
        </div>
      ) : null}

      <section className="mt-8 rounded-2xl border border-line bg-surface p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-display text-[0.68rem] uppercase tracking-[0.16em] text-faint">
              Account ID
            </p>
            <p className="mt-1.5 font-display text-[1.05rem] tracking-[0.04em] text-fg">
              {account.display_id}
            </p>
          </div>
          <span
            className={[
              "pill",
              account.status === "active"
                ? "border-mint/35 bg-mint/10 text-mint-text"
                : "border-sun/35 bg-sun/10 text-sun-text",
            ].join(" ")}
          >
            <span className="pill-dot" aria-hidden="true" />
            {account.status === "active" ? "Active" : "Pending approval"}
          </span>
        </div>

        <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
          <Detail label="Email" value={account.email} />
          <Detail label="Name" value={account.full_name ?? "—"} />
          <Detail label="Member since" value={formatDate(account.created_at)} />
        </dl>
      </section>

      <p className="mt-10 font-display text-[0.7rem] uppercase tracking-[0.2em] text-faint">
        Two worlds, one of you
      </p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <WorldCard
          world="Debate"
          blurb="Argue a case, defend it under pressure, get scored on structure and rebuttal."
          row={debate}
          accent="linear-gradient(90deg, var(--c-brand) 0%, var(--c-sky) 100%)"
        />
        <WorldCard
          world="Extempore"
          blurb="Speak on an unseen prompt with ninety seconds to think and three minutes to land it."
          row={extempore}
          accent="linear-gradient(90deg, var(--c-flare) 0%, var(--c-sun) 100%)"
        />
      </div>

      <p className="mt-6 text-[0.8rem] leading-relaxed text-faint">
        Arenas open in the next stage. Nothing you do in one world moves the
        other — separate ratings, separate history, one login.
      </p>
    </div>
  );
}

function WorldCard({
  world,
  blurb,
  row,
  accent,
}: {
  world: string;
  blurb: string;
  row: WorldRow | null;
  accent: string;
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-surface">
      <div className="h-1 w-full" style={{ background: accent }} aria-hidden="true" />
      <div className="p-5">
        <h2 className="font-display text-[1.05rem] font-medium tracking-[-0.01em] text-fg">
          {world}
        </h2>
        <p className="mt-1.5 text-[0.82rem] leading-relaxed text-muted">{blurb}</p>

        <div className="mt-5 flex items-end justify-between gap-4 border-t border-line pt-4">
          <div>
            <p className="font-display text-[0.64rem] uppercase tracking-[0.16em] text-faint">
              Identity
            </p>
            <p className="mt-1 font-display text-[0.8rem] tracking-[0.03em] text-fg">
              {row?.display_id ?? "—"}
            </p>
          </div>
          <div className="flex gap-5 text-right">
            <Stat label="Rating" value={row ? String(row.rating) : "—"} />
            <Stat label="XP" value={row ? String(row.xp) : "—"} />
          </div>
        </div>
      </div>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-display text-[0.64rem] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p className="mt-1 font-display text-[1rem] text-fg">{value}</p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-display text-[0.64rem] uppercase tracking-[0.16em] text-faint">
        {label}
      </dt>
      <dd className="mt-1 truncate text-[0.88rem] text-fg">{value}</dd>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="mx-auto max-w-xl px-5 py-20 text-center">
      <h1 className="font-display text-[1.6rem] font-medium tracking-[-0.02em] text-fg">
        {title}
      </h1>
      <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">{body}</p>
      <Link href="/" className="btn btn-outline btn-sm mt-7">
        Back to the homepage
      </Link>
    </div>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
