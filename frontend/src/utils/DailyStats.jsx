export function getDailyStats(trades, year, month) {
  return trades.reduce((acc, trade) => {
    const date = new Date(trade.closedAt);

    if (date.getFullYear() !== year || date.getMonth() !== month) {
      return acc;
    }

    const day = date.getDate();

    if (!acc[day]) {
      acc[day] = {
        pnl: 0,
        trades: 0,
      };
    }

    acc[day].pnl += Number(trade.pnl);
    acc[day].trades += 1;

    return acc;
  }, {});
}
