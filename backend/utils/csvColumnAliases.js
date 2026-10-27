const CSV_COLUMN_ALIASES = {
  symbol: [
    "symbol",
    "trading_symbol",
    "tradingsymbol",
    "instrument",
    "instrument_name",
    "stock",
    "name",
  ],

  side: ["side", "trade_type", "transaction_type", "action", "buy_sell"],

  quantity: ["quantity", "qty", "trade_quantity"],

  entryPrice: ["entryPrice", "entry_price", "entry", "buy_price"],

  exitPrice: ["exitPrice", "exit_price", "exit", "sell_price"],

  stopLoss: ["stopLoss", "stop_loss", "sl"],

  targetPrice: ["targetPrice", "target_price", "target"],

  strategyTag: ["strategyTag", "strategy_tag", "strategy"],

  emotionTag: ["emotionTag", "emotion_tag", "emotion"],

  notes: ["notes", "remarks", "comment", "description"],

  openedAt: [
    "openedAt",
    "opened_at",
    "entry_date",
    "entry_time",
    "trade_date",
    "date",
  ],

  closedAt: ["closedAt", "closed_at", "exit_date", "exit_time", "close_time"],

  isin: ["isin"],

  exchange: ["exchange"],

  segment: ["segment"],

  series: ["series"],

  importSource: ["importSource", "import_source"],

  reconciliationKey: ["reconciliationKey", "reconciliation_key"],

  // Accepted for compatibility with broker execution CSVs.
  sourceTradeId: ["trade_id", "tradeid", "execution_id"],

  price: [
    "price",
    "trade_price",
    "execution_price",
    "fill_price",
    "average_price",
  ],
};

export const normalizeSide = (value) => {
  const side = String(value ?? "")
    .trim()
    .toUpperCase();

  if (["BUY", "B", "PURCHASE"].includes(side)) return "BUY";
  if (["SELL", "S", "SALE"].includes(side)) return "SELL";

  throw new Error(`Invalid or missing transaction side: "${value}"`);
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
    side: normalizeSide(getValue("side")),
    quantity: getValue("quantity"),

    entryPrice: getValue("entryPrice"),
    exitPrice: getValue("exitPrice"),
    stopLoss: getValue("stopLoss"),
    targetPrice: getValue("targetPrice"),

    strategyTag: getValue("strategyTag"),
    emotionTag: getValue("emotionTag").toUpperCase(),
    notes: getValue("notes"),

    openedAt: getValue("openedAt"),
    closedAt: getValue("closedAt"),

    isin: getValue("isin"),
    exchange: getValue("exchange").toUpperCase(),
    segment: getValue("segment").toUpperCase(),
    series: getValue("series").toUpperCase(),

    importSource: getValue("importSource"),
    reconciliationKey: getValue("reconciliationKey"),

    // Broker execution fields; not Trade model fields.
    price: getValue("price"),
    sourceTradeId: getValue("sourceTradeId"),
  };
};

export default CSV_COLUMN_ALIASES;
