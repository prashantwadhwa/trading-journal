const CSV_COLUMN_ALIASES = {
  isin: ["isin"],

  exchange: ["exchange"],

  segment: ["segment"],

  series: ["series"],

  sourceTradeId: ["trade_id", "tradeid", "execution_id"],

  openedAt: [
    "openedAt",
    "opened_at",
    "trade_date",
    "order_execution_time",
    "timestamp",
    "date",
  ],

  side: ["side", "trade_type", "transaction_type", "action", "buy_sell"],
  symbol: [
    "symbol",
    "name",
    "tradingsymbol",
    "trading_symbol",
    "instrument",
    "instrument_name",
  ],

  quantity: ["quantity", "qty", "trade_quantity", "filled_quantity"],

  entryPrice: [
    "entryPrice",
    "entry_price",
    "buy_price",
    "average_price",
    "price",
  ],

  price: ["price", "trade_price", "execution_price", "fill_price"],

  exitPrice: ["exitPrice", "exit_price", "sell_price", "close_price"],

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
    
    price: getValue("price"),

    isin: getValue("isin"),
    exchange: getValue("exchange").toUpperCase(),
    segment: getValue("segment").toUpperCase(),
    series: getValue("series").toUpperCase(),
    sourceTradeId: getValue("sourceTradeId"),
  };
};

export default CSV_COLUMN_ALIASES;
