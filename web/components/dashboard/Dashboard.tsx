"use client";

import Link from "next/link";
import { useState } from "react";
import { Mark } from "@/components/Mark";
import ThemeToggle from "@/components/ThemeToggle";
import WeekChart from "@/components/dashboard/WeekChart";
import { WORLD_LABELS, type DashboardData, type World } from "@/lib/dashboard/types";
import { buildGuide } from "@/lib/dashboard/guide";
import { TOPIC_LABELS } from "@/lib/onboarding/schema";
import { prepSeconds, speakSeconds } from "@/lib/practice/prompts";

const ACCENT: Record<
  World,
  { knob: string; bar: string; text: string; glow: string; ring: string }
> = {
  debate: {
    knob: "bg-brand",
    bar: "bg-brand",
    text: "text-brand",
    glow: "var(--c-brand)",
    ring: "shadow-[0_0_0_1px_var(--c-brand)]",
  },
  extempore: {
    knob: "bg-flare",
    bar: "bg-flare",
    text: "text-flare",
    glow: "var(--c-flare)",
    ring: "shadow-[0_0_0_1px_var(--c-flare)]",
  },
};

/**
 * Home, with two worlds in it.
 *
 * The dashboard opens on Debate and switches in place — both worlds are resolved
 * on the server and handed over together, so changing worlds is a state update,
 * not a page load. Rating, reps, weekly series, prompt and advice are all scoped
 * to the selected world; only the streak is global, because days are global.
 *
 * Layout rule: one surface (the hero), everything else set directly on the
 * canvas with hairline rules. Boxes are a last resort, not a default.
 */
