import Radar from "@/components/charts/Radar";
import Bars from "@/components/charts/Bars";
import Sparkline from "@/components/charts/Sparkline";
import { SKILLS, WEEKLY_MINUTES, RATING_SERIES } from "@/lib/sample-data";

export default function SkillData() {
  const total = WEEKLY_MINUTES.reduce((a, b) => a + b.minutes, 0);
  const first = RATING_SERIES[0];
  const last = RATING_SERIES[RATING_SERIES.length - 1];

  return (
    <section id="data" className="section relative border-y border-line bg-surface-2">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-[42rem]">
            <p className="eyebrow reveal">The data</p>
            <h2 className="reveal mt-5 font-display text-[clamp(1.9rem,4.2vw,3.1rem)] font-medium leading-[1.05] tracking-[-0.03em] text-fg">
              “You&rsquo;re getting better” is not feedback.
            </h2>
            <p className="reveal mt-5 max-w-[54ch] text-[1rem] leading-[1.7] text-muted">
              Six dimensions, scored the same way every time, so the shape of
              your progress is visible instead of felt.
            </p>
          </div>
          <span className="reveal pill">Sample profile · illustrative data</span>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1.08fr_1fr]">
          {/* radar */}
          <div className="reveal card p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-[1.05rem] font-medium tracking-tight text-fg">
                  Communication profile
                </h3>
                <p className="mt-1 text-[0.82rem] text-faint">
                  Last 30 days · 18 sessions
                </p>
              </div>
              <span className="tnum rounded-full bg-brand-soft px-2.5 py-1 font-display text-[0.75rem] font-medium text-brand">
                78 avg
              </span>
            </div>

            <div className="mx-auto mt-2 max-w-[340px]">
              <Radar data={SKILLS} id="profile" />
            </div>

            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {SKILLS.map((s) => (
                <li key={s.label} className="flex items-center gap-3">
                  <span className="w-[5.2rem] shrink-0 font-display text-[0.72rem] uppercase tracking-[0.1em] text-faint">
                    {s.label}
                  </span>
                  <span className="h-1 flex-1 overflow-hidden rounded-full bg-line">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        width: `${s.value}%`,
                        background:
                          "linear-gradient(90deg, var(--c-brand), var(--c-sky))",
                      }}
                    />
                  </span>
                  <span className="tnum w-6 text-right text-[0.75rem] text-muted">
                    {s.value}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* right stack */}
          <div className="grid gap-6">
            <div className="reveal card p-6 sm:p-7" style={{ "--d": "90ms" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[1.05rem] font-medium tracking-tight text-fg">
                    Practice this week
                  </h3>
                  <p className="mt-1 text-[0.82rem] text-faint">
                    Minutes per day
                  </p>
                </div>
                <span className="tnum font-display text-[1.35rem] font-medium tracking-tight text-fg">
                  {total}
                  <span className="ml-1 text-[0.7rem] uppercase tracking-wider text-faint">
                    min
                  </span>
                </span>
              </div>
              <div className="mt-5">
                <Bars data={WEEKLY_MINUTES} />
              </div>
            </div>

            <div className="reveal card p-6 sm:p-7" style={{ "--d": "160ms" }}>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-display text-[1.05rem] font-medium tracking-tight text-fg">
                    Debate rating
                  </h3>
                  <p className="mt-1 text-[0.82rem] text-faint">
                    Eight weeks
                  </p>
                </div>
                <span className="tnum rounded-full bg-mint/12 px-2.5 py-1 font-display text-[0.75rem] font-medium text-mint-text">
                  +{last - first}
                </span>
              </div>
              <div className="mt-3">
                <Sparkline values={RATING_SERIES} />
              </div>
              <p className="mt-3 text-[0.78rem] leading-relaxed text-faint">
                Separate from your Extempore rating — by design. A single
                blended score hides exactly what you need to work on.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
