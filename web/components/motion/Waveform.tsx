/**
 * Seeded pseudo-random bar heights: deterministic, so the server and the
 * client render the same wave. Each bar gets its own duration and offset.
 */
export default function Waveform({
  bars = 44,
  className = "",
}: {
  bars?: number;
  className?: string;
}) {
  const heights = Array.from({ length: bars }, (_, i) => {
    const n = Math.sin(i * 12.9898) * 43758.5453;
    return n - Math.floor(n);
  });

  return (
    <div className={`flex items-end justify-between gap-[3px] ${className}`} aria-hidden="true">
      {heights.map((r, i) => (
        <span
          key={i}
          className="wave-bar w-full rounded-full"
          style={{
            height: `${28 + r * 62}%`,
            ["--hi" as string]: `${0.45 + r * 0.55}`,
            ["--lo" as string]: `${0.18 + r * 0.22}`,
            ["--dur" as string]: `${620 + Math.round(r * 780)}ms`,
            ["--delay" as string]: `${-Math.round(r * 1200)}ms`,
            background:
              i % 5 === 0
                ? "var(--c-flare)"
                : i % 3 === 0
                  ? "var(--c-aqua)"
                  : "var(--c-brand)",
            opacity: 0.9,
          }}
        />
      ))}
    </div>
  );
}
