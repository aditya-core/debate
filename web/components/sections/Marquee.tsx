const WORDS = [
  "Think clearly",
  "Speak confidently",
  "Argue well",
  "Think on your feet",
  "Hold your ground",
  "Listen properly",
  "Make it land",
];

function Row() {
  return (
    <div className="marquee-track" aria-hidden="true">
      {WORDS.map((w, i) => (
        <span key={`${w}-${i}`} className="flex items-center gap-10">
          <span className="font-display text-[0.95rem] font-medium uppercase tracking-[0.24em] text-white/90">
            {w}
          </span>
          <span className="text-white/40" aria-hidden="true">
            ✦
          </span>
        </span>
      ))}
    </div>
  );
}

export default function Marquee() {
  return (
    <section
      aria-label="What Gift of Words trains"
      className="relative overflow-hidden border-y border-line py-4"
      style={{
        background:
          "linear-gradient(100deg, var(--c-brand) 0%, #6a43ff 42%, var(--c-sky) 100%)",
      }}
    >
      <div className="marquee">
        <Row />
        <Row />
      </div>
    </section>
  );
}
