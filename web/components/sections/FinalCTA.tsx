import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="section relative isolate overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="orb"
          style={{
            width: 460,
            height: 460,
            top: -120,
            left: "50%",
            transform: "translateX(-50%)",
            background:
              "radial-gradient(circle, var(--c-brand) 0%, transparent 70%)",
            opacity: 0.16,
          }}
        />
        <div
          className="orb"
          style={{
            width: 340,
            height: 340,
            bottom: -140,
            right: "8%",
            background:
              "radial-gradient(circle, var(--c-flare) 0%, transparent 70%)",
            opacity: 0.14,
          }}
        />
      </div>

      <div className="shell text-center">
        <span className="pill reveal">
          <span className="pill-dot" />
          First cohort · limited seats
        </span>

        <h2 className="reveal mx-auto mt-6 max-w-[20ch] font-display text-[clamp(2.1rem,5.4vw,3.9rem)] font-medium leading-[1.02] tracking-[-0.035em] text-fg">
          Your voice is the one thing
          <span className="text-gradient-warm"> nobody can take from you.</span>
        </h2>

        <p className="reveal mx-auto mt-5 max-w-[46ch] text-[1rem] leading-[1.7] text-muted">
          Start with one round. Five minutes. No audience, no judgement, and
          feedback you can actually use.
        </p>

        <div className="reveal mt-9 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup" className="btn btn-primary">
            Begin your journey <span aria-hidden="true">↗</span>
          </Link>
          <Link href="/develop" className="btn btn-outline">
            See what we&rsquo;re building
          </Link>
        </div>

        <p className="reveal mt-6 text-[0.78rem] text-faint">
          Free while we build. No card, no trial countdown.
        </p>
      </div>
    </section>
  );
}
