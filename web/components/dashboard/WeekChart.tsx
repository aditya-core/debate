import type { WeekDay } from "@/lib/dashboard/types";

/**
 * Seven days, one mark each.
 *
 * A day with no rep is a dot, not a bar: a zero-height bar still draws a line
 * and seven of them read as a broken chart. Dots say "nothing yet" clearly, and
 * a real rep replaces the dot with a bar that grows from the same baseline.
 */
export default function WeekChart({
  week,
  barClass,
}: {
  week: WeekDay[];
  barClass: string;
}) {
  const total = week.reduce((sum, day) => sum + day.reps, 0);
  const max = Math.max(1, ...week.map((day) => day.reps));

  return (
    <div
      role="img"
      aria-label={
        total === 0
          ? "No reps in the last seven days"
          : `${total} reps in the last seven days: ${week
              .map((day) => `${day.label} ${day.reps}`)
              .join(", ")}`
      }
      className="flex items-end justify-between gap-1.5 sm:gap-3"
    >
      {week.map((day) => (
        <div key={day.iso} className="flex min-w-0 flex-1 flex-col items-center gap-2">
          <span className="h-4 font-display text-[0.62rem] tabular-nums text-muted">
            {day.reps > 0 ? day.reps : ""}
          </span>
          <div className="flex h-20 w-full items-end justify-center">
            {day.reps > 0 ? (
              <div
                className={["w-2.5 rounded-full sm:w-3.5", barClass].join(" ")}
                style={{ height: `${Math.max(14, Math.round((day.reps / max) * 100))}%` }}
              />
            ) : (
              <div className="mb-0.5 h-1.5 w-1.5 rounded-full bg-line-strong" />
            )}
          </div>
          <span className="font-display text-[0.6rem] uppercase tracking-[0.12em] text-faint">
            {day.label}
          </span>
        </div>
      ))}
    </div>
  );
}
