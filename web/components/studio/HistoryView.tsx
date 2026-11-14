import Link from "next/link";
import type { HistoryData, PracticeEvent } from "@/lib/studio/pages";
import { WORLD_LABELS } from "@/lib/dashboard/types";

function dateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function timeLabel(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function seconds(ms: number | null): string {
  if (!ms) return "—";
  const total = Math.round(ms / 1000);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes ? `${minutes}m ${rest.toString().padStart(2, "0")}s` : `${rest}s`;
}

function Row({ event }: { event: PracticeEvent }) {
  const isBaseline = event.kind === "baseline";
  return (
    <li className="flex items-start gap-4 border-t border-[var(--s-line)] py-4 first:border-t-0">
      <span
        aria-hidden="true"
        className={[
          "mt-1 grid h-9 w-9 shrink-0 place-items-center rounded-xl border text-[0.7rem] font-display",
          isBaseline
            ? "border-[var(--s-amber)]/35 bg-[var(--s-amber)]/10 text-[var(--s-amber)]"
            : "border-[var(--s-line-2)] text-[var(--s-muted)]",
        ].join(" ")}
      >
        {isBaseline ? "60s" : "REP"}
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p className="font-display text-[0.9rem] font-medium">
            {isBaseline
              ? "Baseline check"
              : `${event.world ? WORLD_LABELS[event.world].name : "Practice"} rep`}
          </p>
          {event.world ? (
            <span className="rounded-full border border-[var(--s-line-2)] px-2 py-0.5 font-display text-[0.52rem] uppercase tracking-[0.1em] text-[var(--s-faint)]">
              {event.world}
            </span>
          ) : null}
          {isBaseline ? null : (
            <span className="rounded-full border border-[var(--s-line-2)] px-2 py-0.5 font-display text-[0.52rem] uppercase tracking-[0.1em] text-[var(--s-faint)]">
              not scored yet
            </span>
          )}
        </div>
        <p className="mt-1 text-[0.76rem] leading-relaxed text-[var(--s-muted)]">
          {event.words !== null ? `${event.words} words` : "Length not recorded"}
          {event.durationMs ? ` · ${seconds(event.durationMs)}` : ""}
          {event.source ? ` · ${event.source === "speech" ? "spoken" : "typed"}` : ""}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="font-display text-[0.76rem] tabular-nums text-[var(--s-fg)]">
          {dateLabel(event.at)}
        </p>
        <p className="text-[0.68rem] tabular-nums text-[var(--s-faint)]">{timeLabel(event.at)}</p>
      </div>
    </li>
  );
}

export default function HistoryView({ data }: { data: HistoryData }) {
  const { events, totals, incomplete } = data;
  const empty = events.length === 0;

  return (
    <div className="mx-auto w-full max-w-[60rem] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pb-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-[var(--s-amber)]">
            Everything you have actually done
          </p>
          <h1 className="s-serif mt-2 text-[2rem] font-semibold leading-tight tracking-[-0.02em] lg:text-[2.4rem]">
            Practice history
          </h1>
          <p className="mt-2 max-w-[48ch] text-[0.86rem] leading-relaxed text-[var(--s-muted)]">
            Each row is a moment you spoke, not a lesson you opened. Scores appear
            here once the coach can score a rep.
          </p>
        </div>
        <Link
          href="/welcome"
          className="s-btn-amber inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[0.82rem] font-semibold"
        >
          Start a rep
          <span aria-hidden="true">→</span>
        </Link>
      </header>

      {!empty ? (
        <section className="s-card mt-6 grid grid-cols-2 gap-5 p-5 sm:grid-cols-4 lg:p-6">
          <div>
            <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
              Reps
            </p>
            <p className="mt-1 font-display text-[1.1rem] tabular-nums">{totals.events}</p>
          </div>
          <div>
            <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
              Words
            </p>
            <p className="mt-1 font-display text-[1.1rem] tabular-nums">{totals.words}</p>
          </div>
          <div>
            <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
              Time speaking
            </p>
            <p className="mt-1 font-display text-[1.1rem] tabular-nums">
              {seconds(totals.speakingMs)}
            </p>
          </div>
          <div>
            <p className="font-display text-[0.58rem] uppercase tracking-[0.14em] text-[var(--s-faint)]">
              First rep
            </p>
            <p className="mt-1 font-display text-[1.1rem]">
              {totals.firstAt ? dateLabel(totals.firstAt) : "—"}
            </p>
          </div>
        </section>
      ) : null}

      <section className="s-card mt-5 p-5 lg:p-6">
        {incomplete ? (
          <div className="rounded-xl border border-[var(--s-line-2)] p-4">
            <p className="font-display text-[0.9rem] font-medium">History is unavailable right now.</p>
            <p className="mt-1.5 text-[0.8rem] leading-relaxed text-[var(--s-muted)]">
              The records exist; this read failed. Migration 0008 adds the function
              that serves this list — if it has not been applied, this is the only
              place that can show it.
            </p>
          </div>
        ) : empty ? (
          <div className="py-10 text-center">
            <p className="font-display text-[1.05rem] font-medium">Nothing yet.</p>
            <p className="mx-auto mt-2 max-w-[42ch] text-[0.84rem] leading-relaxed text-[var(--s-muted)]">
              The first row appears the moment you finish a rep or the 60-second
              baseline. Nothing here is backfilled or invented.
            </p>
            <Link
              href="/welcome"
              className="s-btn-amber mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-display text-[0.82rem] font-semibold"
            >
              Record the first one
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        ) : (
          <ul>
            {events.map((event) => (
              <Row key={event.id} event={event} />
            ))}
          </ul>
        )}
      </section>

      <p className="mt-4 text-[0.72rem] leading-relaxed text-[var(--s-faint)]">
        What you said is kept for seven days, then deleted; the fact that you
        practised, and how long for, is kept. That split is deliberate — enough to
        show progress, not enough to build a permanent archive of your voice.
      </p>
    </div>
  );
}
