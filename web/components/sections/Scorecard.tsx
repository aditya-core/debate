import { RUBRIC } from "@/lib/sample-data";

export default function Scorecard() {
  const total = RUBRIC.reduce((a, r) => a + r.score, 0);
  const max = RUBRIC.reduce((a, r) => a + r.max, 0);

  return (
    <section className="section relative">
      <div className="shell grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <p className="eyebrow reveal">The feedback</p>
          <h2 className="reveal mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
            Specific enough to change what you do next.
          </h2>
          <p className="reveal mt-5 max-w-[50ch] text-[1rem] leading-[1.7] text-muted">
            “Good job, keep practising” is worthless. A rubric that says your
            evidence was strong but your rebuttal answered a different argument
            is something you can act on tonight.
          </p>

          <ul className="mt-7 space-y-3">
            {[
              "Every score traceable to a line you actually said",
              "One priority fix per session, not twelve",
              "History kept so patterns become visible",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3 text-[0.92rem] text-fg/85">
                <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-mint/15 text-mint-text">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>

        {/* the card */}
        <div className="reveal relative" style={{ "--d": "120ms" }}>
          <div
            aria-hidden="true"
            className="absolute -inset-4 -z-10 rounded-[32px]"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--c-flare) 14%, transparent), color-mix(in oklab, var(--c-sun) 10%, transparent) 50%, transparent 78%)",
              filter: "blur(4px)",
            }}
          />

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div>
                <p className="font-display text-[0.68rem] uppercase tracking-[0.18em] text-faint">
                  Round scorecard
                </p>
                <p className="mt-0.5 font-display text-[0.95rem] font-medium text-fg">
                  Debate · “Social media does more harm than good”
                </p>
              </div>
              <span className="tnum shrink-0 rounded-full bg-fg px-3 py-1 font-display text-[0.8rem] font-medium text-canvas">
                {total}/{max}
              </span>
            </div>

            <ul className="divide-y divide-line px-6">
              {RUBRIC.map((r) => (
                <li key={r.label} className="flex items-center gap-4 py-3.5">
                  <span className="flex-1 text-[0.86rem] leading-snug text-muted">
                    {r.label}
                  </span>
                  <span className="flex shrink-0 gap-1" aria-hidden="true">
                    {Array.from({ length: r.max }).map((_, i) => (
                      <span
                        key={i}
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background:
                            i < r.score ? "var(--c-brand)" : "var(--c-line-strong)",
                        }}
                      />
                    ))}
                  </span>
                  <span className="tnum w-8 text-right font-display text-[0.8rem] text-fg">
                    {r.score}/{r.max}
                  </span>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-surface-2 px-6 py-4">
              <p className="font-display text-[0.66rem] uppercase tracking-[0.18em] text-flare-text">
                Priority for next round
              </p>
              <p className="mt-1.5 text-[0.86rem] leading-relaxed text-muted">
                Your rebuttal answered a <em>different</em> argument. Restate
                the opposing claim in one sentence before you respond to it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
