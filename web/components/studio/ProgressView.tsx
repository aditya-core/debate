import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard/types";
import { WORLD_LABELS } from "@/lib/dashboard/types";
import { formatPoints } from "@/lib/dashboard/levels";

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

const GATE_COPY: Record<string, string> = {
  setup: "You told us what you are working towards and how much time you have.",
  baseline: "One minute of speech, measured once, so later weeks have a floor.",
  "first-rep": "A prompt answered end to end, with a prep timer and a limit.",
  scored: "The coach scores a rep against the rubric. This is the gate that fills the bars.",
  feedback: "One strength and one fix, specific enough to act on.",
  level: "Enough scored reps for the next level to mean something.",
};

function Ring({ percent, caption }: { percent: number; caption: string }) {
  const offset = RING_C * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative h-[104px] w-[104px] shrink-0">
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="p-ring" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="120">
            <stop offset="0%" style={{ stopColor: "var(--s-amber-hi)" }} />
            <stop offset="100%" style={{ stopColor: "var(--s-amber-lo)" }} />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r={RING_R} fill="none" stroke="var(--s-line-2)" strokeWidth="9" />
        <circle
          cx="60"
          cy="60"
          r={RING_R}
          fill="none"
          stroke="url(#p-ring)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <p className="font-display text-[1.1rem] font-semibold leading-none tabular-nums">
            {percent}%
          </p>
          <p className="mt-1 font-display text-[0.52rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
            {caption}
          </p>
        </div>
      </div>
    </div>
  );
}

function Figure({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="min-w-0">
      <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
        {label}
      </p>
      <p className="mt-1 font-display text-[1.05rem] font-medium tabular-nums text-[var(--s-fg)]">
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-[0.68rem] text-[var(--s-faint)]">{hint}</p> : null}
    </div>
  );
}

