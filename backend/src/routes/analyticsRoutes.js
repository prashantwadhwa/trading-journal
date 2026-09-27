require("dotenv").config();

const express = require("express");
const prisma = require("../config/prisma");
const verifyToken = require("../middleware/authMiddleware");
const { inThisWeek, endOfWeek, startOfWeek } = require("date-fns");

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
  return res.json({
    message: "Hellow dashboard",
    userId: req.user.userId,
  });
});

router.get("/summary", verifyToken, async (req, res) => {
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
        response: {
          totalTrades: 0,
          winningTrades: 0,
          losingTrades: 0,
          winRate: 0,
          totalPnl: 0,
          avgPnl: 0,
          avgRiskReward: 0,
          tradesThisWeek: 0,
        },
      });
    }

    const totalTrades = userTrades.length;

    const winningTrades = userTrades.filter(
      (trade) => Number(trade.pnl) > 0,
    ).length;

    const losingTrades = userTrades.filter(
      (trade) => Number(trade.pnl) < 0,
    ).length;

    const winRate = Number(((winningTrades / totalTrades) * 100).toFixed(2));

    const totalPnl = userTrades.reduce((accumulator, trade) => {
      return accumulator + Number(trade.pnl);
    }, 0);

    const avgPnl = Number((totalPnl / totalTrades).toFixed(2));

    const totalRR = userTrades.reduce((accumulator, trade) => {
      return accumulator + Number(trade.riskRewardRatio);
    }, 0);

    const avgRiskReward = Number((totalRR / totalTrades).toFixed(2));

    const now = new Date();

    const weekStart = startOfWeek(now, {
      weekStartsOn: 1,
    });

    const weekEnd = endOfWeek(now, {
      weekStartsOn: 1,
    });

    const tradesThisWeek = userTrades.filter((trade) => {
      const openedAt = new Date(trade.openedAt);

      return openedAt >= weekStart && openedAt <= weekEnd;
    }).length;

    return res.status(200).json({
      message: "Analytics summary fetched successfully",
      response: {
        totalTrades,
        winningTrades,
        losingTrades,
        winRate,
        totalPnl: Number(totalPnl.toFixed(2)),
        avgPnl,
        avgRiskReward,
        tradesThisWeek,
      },
    });
  } catch (error) {
    console.error("Analytics summary error:", error);

    return res.status(500).json({
      message: "Failed to fetch analytics summary",
    });
  }
});

router.get("/equity-curve", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    const userTrades = await prisma.trade.findMany({
      where: {
        userId,
      },
      orderBy: {
        closedAt: "asc",
      },
      select: {
        closedAt: true,
        pnl: true,
      },
    });

    if (userTrades.length === 0) {
      return res.status(200).json({
        message: "No trades found",
        response: [],
      });
    }

    const dailyPnl = {};

    userTrades.forEach((trade) => {
      const date = new Date(trade.closedAt).toISOString().split("T")[0];

      if (!dailyPnl[date]) {
        dailyPnl[date] = 0;
      }

      dailyPnl[date] += Number(trade.pnl);
    });

    let cumulativePnl = 0;

    const equityCurve = Object.entries(dailyPnl).map(([date, pnl]) => {
      cumulativePnl += pnl;

      return {
        date,
        dailyPnl: Number(pnl.toFixed(2)),
        cumulativePnl: Number(cumulativePnl.toFixed(2)),
      };
    });

    return res.status(200).json({
      message: "Equity curve fetched successfully",
      response: equityCurve,
    });
    
  } catch (error) {
    console.error("Equity curve error:", error);

    return res.status(500).json({
      message: "Failed to fetch equity curve",
    });
  }
});

module.exports = router;