export default function Dashboard({ data }: { data: DashboardData }) {
  const [world, setWorld] = useState<World>("debate");

  const accent = ACCENT[world];
  const stat = data.worlds[world];
  const prompt = data.today[world];
  const week = data.week[world];
  const guide = buildGuide(data, world);
  const [lead, second] = guide;
  const prep = prepSeconds(prompt.format);
  const speak = speakSeconds(prompt.format);
  const weekTotal = week.reduce((sum, day) => sum + day.reps, 0);

  return (
    <div className="pb-24 md:pb-0">
      {/* ---------------- top bar: the switch and the streak ---------------- */}
      <div className="sticky top-0 z-20 border-b border-line bg-canvas/80 backdrop-blur-md">
        <div className="flex items-center gap-3 px-4 py-2.5 sm:px-8 sm:py-3">
          <Link href="/dashboard" aria-label="Gift of Words" className="md:hidden">
            <Mark size={20} />
          </Link>

          <div
            role="tablist"
            aria-label="Choose a world"
            className="relative flex rounded-full border border-line bg-surface p-1"
          >
            <span
              aria-hidden="true"
              className={[
                "absolute inset-y-1 left-1 w-[calc(50%-4px)] rounded-full transition-transform duration-300 ease-out",
                accent.knob,
              ].join(" ")}
              style={{ transform: world === "debate" ? "none" : "translateX(100%)" }}
            />
            {(["debate", "extempore"] as const).map((option) => (
              <button
                key={option}
                type="button"
                role="tab"
                aria-selected={world === option}
                onClick={() => setWorld(option)}
                className={[
                  "relative z-10 w-24 rounded-full py-1.5 font-display text-[0.76rem] tracking-[0.01em] transition-colors sm:w-[6.5rem]",
                  world === option ? "text-white" : "text-muted hover:text-fg",
                ].join(" ")}
              >
                {WORLD_LABELS[option].name}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2.5">
            <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 font-display text-[0.66rem] tabular-nums text-muted sm:flex">
              <span aria-hidden="true" className={world === "debate" ? "text-brand" : "text-flare"}>
                ◆
              </span>
              {data.totals.streak} day{data.totals.streak === 1 ? "" : "s"}
            </span>
            <span className="hidden font-display text-[0.74rem] tracking-[0.03em] text-faint md:inline">
              {data.displayId}
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="px-5 pt-6 sm:px-8 sm:pt-9">
        <div key={world} className="world-in">
          {/* ---------------- hero: today's rep in this world ---------------- */}
          <section className="relative overflow-hidden rounded-[26px] bg-fg px-5 py-6 text-canvas sm:px-9 sm:py-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full opacity-30 blur-3xl"
              style={{
                background: `radial-gradient(closest-side, ${accent.glow}, transparent)`,
              }}
            />

            <div className="relative grid gap-8 md:grid-cols-[1fr_10.5rem] md:items-start">
              <div>
                <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-canvas/45">
                  Today · {WORLD_LABELS[world].name}
                </p>

                <h1 className="mt-3 max-w-[30ch] font-display text-[clamp(1.35rem,3.4vw,2rem)] font-medium leading-[1.16] tracking-[-0.025em] text-canvas">
                  {prompt.title}
                </h1>

                <p className="mt-2.5 max-w-[58ch] text-[0.86rem] leading-[1.65] text-canvas/65">
                  {prompt.brief}
                </p>
              </div>

              <dl className="hidden shrink-0 gap-4 border-l border-canvas/12 pl-7 md:grid">
                {[
                  ["Think", `${prep}s`],
                  ["Speak", `${speak}s`],
                  ["Topic", TOPIC_LABELS[prompt.topic]],
                ].map(([label, value]) => (
                  <div key={label}>
                    <dt className="font-display text-[0.54rem] uppercase tracking-[0.18em] text-canvas/40">
                      {label}
                    </dt>
                    <dd className="mt-0.5 font-display text-[0.82rem] text-canvas/85">{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="md:col-span-2">
                {/* Phones have no meta column, so the numbers go above the buttons
                    rather than beside them. */}
                <div className="mb-4 flex items-center gap-x-3 font-display text-[0.62rem] uppercase tracking-[0.14em] text-canvas/40 md:hidden">
                  <span>{prep}s think</span>
                  <span aria-hidden="true">·</span>
                  <span>{speak}s speak</span>
                  <span aria-hidden="true">·</span>
                  <span>{TOPIC_LABELS[prompt.topic]}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                <Link
                  href={`/welcome?format=${world}`}
                  className="btn btn-sm border-transparent bg-canvas text-fg hover:bg-canvas/90"
                >
                  Start rep
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href={`/welcome?format=${world}&take=1`}
                  className="btn btn-sm border border-canvas/25 text-canvas/80 hover:border-canvas/50 hover:text-canvas"
                >
                  Another prompt
                </Link>
                </div>
              </div>
            </div>
          </section>

          {/* ---------------- numbers, on the canvas ---------------- */}
          <div className="mt-7 grid grid-cols-4 divide-x divide-line">
            <Metric
              label="Rating"
              value={stat.rating}
              hint={stat.reps === 0 ? "provisional" : undefined}
            />
            <Metric label="Reps" value={stat.reps} className="pl-3 sm:pl-6" />
            <Metric label="XP" value={stat.xp} className="pl-3 sm:pl-6" />
            <Metric
              label="Streak"
              value={data.totals.streak}
              className="pl-3 sm:pl-6"
            />
          </div>

          {/* ---------------- baseline: one line, not a column ---------------- */}
          <div className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t border-line pt-4">
            <p className="text-[0.78rem] text-muted">
              <span className="font-display text-[0.58rem] uppercase tracking-[0.16em] text-faint">
                Baseline
              </span>
              <span className="ml-2.5">
                {data.capture
                  ? `${data.capture.word_count} words, ${data.capture.source === "speech" ? "spoken" : "typed"}, deleted ${new Date(
                      data.capture.expires_at,
                    ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`
                  : "not recorded yet"}
              </span>
            </p>
            <Link
              href="/onboarding?edit=1"
              className="link-underline text-[0.78rem] text-fg"
            >
              {data.capture ? "Redo the check" : "Record the 60-second check"} →
            </Link>
          </div>

          {/* ---------------- guide ---------------- */}
          <div className="mt-8 border-t border-line pt-8">
            <section>
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-faint">
                  Your guide
                </h2>
                <span className="font-display text-[0.56rem] uppercase tracking-[0.14em] text-faint">
                  rule-based
                </span>
              </div>

              <div className="mt-3 grid gap-6 lg:grid-cols-2 lg:gap-10">
              {lead ? (
                <div>
                  <h3 className="max-w-[30ch] font-display text-[1.05rem] font-medium leading-snug tracking-[-0.01em] text-fg">
                    {lead.title}
                  </h3>
                  <p className="mt-2 max-w-[56ch] text-[0.86rem] leading-[1.7] text-muted">
                    {lead.body}
                  </p>
                  <Link
                    href={lead.href}
                    className={["link-underline mt-2.5 inline-block text-[0.8rem]", accent.text].join(" ")}
                  >
                    {lead.cta} →
                  </Link>
                </div>
              ) : null}

              {second ? (
                <Link
                  href={second.href}
                  className="group flex flex-col justify-between gap-3 border-t border-line pt-4 text-muted transition-colors hover:text-fg lg:border-t-0 lg:pt-0"
                >
                  <span>
                    <span className="block font-display text-[0.82rem] font-medium text-fg">
                      {second.title}
                    </span>
                    <span className="mt-1.5 block max-w-[46ch] text-[0.8rem] leading-[1.65]">
                      {second.body}
                    </span>
                  </span>
                  <span className="text-[0.78rem] text-faint group-hover:text-fg">
                    {second.cta} →
                  </span>
                </Link>
              ) : null}
              </div>

              <p className="mt-5 text-[0.68rem] leading-relaxed text-faint">
                Rule-based for now. The mentor that scores reps comes with the arena.
              </p>
            </section>
          </div>

          {/* ---------------- the week in this world ---------------- */}
          <section className="mt-10 border-t border-line pt-7">
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-faint">
                This week · {WORLD_LABELS[world].name}
              </h2>
              <p className="font-display text-[0.72rem] tabular-nums text-muted">
                {weekTotal} {weekTotal === 1 ? "rep" : "reps"} · {stat.xp} XP
              </p>
            </div>

            <div className="mt-5 max-w-[38rem]">
              <WeekChart week={week} barClass={accent.bar} />
            </div>

            <p className="mt-4 text-[0.76rem] leading-relaxed text-muted">
              {weekTotal === 0
                ? `Nothing in ${WORLD_LABELS[world].name.toLowerCase()} this week. One rep puts a bar here — and ${WORLD_LABELS[world].blurb.toLowerCase()}`
                : `${WORLD_LABELS[world].blurb} Keep the bars level and the rating follows.`}
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({
  label,
  value,
  hint,
  className = "",
}: {
  label: string;
  value: number;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="font-display text-[clamp(1.4rem,4vw,1.7rem)] font-medium leading-none tabular-nums tracking-[-0.03em] text-fg">
        {value}
      </p>
      <p className="mt-2 font-display text-[0.6rem] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      {hint ? <p className="mt-0.5 text-[0.62rem] text-faint/75">{hint}</p> : null}
    </div>
  );
}
