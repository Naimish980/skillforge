import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../db";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured in .env");
};

// =====================================================
// REGISTER
// POST /api/auth/register
// =====================================================

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, phone and password are required",
      });
    }

    const normalizedName = String(name).trim();
    const normalizedEmail = String(email).trim().toLowerCase();
    const normalizedPhone = String(phone).trim();
    const plainPassword = String(password);

    // Name validation
    if (normalizedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: "Name must contain at least 2 characters",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address",
      });
    }

    // Indian mobile number validation
    const phoneRegex = /^[6-9]\d{9}$/;

    if (!phoneRegex.test(normalizedPhone)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 10-digit Indian mobile number",
      });
    }

    // Password validation
    if (plainPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    // Check email / phone
    const existingUser = await pool.query(
      `
      SELECT id, email, phone
      FROM users
      WHERE email = $1 OR phone = $2
      `,
      [normalizedEmail, normalizedPhone],
    );

    if (existingUser.rows.length > 0) {
      const existing = existingUser.rows[0];

      if (existing.email === normalizedEmail) {
        return res.status(409).json({
          success: false,
          message: "Email is already registered",
        });
      }

      if (existing.phone === normalizedPhone) {
        return res.status(409).json({
          success: false,
          message: "Phone number is already registered",
        });
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(plainPassword, 12);

    // Create account
    const result = await pool.query(
      `
      INSERT INTO users (
        name,
        email,
        phone,
        password_hash
      )
      VALUES ($1, $2, $3, $4)
      RETURNING id, name, email, phone, created_at
      `,
      [
        normalizedName,
        normalizedEmail,
        normalizedPhone,
        passwordHash,
      ],
    );

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while creating the account",
    });
  }
});

// =====================================================
// LOGIN
// POST /api/auth/login
// =====================================================

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Required fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const plainPassword = String(password);

    // Find user
    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        phone,
        password_hash,
        created_at
      FROM users
      WHERE email = $1
      `,
      [normalizedEmail],
    );

    // User doesn't exist
    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Account not found. Please create an account first.",
      });
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(
      plainPassword,
      user.password_hash,
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      JWT_SECRET,
      {
        expiresIn: "7d",
      },
    );

    // Never send password hash to frontend
    delete user.password_hash;

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong while logging in",
    });
  }
});

export default router;