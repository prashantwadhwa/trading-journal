import dotenv from "dotenv";
import express from "express";
import prisma from "../config/prisma.js";
import requireAuth from "../middleware/authMiddleware.js";
import Decimal from "decimal.js";

import multer from "multer";
import { parse } from "csv-parse/sync";
import { mapCsvColumns } from "../../utils/mapCsvColumns.js";
import { normalizeCsvRow } from "../../utils/csvColumnAliases.js";

dotenv.config();

const router = express.Router();

const VALID_SIDES = ["BUY", "SELL"];
const VALID_EMOTIONS = ["CONFIDENT", "FOMO", "BORED", "ANXIOUS", "REVENGE"];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, //5mb max file size,
  },
  fileFilter: (req, file, cb) => {
    if (!file.originalname.toLowerCase().endsWith(".csv")) {
      return cb(new Error("Only CSV files are allowed."));
    }

    cb(null, true);
  },
});

router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    // pagination query

    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const skip = (page - 1) * limit;

    //filters

    const { strategy, emotion, symbol, side, from, to } = req.query;

    const where = {
      userId,
    };

    // Strategy filter
    if (strategy) {
      where.strategyTag = strategy;
    }

    // Emotion filter
    if (emotion) {
      const e = String(emotion).toUpperCase();
      if (!VALID_EMOTIONS.includes(e)) {
        return res.status(400).json({ message: "Invalid emotion filter" });
      }
      where.emotionTag = e;
    }

    // Symbol filter
    if (symbol) {
      where.symbol = String(symbol.toUpperCase());
    }

    // Trade side filter
    if (side) {
      const s = String(side).toUpperCase();
      if (!VALID_SIDES.includes(s)) {
        return res.status(400).json({ message: "Invalid side filter" });
      }
      where.side = s;
    }

    // Date filters
    if (from || to) {
      where.openedAt = {};

      if (from) {
        const d = new Date(from);
        if (isNaN(d))
          return res.status(400).json({ message: "Invalid 'from' date" });
        where.openedAt = { ...where.openedAt, gte: d };
      }

      if (to) {
        const endDate = new Date(to);
        endDate.setHours(23, 59, 59, 999);

        where.openedAt.lte = endDate;
      }
    }

    const [userTrades, totalTrades] = await Promise.all([
      prisma.trade.findMany({
        where,
        orderBy: {
          openedAt: "desc",
        },
        skip,
        take: limit,
      }),

      prisma.trade.count({
        where,
      }),
    ]);

    const totalPages = Math.ceil(totalTrades / limit);

    if (userTrades.length === 0) {
      return res.status(200).json({
        message: "No trades found",
        response: [],
      });
    }

    return res.status(200).json({
      message:
        userTrades.length === 0
          ? "No trades found"
          : "Trades fetched successfully",
      response: {
        trades: userTrades,
        pagination: { page, limit, totalTrades, totalPages },
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tradeId = req.params.id;

    const userTrade = await prisma.trade.findUnique({
      where: {
        id: tradeId,
        userId,
      },
    });

    if (!userTrade) {
      return res.status(200).json({
        message: "Trade not found",
      });
    }

    return res.status(200).json({
      message: "trade fetched successfully",
      response: userTrade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      symbol,
      side,
      quantity,
      entryPrice,
      exitPrice,
      stopLoss,
      targetPrice,
      strategyTag,
      emotionTag,
      notes,
      openedAt,
      closedAt,
    } = req.body;

    const qty = new Decimal(quantity);
    const entry = new Decimal(entryPrice);
    const exit = new Decimal(exitPrice);
    const stop = new Decimal(stopLoss);
    const target = new Decimal(targetPrice);

    if (
      !symbol ||
      !side ||
      !quantity ||
      !entryPrice ||
      !exitPrice ||
      !stopLoss ||
      !targetPrice ||
      !openedAt ||
      !closedAt
    ) {
      return res.status(400).json({
        message: "Missing required trade fields",
      });
    }

    let pnl = Decimal;
    let risk = Decimal;
    let reward = Decimal;

    if (side === "BUY") {
      pnl = exit.minus(entry).times(qty);
      risk = entry.minus(stop).abs().times(qty);
      reward = target.minus(entry).abs().times(qty);
    } else if (side === "SELL") {
      pnl = entry.minus(exit).times(qty);
      risk = stop.minus(entry).abs().times(qty);
      reward = entry.minus(target).abs().times(qty);
    } else {
      return res.status(400).json({
        message: "Invalid trade side",
      });
    }

    const riskRewardRatio = risk.isZero() ? new Decimal(0) : reward.div(risk);

    const trade = await prisma.trade.create({
      data: {
        userId,
        symbol,
        side,
        quantity,
        entryPrice,
        exitPrice,
        stopLoss,
        targetPrice,
        strategyTag,
        emotionTag,
        notes,
        pnl,
        riskRewardRatio,
        openedAt: new Date(openedAt),
        closedAt: closedAt ? new Date(closedAt) : null,
      },
    });

    return res.status(200).json({
      message: "Trade added",
      response: trade,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tradeId = req.params.id;

    const {
      symbol,
      side,
      quantity,
      entryPrice,
      exitPrice,
      stopLoss,
      targetPrice,
      strategyTag,
      emotionTag,
      notes,
      openedAt,
      closedAt,
    } = req.body;

    const existingTrade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId,
      },
    });

    if (!existingTrade) {
      return res.status(404).json({
        message: "Trade not found",
      });
    }

    const finalSymbol = symbol ?? existingTrade.symbol;
    const finalSide = side ?? existingTrade.side;
    const finalQuantity = quantity ?? existingTrade.quantity;
    const finalEntryPrice = entryPrice ?? existingTrade.entryPrice;
    const finalExitPrice = exitPrice ?? existingTrade.exitPrice;
    const finalStopLoss = stopLoss ?? existingTrade.stopLoss;
    const finalTargetPrice = targetPrice ?? existingTrade.targetPrice;

    const qty = new Decimal(finalQuantity);
    const entry = new Decimal(finalEntryPrice);
    const exit = new Decimal(finalExitPrice);
    const stop = new Decimal(finalStopLoss);
    const target = new Decimal(finalTargetPrice);

    let pnl;
    let risk;
    let reward;

    if (finalSide === "BUY") {
      pnl = exit.minus(entry).times(qty);
      risk = entry.minus(stop).abs().times(qty);
      reward = target.minus(entry).abs().times(qty);
    } else if (finalSide === "SELL") {
      pnl = entry.minus(exit).times(qty);
      risk = stop.minus(entry).abs().times(qty);
      reward = entry.minus(target).abs().times(qty);
    } else {
      return res.status(400).json({
        message: "Invalid trade side",
      });
    }

    const riskRewardRatio = risk.isZero() ? new Decimal(0) : reward.div(risk);

    const updatedTrade = await prisma.trade.update({
      where: {
        id: tradeId,
      },
      data: {
        symbol: finalSymbol,
        side: finalSide,
        quantity: finalQuantity,
        entryPrice: finalEntryPrice,
        exitPrice: finalExitPrice,
        stopLoss: finalStopLoss,
        targetPrice: finalTargetPrice,

        strategyTag: strategyTag ?? existingTrade.strategyTag,
        emotionTag: emotionTag ?? existingTrade.emotionTag,
        notes: notes ?? existingTrade.notes,

        pnl,
        riskRewardRatio,

        openedAt: openedAt ? new Date(openedAt) : existingTrade.openedAt,

        closedAt: closedAt ? new Date(closedAt) : existingTrade.closedAt,
      },
    });

    return res.status(200).json({
      message: "Trade updated successfully",
      response: updatedTrade,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const tradeId = req.params.id;

    const existingTrade = await prisma.trade.findFirst({
      where: {
        id: tradeId,
        userId,
      },
    });

    if (!existingTrade) {
      return res.status(404).json({
        message: "Trade not found",
      });
    }

    await prisma.trade.delete({
      where: {
        id: tradeId,
      },
    });

    return res.status(200).json({
      message: "Trade deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post(
  "/import/preview",
  requireAuth,
  upload.single("file"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please upload a CSV file",
        });
      }

      const rows = parse(req.file.buffer, {
        bom: true,
        columns: (headers) => headers.map((header) => header.trim()),
        skip_empty_lines: true,
        trim: true,
      });

      if (rows.length === 0) {
        return res.status(400).json({
          message: "CSV file is empty",
        });
      }

      const headers = Object.keys(rows[0]);

      const columnMap = mapCsvColumns(headers);

      const normalizedRows = rows.map((row) => normalizeCsvRow(row, columnMap));

      const requiredHeaders = [
        "symbol",
        "side",
        "quantity",
        "entryPrice",
        "openedAt",
      ];

      const missingHeaders = requiredHeaders.filter(
        (header) => !columnMap[header],
      );

      if (missingHeaders.length > 0) {
        return res.status(400).json({
          message: "CSV is missing required trade information",
          missingHeaders,
          detectedColumns: columnMap,
        });
      }

      const validatedRows = normalizedRows.map((row, index) => {
        const errors = [];

        if (!row.symbol?.trim()) {
          errors.push("Symbol is required");
        }

        for (const field of ["quantity", "entryPrice"]) {
          const value = Number(row[field]);

          if (!row[field]?.trim() || !Number.isFinite(value) || value <= 0) {
            errors.push(`${field} must be positive`);
          }
        }

        for (const field of ["openedAt"]) {
          if (!row[field]?.trim() || Number.isNaN(Date.parse(row[field]))) {
            errors.push(`${field} must be a valid date`);
          }
        }

        return {
          rowNumber: index + 2,
          valid: errors.length === 0,
          errors,
          data: row,
        };
      });

      return res.status(200).json({
        totalRows: rows.length,
        preview: validatedRows.slice(0,10),
        rows: validatedRows,
      });
    } catch (error) {
      console.error("CSV preview error:", error);

      return res.status(400).json({
        message: "Unable to parse CSV file",
      });
    }
  },
);

router.post("/import", requireAuth, async (req, res) => {
  try {
    const { rows } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({
        message: "No trades provided",
      });
    }

    if (rows.length > 1000) {
      return res.status(400).json({
        message: "Maximum 1000 trades per import",
      });
    }

    const validatedTrades = [];

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      const errors = [];

      const side = String(row.side || "")
        .trim()
        .toUpperCase();
      const emotionTag = String(row.emotionTag || "")
        .trim()
        .toUpperCase();

      if (!row.symbol?.trim()) {
        errors.push("Symbol is required");
      }

      if (!VALID_SIDES.includes(side)) {
        errors.push("Invalid side");
      }

      const numericFields = ["quantity", "entryPrice"];

      for (const field of numericFields) {
        const value = row[field];

        if (
          value === undefined ||
          value === null ||
          String(value).trim() === "" ||
          !Number.isFinite(Number(value)) ||
          Number(value) <= 0
        ) {
          errors.push(`${field} must be a positive number`);
        }
      }

      const openedAt = row.openedAt ? new Date(row.openedAt) : null;
      const closedAt = row.closedAt ? new Date(row.closedAt) : null;

      if (!row.openedAt || Number.isNaN(openedAt.getTime())) {
        errors.push("Invalid trade dates");
      }

      if (errors.length > 0) {
        return res.status(400).json({
          message: "Import validation failed",
          rowNumber: index + 2,
          errors,
        });
      }

      const qty = new Decimal(row.quantity);
      const entry = new Decimal(row.entryPrice);

      const exit = row.exitPrice ? new Decimal(row.exitPrice) : null;
      const stop = row.stopLoss ? new Decimal(row.stopLoss) : null;
      const target = row.targetPrice ? new Decimal(row.targetPrice) : null;

      let pnl = null;
      let riskRewardRatio = null;

      if (exit !== null) {
        pnl =
          side === "BUY"
            ? exit.minus(entry).times(qty)
            : entry.minus(exit).times(qty);
      }

      if (stop !== null && target !== null) {
        let risk;
        let reward;

        if (side === "BUY") {
          risk = entry.minus(stop).abs().times(qty);
          reward = target.minus(entry).abs().times(qty);
        } else {
          risk = stop.minus(entry).abs().times(qty);
          reward = entry.minus(target).abs().times(qty);
        }

        if (!risk.isZero()) {
          riskRewardRatio = reward.div(risk);
        }
      }

      validatedTrades.push({
        userId,
        symbol: row.symbol.trim().toUpperCase(),
        side,
        quantity: qty.toString(),
        entryPrice: entry.toString(),
        exitPrice: exit?.toString() ?? null,
        stopLoss: stop?.toString() ?? null,
        targetPrice: target?.toString() ?? null,
        pnl: pnl?.toString() ?? null,
        riskRewardRatio: riskRewardRatio?.toFixed(4) ?? null,
        emotionTag: emotionTag || null,
        strategyTag: row.strategyTag?.trim() || null,
        notes: row.notes?.trim() || null,
        openedAt,
        closedAt,
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      return tx.trade.createMany({
        data: validatedTrades,
      });
    });

    return res.status(201).json({
      message: "Trades imported successfully",
      importedCount: result.count,
    });
  } catch (error) {
    console.error("Trade import error:", error);

    return res.status(500).json({
      message: "Failed to import trades",
    });
  }
});

export default router;
