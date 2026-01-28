require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");

// route imports
const authRoutes = require("./routes/auth");
const dealsRoutes = require("./routes/deals");
const claimsRoutes = require("./routes/claims");
const verificationRoutes = require("./routes/verification");

const app = express();

// connect to database
connectDB();

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://start-up-benefits.vercel.app",
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
  }),
);
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/deals", dealsRoutes);
app.use("/api/claims", claimsRoutes);
app.use("/api/verification", verificationRoutes);

// health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
