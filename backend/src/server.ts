import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./db";
import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import progressRoutes from "./routes/progress";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/progress", progressRoutes);

app.get("/api/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      success: true,
      message: "SkillForge backend is running",
      database: "PostgreSQL connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error("Database health check error:", error);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

const PORT = Number(process.env.PORT || 5000);

app.listen(PORT, () => {
  console.log(`🚀 SkillForge backend running on port ${PORT}`);
});
