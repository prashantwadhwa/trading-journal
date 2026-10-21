import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  SlidersHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import DashNav from "@/components/DashNav/DashNav";
import { useAuth } from "@/context/AuthContext";

const EMOTION_STYLES = {
  CONFIDENT: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20",
  CALM: "bg-sky-400/10 text-sky-300 ring-sky-400/20",
  GREEDY: "bg-amber-400/10 text-amber-300 ring-amber-400/20",
  FOMO: "bg-violet-400/10 text-violet-300 ring-violet-400/20",
  FEARFUL: "bg-orange-400/10 text-orange-300 ring-orange-400/20",
  FRUSTRATED: "bg-rose-400/10 text-rose-300 ring-rose-400/20",
};

const surface = "rounded-xl border border-white/[0.08] bg-[#11131a]";
const fieldClass =
  "border-white/10 bg-white/[0.03] text-zinc-100 placeholder:text-zinc-500 focus-visible:border-amber-400/50 focus-visible:ring-1 focus-visible:ring-amber-400/30";
const ghostBtn =
  "border-white/10 bg-transparent text-zinc-200 hover:bg-white/[0.06] hover:text-white disabled:opacity-40";
const headClass =
  "h-11 text-xs font-medium uppercase tracking-wider text-zinc-500";
const labelClass = "text-sm font-medium text-zinc-300";
const selectContentClass = "border-white/10 bg-[#161923] text-zinc-100";

const PAGE_SIZE = 20;

const formatDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number.toLocaleString(undefined, { maximumFractionDigits: 4 })
    : String(value);
};

const normalizeTrades = (data) => {
  const payload = data?.response;

  if (Array.isArray(payload)) {
    return {
      trades: payload,
      pagination: { page: 1, limit: PAGE_SIZE, totalTrades: 0, totalPages: 0 },
    };
  }

  return {
    trades: payload?.trades ?? [],
    pagination: payload?.pagination ?? {
      page: 1,
      limit: PAGE_SIZE,
      totalTrades: 0,
      totalPages: 0,
    },
  };
};

