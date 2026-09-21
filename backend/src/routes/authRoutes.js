require("dotenv").config();
const bcrypt = require("bcrypt");
import jwt from "jsonwebtoken";

const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({
        message: "Please fill the required fields",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      res.status(400).json({
        message: "User already exists, Please LogIn",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        name: true,
        email: true,
      },
    });

    return res.status(201).json({
      message: "Profile created successfully!!",
      data: {
        newUser,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

   if ( !email || !password) {
      res.status(400).json({
        message: "Please fill the required fields",
      });
    }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return res.status(400).json({ error: "Invalid email or password." });

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword)
    return res.status(400).json({ error: "Invalid email or password." });

  const accessToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: "15m" },
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" },
  );

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    message: "Logged in successfully!",
    accessToken,
  });
});

router.post("/refresh-token", (req, res) => {
  const cookies = req.cookies;

  if (!cookies?.refreshToken)  return res.status(401).json({ error: "Unauthorized access." });

  const refreshToken = cookies.refreshToken;

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({
        message: "Forbidden access",
        error: err
      });
    }

    const newAccessToken = jwt.sign(
      { userId: decoded.userId },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: "15m" },
    );

    res.json({
      accessToken: newAccessToken,
    });
  });
});

router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  res.json({ message: 'Logged out successfully!' });
});

module.exports = router;
