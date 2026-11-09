import type { SkillAxis } from "@/lib/sample-data";

/**
 * Six-axis skill radar. Pure SVG, no chart library, no client JS —
 * the entrance animation is a CSS transform on scroll.
 */
export default function Radar({
  data,
  size = 300,
  id = "radar",
}: {
  data: SkillAxis[];
  size?: number;
  id?: string;
}) {
  const pad = 66;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - pad;
  const n = data.length;

  const angleAt = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const at = (i: number, ratio: number) => ({
    x: cx + Math.cos(angleAt(i)) * r * ratio,
    y: cy + Math.sin(angleAt(i)) * r * ratio,
  });

  const polygon = data
    .map((d, i) => {
      const p = at(i, d.value / 100);
      return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      role="img"
      aria-label={`Skill profile: ${data.map((d) => `${d.label} ${d.value}`).join(", ")}`}
    >
      <defs>
        <linearGradient id={`${id}-fill`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-brand)" stopOpacity="0.42" />
          <stop offset="60%" stopColor="var(--c-sky)" stopOpacity="0.28" />
          <stop offset="100%" stopColor="var(--c-aqua)" stopOpacity="0.18" />
        </linearGradient>
        <linearGradient id={`${id}-stroke`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--c-brand)" />
          <stop offset="100%" stopColor="var(--c-sky)" />
        </linearGradient>
      </defs>

      {/* rings */}
      {[0.25, 0.5, 0.75, 1].map((ratio) => (
        <polygon
          key={ratio}
          points={data
            .map((_, i) => {
              const p = at(i, ratio);
              return `${p.x.toFixed(1)},${p.y.toFixed(1)}`;
            })
            .join(" ")}
          fill="none"
          stroke="var(--c-line)"
          strokeWidth="1"
        />
      ))}

      {/* spokes */}
      {data.map((_, i) => {
        const p = at(i, 1);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="var(--c-line)"
            strokeWidth="1"
          />
        );
      })}

      {/* shape */}
      <polygon
        className="radar-shape"
        points={polygon}
        fill={`url(#${id}-fill)`}
        stroke={`url(#${id}-stroke)`}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* points */}
      {data.map((d, i) => {
        const p = at(i, d.value / 100);
        return (
          <circle
            key={d.label}
            cx={p.x}
            cy={p.y}
            r="3.4"
            fill="var(--c-surface)"
            stroke={`url(#${id}-stroke)`}
            strokeWidth="2"
          />
        );
      })}

      {/* labels */}
      {data.map((d, i) => {
        const p = at(i, 1.13);
        const anchor =
          Math.abs(p.x - cx) < 6 ? "middle" : p.x > cx ? "start" : "end";
        return (
          <text
            key={d.label}
            x={p.x}
            y={p.y + 4}
            textAnchor={anchor}
            fontSize="10.5"
            fontFamily="var(--font-display)"
            letterSpacing="0.06em"
            fill="var(--c-muted)"
            style={{ textTransform: "uppercase" }}
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
