import Link from "next/link";
import WeekChart from "@/components/dashboard/WeekChart";
import type { DashboardData, WorldStat } from "@/lib/dashboard/data";
import type { GuideItem } from "@/lib/dashboard/guide";
import { TOPIC_LABELS, WINDOW_LABELS } from "@/lib/onboarding/schema";
import { prepSeconds, speakSeconds } from "@/lib/practice/prompts";

const dateFormat = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/**
 * Home.
 *
 * The order is the argument: what to do today, then what the numbers say, then
 * what the guide thinks, then the two worlds, then the week. Numbers appear
 * after the action on purpose — a new account has nothing but zeros, and zeros
 * shown first read as failure rather than as day one.
 */
export default function Dashboard({
  data,
  guide,
}: {
  data: DashboardData;
  guide: GuideItem[];
}) {
  const prep = prepSeconds(data.today.format);
  const speak = speakSeconds(data.today.format);
  const window = WINDOW_LABELS[data.learner.practiceWindow as keyof typeof WINDOW_LABELS];

  return (
    <div className="px-5 pb-28 pt-8 sm:px-8 sm:pb-12 sm:pt-10">
      {/* ---------------- greeting ---------------- */}
      <header className="dash-rise">
        <p className="eyebrow">Your home</p>
        <h1 className="mt-3 font-display text-[clamp(1.6rem,3.6vw,2.15rem)] font-medium leading-[1.1] tracking-[-0.03em] text-fg">
          {data.firstName ? `Good to see you, ${data.firstName}.` : "Good to see you."}
        </h1>
        <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.82rem] text-muted">
          <span className="font-display tracking-[0.04em]">{data.displayId}</span>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
          <span>joined {dateFormat(data.memberSince)}</span>
          <span aria-hidden="true" className="text-faint">
            ·
          </span>
          <span>
            {data.learner.minutesPerDay} min a day{window ? `, ${window.toLowerCase()}` : ""}
          </span>
        </p>
      </header>

      {/* ---------------- today ---------------- */}
      <section
        className="dash-rise elevated relative mt-7 overflow-hidden rounded-3xl border border-line bg-surface"
        style={{ animationDelay: "60ms" }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              "radial-gradient(closest-side, color-mix(in oklab, var(--c-brand) 45%, transparent), transparent)",
          }}
        />
        <div className="relative px-5 py-6 sm:px-7 sm:py-7">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-brand/35 bg-brand-soft px-2.5 py-1 font-display text-[0.6rem] uppercase tracking-[0.16em] text-fg">
              Today&apos;s rep
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 font-display text-[0.6rem] uppercase tracking-[0.16em] text-muted">
              {data.today.format === "debate" ? "Debate" : "Extempore"}
            </span>
            <span className="rounded-full border border-line px-2.5 py-1 font-display text-[0.6rem] uppercase tracking-[0.16em] text-faint">
              {TOPIC_LABELS[data.today.topic]}
            </span>
          </div>

          <h2 className="mt-4 max-w-[34ch] font-display text-[clamp(1.25rem,3vw,1.7rem)] font-medium leading-[1.2] tracking-[-0.02em] text-fg">
            {data.today.title}
          </h2>
          <p className="mt-2.5 max-w-[58ch] text-[0.88rem] leading-[1.7] text-muted">
            {data.today.brief}
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-2.5">
            <Link href="/welcome" className="btn btn-primary btn-sm">
              Start · {prep}s think, {speak}s speak
              <span aria-hidden="true">→</span>
            </Link>
            <Link href="/welcome?take=1" className="btn btn-outline btn-sm">
              A different prompt
            </Link>
          </div>
        </div>
      </section>

      {/* ---------------- numbers ---------------- */}
      <div
        className="dash-rise mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4"
        style={{ animationDelay: "110ms" }}
      >
        <Tile label="Debate rating" value={data.worlds.debate.rating} hint="provisional" />
        <Tile label="Extempore rating" value={data.worlds.extempore.rating} hint="provisional" />
        <Tile label="Reps" value={data.totals.reps} hint="all time" />
        <Tile
          label="Streak"
          value={data.totals.streak}
          hint={data.totals.streak === 1 ? "day" : "days"}
        />
      </div>

      {/* ---------------- guide + baseline ---------------- */}
      <div
        className="dash-rise mt-8 grid gap-4 lg:grid-cols-3"
        style={{ animationDelay: "160ms" }}
      >
        <section className="rounded-2xl border border-line bg-surface p-5 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-faint">
              Your guide
            </p>
            <span className="rounded-full border border-line px-2 py-0.5 font-display text-[0.58rem] uppercase tracking-[0.14em] text-faint">
              rule-based for now
            </span>
          </div>

          <ul className="mt-4 space-y-4">
            {guide.map((item, index) => (
              <li key={item.title} className="flex gap-3">
                <span
                  aria-hidden="true"
                  className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-brand/35 bg-brand-soft font-display text-[0.62rem] text-fg"
                >
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-display text-[0.92rem] font-medium leading-snug text-fg">
                    {item.title}
                  </p>
                  <p className="mt-1 max-w-[56ch] text-[0.84rem] leading-relaxed text-muted">
                    {item.body}
                  </p>
                  <Link
                    href={item.href}
                    className="link-underline mt-1.5 inline-block text-[0.78rem] text-fg"
                  >
                    {item.cta} →
                  </Link>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-5 border-t border-line pt-3 text-[0.72rem] leading-relaxed text-faint">
            This reads your answers and your history, and says only what they
            support. The mentor that scores your reps — and argues back — arrives
            with the arena.
          </p>
        </section>

        <section className="flex flex-col rounded-2xl border border-line bg-surface p-5">
          <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-faint">
            Baseline
          </p>

          {data.capture ? (
            <>
              <p className="mt-3 font-display text-[1.5rem] font-medium tabular-nums tracking-[-0.02em] text-fg">
                {data.capture.word_count}
                <span className="ml-1 text-[0.8rem] font-normal text-muted">words</span>
              </p>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                recorded {dateFormat(data.capture.created_at)} ·{" "}
                {data.capture.source === "speech" ? "spoken" : "typed"}
              </p>
              <p className="mt-auto pt-4 text-[0.72rem] leading-relaxed text-faint">
                Stored as text only, deleted {dateFormat(data.capture.expires_at)}.
                Audio never leaves your device.
              </p>
            </>
          ) : (
            <>
              <p className="mt-3 text-[0.9rem] leading-relaxed text-fg">
                Not recorded yet. It is optional, and it is the only thing that
                makes your first score comparable to anything.
              </p>
              <Link
                href="/onboarding?edit=1"
                className="btn btn-outline btn-sm mt-4 self-start"
              >
                Record it
              </Link>
            </>
          )}
        </section>
      </div>

      {/* ---------------- worlds ---------------- */}
      <section className="dash-rise mt-8" style={{ animationDelay: "210ms" }}>
        <h2 className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-faint">
          Two worlds, one you
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <WorldCard
            name="Debate"
            blurb="Take a side, hold it, answer the objection."
            stat={data.worlds.debate}
            format="debate"
          />
          <WorldCard
            name="Extempore"
            blurb="A minute to think, two to speak, nothing to hide behind."
            stat={data.worlds.extempore}
            format="extempore"
          />
        </div>
      </section>

      {/* ---------------- week ---------------- */}
      <section
        className="dash-rise mt-8 rounded-2xl border border-line bg-surface p-5"
        style={{ animationDelay: "260ms" }}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-faint">
            Last seven days
          </p>
          <p className="font-display text-[0.72rem] tabular-nums text-muted">
            {data.totals.reps} {data.totals.reps === 1 ? "rep" : "reps"} total ·{" "}
            {data.totals.xp} XP
          </p>
        </div>
        <div className="mt-4">
          <WeekChart week={data.week} />
        </div>
      </section>
    </div>
  );
}

function Tile({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface px-4 py-3.5">
      <p className="font-display text-[0.56rem] uppercase tracking-[0.16em] text-faint">
        {label}
      </p>
      <p className="mt-1.5 font-display text-[1.35rem] font-medium leading-none tabular-nums tracking-[-0.02em] text-fg">
        {value}
      </p>
      <p className="mt-1 text-[0.68rem] text-faint">{hint}</p>
    </div>
  );
}

function WorldCard({
  name,
  blurb,
  stat,
  format,
}: {
  name: string;
  blurb: string;
  stat: WorldStat;
  format: "debate" | "extempore";
}) {
  return (
    <div className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-line-strong">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-display text-[1rem] font-medium tracking-[-0.01em] text-fg">
            {name}
          </p>
          <p className="mt-1 max-w-[34ch] text-[0.8rem] leading-relaxed text-muted">
            {blurb}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-display text-[1.15rem] tabular-nums leading-none text-fg">
            {stat.rating}
          </p>
          <p className="mt-1 font-display text-[0.56rem] uppercase tracking-[0.14em] text-faint">
            rating
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <p className="text-[0.72rem] text-faint">
          {stat.reps} {stat.reps === 1 ? "rep" : "reps"} · {stat.xp} XP
        </p>
        <Link href={`/welcome?format=${format}`} className="btn btn-outline btn-sm">
          Enter
        </Link>
      </div>
    </div>
  );
}
