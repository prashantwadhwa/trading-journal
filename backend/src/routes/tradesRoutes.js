require("dotenv").config();

const express = require("express");
const prisma = require("../config/prisma");
const verifyToken = require("../middleware/authMiddleware");
import Decimal from "decimal.js";

const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userTrades = await prisma.trade.findMany({
      where: {
        userId,
      },
      orderBy: {
        openedAt: "desc",
      },
    });

    if (userTrades.length === 0) {
      return res.status(200).json({
        message: "No trades found",
        response: [],
      });
    }

    return res.status(200).json({
      message: "trades fetched success",
      response: userTrades,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
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
        openedAt,
        closedAt,
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

router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
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

router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
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

module.exports = router;
