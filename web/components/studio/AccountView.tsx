import Link from "next/link";
import type { AccountPageData } from "@/lib/studio/pages";
import {
  EXPERIENCE_LABELS,
  GOAL_LABELS,
  TOPIC_LABELS,
  WINDOW_LABELS,
  type OnboardingAnswers,
} from "@/lib/onboarding/schema";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
        {label}
      </p>
      <p className="mt-1 truncate text-[0.86rem] text-[var(--s-fg)]">{value}</p>
    </div>
  );
}

const label = <T extends string>(
  map: Record<T, { label: string }>,
  value: string,
  fallback = "—",
): string => map[value as T]?.label ?? fallback;

export default function AccountView({
  data,
  passwordState,
}: {
  data: AccountPageData;
  passwordState?: string;
}) {
  const { account, learner, worlds } = data;
  const firstName = account.full_name?.trim().split(/\s+/)[0] ?? null;

  return (
    <div className="mx-auto w-full max-w-[60rem] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-[var(--s-amber)]">
            Your account
          </p>
          <h1 className="s-serif mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.02em] lg:text-[2.4rem]">
            {firstName ? `Hello, ${firstName}.` : "Hello."}
          </h1>
          <p className="mt-2 text-[0.86rem] text-[var(--s-muted)]">
            Everything we know about you, and the switches to change it.
          </p>
        </div>
        <form action="/auth/signout" method="post">
          <button
            type="submit"
            className="s-btn-ghost rounded-xl px-4 py-2.5 font-display text-[0.82rem]"
          >
            Sign out
          </button>
        </form>
      </header>

      {passwordState === "changed" ? (
        <div className="s-card mt-5 border-emerald-400/30 p-4">
          <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-emerald-300">
            Password updated
          </p>
          <p className="mt-1.5 text-[0.82rem] text-[var(--s-muted)]">
            You are signed in with the new one. Other devices will need it too.
          </p>
        </div>
      ) : null}

      {account.status === "pending_guardian_consent" ? (
        <div className="s-card mt-5 p-4" style={{ borderColor: "rgba(245,165,36,0.4)" }}>
          <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-amber)]">
            Waiting on a guardian
          </p>
          <p className="mt-1.5 text-[0.82rem] leading-relaxed text-[var(--s-muted)]">
            We have emailed your parent or guardian. Both identities are ready;
            practice unlocks as soon as they approve.
          </p>
        </div>
      ) : null}

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-2">
        <div className="space-y-5">
        <section className="s-card p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-[0.95rem] font-semibold">Identity</h2>
            <span
              className={[
                "rounded-full border px-2.5 py-0.5 font-display text-[0.55rem] uppercase tracking-[0.12em]",
                account.status === "active"
                  ? "border-emerald-400/40 text-emerald-300"
                  : "border-[var(--s-amber)]/40 text-[var(--s-amber)]",
              ].join(" ")}
            >
              {account.status === "active" ? "Active" : "Pending"}
            </span>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Account ID" value={account.display_id} />
            <Field label="Member since" value={formatDate(account.created_at)} />
            <div className="sm:col-span-2">
              <Field label="Email" value={account.email} />
            </div>
            <div className="sm:col-span-2">
              <Field label="Name" value={account.full_name ?? "—"} />
            </div>
          </div>

          <p className="mt-4 border-t border-[var(--s-line)] pt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
            Your email is never shown to other learners, in any world.
          </p>
        </section>

        <section className="s-card p-5">
          <h2 className="font-display text-[0.95rem] font-semibold">Your worlds</h2>
          <div className="mt-4 space-y-4">
            {(["debate", "extempore"] as const).map((world) => (
              <div
                key={world}
                className="flex items-center justify-between gap-3 rounded-xl border border-[var(--s-line)] px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="font-display text-[0.85rem] font-medium capitalize">{world}</p>
                  <p className="text-[0.7rem] tracking-[0.04em] text-[var(--s-faint)]">
                    {worlds[world].displayId ?? "—"}
                  </p>
                </div>
                <div className="flex shrink-0 gap-4 text-right">
                  <div>
                    <p className="font-display text-[0.52rem] uppercase tracking-[0.12em] text-[var(--s-faint)]">
                      Rating
                    </p>
                    <p className="font-display text-[0.86rem] tabular-nums">
                      {worlds[world].rating ?? "—"}
                    </p>
                  </div>
                  <div>
                    <p className="font-display text-[0.52rem] uppercase tracking-[0.12em] text-[var(--s-faint)]">
                      XP
                    </p>
                    <p className="font-display text-[0.86rem] tabular-nums">
                      {worlds[world].xp ?? "—"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
            Separate identities, one login. Nothing you do in one world moves the
            other's rating.
          </p>
        </section>

        </div>
        <div className="space-y-5">
        <section className="s-card p-5">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-[0.95rem] font-semibold">Your plan</h2>
            <Link
              href="/onboarding?edit=1"
              className="text-[0.78rem] text-[var(--s-amber)] hover:underline"
            >
              Edit answers
            </Link>
          </div>

          <div className="mt-4 space-y-4">
            <Field
              label="Here for"
              value={
                learner.goals
                  .map((goal) => label(GOAL_LABELS, goal))
                  .join(", ") || "—"
              }
            />
            <Field
              label="Starting point"
              value={`${label(EXPERIENCE_LABELS, learner.experience)} · confidence ${learner.comfort}/5`}
            />
            <Field
              label="Topics"
              value={
                learner.topics.map((topic) => TOPIC_LABELS[topic as keyof typeof TOPIC_LABELS] ?? topic).join(", ") ||
                "We choose for you"
              }
            />
            <Field
              label="Rhythm"
              value={`${learner.minutes_per_day} min a day · ${WINDOW_LABELS[learner.practice_window as OnboardingAnswers["practiceWindow"]] ?? learner.practice_window}`}
            />
            {learner.preparing_for ? (
              <Field label="Working towards" value={learner.preparing_for} />
            ) : null}
            {learner.target_date ? (
              <Field label="Target date" value={formatDate(learner.target_date)} />
            ) : null}
          </div>

          <p className="mt-4 border-t border-[var(--s-line)] pt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
            Recorded on {formatDate(learner.completed_at)}. Editing keeps your
            history; it does not reset progress.
          </p>
        </section>

        <section className="s-card p-5">
          <h2 className="font-display text-[0.95rem] font-semibold">Security</h2>
          <div className="mt-4 space-y-3">
            <Link
              href="/account/update-password"
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--s-line)] px-3.5 py-3 text-[0.84rem] text-[var(--s-fg)] transition-colors hover:border-[var(--s-line-2)]"
            >
              Change password
              <span aria-hidden="true" className="text-[var(--s-faint)]">→</span>
            </Link>
            <Link
              href="/legal"
              className="flex items-center justify-between gap-3 rounded-xl border border-[var(--s-line)] px-3.5 py-3 text-[0.84rem] text-[var(--s-fg)] transition-colors hover:border-[var(--s-line-2)]"
            >
              Privacy, data and consent
              <span aria-hidden="true" className="text-[var(--s-faint)]">→</span>
            </Link>
          </div>
          <p className="mt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
            Sessions are tied to this account and readable only by it. Row-level
            security is on for every table that holds your data.
          </p>
        </section>
        </div>
      </div>
    </div>
  );
}
