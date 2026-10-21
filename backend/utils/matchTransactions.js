// This function will:

// - Sort transactions chronologically.
// - Match SELL transactions to the oldest available BUY quantity for the same instrument.
// - Create a completed trade for each matched quantity.
// - Keep leftover BUY quantities as open positions.
// - Report sells that cannot be matched to a previous buy instead of incorrectly opening short positions.

import Decimal from "decimal.js";

const instrumentKey = (tx) =>
  [tx.isin || tx.symbol, tx.exchange || "", tx.segment || "", tx.series || ""]
    .map((value) => String(value).trim().toUpperCase())
    .join("|");

export function matchTransactions(transactions) {
  const sorted = [...transactions].sort((a, b) => {
    const dateDiff =
      new Date(a.openedAt).getTime() - new Date(b.openedAt).getTime();

    if (dateDiff !== 0) return dateDiff;

    return String(a.sourceTradeId).localeCompare(
      String(b.sourceTradeId),
      undefined,
      { numeric: true },
    );
  });

  const buyQueues = new Map(); // stores unsold quantities
  const completedTrades = []; // both buy and sell orders exist
  const unmatchedSells = []; // SELL quantities that could not be matched to earlier BUY quantities.

  for (const tx of sorted) {
    const key = instrumentKey(tx);

    if (!buyQueues.has(key)) {
      buyQueues.set(key, []);
    }

    const queue = buyQueues.get(key);
    const quantity = new Decimal(tx.quantity);
    const price = new Decimal(tx.price);

    if (tx.side === "BUY") {
      queue.push({
        ...tx,
        remainingQuantity: quantity,
      });

      continue;
    }

    let remainingToSell = quantity;

    while (remainingToSell.gt(0) && queue.length > 0) {
      const buy = queue[0];

      const matchedQuantity = Decimal.min(
        remainingToSell,
        buy.remainingQuantity,
      );

      const pnl = price.minus(new Decimal(buy.price)).times(matchedQuantity);

      completedTrades.push({
        symbol: buy.symbol,
        isin: buy.isin ?? null,
        exchange: buy.exchange ?? null,
        segment: buy.segment ?? null,
        series: buy.series ?? null,
        side: "BUY",
        quantity: matchedQuantity.toString(),
        entryPrice: String(buy.price),
        exitPrice: price.toString(),
        openedAt: new Date(buy.openedAt),
        closedAt: new Date(tx.openedAt),
        pnl: pnl.toString(),
        riskRewardRatio: null,
        stopLoss: null,
        targetPrice: null,
        emotionTag: null,
        strategyTag: null,
        notes: null,
        positionStatus: "CLOSED",
        importSource: "BROKER_CSV",
        reconciliationKey: `CLOSED:${buy.sourceTradeId}:${tx.sourceTradeId}`,
      });

      buy.remainingQuantity = buy.remainingQuantity.minus(matchedQuantity);

      remainingToSell = remainingToSell.minus(matchedQuantity);

      if (buy.remainingQuantity.isZero()) {
        queue.shift();
      }
    }

    if (remainingToSell.gt(0)) {
      unmatchedSells.push({
        sourceTradeId: tx.sourceTradeId,
        symbol: tx.symbol,
        quantity: remainingToSell.toString(),
        executedAt: tx.openedAt,
        reason: "No matching earlier BUY quantity",
      });
    }
  }

  const openPositions = [];

  for (const queue of buyQueues.values()) {
    for (const buy of queue) {
      if (buy.remainingQuantity.isZero()) continue;

      openPositions.push({
        symbol: buy.symbol,
        isin: buy.isin ?? null,
        exchange: buy.exchange ?? null,
        segment: buy.segment ?? null,
        series: buy.series ?? null,
        side: "BUY",
        quantity: buy.remainingQuantity.toString(),
        entryPrice: String(buy.price),
        exitPrice: null,
        openedAt: new Date(buy.openedAt),
        closedAt: null,
        pnl: null,
        riskRewardRatio: null,
        stopLoss: null,
        targetPrice: null,
        emotionTag: null,
        strategyTag: null,
        notes: null,
        positionStatus: "OPEN",
        importSource: "BROKER_CSV",
        reconciliationKey: `OPEN:${buy.sourceTradeId}`,
      });
    }
  }

  return {
    completedTrades,
    openPositions,
    unmatchedSells,
  };
}
