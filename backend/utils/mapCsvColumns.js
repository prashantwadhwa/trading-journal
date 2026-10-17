import CSV_COLUMN_ALIASES, { normalizeColumnName } from "./csvColumnAliases.js";

export const mapCsvColumns = (headers) => {
  const normalizedHeaders = headers.map((header) => ({
    original: header,
    normalized: normalizeColumnName(header),
  }));

  const columnMap = {};

  for (const [property, aliases] of Object.entries(CSV_COLUMN_ALIASES)) {
    const normalizedAliases = aliases.map(normalizeColumnName);

    const match = normalizedHeaders.find((header) =>
      normalizedAliases.includes(header.normalized),
    );

    if (match) {
      columnMap[property] = match.original;
    }
  }

  return columnMap;
};
