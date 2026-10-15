import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Loader2, LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import EquityCurve from "@/components/EquityCurve/EquityCurve";
import PnlHeatmap from "@/components/DailyHeatmap/DailyHeatmap";
import AddTradeModal from "@/components/AddTradeModal/AddTradeModal";
import { toast } from "sonner";

function Dashboard() {
  const navigate = useNavigate();
  const { data: session, isPending } = useAuth();

  const [trades, setTrades] = useState([]);
  const [stats, setStats] = useState({
    winRate: 0,
    avgRiskReward: 0,
    totalPnl: 0,
    tradesThisWeek: 0,
    positive: true,
    change: "",
  });
  const [equityCurve, setEquityCurve] = useState([]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const today = new Intl.DateTimeFormat("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(new Date());

  const hour = new Date().getHours();

  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const getStats = useCallback(async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/analytics/summary`,
      {
        withCredentials: true,
      },
    );
    setStats(res.data.response);
  }, []);

  const getEquityCurve = useCallback(async () => {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/analytics/equity-curve`,
      {
        withCredentials: true,
      },
    );

    setEquityCurve(res.data.response);
  }, []);

  const getTrades = useCallback(async () => {
    const res = await axios.get(`${import.meta.env.VITE_API_URL}/trades`, {
      withCredentials: true,
    });

    setTrades(res.data.response.trades);
  }, []);

  const handleLogout = async () => {
    const { error } = await authClient.signOut();

    if (error) {
      console.error("Logout failed:", error);
      return;
    }

    navigate("/");
  };

  useEffect(() => {
    if (!isRefreshing) return;

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [isRefreshing]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        await Promise.all([getStats(), getEquityCurve(), getTrades()]);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
        toast.error("Failed to load dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, [getStats, getEquityCurve, getTrades]);

  const refreshDashboard = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([getTrades(), getStats(), getEquityCurve()]);
    } catch (error) {
      console.error("Failed to refresh dashboard:", error);
      toast.error("Failed to refresh dashboard. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatCurrency = (value) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);

  if (isPending || isLoading) {
    return (
      <div className="spinner">
        <span className="loader"></span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="error-msg">
        <span>
          Not authenticated, please{" "}
          <Link
            className="text-emerald-400 hover:text-emerald-500 transition duration-300"
            to={"/login"}
          >
            Login
          </Link>
        </span>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-zinc-950! text-zinc-100!">
      <header className="border-b border-zinc-800 bg-zinc-950/55 fixed w-full backdrop-blur-md z-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <div className="text-lg font-semibold tracking-tight">
              Trading Journal
            </div>
            <div className="text-xs text-zinc-500">
              Your trading performance
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/trades/import")}
                className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-900"
              >
                Import CSV
              </button>

              <AddTradeModal onTradeAdded={refreshDashboard} />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger className="h-10 w-10 overflow-hidden rounded-full outline-none ring-offset-zinc-950 transition hover:ring-2 hover:ring-emerald-500 focus:ring-2 focus:ring-emerald-500">
                <img
                  className="h-10 w-10 object-cover"
                  src={`https://api.dicebear.com/10.x/marbles/svg?seed=${session.user.id}`}
                  alt="User avatar"
                />
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-64 border-zinc-800 bg-zinc-900 text-zinc-100"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-3 py-2">
                    <div className="flex flex-col">
                      <span className="truncate text-sm font-medium text-zinc-100">
                        {session.user.name || "Trader"}
                      </span>

                      <span className="truncate text-xs font-normal text-zinc-500">
                        {session.user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="bg-zinc-800" />

                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer px-3 py-2 text-red-400! focus:bg-red-500/10 focus:text-red-400!"
                >
                  <LogOut className="mr-2 h-4 w-4 stroke-red-400!" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 pt-24!">
        <section className="greeting-header mb-8 flex items-end justify-between">
          <div>
            <p className="mb-1 text-sm text-zinc-500">{today}</p>

            <h1 className="text-3xl font-semibold tracking-tight">
              {greeting} {session.user.name}.
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Here's how your trading is looking.
            </p>
          </div>

          <button
            onClick={() => navigate("/analytics")}
            className="text-sm text-emerald-400 hover:text-emerald-300"
          >
            View detailed analytics →
          </button>
        </section>

        <section className="trades-summary-kpi grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-sm text-zinc-500">Win Rate</p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-2xl font-semibold">{stats.winRate}%</p>

              <span
                className={`text-xs font-medium ${
                  stats.positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stats.change}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-sm text-zinc-500">Avg. R:R</p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-2xl font-semibold">{stats.avgRiskReward}</p>

              <span
                className={`text-xs font-medium ${
                  stats.positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stats.change}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-sm text-zinc-500">Total P&L</p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-2xl font-semibold">
                ₹ {formatCurrency(stats.totalPnl)}
              </p>

              <span
                className={`text-xs font-medium ${
                  stats.positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stats.change}
              </span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
            <p className="text-sm text-zinc-500">Trades This Week</p>

            <div className="mt-2 flex items-end justify-between gap-4">
              <p className="text-2xl font-semibold">{stats.tradesThisWeek}</p>

              <span
                className={`text-xs font-medium ${
                  stats.positive ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {stats.change}
              </span>
            </div>
          </div>
        </section>

        <section className="trades-analytics mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="equity-curve-chart rounded-xl border border-zinc-800 bg-zinc-900/60 p-6 lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-semibold">Equity Curve</h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Cumulative P&L · September
                </p>
              </div>

              <select className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 outline-none">
                <option>This month</option>
                <option>This week</option>
                <option>Last 3 months</option>
              </select>
            </div>

            <EquityCurve data={equityCurve} />
          </div>

          <div className="alerts-sidebar rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Trading Behavior</h2>

              <span className="rounded-full bg-amber-500/10 px-2 py-1 text-xs text-amber-400">
                2 alerts
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex gap-3">
                  <span className="text-lg">⚠️</span>

                  <div>
                    <p className="text-sm font-medium text-red-300">
                      Revenge trading
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      2 trades opened within 10 minutes of a loss.
                    </p>

                    <p className="mt-2 text-xs font-medium text-red-400">
                      Cost: ₹1,240
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
                <div className="flex gap-3">
                  <span className="text-lg">📈</span>

                  <div>
                    <p className="text-sm font-medium text-amber-300">
                      Position sizing
                    </p>

                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Your average position size is 32% higher than usual.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => navigate("/analytics/behavior")}
              className="mt-5 w-full rounded-lg border border-zinc-700 py-2 text-xs font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
            >
              View behavior analysis
            </button>
          </div>
        </section>

        <section className="daily-pnl mt-6 ">
          <PnlHeatmap data={stats} tradesData={trades} formatCurrency={formatCurrency}/>
        </section>

        <section className="recent-section mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3 items-start">
          <div className="recent-trades min-h-0 rounded-xl border border-zinc-800 bg-zinc-900/60 lg:col-span-2">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div>
                <h2 className="font-semibold">Recent Trades</h2>

                <p className="mt-1 text-xs text-zinc-500">
                  Your latest executions
                </p>
              </div>

              <button
                onClick={() => navigate("/trades")}
                className="text-xs text-emerald-400 hover:text-emerald-300"
              >
                View all →
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto no-scrollbar divide-y divide-zinc-800">
              {trades.length === 0 ? (
                <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                  <p className="text-sm font-medium text-zinc-300">
                    No trades yet
                  </p>
                </div>
              ) : (
                trades.map((trade) => (
                  <button
                    key={trade?.id}
                    onClick={() => navigate("/trades")}
                    className="grid w-full grid-cols-5 items-center px-6 py-4 text-left transition hover:bg-zinc-800/40"
                  >
                    <div>
                      <p className="text-sm font-medium">{trade.symbol}</p>

                      <p className="mt-1 text-xs text-zinc-600">{trade.time}</p>
                    </div>

                    <div>
                      <p className="text-xs text-zinc-500">Strategy</p>

                      <p className="mt-1 text-xs">{trade?.strategyTag}</p>
                    </div>

                    <div>
                      <span
                        className={`rounded px-2 py-1 text-[10px] font-semibold ${
                          trade.side === "BUY"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {trade.side}
                      </span>
                    </div>

                    <div>
                      <p
                        className={`text-sm font-medium ${
                          trade.pnl >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {formatCurrency(trade.pnl)}
                      </p>

                      <p className="mt-1 text-xs text-zinc-600">{trade.r}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-zinc-500">
                        {trade.emotionTag}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          <div className="weekly-review rounded-xl border border-zinc-800 bg-zinc-900/60 p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Weekly Review</h2>

              <span className="rounded-full bg-purple-500/10 px-2 py-1 text-xs text-purple-400">
                AI
              </span>
            </div>

            <p className="mt-1 text-xs text-zinc-500">Sep 22 – Sep 28</p>

            <div className="mt-5">
              <p className="text-sm leading-6 text-zinc-300">
                Your breakout setups performed well this week, with a{" "}
                <span className="text-emerald-400">72% win rate</span>.
              </p>

              <p className="mt-3 text-sm leading-6 text-zinc-400">
                Most losses came from trades taken after 1 PM. You also had two
                possible revenge trades after consecutive losses.
              </p>
            </div>

            <button
              onClick={() => navigate("/reviews")}
              className="mt-6 w-full rounded-lg bg-zinc-800 py-2.5 text-xs font-medium text-zinc-300 transition hover:bg-zinc-700"
            >
              Read full review →
            </button>
          </div>
        </section>
      </main>

      {isRefreshing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/30 backdrop-blur-[2px]">
          <div className="flex items-center gap-3 rounded-xl border border-zinc-700 bg-zinc-900 px-5 py-4 shadow-xl">
            <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
            <span className="text-sm text-zinc-200">Updating dashboard...</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
