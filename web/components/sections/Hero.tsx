import Link from "next/link";
import LiveDemo from "./LiveDemo";

export default function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden">
      {/* atmosphere */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 grid-bg" />
        <div
          className="orb"
          style={{
            width: 520,
            height: 520,
            top: -160,
            right: -120,
            background:
              "radial-gradient(circle, var(--c-brand) 0%, transparent 70%)",
            opacity: 0.22,
          }}
        />
        <div
          className="orb"
          style={{
            width: 420,
            height: 420,
            bottom: -180,
            left: -140,
            background:
              "radial-gradient(circle, var(--c-flare) 0%, transparent 70%)",
            opacity: 0.16,
          }}
        />
        <div
          className="orb"
          style={{
            width: 360,
            height: 360,
            top: 120,
            left: "38%",
            background:
              "radial-gradient(circle, var(--c-aqua) 0%, transparent 70%)",
            opacity: 0.12,
          }}
        />
      </div>

      <div className="shell grid items-center gap-14 py-14 sm:py-16 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16 lg:py-24">
        {/* copy */}
        <div>
          <span className="pill">
            <span className="pill-dot" />
            Building the first cohort
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.5rem,6.2vw,4.6rem)] font-medium leading-[0.96] tracking-[-0.04em] text-fg">
            Unlock the power
            <br />
            <span className="text-gradient">of your words.</span>
          </h1>

          <p className="mt-6 max-w-[26ch] font-display text-[clamp(1.05rem,2vw,1.32rem)] leading-[1.4] text-fg sm:max-w-[34ch]">
            Think clearly. Speak confidently.{" "}
            <span className="text-muted">Communicate exceptionally.</span>
          </p>

          <p className="mt-4 max-w-[48ch] text-[0.95rem] leading-[1.7] text-muted">
            An intelligent training experience for debate, extempore and the
            uncomfortable art of thinking on your feet — with feedback specific
            enough to actually change how you speak.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/signup" className="btn btn-primary">
              Begin your journey
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/#how" className="btn btn-outline">
              See how it works
              <span aria-hidden="true">↓</span>
            </Link>
          </div>

          <dl className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6">
            {[
              { k: "2", v: "practice worlds" },
              { k: "6", v: "skills measured" },
              { k: "5 min", v: "a day is enough" },
            ].map((s) => (
              <div key={s.v}>
                <dt className="font-display text-xl font-medium tracking-tight text-fg">
                  {s.k}
                </dt>
                <dd className="mt-0.5 text-[0.76rem] uppercase tracking-[0.14em] text-faint">
                  {s.v}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* product preview */}
        <div className="relative">
          <div
            aria-hidden="true"
            className="absolute -inset-6 -z-10 rounded-[34px]"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in oklab, var(--c-brand) 16%, transparent), color-mix(in oklab, var(--c-sky) 10%, transparent) 45%, transparent 75%)",
              filter: "blur(6px)",
            }}
          />

          <div className="relative mx-auto max-w-[440px]">
            <div
              aria-hidden="true"
              className="absolute inset-x-4 -top-3 h-6 rounded-t-2xl border border-line bg-surface/70"
            />
            <LiveDemo />

            {/* floating chips — desktop only, so nothing overflows on phones */}
            <div className="pointer-events-none absolute -left-10 bottom-16 hidden xl:block">
              <div className="card flex items-center gap-3 px-3.5 py-2.5">
                <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-soft font-display text-[0.7rem] font-semibold text-brand">
                  DB
                </span>
                <div>
                  <p className="text-[0.66rem] uppercase tracking-[0.14em] text-faint">
                    Debate rating
                  </p>
                  <p className="tnum font-display text-[0.9rem] font-medium text-fg">
                    1,312 <span className="text-[0.7rem] text-mint">+32</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 top-10 hidden xl:block">
              <div className="card px-3.5 py-2">
                <p className="text-[0.66rem] uppercase tracking-[0.14em] text-faint">
                  Streak
                </p>
                <p className="font-display text-[0.9rem] font-medium text-fg">
                  6 days <span aria-hidden="true">🔥</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
