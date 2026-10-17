const CSV_COLUMN_ALIASES = {
  symbol: [
    "symbol",
    "name",
    "tradingsymbol",
    "trading_symbol",
    "instrument",
    "instrument_name",
  ],

  side: ["side", "trade_type", "transaction_type", "action", "buy_sell"],

  quantity: ["quantity", "qty", "trade_quantity", "filled_quantity"],

  entryPrice: [
    "entryPrice",
    "entry_price",
    "buy_price",
    "average_price",
    "price",
  ],

  exitPrice: ["exitPrice", "exit_price", "sell_price", "close_price"],

  openedAt: [
    "openedAt",
    "opened_at",
    "trade_date",
    "order_execution_time",
    "timestamp",
    "date",
  ],

  closedAt: ["closedAt", "closed_at", "exit_time", "close_time"],

  stopLoss: ["stopLoss", "stop_loss", "sl"],

  targetPrice: ["targetPrice", "target_price", "target"],

  emotionTag: ["emotionTag", "emotion"],

  strategyTag: ["strategyTag", "strategy"],

  notes: ["notes", "remarks", "comment"],
};

export const normalizeColumnName = (name) => {
  return String(name)
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
};

export const normalizeCsvRow = (row, columnMap) => {
  const getValue = (property) => {
    const column = columnMap[property];

    if (!column) return "";

    return String(row[column] ?? "").trim();
  };

  return {
    symbol: getValue("symbol").toUpperCase(),
    side: getValue("side").toUpperCase(),
    quantity: getValue("quantity"),
    entryPrice: getValue("entryPrice"),
    exitPrice: getValue("exitPrice"),
    stopLoss: getValue("stopLoss"),
    targetPrice: getValue("targetPrice"),
    emotionTag: getValue("emotionTag").toUpperCase(),
    strategyTag: getValue("strategyTag"),
    notes: getValue("notes"),
    openedAt: getValue("openedAt"),
    closedAt: getValue("closedAt"),
  };
};

export default CSV_COLUMN_ALIASES;
