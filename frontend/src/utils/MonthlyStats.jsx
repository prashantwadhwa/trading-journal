export function getMonthlyStats(trades, year) {
  return trades.reduce((acc, trade) => {
    const date = new Date(trade.closedAt);

    if (date.getFullYear() !== year) {
      return acc;
    }

    const month = date.getMonth();

    if (!acc[month]) {
      acc[month] = {
        pnl: 0,
        trades: 0,
      };
    }

    acc[month].pnl += Number(trade.pnl);
    acc[month].trades += 1;

    return acc;
  }, {});
}
