const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/authRoutes")
const analyticsRoutes = require("./routes/analyticsRoutes")

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));

app.get("/", (req,res)=>{
    res.send("Hello from empty route!!!!")
});

app.use("/auth", authRoutes)
app.use("/analytics", analyticsRoutes)

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
