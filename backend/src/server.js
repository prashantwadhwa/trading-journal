import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/authRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import tradesRoutes from "./routes/tradesRoutes.js";

dotenv.config();

import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);

app.all("/api/auth/*splat", toNodeHandler(auth));
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Hello from empty route!!!!");
});

app.use("/auth", authRoutes);
app.use("/analytics", analyticsRoutes);
app.use("/trades", tradesRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
