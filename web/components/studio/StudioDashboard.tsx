import Link from "next/link";
import type { DashboardData } from "@/lib/dashboard/types";
import type { GuideItem } from "@/lib/dashboard/guide";
import { WORLD_LABELS } from "@/lib/dashboard/types";
import { TOPIC_LABELS } from "@/lib/onboarding/schema";
import { prepSeconds, speakSeconds } from "@/lib/practice/prompts";

const RING_R = 52;
const RING_C = 2 * Math.PI * RING_R;

function Ring({
  percent,
  size = 96,
  id,
}: {
  percent: number;
  size?: number;
  id: string;
}) {
  const offset = RING_C * (1 - Math.max(0, Math.min(100, percent)) / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id={id} gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="120" y2="120">
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
          stroke={`url(#${id})`}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={RING_C}
          strokeDashoffset={offset}
          className="s-ring-arc"
          style={{ "--ring-circumference": `${RING_C}` } as React.CSSProperties}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-[1.05rem] font-semibold leading-none tabular-nums">
            {percent}%
          </p>
          {size >= 92 ? (
            <p className="mt-1 font-display text-[0.52rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
              Complete
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-[var(--s-line)] text-[var(--s-amber)]">
        {icon}
      </span>
      <span className="min-w-0">
        <span className="block truncate font-display text-[0.82rem] font-medium leading-tight">{value}</span>
        <span className="block truncate font-display text-[0.58rem] uppercase tracking-[0.12em] text-[var(--s-faint)]">
          {label}
        </span>
      </span>
    </div>
  );
}

const svgProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: "h-4 w-4",
  "aria-hidden": true,
};

export default function StudioDashboard({
  data,
  guide,
}: {
  data: DashboardData;
  guide: GuideItem[];
}) {
  const { firstName, learner, progress, totals, skills, metrics, capture } = data;
  const world = "debate" as const;
  const prompt = data.today[world];
  const prep = prepSeconds(prompt.format);
  const speak = speakSeconds(prompt.format);
  const lead = guide[0];
  const second = guide[1];
  const weekReps = data.week[world].reduce((sum, day) => sum + day.reps, 0);

  return (
    <div className="px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pb-8 lg:pt-6">
      {/* ================= desktop ================= */}
      <div className="hidden lg:grid lg:grid-cols-[minmax(0,1fr)_24.5rem] lg:gap-5">
        <div className="flex min-w-0 flex-col gap-5">
          {/* hero */}
          <section className="s-card s-rise relative isolate overflow-hidden">
            <div
              aria-hidden="true"
              className="s-glow pointer-events-none absolute -right-16 -top-24 h-[26rem] w-[26rem] rounded-full"
              style={{
                background:
                  "radial-gradient(closest-side, rgba(245,165,36,0.42), rgba(245,165,36,0.06) 62%, transparent)",
              }}
            />
            <img
              src="/img/hero-bust.webp"
              alt=""
              aria-hidden="true"
              className="s-float pointer-events-none absolute -bottom-10 right-0 h-[21rem] w-auto object-contain mix-blend-lighten"
              style={{
                maskImage:
                  "radial-gradient(75% 78% at 62% 46%, black 42%, rgba(0,0,0,0.35) 72%, transparent 100%)",
                WebkitMaskImage:
                  "radial-gradient(75% 78% at 62% 46%, black 42%, rgba(0,0,0,0.35) 72%, transparent 100%)",
              }}
            />

            <div className="relative max-w-[34rem] px-8 py-8">
              <p className="font-display text-[0.62rem] uppercase tracking-[0.22em] text-[var(--s-amber)]">
                Your personal debate trainer
              </p>
              <h1 className="s-serif mt-3 text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.02em]">
                Think clearly.
                <br />
                <span className="bg-gradient-to-r from-[var(--s-amber-hi)] to-[var(--s-amber-lo)] bg-clip-text text-transparent">
                  Argue confidently.
                </span>
              </h1>
              <p className="mt-3 max-w-[30rem] text-[0.88rem] leading-relaxed text-[var(--s-muted)]">
                A personalised, AI-powered learning experience to build your debate
                and critical thinking skills.
              </p>

              <div className="mt-6 flex items-center gap-3">
                <Link href="/welcome" className="s-btn-amber relative inline-flex items-center gap-2 overflow-hidden rounded-xl px-5 py-2.5 font-display text-[0.85rem] font-semibold">
                  <svg {...svgProps} className="h-3.5 w-3.5" fill="currentColor" stroke="none">
                    <path d="M8 5.5v13l11-6.5z" />
                  </svg>
                  Continue training
                  <span aria-hidden="true">→</span>
                </Link>
                <span
                  title="The coach arrives with the arena"
                  className="s-btn-ghost inline-flex cursor-not-allowed items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[0.82rem] opacity-70"
                >
                  <svg {...svgProps} className="h-4 w-4">
                    <path d="M12 3.5 13.8 9l5.7.3-4.6 3.5 1.6 5.5L12 15.4 7.5 18.3l1.6-5.5L4.5 9.3 10.2 9z" />
                  </svg>
                  Ask AI Coach
                  <span className="rounded-full border border-[var(--s-line)] px-1.5 py-0.5 font-display text-[0.5rem] uppercase tracking-[0.1em] text-[var(--s-faint)]">
                    soon
                  </span>
                </span>
              </div>
            </div>
          </section>

          {/* arena */}
          <section className="s-rise" style={{ animationDelay: "70ms" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="flex items-center gap-2.5 font-display text-[1.05rem] font-semibold tracking-[-0.01em]">
                  <svg {...svgProps} className="h-4 w-4 text-[var(--s-amber)]">
                    <circle cx="12" cy="12" r="7.5" />
                    <path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22" />
                    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
                  </svg>
                  Enter the AI Arena
                </h2>
                <p className="mt-1 text-[0.82rem] text-[var(--s-muted)]">
                  {WORLD_LABELS.debate.blurb} Start where you are.
                </p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {/* beginner */}
              <Link
                href="/welcome?format=debate"
                className="s-card s-card-hover group relative flex flex-col p-4"
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/12 text-emerald-400">
                  <svg {...svgProps} className="h-5 w-5">
                    <path d="M20.5 3.5c0 9.4-5.6 15-15 15 0-9.4 5.6-15 15-15z" />
                    <path d="M4 20 14.5 9.5" />
                  </svg>
                </span>
                <h3 className="mt-3 font-display text-[0.95rem] font-semibold">Beginner</h3>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--s-muted)]">
                  Learn the basics with guidance and hints.
                </p>
                <span className="mt-3 font-display text-[0.66rem] uppercase tracking-[0.12em] text-[var(--s-faint)]">
                  {prep}s think · {speak}s speak
                </span>
              </Link>

              {/* practice — today's rep */}
              <Link
                href="/welcome"
                className="s-card s-card-hover relative flex flex-col p-4"
                style={{ borderColor: "rgba(245,165,36,0.42)" }}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--s-amber)]/15 text-[var(--s-amber)]">
                    <svg {...svgProps} className="h-5 w-5">
                      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
                    </svg>
                  </span>
                  <span className="rounded-full bg-[var(--s-amber)] px-2 py-0.5 font-display text-[0.5rem] font-semibold uppercase tracking-[0.08em] text-[#1a1206]">
                    Recommended
                  </span>
                </span>
                <h3 className="mt-3 font-display text-[0.95rem] font-semibold">Practice</h3>
                <p className="mt-1 line-clamp-2 text-[0.78rem] leading-relaxed text-[var(--s-muted)]">
                  {prompt.title}
                </p>
                <span className="mt-3 font-display text-[0.66rem] uppercase tracking-[0.12em] text-[var(--s-amber)]">
                  {TOPIC_LABELS[prompt.topic]} · start now
                </span>
              </Link>

              {/* challenge — locked */}
              <div
                title="Scored rounds arrive with the arena"
                className="s-card relative flex cursor-not-allowed flex-col p-4"
                style={{ borderColor: "rgba(122,92,240,0.28)" }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--s-violet)]/15 text-[var(--s-violet)]">
                  <svg {...svgProps} className="h-5 w-5">
                    <path d="M3 7l4 4 5-7 5 7 4-4-2 12H5z" />
                  </svg>
                </span>
                <h3 className="mt-3 font-display text-[0.95rem] font-semibold">Challenge</h3>
                <p className="mt-1 text-[0.78rem] leading-relaxed text-[var(--s-muted)]">
                  A tougher round, scored against the rubric.
                </p>
                <span className="mt-3 font-display text-[0.66rem] uppercase tracking-[0.12em] text-[var(--s-faint)]">
                  Opens with scoring
                </span>
              </div>
            </div>
          </section>

          {/* learning path */}
          <section
            className="s-card s-rise flex flex-1 flex-col p-5"
            style={{ animationDelay: "120ms" }}
          >
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="flex items-center gap-2.5 font-display text-[1.05rem] font-semibold tracking-[-0.01em]">
                <svg {...svgProps} className="h-4 w-4 text-[var(--s-amber)]">
                  <path d="M4 4.8h6.2a2 2 0 0 1 2 2V21a2 2 0 0 0-2-1.8H4z" />
                  <path d="M20 4.8h-5.8a2 2 0 0 0-2 2V21a2 2 0 0 1 2-1.8H20z" />
                </svg>
                Your learning path
              </h2>
              <span className="text-[0.74rem] text-[var(--s-faint)]">
                {progress.percent}% of the way in
              </span>
            </div>

            <ol className="relative mt-6 flex items-start justify-between gap-2">
              <span
                aria-hidden="true"
                className="absolute left-4 right-4 top-[13px] h-px bg-[var(--s-line-2)]"
              />
              {data.path.map((step) => {
                const done = step.state === "done";
                const current = step.state === "current";
                const locked = step.state === "locked";
                return (
                  <li key={step.key} className="relative z-10 flex min-w-0 flex-1 flex-col items-center text-center">
                    <span
                      className={[
                        "grid h-[27px] w-[27px] place-items-center rounded-full border",
                        done
                          ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
                          : current
                            ? "border-[var(--s-amber)] bg-[var(--s-amber)]/15 text-[var(--s-amber)]"
                            : "border-[var(--s-line-2)] bg-[var(--s-panel)] text-[var(--s-faint)]",
                      ].join(" ")}
                    >
                      {done ? (
                        <svg {...svgProps} className="h-3.5 w-3.5">
                          <path d="m5 12.5 4.5 4.5L19 7" />
                        </svg>
                      ) : locked ? (
                        <svg {...svgProps} className="h-3 w-3">
                          <rect x="5" y="11" width="14" height="9" rx="2" />
                          <path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3" />
                        </svg>
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-current" />
                      )}
                    </span>
                    <span
                      className={[
                        "mt-2 text-[0.7rem] leading-tight",
                        current ? "text-[var(--s-fg)]" : "text-[var(--s-muted)]",
                      ].join(" ")}
                    >
                      {step.label}
                    </span>
                    {current ? (
                      <span className="mt-1 rounded-full bg-[var(--s-amber)]/15 px-1.5 py-0.5 font-display text-[0.5rem] uppercase tracking-[0.1em] text-[var(--s-amber)]">
                        Current
                      </span>
                    ) : null}
                  </li>
                );
              })}
            </ol>

            <p className="mt-auto border-t border-[var(--s-line)] pt-4 text-[0.74rem] leading-relaxed text-[var(--s-muted)]">
              Next up:{" "}
              <span className="text-[var(--s-fg)]">
                {data.path.find((step) => step.state === "current")?.label ?? "a scored rep"}
              </span>{" "}
              — the coach scores your argument against the rubric, then the last
              two skill bars have numbers instead of dashes.
            </p>
          </section>

        </div>

        {/* ---------- right rail ---------- */}
        <div className="space-y-5">
          <section className="s-card s-rise p-5" style={{ animationDelay: "40ms" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-[0.95rem] font-semibold">
                <svg {...svgProps} className="h-4 w-4 text-[var(--s-amber)]">
                  <path d="M4 20h16" />
                  <path d="M7 20v-6M12 20V8M17 20v-9" />
                </svg>
                Your progress
              </h2>
              <span className="rounded-full border border-[var(--s-line-2)] px-2.5 py-0.5 font-display text-[0.62rem] text-[var(--s-amber)]">
                Level {progress.level}
              </span>
            </div>

            <div className="mt-4 flex items-center gap-5">
              <Ring percent={progress.percent} id="ring-desktop" />
              <div className="min-w-0 flex-1 space-y-3">
                <Stat
                  icon={
                    <svg {...svgProps}>
                      <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
                    </svg>
                  }
                  value={`${totals.streak} day${totals.streak === 1 ? "" : "s"}`}
                  label="Streak"
                />
                <Stat
                  icon={
                    <svg {...svgProps}>
                      <path d="M7 4h10v4a5 5 0 0 1-10 0z" />
                      <path d="M17 5h2.5a3 3 0 0 1-3 4M7 5H4.5a3 3 0 0 0 3 4M9 20h6M12 13v7" />
                    </svg>
                  }
                  value={`${totals.reps}`}
                  label="Training sessions"
                />
                <Stat
                  icon={
                    <svg {...svgProps}>
                      <path d="M4 4.8h6.2a2 2 0 0 1 2 2V21a2 2 0 0 0-2-1.8H4z" />
                      <path d="M20 4.8h-5.8a2 2 0 0 0-2 2V21a2 2 0 0 1 2-1.8H20z" />
                    </svg>
                  }
                  value={capture ? `${capture.word_count} words` : "—"}
                  label="Baseline"
                />
              </div>
            </div>
            <div className="mt-4 border-t border-[var(--s-line)] pt-3">
              <div className="flex items-baseline justify-between">
                <p className="font-display text-[0.62rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
                  This week
                </p>
                <p className="font-display text-[0.66rem] tabular-nums text-[var(--s-muted)]">
                  {weekReps} reps · {totals.xp} XP
                </p>
              </div>
              <div className="mt-2 flex items-end justify-between gap-1.5" aria-hidden="true">
                {data.week[world].map((day) => {
                  const max = Math.max(1, ...data.week[world].map((d) => d.reps));
                  return (
                    <span key={day.iso} className="flex flex-1 flex-col items-center gap-1">
                      <span className="flex h-9 w-full items-end justify-center">
                        <span
                          className={day.reps > 0 ? "s-fill w-1.5 rounded-full" : "h-1 w-1 rounded-full bg-[var(--s-line-2)]"}
                          style={day.reps > 0 ? { height: `${Math.max(16, Math.round((day.reps / max) * 100))}%` } : undefined}
                        />
                      </span>
                      <span className="font-display text-[0.5rem] uppercase tracking-[0.08em] text-[var(--s-faint)]">
                        {day.label}
                      </span>
                    </span>
                  );
                })}
              </div>
            </div>
          </section>

          <section id="progress" className="s-card s-rise p-5" style={{ animationDelay: "90ms" }}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 font-display text-[0.95rem] font-semibold">
                <svg {...svgProps} className="h-4 w-4 text-[var(--s-amber)]">
                  <circle cx="12" cy="12" r="8.4" />
                  <path d="M8.5 12.5 11 15l4.5-5.5" />
                </svg>
                Skill overview
              </h2>
              <Link href="/dashboard#progress" className="text-[0.72rem] text-[var(--s-faint)] hover:text-[var(--s-fg)]">
                View details →
              </Link>
            </div>

            <ul className="mt-4 space-y-3.5">
              {skills.map((skill) => (
                <li key={skill.key} className="flex items-center gap-3">
                  <span className="w-[7.5rem] shrink-0 truncate text-[0.78rem] text-[var(--s-muted)]">
                    {skill.label}
                  </span>
                  <span className="s-track h-[7px] min-w-0 flex-1 overflow-hidden rounded-full">
                    <span
                      className="s-fill block h-full rounded-full"
                      style={{ width: `${skill.value ?? 0}%` }}
                    />
                  </span>
                  <span className="w-9 shrink-0 text-right font-display text-[0.74rem] tabular-nums text-[var(--s-fg)]">
                    {skill.value === null ? "—" : `${skill.value}%`}
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-3.5 border-t border-[var(--s-line)] pt-3 text-[0.7rem] leading-relaxed text-[var(--s-faint)]">
              {skills.some((skill) => skill.value === null)
                ? "Structure and evidence are measured by the scorer, which opens with the arena. Pace and length come from your baseline."
                : "All four are measured from your reps."}
            </p>
          </section>

          <section className="s-card s-rise p-5" style={{ animationDelay: "140ms" }}>
            <h2 className="flex items-center gap-2 font-display text-[0.95rem] font-semibold">
              <svg {...svgProps} className="h-4 w-4 text-[var(--s-amber)]">
                <path d="M4 5.5h16v10H9l-5 4z" />
              </svg>
              Recent feedback
            </h2>

            <div className="mt-4 space-y-3">
              {lead ? (
                <div className="rounded-xl border border-emerald-400/25 bg-emerald-500/8 p-3">
                  <p className="flex items-center gap-2 font-display text-[0.58rem] uppercase tracking-[0.14em] text-emerald-300">
                    <svg {...svgProps} className="h-3.5 w-3.5">
                      <path d="m5 12.5 4.5 4.5L19 7" />
                    </svg>
                    Next step
                  </p>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--s-fg)]">{lead.title}</p>
                </div>
              ) : null}

              {second ? (
                <div className="rounded-xl border border-[var(--s-amber)]/25 bg-[var(--s-amber)]/8 p-3">
                  <p className="flex items-center gap-2 font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-amber)]">
                    <svg {...svgProps} className="h-3.5 w-3.5">
                      <path d="M12 8v5M12 16.5v.5" />
                      <circle cx="12" cy="12" r="8.4" />
                    </svg>
                    Keep in mind
                  </p>
                  <p className="mt-1.5 text-[0.78rem] leading-relaxed text-[var(--s-fg)]">{second.title}</p>
                </div>
              ) : null}
            </div>

            <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--s-faint)]">
              Rule-based for now. The mentor that scores your reps arrives with the
              arena.
            </p>
          </section>

        </div>
        {/* daily workout — full width, the last thing on the desk */}
        <section
          className="s-card s-rise relative overflow-hidden p-5 lg:col-span-2"
          style={{ animationDelay: "170ms" }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-20 -bottom-24 h-56 w-56 rounded-full opacity-40"
            style={{
              background: "radial-gradient(closest-side, rgba(245,165,36,0.35), transparent)",
            }}
          />
          <div className="relative flex flex-wrap items-center gap-x-8 gap-y-4">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--s-line-2)] text-[var(--s-amber)]">
                <svg {...svgProps} className="h-5 w-5">
                  <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
                  <path d="M8 3v3M16 3v3M3.5 10h17" />
                </svg>
              </span>
              <div>
                <p className="font-display text-[0.95rem] font-semibold">Daily intellectual workout</p>
                <p className="text-[0.78rem] text-[var(--s-muted)]">
                  A quick, focused exercise to sharpen your thinking.
                </p>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-[0.86rem] font-medium">{prompt.title}</p>
              <p className="mt-0.5 truncate text-[0.76rem] text-[var(--s-muted)]">
                {prompt.angle}
              </p>
            </div>

            <Link
              href="/welcome"
              className="s-btn-amber inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 font-display text-[0.8rem] font-semibold"
            >
              Start exercise
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

      </div>

      {/* ================= phone ================= */}
      <div className="mx-auto w-full max-w-[36rem] lg:hidden">
        <section className="relative pb-2">
          <p className="flex items-center gap-2 text-[0.92rem] text-[var(--s-muted)]">
            Hi {firstName ?? "there"}
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-[var(--s-amber)]"
              fill="currentColor"
            >
              <path d="M12 2.5 13.9 9l6.6.4-5.2 4 1.9 6.4-5.2-3.6-5.2 3.6 1.9-6.4-5.2-4L10.1 9z" />
            </svg>
          </p>
          <h1 className="s-serif mt-1 text-[2rem] font-semibold leading-[1.08] tracking-[-0.02em]">
            Your next
            <br />
            <span className="bg-gradient-to-r from-[var(--s-amber-hi)] to-[var(--s-amber-lo)] bg-clip-text text-transparent">
              training is ready.
            </span>
          </h1>
          <p className="mt-2 max-w-[22rem] text-[0.82rem] text-[var(--s-muted)]">
            Continue building your debating skills.
          </p>

          <img
            src="/img/hero-bust.webp"
            alt=""
            aria-hidden="true"
            className="s-float pointer-events-none absolute -right-4 -top-2 h-[9.5rem] w-auto object-contain mix-blend-lighten"
            style={{
              maskImage:
                "radial-gradient(70% 70% at 55% 45%, black 40%, rgba(0,0,0,0.3) 75%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(70% 70% at 55% 45%, black 40%, rgba(0,0,0,0.3) 75%, transparent 100%)",
            }}
          />
        </section>

        {/* recommended */}
        <section className="s-card mt-5 border-[rgba(245,165,36,0.4)] p-4">
          <p className="flex items-center gap-1.5 font-display text-[0.55rem] uppercase tracking-[0.16em] text-[var(--s-amber)]">
            <svg {...svgProps} className="h-3 w-3" fill="currentColor" stroke="none">
              <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />
            </svg>
            Recommended for you
          </p>
          <h2 className="mt-2 font-display text-[1.15rem] font-semibold leading-snug">
            {WORLD_LABELS.debate.name} · {TOPIC_LABELS[prompt.topic]}
          </h2>
          <p className="mt-1 line-clamp-2 text-[0.8rem] leading-relaxed text-[var(--s-muted)]">
            {prompt.title}
          </p>

          <div className="mt-3 flex items-center gap-2 text-[0.62rem] uppercase tracking-[0.1em] text-[var(--s-faint)]">
            <span className="flex flex-col items-center gap-1">
              <svg {...svgProps} className="h-4 w-4">
                <path d="M4 4.8h6.2a2 2 0 0 1 2 2V21a2 2 0 0 0-2-1.8H4z" />
                <path d="M20 4.8h-5.8a2 2 0 0 0-2 2V21a2 2 0 0 1 2-1.8H20z" />
              </svg>
              Think
            </span>
            <span aria-hidden="true" className="mt-0.5">›</span>
            <span className="flex flex-col items-center gap-1">
              <svg {...svgProps} className="h-4 w-4">
                <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
                <path d="M6 11a6 6 0 0 0 12 0M12 17v4" />
              </svg>
              Speak
            </span>
            <span aria-hidden="true" className="mt-0.5">›</span>
            <span className="flex flex-col items-center gap-1">
              <svg {...svgProps} className="h-4 w-4">
                <path d="M4 20h16" />
                <path d="M7 20v-6M12 20V8M17 20v-9" />
              </svg>
              Feedback
            </span>
          </div>

          <Link
            href="/welcome"
            className="s-btn-amber mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 font-display text-[0.86rem] font-semibold"
          >
            <svg {...svgProps} className="h-3.5 w-3.5" fill="currentColor" stroke="none">
              <path d="M8 5.5v13l11-6.5z" />
            </svg>
            Start training
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        {/* progress */}
        <section className="s-card mt-3 flex items-center gap-4 p-4">
          <Ring percent={progress.percent} size={86} id="ring-mobile" />
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.8rem] font-medium">Level {progress.level}</p>
            <p className="text-[0.72rem] text-[var(--s-muted)]">Developing debater</p>
            <p className="mt-1 text-[0.72rem] text-[var(--s-amber)]">
              {totals.streak} day{totals.streak === 1 ? "" : "s"} streak
            </p>
          </div>
        </section>

        {/* daily workout */}
        <section className="s-card mt-3 flex items-center gap-3 p-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[var(--s-line-2)] text-[var(--s-amber)]">
            <svg {...svgProps} className="h-5 w-5">
              <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
              <path d="M8 3v3M16 3v3M3.5 10h17" />
            </svg>
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-[0.86rem] font-semibold">Daily workout</p>
            <p className="truncate text-[0.74rem] text-[var(--s-muted)]">
              A quick 5-minute exercise.
            </p>
          </div>
          <Link
            href="/welcome"
            aria-label="Start the daily workout"
            className="s-btn-amber grid h-9 w-9 place-items-center rounded-full"
          >
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        {/* skills on phone */}
        <section id="progress-mobile" className="s-card mt-3 p-4">
          <h2 className="font-display text-[0.9rem] font-semibold">Your skills</h2>
          <ul className="mt-3 space-y-3">
            {skills.map((skill) => (
              <li key={skill.key} className="flex items-center gap-3">
                <span className="w-[6.5rem] shrink-0 truncate text-[0.74rem] text-[var(--s-muted)]">
                  {skill.label}
                </span>
                <span className="s-track h-[6px] min-w-0 flex-1 overflow-hidden rounded-full">
                  <span className="s-fill block h-full rounded-full" style={{ width: `${skill.value ?? 0}%` }} />
                </span>
                <span className="w-7 shrink-0 text-right font-display text-[0.7rem] tabular-nums">
                  {skill.value === null ? "—" : `${skill.value}%`}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-[var(--s-faint)]">
            Pace and length come from your baseline. Structure and evidence unlock
            with the first scored rep.
          </p>
        </section>
      </div>
    </div>
  );
}