export default function Trades() {
  const [trades, setTrades] = useState([]);
  const { data: session, isPending } = useAuth();

  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    totalTrades: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");
  const [strategy, setStrategy] = useState("");
  const [emotion, setEmotion] = useState("");
  const [side, setSide] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTrades = useCallback(
    async (signal) => {
      setLoading(true);
      setError("");

      try {
        const params = {
          page,
          limit: PAGE_SIZE,
        };

        if (search.trim()) {
          params.symbol = search.trim().toUpperCase();
        }

        if (strategy.trim()) {
          params.strategy = strategy.trim();
        }

        if (emotion) params.emotion = emotion;
        if (side) params.side = side;
        if (from) params.from = from;
        if (to) params.to = to;

        const { data } = await axios.get(
          `${import.meta.env.VITE_API_URL}/trades`,
          {
            params,
            withCredentials: true,
            headers: {
              Accept: "application/json",
            },
            signal,
          },
        );

        const result = normalizeTrades(data);

        setTrades(result.trades);
        setPagination(result.pagination);
      } catch (err) {
        if (err.code === "ERR_CANCELED" || axios.isCancel(err)) {
          return;
        }

        setError(
          err.response?.data?.message || err.message || "Something went wrong.",
        );

        setTrades([]);

        setPagination({
          page,
          limit: PAGE_SIZE,
          totalTrades: 0,
          totalPages: 0,
        });
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [page, search, strategy, emotion, side, from, to],
  );

  useEffect(() => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
      fetchTrades(controller.signal);
    }, 300);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [fetchTrades]);

  const getSideLabel = (side) => {
    return side === "BUY" ? "LONG" : "SHORT";
  };

  const updateFilter = (setter, value) => {
    setter(value === "all" ? "" : value);
    setPage(1);
  };

  const clearFilters = () => {
    setSearch("");
    setStrategy("");
    setEmotion("");
    setSide("");
    setFrom("");
    setTo("");
    setPage(1);
  };

  const hasFilters = Boolean(
    search.trim() || strategy || emotion || side || from || to,
  );

  const startItem =
    pagination.totalTrades === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;

  const endItem = Math.min(page * PAGE_SIZE, pagination.totalTrades);

  if (isPending || loading) {
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
    <div className="min-h-screen bg-[#0a0b0f] text-zinc-100">
      <DashNav />

      <div className="mx-auto max-w-[1600px] pt-24! space-y-6 p-4 sm:p-6 lg:p-8">
        {/* Page header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>

            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-white">
              My Trades
            </h1>

            <p className="mt-2 text-sm text-zinc-400">
              Review, search, and manage your trading history.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => fetchTrades()}
            disabled={loading}
            className={`gap-2 self-start ${ghostBtn}`}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={`${surface} relative overflow-hidden p-5`}>
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 to-transparent" />
            <p className="text-sm text-zinc-400">Total matching trades</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {pagination.totalTrades.toLocaleString()}
            </p>
          </div>

          <div className={`${surface} p-5`}>
            <p className="text-sm text-zinc-400">Current page</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {pagination.totalPages
                ? `${page} / ${pagination.totalPages}`
                : "0 / 0"}
            </p>
          </div>

          <div className={`${surface} p-5`}>
            <p className="text-sm text-zinc-400">Trades displayed</p>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-white">
              {trades.length}
            </p>
          </div>
        </div>

        {/* Search and filters */}
        <div className={`${surface} space-y-4 p-4 sm:p-5`}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <Input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by symbol, e.g. BTCUSDT..."
                className={`pl-9 ${fieldClass}`}
                aria-label="Search trades by symbol"
              />
            </div>

            <Button
              variant="outline"
              onClick={() => setShowFilters((value) => !value)}
              className={`gap-2 ${ghostBtn}`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {hasFilters && (
                <span className="rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-black">
                  Active
                </span>
              )}
            </Button>

            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="gap-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 gap-4 border-t border-white/[0.08] pt-4 sm:grid-cols-2 lg:grid-cols-5">
              {/* Side filter */}
              <div className="space-y-2">
                <label className={labelClass}>Trade side</label>

                <Select
                  value={side || "All"}
                  onValueChange={(value) => updateFilter(setSide, value)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="All sides" />
                  </SelectTrigger>

                  <SelectContent className={selectContentClass}>
                    <SelectItem value="all">All sides</SelectItem>
                    <SelectItem value="BUY">BUY</SelectItem>
                    <SelectItem value="SELL">SELL</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Emotion filter */}
              <div className="space-y-2">
                <label className={labelClass}>Emotion</label>

                <Select
                  value={emotion || "all"}
                  onValueChange={(value) => updateFilter(setEmotion, value)}
                >
                  <SelectTrigger className={fieldClass}>
                    <SelectValue placeholder="All emotions" />
                  </SelectTrigger>

                  <SelectContent className={selectContentClass}>
                    <SelectItem value="all">All emotions</SelectItem>
                    <SelectItem value="CONFIDENT">Confident</SelectItem>
                    <SelectItem value="FEARFUL">Fearful</SelectItem>
                    <SelectItem value="GREEDY">Greedy</SelectItem>
                    <SelectItem value="FOMO">FOMO</SelectItem>
                    <SelectItem value="CALM">Calm</SelectItem>
                    <SelectItem value="FRUSTRATED">Frustrated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Strategy filter */}
              <div className="space-y-2">
                <label className={labelClass}>Strategy</label>

                <Input
                  value={strategy}
                  onChange={(e) => updateFilter(setStrategy, e.target.value)}
                  placeholder="Strategy tag"
                  className={fieldClass}
                />
              </div>

              {/* From date */}
              <div className="space-y-2">
                <label className={labelClass}>From date</label>

                <Input
                  type="date"
                  value={from}
                  max={to || undefined}
                  onChange={(e) => updateFilter(setFrom, e.target.value)}
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </div>

              {/* To date */}
              <div className="space-y-2">
                <label className={labelClass}>To date</label>

                <Input
                  type="date"
                  value={to}
                  min={from || undefined}
                  onChange={(e) => updateFilter(setTo, e.target.value)}
                  className={`${fieldClass} [color-scheme:dark]`}
                />
              </div>
            </div>
          )}
        </div>

        {/* Trades table */}
        <div className={`${surface} overflow-hidden`}>
          <div className="flex flex-col gap-1 border-b border-white/[0.08] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-white">Trade history</h2>
              <p className="text-sm text-zinc-400">
                Your most recently opened trades appear first.
              </p>
            </div>

            <p className="text-sm text-zinc-400">
              {loading
                ? "Loading trades..."
                : `${startItem}–${endItem} of ${pagination.totalTrades}`}
            </p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.08] bg-white/[0.02] hover:bg-white/[0.02]">
                  <TableHead className={headClass}>Symbol</TableHead>
                  <TableHead className={headClass}>Side</TableHead>
                  <TableHead className={headClass}>Entry price</TableHead>
                  <TableHead className={headClass}>Exit price</TableHead>
                  <TableHead className={headClass}>Quantity</TableHead>
                  <TableHead className={headClass}>P&amp;L</TableHead>
                  <TableHead className={headClass}>Strategy</TableHead>
                  <TableHead className={headClass}>Emotion</TableHead>
                  <TableHead className={headClass}>Opened at</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <TableRow key={index} className="border-white/[0.06]">
                      {Array.from({ length: 9 }).map((__, cell) => (
                        <TableCell key={cell} className="px-5!">
                          <div className="h-4 w-20 animate-pulse rounded bg-white/[0.07]" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : error ? (
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableCell colSpan={9} className="h-40 text-center">
                      <p className="font-medium text-rose-400">{error}</p>

                      <Button
                        variant="outline"
                        size="sm"
                        className={`mt-3 ${ghostBtn}`}
                        onClick={() => fetchTrades()}
                      >
                        Try again
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : trades.length === 0 ? (
                  <TableRow className="border-white/[0.06] hover:bg-transparent">
                    <TableCell colSpan={9} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Search className="h-8 w-8 text-zinc-600" />

                        <p className="font-medium text-zinc-200">
                          No trades found
                        </p>

                        <p className="text-sm text-zinc-500">
                          Try changing your search or filters.
                        </p>

                        {hasFilters && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                            className={ghostBtn}
                          >
                            Clear filters
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  trades.map((trade) => {
                    const tradeId =
                      trade.id ?? `${trade.symbol}-${trade.openedAt}`;

                    const normalizedSide = String(
                      trade.side ?? "",
                    ).toUpperCase();

                    // Supports both BUY/SELL (your filter) and LONG/SHORT
                    const isLong =
                      normalizedSide === "LONG" || normalizedSide === "BUY";
                    const isShort =
                      normalizedSide === "SHORT" || normalizedSide === "SELL";

                    const entryPrice = trade.entryPrice ?? trade.entry;

                    const exitPrice = trade.exitPrice ?? trade.exit;

                    const quantity = trade.quantity ?? trade.size;

                    const pnl = trade.pnl ?? trade.profitLoss;

                    const pnlNumber =
                      pnl === null || pnl === undefined || pnl === ""
                        ? null
                        : Number(pnl);

                    const emotionKey = String(
                      trade.emotionTag ?? "",
                    ).toUpperCase();

                    return (
                      <TableRow
                        key={tradeId}
                        className="border-white/[0.06] transition-colors hover:bg-white/[0.03]"
                      >
                        <TableCell className="font-semibold text-white">
                          {trade.symbol || "—"}
                        </TableCell>

                        <TableCell>
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                              isLong
                                ? "bg-emerald-400/10 text-emerald-300 ring-emerald-400/20"
                                : isShort
                                  ? "bg-rose-400/10 text-rose-300 ring-rose-400/20"
                                  : "bg-white/5 text-zinc-400 ring-white/10"
                            }`}
                          >
                            {isLong && <ArrowUpRight className="h-3.5 w-3.5" />}

                            {isShort && (
                              <ArrowDownRight className="h-3.5 w-3.5" />
                            )}

                            {trade.side || "—"}
                          </span>
                        </TableCell>

                        <TableCell className="tabular-nums text-zinc-300">
                          {formatNumber(entryPrice)}
                        </TableCell>

                        <TableCell className="tabular-nums text-zinc-300">
                          {formatNumber(exitPrice)}
                        </TableCell>

                        <TableCell className="tabular-nums text-zinc-300">
                          {formatNumber(quantity)}
                        </TableCell>

                        <TableCell
                          className={`font-semibold tabular-nums ${
                            pnlNumber === null || !Number.isFinite(pnlNumber)
                              ? "text-zinc-500"
                              : pnlNumber > 0
                                ? "text-emerald-400"
                                : pnlNumber < 0
                                  ? "text-rose-400"
                                  : "text-zinc-300"
                          }`}
                        >
                          {formatNumber(pnl)}
                        </TableCell>

                        <TableCell className="text-zinc-300">
                          {trade.strategyTag || "—"}
                        </TableCell>

                        <TableCell>
                          {trade.emotionTag ? (
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                                EMOTION_STYLES[emotionKey] ??
                                "bg-white/5 text-zinc-300 ring-white/10"
                              }`}
                            >
                              {trade.emotionTag}
                            </span>
                          ) : (
                            <span className="text-zinc-500">—</span>
                          )}
                        </TableCell>

                        <TableCell className="whitespace-nowrap text-zinc-500">
                          {formatDate(trade.openedAt)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-4 border-t border-white/[0.08] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-400">
              Page {pagination.totalPages ? page : 0} of {pagination.totalPages}
              {" · "}
              {pagination.totalTrades} total trades
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={loading || page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className={`gap-1 ${ghostBtn}`}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={
                  loading ||
                  !pagination.totalPages ||
                  page >= pagination.totalPages
                }
                onClick={() => setPage((current) => current + 1)}
                className={`gap-1 ${ghostBtn}`}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
