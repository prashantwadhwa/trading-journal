import { useMemo } from "react";
import './DailyHeatmap.scss'

const getPnlColor = (pnl) => {
  if (pnl == null) return "bg-zinc-900";
  if (pnl === 0) return "bg-zinc-800";

  if (pnl > 0) {
    return "bg-emerald-500";
  }

  if (pnl < 0) return "bg-red-500";
};

const formatPnl = (pnl) => {
  if (pnl == null) return "No trading";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(pnl);
};

export default function PnlHeatmap({ data = pnlData }) {
  // using useMemo here, so we keep the data here unless it changes and dont fetch it on every load. it will change
  // when the data changes
  const { weeks, months } = useMemo(() => {
    if (!data?.length) {
      return {
        weeks: [],
        months: [],
      };
    }

    const pnlMap = new Map(data.map((item) => [item.date, item.dailyPnl]));

    const start = new Date(data[0].date);
    const end = new Date(data[data.length - 1].date);

    // Start from Sunday at first date
    const firstDay = new Date(start);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay());

    // End on Saturday after/at last date
    const lastDay = new Date(end);
    lastDay.setDate(lastDay.getDate() + (6 - lastDay.getDay()));

    const weeks = [];
    const months = [];

    let current = new Date(firstDay);

    // find weeks labels
    while (current <= lastDay) {
      const week = [];

      for (let day = 0; day < 7; day++) {
        const date = new Date(current);

        const dateString = date.toISOString().split("T")[0];

        week.push({
          date: dateString,
          pnl: pnlMap.get(dateString),
        });

        current.setDate(current.getDate() + 1);
      }

      weeks.push(week);
    }

    // Find month labels
    weeks.forEach((week, index) => {
      const firstDay = new Date(week[0].date);

      if (firstDay.getDate() <= 7 || index === 0) {
        months.push({
          index,
          label: firstDay.toLocaleDateString("en-US", {
            month: "short",
          }),
        });
      }
    });

    return { weeks, months };
  }, [data]);

  return (
    <div className="heatmap rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-zinc-100">Daily P&L</h2>

          <p className="mt-1 text-xs text-zinc-500">
            Your trading performance by day
          </p>
        </div>

        <div className="hidden items-center gap-2 text-xs text-zinc-500 sm:flex">
          <span>Loss</span>
          <span className="h-3 w-3 rounded-sm bg-red-500" />

          <span className="mx-1 h-px w-2 bg-zinc-700" />

          <span className="h-3 w-3 rounded-sm bg-emerald-500" />

          <span>Profit</span>
        </div>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="relative min-w-max">
          {/* Month labels */}
          <div className="ml-8 mb-2 flex h-4">
            {months.map((month) => (
              <div
                key={`${month.label}-${month.index}`}
                className="absolute text-[11px] text-zinc-500"
                style={{
                  left: `${month.index * 16 + 32}px`,
                }}
              >
                {month.label}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="mr-2 grid grid-rows-7 gap-1">
              <span className="h-3 text-[10px] text-zinc-600">Sun</span>

              <span className="h-3 text-[10px] text-zinc-600">Mon</span>

              <span className="h-3 text-[10px] text-zinc-600">Tue</span>

              <span className="h-3 text-[10px] text-zinc-600">Wed</span>

              <span className="h-3 text-[10px] text-zinc-600">Thu</span>

              <span className="h-3 text-[10px] text-zinc-600">Fri</span>

              <span className="h-3 text-[10px] text-zinc-600">Sat</span>
            </div>

            {/* Weeks */}
            <div className="flex gap-1">
              {weeks.map((week, weekIndex) => (
                <div key={weekIndex} className="grid grid-rows-7 gap-1">
                  {week.map((day) => (
                    <div
                      key={day.date}
                      className={`
                        h-3 w-3
                        rounded-[3px]
                        ${getPnlColor(day.pnl)}
                        cursor-pointer
                        transition-all
                        hover:scale-125
                        hover:ring-1
                        hover:ring-white/50
                      `}
                      title={`${day.date} • ${formatPnl(day.pnl)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
        <span className="text-xs text-zinc-500">
          {data.length} trading days
        </span>

        <span className="text-xs text-zinc-500">Hover over a day for P&L</span>
      </div>
    </div>
  );
}