export default function ProgressView({ data }: { data: DashboardData }) {
  const { skills, totals, metrics, worlds, progress, capture, level, levels } = data;
  const measured = skills.filter((skill) => skill.value !== null).length;

  return (
    <div className="mx-auto w-full max-w-[68rem] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-[var(--s-amber)]">
            Evidence, not encouragement
          </p>
          <h1 className="s-serif mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.02em] lg:text-[2.4rem]">
            Your progress
          </h1>
          <p className="mt-2 max-w-[46ch] text-[0.86rem] leading-relaxed text-[var(--s-muted)]">
            Four things have to be true before a score means anything.{" "}
            {measured === skills.length
              ? "All four are measured."
              : `${measured} of ${skills.length} skills have a number; the rest unlock with the scorer.`}
          </p>
        </div>
        <Link
          href="/welcome"
          className="s-btn-amber inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[0.82rem] font-semibold"
        >
          Train something
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      <section className="s-card mt-6 p-5 lg:p-6">
        <div className="flex flex-wrap items-center gap-6">
          <Ring
            percent={level.percent}
            caption={level.nextAt ? `to L${level.level + 1}` : "max"}
          />
          <div className="grid flex-1 gap-5 sm:grid-cols-4">
            <Figure
              label="Level"
              value={String(level.level)}
              hint={level.toNext !== null ? `${formatPoints(level.toNext)} pts to ${level.nextName}` : level.name}
            />
            <Figure label="Reps" value={String(totals.reps)} hint="Completed sessions" />
            <Figure
              label="Streak"
              value={`${totals.streak} day${totals.streak === 1 ? "" : "s"}`}
              hint="Consecutive practice days"
            />
            {worlds.debate.reps + worlds.extempore.reps > 0 ? (
              <Figure
                label="Debate rating"
                value={String(worlds.debate.rating)}
                hint="Starting rating; moves with scored reps"
              />
            ) : (
              <Figure label="Baseline" value={capture ? `${capture.word_count} words` : "—"} hint={capture ? "From your 60-second check" : "Not recorded yet"} />
            )}
          </div>
        </div>
      </section>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="s-card p-5 lg:p-6">
          <h2 className="font-display text-[1rem] font-semibold">Skills</h2>
          <p className="mt-1 text-[0.8rem] text-[var(--s-muted)]">
            Pace and length come from your baseline. Structure and evidence come
            from the scorer, which is why they are dashes today.
          </p>

          <ul className="mt-5 space-y-5">
            {skills.map((skill) => (
              <li key={skill.key}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-display text-[0.86rem] font-medium">{skill.label}</p>
                  <p className="font-display text-[0.86rem] tabular-nums text-[var(--s-fg)]">
                    {skill.value === null ? "—" : `${skill.value}%`}
                  </p>
                </div>
                <span className="s-track mt-2 block h-[7px] overflow-hidden rounded-full">
                  <span
                    className="s-fill block h-full rounded-full"
                    style={{ width: `${skill.value ?? 0}%` }}
                  />
                </span>
                <p className="mt-1.5 text-[0.72rem] text-[var(--s-faint)]">{skill.note}</p>
              </li>
            ))}
          </ul>

          <p className="mt-5 border-t border-[var(--s-line)] pt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
            {metrics.words !== null && capture
              ? `Baseline recorded ${new Date(capture.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                })} · ${metrics.words} words in a minute.`
              : metrics.words !== null
                ? `Baseline: ${metrics.words} words in a minute.`
                : "No baseline yet. The 60-second check is the cheapest way to fill two of these bars."}
          </p>
        </section>

        <section className="s-card p-5 lg:p-6">
          <h2 className="font-display text-[1rem] font-semibold">The path</h2>
          <ol className="mt-4 space-y-4">
            {data.path.map((step, index) => {
              const done = step.state === "done";
              const current = step.state === "current";
              return (
                <li key={step.key} className="flex gap-3">
                  <span
                    aria-hidden="true"
                    className={[
                      "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border font-display text-[0.6rem]",
                      done
                        ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                        : current
                          ? "border-[var(--s-amber)] bg-[var(--s-amber)]/15 text-[var(--s-amber)]"
                          : "border-[var(--s-line-2)] text-[var(--s-faint)]",
                    ].join(" ")}
                  >
                    {done ? "✓" : index + 1}
                  </span>
                  <div className="min-w-0">
                    <p
                      className={[
                        "text-[0.84rem] leading-snug",
                        current ? "text-[var(--s-fg)]" : "text-[var(--s-muted)]",
                      ].join(" ")}
                    >
                      {step.label}
                      {current ? (
                        <span className="ml-2 rounded-full bg-[var(--s-amber)]/15 px-1.5 py-0.5 font-display text-[0.5rem] uppercase tracking-[0.1em] text-[var(--s-amber)]">
                          current
                        </span>
                      ) : null}
                    </p>
                    <p className="mt-0.5 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
                      {GATE_COPY[step.key] ?? ""}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      </div>


      {/* The ladder, with its rungs written down. A level with no sentence
          attached is a badge, and badges do not tell anyone what to do next. */}
      <section className="s-card mt-5 p-5 lg:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[1rem] font-semibold">The ladder</h2>
          <p className="text-[0.74rem] tabular-nums text-[var(--s-faint)]">
            {formatPoints(level.points)} points
            {level.nextAt !== null
              ? ` · ${formatPoints(level.floor)} → ${formatPoints(level.nextAt)} for Level ${level.level + 1}`
              : " · top of the ladder"}
          </p>
        </div>

        <ol className="mt-4 space-y-2">
          {levels.map((step) => {
            const done = level.points >= step.at;
            const current = step.level === level.level;
            return (
              <li
                key={step.level}
                className={[
                  "flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-xl border px-3.5 py-3",
                  current
                    ? "border-[var(--s-amber)]/40 bg-[var(--s-amber)]/8"
                    : "border-[var(--s-line)]",
                ].join(" ")}
              >
                <span
                  className={[
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border font-display text-[0.6rem]",
                    done
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-300"
                      : "border-[var(--s-line-2)] text-[var(--s-faint)]",
                  ].join(" ")}
                >
                  {step.level}
                </span>
                <p
                  className={[
                    "font-display text-[0.86rem] font-medium",
                    current ? "text-[var(--s-fg)]" : "text-[var(--s-muted)]",
                  ].join(" ")}
                >
                  {step.name}
                </p>
                <p className="font-display text-[0.66rem] tabular-nums text-[var(--s-faint)]">
                  {step.at === 0 ? "from the start" : `${formatPoints(step.at)} pts`}
                </p>
                {current ? (
                  <span className="rounded-full bg-[var(--s-amber)]/15 px-1.5 py-0.5 font-display text-[0.5rem] uppercase tracking-[0.1em] text-[var(--s-amber)]">
                    you are here
                  </span>
                ) : null}
                <p className="w-full text-[0.76rem] leading-relaxed text-[var(--s-muted)]">
                  {step.blurb}
                </p>
                <p className="w-full text-[0.74rem] leading-relaxed text-[var(--s-faint)]">
                  Next: {step.unlocks}
                </p>
              </li>
            );
          })}
        </ol>

        <p className="mt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
          Points are the sum of both worlds — speaking is speaking. The thresholds
          are a product decision, not a measurement; they are written here so you
          can see exactly what a level costs.
        </p>
      </section>

      <section className="s-card mt-5 p-5 lg:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[1rem] font-semibold">This week</h2>
          <p className="text-[0.74rem] text-[var(--s-faint)]">
            {totals.xp} XP · {totals.reps} reps all time
          </p>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {(["debate", "extempore"] as const).map((world) => {
            const max = Math.max(1, ...data.week[world].map((day) => day.reps));
            return (
              <div key={world}>
                <p className="font-display text-[0.62rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
                  {WORLD_LABELS[world].name}
                </p>
                <div className="mt-2 flex items-end justify-between gap-2" aria-hidden="true">
                  {data.week[world].map((day) => (
                    <div key={day.iso} className="flex flex-1 flex-col items-center gap-1.5">
                      <div className="flex h-14 w-full items-end justify-center">
                        <span
                          className={
                            day.reps > 0
                              ? "s-fill w-2 rounded-full"
                              : "h-1 w-1 rounded-full bg-[var(--s-line-2)]"
                          }
                          style={
                            day.reps > 0
                              ? { height: `${Math.max(16, Math.round((day.reps / max) * 100))}%` }
                              : undefined
                          }
                        />
                      </div>
                      <span className="font-display text-[0.54rem] uppercase tracking-[0.08em] text-[var(--s-faint)]">
                        {day.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
