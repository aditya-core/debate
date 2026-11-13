"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Phase = "idle" | "prep" | "speak" | "done";

const R = 54;
const CIRCUMFERENCE = 2 * Math.PI * R;

function clock(total: number): string {
  const s = Math.max(0, Math.ceil(total));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/**
 * A first rep, not a test.
 *
 * Two phases and a deadline — that is the whole product in miniature: think for
 * a fixed time, then speak for a fixed time. Nothing is recorded here, and the
 * copy says so. The ring is the only thing that moves, so it can be watched
 * without reading.
 */
export default function PrepTimer({
  prep,
  speak,
  format,
}: {
  prep: number;
  speak: number;
  format: "debate" | "extempore";
}) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [remaining, setRemaining] = useState(prep);
  const [total, setTotal] = useState(prep);
  const endAt = useRef<number | null>(null);

  const start = useCallback(
    (next: Phase, seconds: number) => {
      setPhase(next);
      setTotal(seconds);
      setRemaining(seconds);
      endAt.current = Date.now() + seconds * 1000;
    },
    [],
  );

  useEffect(() => {
    if (phase !== "prep" && phase !== "speak") return;

    const id = window.setInterval(() => {
      const left = endAt.current ? (endAt.current - Date.now()) / 1000 : 0;
      if (left <= 0) {
        window.clearInterval(id);
        setRemaining(0);
        if (phase === "prep") {
          start("speak", speak);
        } else {
          setPhase("done");
        }
        return;
      }
      setRemaining(left);
    }, 250);

    return () => window.clearInterval(id);
  }, [phase, speak, start]);

  const filled = total > 0 ? remaining / total : 0;
  const running = phase === "prep" || phase === "speak";

  const phaseLabel =
    phase === "prep"
      ? "Thinking"
      : phase === "speak"
        ? "Speaking"
        : phase === "done"
          ? "That's a rep"
          : "Ready when you are";

  const hint =
    phase === "prep"
      ? format === "debate"
        ? "Three beats: the claim, the reason, the objection you will answer. No notes yet — say it in your head."
        : "One story, one point, one line you want them to remember. No notes."
      : phase === "speak"
        ? "Out loud, at normal volume. Pauses are allowed — silence is not a mistake, filler is."
        : phase === "done"
          ? "Nothing was recorded or scored — the arena does that. This was only to hear your own voice start."
          : `You get ${clock(prep)} to think and ${clock(speak)} to speak. Start when you are ready.`;

  return (
    <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
      <div className="flex items-center gap-5">
        {/* ---- the ring ---- */}
        <div className="relative shrink-0" aria-hidden="true">
          <svg viewBox="0 0 128 128" className="h-[104px] w-[104px] -rotate-90">
            <circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              strokeWidth="7"
              className="stroke-line-strong"
            />
            <circle
              cx="64"
              cy="64"
              r={R}
              fill="none"
              strokeWidth="7"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={CIRCUMFERENCE * (1 - filled)}
              className={[
                "prep-ring",
                phase === "speak" ? "stroke-flare" : "stroke-brand",
                phase === "done" ? "stroke-aqua" : "",
              ].join(" ")}
            />
          </svg>
          <span className="pointer-events-none absolute inset-0 grid place-items-center font-display text-[1.05rem] tabular-nums tracking-tight text-fg">
            {phase === "done" ? "✓" : clock(remaining)}
          </span>
        </div>

        {/* ---- the words ---- */}
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-display text-[0.62rem] uppercase tracking-[0.2em] text-faint">
            {running ? (
              <span
                aria-hidden="true"
                className={[
                  "inline-block h-1.5 w-1.5 rounded-full",
                  phase === "speak" ? "bg-flare prep-dot" : "bg-brand prep-dot",
                ].join(" ")}
              />
            ) : null}
            {phaseLabel}
          </p>
          <p
            aria-live="polite"
            className="mt-1.5 text-[0.86rem] leading-relaxed text-muted"
          >
            {hint}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {phase === "idle" ? (
          <button
            type="button"
            onClick={() => start("prep", prep)}
            className="btn btn-primary btn-sm"
          >
            Start · {clock(prep)} to think
            <span aria-hidden="true">→</span>
          </button>
        ) : null}

        {phase === "prep" ? (
          <>
            <button
              type="button"
              onClick={() => start("speak", speak)}
              className="btn btn-primary btn-sm"
            >
              I&apos;m ready — speak now
              <span aria-hidden="true">→</span>
            </button>
            <button
              type="button"
              onClick={() => start("prep", prep)}
              className="btn btn-outline btn-sm"
            >
              Restart prep
            </button>
          </>
        ) : null}

        {phase === "speak" ? (
          <button
            type="button"
            onClick={() => setPhase("done")}
            className="btn btn-outline btn-sm"
          >
            Stop early
          </button>
        ) : null}

        {phase === "done" ? (
          <button
            type="button"
            onClick={() => {
              setPhase("idle");
              setRemaining(prep);
              setTotal(prep);
            }}
            className="btn btn-outline btn-sm"
          >
            Run it again
          </button>
        ) : null}

        <span className="ml-auto text-[0.72rem] text-faint">
          {running ? "No timer sounds" : "Optional — the prompt is yours either way"}
        </span>
      </div>
    </div>
  );
}
