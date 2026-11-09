export default function Bars({
  data,
}: {
  data: { day: string; minutes: number }[];
}) {
  const max = Math.max(...data.map((d) => d.minutes));

  return (
    <div className="flex h-[150px] items-end gap-2.5 sm:gap-3.5">
      {data.map((d, i) => {
        const pct = Math.round((d.minutes / max) * 100);
        return (
          <div key={`${d.day}-${i}`} className="flex flex-1 flex-col items-center gap-2">
            <span className="tnum text-[0.66rem] text-faint">{d.minutes}</span>
            <div className="relative flex w-full flex-1 items-end overflow-hidden rounded-md bg-line/50">
              <div
                className="bar-fill w-full rounded-md"
                style={{
                  height: `${pct}%`,
                  background:
                    "linear-gradient(180deg, var(--c-brand), var(--c-sky))",
                  ["--d" as string]: `${i * 60}ms`,
                }}
              />
            </div>
            <span className="font-display text-[0.68rem] uppercase tracking-[0.1em] text-muted">
              {d.day}
            </span>
          </div>
        );
      })}
    </div>
  );
}
