export default function Vision() {
  return (
    <section id="vision" className="relative overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, #4b1fd6 0%, #6a3cf0 32%, #b03bd6 66%, #ff3d8b 100%)",
        }}
        aria-hidden="true"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />

      <div className="shell relative py-20 sm:py-24">
        <p className="font-display text-[0.7rem] uppercase tracking-[0.24em] text-white/60">
          Our vision
        </p>

        <blockquote className="mt-7 max-w-[24ch] font-display text-[clamp(1.75rem,4.6vw,3.2rem)] font-medium leading-[1.08] tracking-[-0.03em] text-white">
          The ability to be understood is not a talent. It is a practice.
        </blockquote>

        <div className="mt-8 flex flex-col gap-6 border-t border-white/20 pt-6 sm:flex-row sm:items-end sm:justify-between">
          <p className="max-w-[52ch] text-[0.95rem] leading-[1.7] text-white/75">
            Gift of Words exists for the moment before the room — the interview,
            the argument, the speech you did not get to prepare for. We think
            that moment can be trained, and that everyone deserves the training.
          </p>
          <p className="font-display text-[0.8rem] uppercase tracking-[0.2em] text-white/60">
            Built in India · for everyone
          </p>
        </div>
      </div>
    </section>
  );
}
