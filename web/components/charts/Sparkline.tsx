export default function Sparkline({
  values,
  width = 320,
  height = 110,
}: {
  values: number[];
  width?: number;
  height?: number;
}) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = 10;
  const span = max - min || 1;

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${height} L${points[0][0].toFixed(1)},${height} Z`;
  const last = points[points.length - 1];

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img" aria-label={`Rating trend, ${min} to ${max}`}>
      <defs>
        <linearGradient id="spark-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--c-brand)", stopOpacity: 0.22 }} />
          <stop offset="100%" style={{ stopColor: "var(--c-brand)", stopOpacity: 0 }} />
        </linearGradient>
        <linearGradient id="spark-line-g" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" style={{ stopColor: "var(--c-brand)" }} />
          <stop offset="100%" style={{ stopColor: "var(--c-sky)" }} />
        </linearGradient>
      </defs>

      <path d={area} fill="url(#spark-area)" />
      <path
        className="spark-line"
        d={line}
        fill="none"
        stroke="url(#spark-line-g)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last[0]} cy={last[1]} r="4" className="chart-dot" />
      <circle cx={last[0]} cy={last[1]} r="8" className="chart-dot" opacity="0.18" />
    </svg>
  );
}
