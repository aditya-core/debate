import type { WeekDay } from "@/lib/dashboard/data";

/**
 * Seven bars, one per day, from real session rows.
 *
 * When there is nothing to show it says so instead of drawing a flat line at
 * zero and calling it progress. An empty chart that admits it is empty is worth
 * more than a beautiful one that invents a trend.
 */
export default function WeekChart({ week }: { week: WeekDay[] }) {
  const total = week.reduce((sum, day) => sum + day.reps, 0);
  const max = Math.max(1, ...week.map((day) => day.reps));

  return (
    <div>
      <div className="flex items-end justify-between gap-1.5 sm:gap-3" aria-hidden="true">
        {week.map((day) => {
          const height = day.reps === 0 ? 3 : Math.max(8, Math.round((day.reps / max) * 100));
          return (
            <div key={day.iso} className="flex min-w-0 flex-1 flex-col items-center gap-1.5">
              <span className="font-display text-[0.62rem] tabular-nums text-faint">
                {day.reps > 0 ? day.reps : ""}
              </span>
              <div className="flex h-24 w-full items-end">
                <div
                  className={[
                    "w-full rounded-t-[4px] transition-[height] duration-500",
                    day.reps > 0
                      ? "bg-linear-to-t from-brand to-sky"
                      : "bg-line-strong",
                  ].join(" ")}
                  style={{ height: `${height}%` }}
                />
              </div>
              <span className="font-display text-[0.6rem] uppercase tracking-[0.1em] text-faint">
                {day.label}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[0.78rem] leading-relaxed text-muted">
        {total === 0
          ? "No reps in the last seven days. This fills in from your first one — there is nothing to catch up on."
          : `${total} ${total === 1 ? "rep" : "reps"} in the last seven days.`}
      </p>
    </div>
  );
}
