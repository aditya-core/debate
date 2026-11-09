import Link from "next/link";
import CountUp from "@/components/motion/CountUp";
import Magnetic from "@/components/motion/Magnetic";
import LiveDemo from "./LiveDemo";

const STATS = [
  { value: 2, suffix: "", label: "practice worlds" },
  { value: 6, suffix: "", label: "skills measured" },
  { value: 5, suffix: " min", label: "a day is enough" },
];

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
            background: "radial-gradient(circle, var(--c-brand) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, var(--c-flare) 0%, transparent 70%)",
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
            background: "radial-gradient(circle, var(--c-aqua) 0%, transparent 70%)",
            opacity: 0.12,
          }}
        />

        {/* concentric rings behind the panel — a room listening */}
        <svg
          className="absolute right-[-12%] top-1/2 hidden h-[720px] w-[720px] -translate-y-1/2 opacity-[0.13] lg:block"
          viewBox="0 0 400 400"
          aria-hidden="true"
        >
          {[70, 110, 150, 190].map((r, i) => (
            <circle
              key={r}
              cx="200"
              cy="200"
              r={r}
              fill="none"
              stroke="var(--c-brand)"
              strokeWidth="0.7"
              className="ring-pulse"
              style={{ transformOrigin: "200px 200px", animationDelay: `${i * 0.85}s` }}
            />
          ))}
        </svg>
      </div>

      <div className="shell grid items-center gap-14 py-12 sm:py-16 lg:grid-cols-[1.06fr_0.94fr] lg:gap-16 lg:py-24">
        {/* copy */}
        <div>
          <span className="pill rise" style={{ "--d": "60ms" } as React.CSSProperties}>
            <span className="pill-dot" />
            Building the first cohort
          </span>

          <h1 className="mt-6 font-display text-[clamp(2.5rem,6.2vw,4.6rem)] font-medium leading-[0.96] tracking-[-0.04em] text-fg">
            <span className="mask">
              <span className="mask-line" style={{ "--d": "180ms" } as React.CSSProperties}>
                Unlock the power{" "}
              </span>
            </span>
            <span className="mask">
              <span className="mask-line" style={{ "--d": "300ms" } as React.CSSProperties}>
                of your{" "}
                <span className="accent-word" style={{ "--d": "1080ms" } as React.CSSProperties}>
                  words.
                </span>
              </span>
            </span>
          </h1>

          <p
            className="rise mt-6 max-w-[26ch] font-display text-[clamp(1.05rem,2vw,1.32rem)] leading-[1.4] text-fg sm:max-w-[34ch]"
            style={{ "--d": "520ms" } as React.CSSProperties}
          >
            Think clearly. Speak confidently.{" "}
            <span className="text-muted">Communicate exceptionally.</span>
          </p>

          <p
            className="rise mt-4 max-w-[48ch] text-[0.95rem] leading-[1.7] text-muted"
            style={{ "--d": "600ms" } as React.CSSProperties}
          >
            An intelligent training experience for debate, extempore and the
            uncomfortable art of thinking on your feet — with feedback specific
            enough to actually change how you speak.
          </p>

          <div
            className="rise mt-8 flex flex-wrap items-center gap-3"
            style={{ "--d": "700ms" } as React.CSSProperties}
          >
            <Magnetic>
              <Link href="/signup" className="btn btn-primary btn-sheen">
                Begin your journey
                <span aria-hidden="true">↗</span>
              </Link>
            </Magnetic>
            <Link href="/#how" className="btn btn-outline">
              See how it works
              <span aria-hidden="true">↓</span>
            </Link>
          </div>

          <dl
            className="rise mt-10 flex flex-wrap items-center gap-x-8 gap-y-4 border-t border-line pt-6"
            style={{ "--d": "820ms" } as React.CSSProperties}
          >
            {STATS.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block font-display text-[1.35rem] font-medium leading-none text-fg">
                    <CountUp to={s.value} suffix={s.suffix} />
                  </span>
                  <span className="mt-1.5 block font-display text-[0.68rem] uppercase tracking-[0.16em] text-faint">
                    {s.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the product, performing itself */}
        <div
          className="rise relative"
          style={{ "--d": "420ms" } as React.CSSProperties}
        >
          <div className="float-a">
            <LiveDemo />
          </div>

          <div className="pointer-events-none absolute -left-6 -top-5 hidden sm:block">
            <div className="card float-b px-3.5 py-2.5">
              <p className="font-display text-[0.6rem] uppercase tracking-[0.16em] text-faint">
                Filler words
              </p>
              <p className="mt-0.5 font-display text-[1.15rem] font-medium leading-none text-mint-text">
                −63%
              </p>
            </div>
          </div>

          <div className="pointer-events-none absolute -bottom-6 -right-4 hidden sm:block">
            <div className="card float-a px-3.5 py-2.5" style={{ animationDelay: "1.2s" }}>
              <p className="font-display text-[0.6rem] uppercase tracking-[0.16em] text-faint">
                Confidence
              </p>
              <p className="mt-0.5 font-display text-[1.15rem] font-medium leading-none text-brand">
                +41 pts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
