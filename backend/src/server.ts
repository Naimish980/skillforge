import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db";

import authRoutes from "./routes/auth";
import paymentRoutes from "./routes/payment";
import progressRoutes from "./routes/progress";
import adminRoutes from "./routes/admin";
import offerRoutes from "./routes/offers";

dotenv.config();

const app = express();

/* =========================
   SECURITY HEADERS
========================= */

app.use(helmet());

/* =========================
   CORS
========================= */

const allowedOrigins = [
  "https://skillforge-tau-three.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (health checks, server-to-server requests, etc.)
      if (!origin) {
        callback(null, true);
        return;
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS policy: Origin not allowed"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: false,
  }),
);

/* =========================
   JSON BODY
========================= */

app.use(express.json());

/* =========================
   RATE LIMITERS
========================= */

// General APIs
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message: "Too many requests. Please try again later.",
  },
});

// Authentication APIs
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many authentication attempts. Please try again later.",
  },
});

// Payment APIs
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many payment requests. Please try again later.",
  },
});

// Admin APIs
// Higher limit because Admin Dashboard loads many APIs together.
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,

  message: {
    success: false,
    message:
      "Too many admin requests. Please try again later.",
  },
});

/* =========================
   ROUTES
========================= */

app.use(
  "/api/auth",
  authLimiter,
  authRoutes,
);

app.use(
  "/api/payment",
  paymentLimiter,
  paymentRoutes,
);

app.use(
  "/api/progress",
  generalLimiter,
  progressRoutes,
);

app.use(
  "/api/admin",
  adminLimiter,
  adminRoutes,
);

app.use(
  "/api/offers",
  generalLimiter,
  offerRoutes,
);

/* =========================
   HEALTH CHECK
========================= */

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
    console.error(
      "Database health check error:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Database connection failed",
    });
  }
});

/* =========================
   SERVER
========================= */

const PORT = Number(
  process.env.PORT || 5000,
);

app.listen(PORT, () => {
  console.log(
    `🚀 SkillForge backend running on port ${PORT}`,
  );
});