require("dotenv").config();

const express = require("express");
const prisma = require("../config/prisma");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/dashboard", verifyToken, (req, res) => {
    return res.json({
        message: 'Hellow dashboard',
        userId: req.user.userId
    })
});

module.exports = router;
