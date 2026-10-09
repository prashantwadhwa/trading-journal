import "./DailyHeatmap.scss";
import { getMonthlyStats } from "@/utils/MonthlyStats";
import { getDailyStats } from "@/utils/DailyStats";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const months = [
  { name: "January", number: 1, days: 31 },
  { name: "February", number: 2, days: 28 },
  { name: "March", number: 3, days: 31 },
  { name: "April", number: 4, days: 30 },
  { name: "May", number: 5, days: 31 },
  { name: "June", number: 6, days: 30 },
  { name: "July", number: 7, days: 31 },
  { name: "August", number: 8, days: 31 },
  { name: "September", number: 9, days: 30 },
  { name: "October", number: 10, days: 31 },
  { name: "November", number: 11, days: 30 },
  { name: "December", number: 12, days: 31 },
];

export default function PnlHeatmap({ data, tradesData }) {
  const monthlyStats = getMonthlyStats(tradesData, 2026);
  const prevRef = useRef(null);
  const nextRef = useRef(null);
  const paginationRef = useRef(null);

  const currentMonth = new Date().getMonth();

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
      <div className="">
        <div className="calendar-container flex gap-10">
          <Swiper
            modules={[Navigation, Pagination]}
            initialSlide={currentMonth}
            spaceBetween={20}
            slidesPerView={4}
            slidesPerGroup={4}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            pagination={{
              clickable: true,
              el: paginationRef.current,
              type: "fraction",
            }}
            breakpoints={{
              0: {
                slidesPerView: 1,
                slidesPerGroup: 1,
              },
              640: {
                slidesPerView: 2,
                slidesPerGroup: 2,
              },
              1024: {
                slidesPerView: 4,
                slidesPerGroup: 4,
              },
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.params.pagination.el = paginationRef.current;
            }}
            className="calendar-swiper w-full"
          >
            {months.map((month) => {
              const dailyStats = getDailyStats(
                tradesData,
                2026,
                month.number - 1,
              );

              const monthStats = monthlyStats[month.number - 1] ?? {
                pnl: 0,
                trades: 0,
              };

              return (
                <SwiperSlide key={month.number}>
                  <div
                    className="month-section flex flex-col gap-2 h-full justify-between items-center"
                    key={`${month.name}-${month.index}`}
                  >
                    <div className="month-header">{month.name}</div>
                    <div className="month-calendar">
                      <div className="days-grid grid grid-cols-7 gap-2">
                        <TooltipProvider>
                          {Array.from({ length: month.days }, (_, i) => {
                            const day = i + 1;
                            const dayStats = dailyStats[day];

                            const pnl = dayStats?.pnl ?? 0;

                            return (
                              <Tooltip key={day}>
                                <TooltipTrigger>
                                  <div
                                    className={`calendar-day aspect-square cursor-pointer ${pnl > 0
                                      ? "bg-green-500/80"
                                      : pnl < 0
                                        ? "bg-red-500/80"
                                        : "bg-gray-200/10"
                                      }`}
                                  >
                                    {day}
                                  </div>
                                </TooltipTrigger>

                                <TooltipContent>
                                  <div className="text-xs">
                                    <div className="font-medium">
                                      {month.name} {day}
                                    </div>

                                    <div
                                      className={
                                        pnl >= 0
                                          ? "text-green-400"
                                          : "text-red-400"
                                      }
                                    >
                                      {pnl >= 0 ? "+" : ""}
                                      {pnl.toLocaleString()} P&L
                                    </div>

                                    <div className="text-gray-400">
                                      {dayStats?.trades ?? 0}{" "}
                                      {(dayStats?.trades ?? 0) === 1
                                        ? "trade"
                                        : "trades"}
                                    </div>
                                  </div>
                                </TooltipContent>
                              </Tooltip>
                            );
                          })}
                        </TooltipProvider>
                      </div>
                    </div>
                    <div
                      className={`month-pnl text-sm font-semibold px-2.5 py-1 mt-5 rounded-md border-gray-300/50 border ${monthStats.pnl >= 0 ? "text-green-400 bg-green-400/20" : "text-red-400 bg-red-400/20"
                        }`}
                      key={month.number}
                    >
                      Monthly P&L: {monthStats.pnl}
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-4">
        <span className="text-xs text-zinc-500">Hover over a day for P&L</span>
        <div className="calendar-swiper-controls flex gap-3 items-center justify-center">
          <button ref={prevRef} className="custom-prev">
            <ChevronLeft />
          </button>
          <div ref={paginationRef} className="custom-pagination" />

          <button ref={nextRef} className="custom-next">
            <ChevronRight />
          </button>
        </div>
      </div>
    </div>
  );
}
