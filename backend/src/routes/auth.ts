import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Resend } from "resend";
import { pool } from "../db";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
const FRONTEND_URL =
  process.env.FRONTEND_URL || "http://localhost:5173";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured in .env");
}

if (!RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is not configured in .env");
}

const resend = new Resend(RESEND_API_KEY);

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

// =====================================================
// FORGOT PASSWORD
// POST /api/auth/forgot-password
// =====================================================

router.post(
  "/forgot-password",
  async (req: Request, res: Response) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: "Email is required",
        });
      }

      const normalizedEmail = String(email)
        .trim()
        .toLowerCase();

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(normalizedEmail)) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid email address",
        });
      }

      // Find user
      const userResult = await pool.query(
        `
        SELECT id, name, email
        FROM users
        WHERE email = $1
        `,
        [normalizedEmail],
      );

      /*
       * We intentionally return the same response even if
       * the email does not exist.
       *
       * This prevents account/email enumeration.
       */
      if (userResult.rows.length === 0) {
        return res.status(200).json({
          success: true,
          message:
            "If an account exists with this email, a password reset link has been sent.",
        });
      }

      const user = userResult.rows[0];

      // Delete old unused tokens for this user
      await pool.query(
        `
        DELETE FROM password_reset_tokens
        WHERE user_id = $1
        AND used_at IS NULL
        `,
        [user.id],
      );

      // Generate secure random token
      const rawToken = crypto.randomBytes(32).toString("hex");

      // Store only SHA-256 hash in database
      const tokenHash = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

      // Token valid for 30 minutes
      const expiresAt = new Date(
        Date.now() + 30 * 60 * 1000,
      );

      await pool.query(
        `
        INSERT INTO password_reset_tokens (
          user_id,
          token_hash,
          expires_at
        )
        VALUES ($1, $2, $3)
        `,
        [
          user.id,
          tokenHash,
          expiresAt,
        ],
      );

      // Create reset link
      const resetLink =
        `${FRONTEND_URL}/reset-password?token=${rawToken}`;

      // Send email
      try {
        await resend.emails.send({
          from: RESEND_FROM_EMAIL,
          to: [user.email],
          subject: "Reset your SkillForge password",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Reset your SkillForge password</title>
              </head>

              <body
                style="
                  margin:0;
                  padding:0;
                  background:#030603;
                  font-family:Arial,Helvetica,sans-serif;
                  color:#ffffff;
                "
              >
                <div
                  style="
                    max-width:600px;
                    margin:40px auto;
                    padding:20px;
                  "
                >
                  <div
                    style="
                      background:#0b100b;
                      border:1px solid #1d2a1d;
                      border-radius:16px;
                      padding:40px 30px;
                    "
                  >

                    <h1
                      style="
                        margin:0 0 10px;
                        color:#b7ff00;
                        font-size:30px;
                      "
                    >
                      SkillForge
                    </h1>

                    <p
                      style="
                        color:#a7b0a7;
                        font-size:14px;
                        margin-top:0;
                      "
                    >
                      Learn. Build. Grow.
                    </p>

                    <h2
                      style="
                        color:#ffffff;
                        margin-top:35px;
                      "
                    >
                      Reset your password
                    </h2>

                    <p
                      style="
                        color:#c8cec8;
                        line-height:1.7;
                        font-size:15px;
                      "
                    >
                      Hi ${user.name},
                    </p>

                    <p
                      style="
                        color:#c8cec8;
                        line-height:1.7;
                        font-size:15px;
                      "
                    >
                      We received a request to reset your
                      SkillForge account password.
                    </p>

                    <div style="margin:30px 0;">
                      <a
                        href="${resetLink}"
                        style="
                          display:inline-block;
                          background:#b7ff00;
                          color:#000000;
                          text-decoration:none;
                          padding:14px 24px;
                          border-radius:10px;
                          font-weight:bold;
                          font-size:15px;
                        "
                      >
                        Reset Password
                      </a>
                    </div>

                    <p
                      style="
                        color:#929b92;
                        line-height:1.6;
                        font-size:13px;
                      "
                    >
                      This link will expire in
                      <strong>30 minutes</strong>.
                    </p>

                    <p
                      style="
                        color:#929b92;
                        line-height:1.6;
                        font-size:13px;
                      "
                    >
                      If you did not request a password reset,
                      you can safely ignore this email.
                    </p>

                    <hr
                      style="
                        border:none;
                        border-top:1px solid #202820;
                        margin:30px 0;
                      "
                    />

                    <p
                      style="
                        color:#687168;
                        font-size:12px;
                        line-height:1.5;
                      "
                    >
                      © ${new Date().getFullYear()} SkillForge.
                      All rights reserved.
                    </p>

                  </div>
                </div>
              </body>
            </html>
          `,
        });
      } catch (emailError) {
        console.error(
          "Password reset email error:",
          emailError,
        );

        // Remove token if email could not be sent
        await pool.query(
          `
          DELETE FROM password_reset_tokens
          WHERE token_hash = $1
          `,
          [tokenHash],
        );

        return res.status(500).json({
          success: false,
          message:
            "Unable to send password reset email. Please try again later.",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "If an account exists with this email, a password reset link has been sent.",
      });
    } catch (error) {
      console.error("Forgot password error:", error);

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while processing the password reset request",
      });
    }
  },
);

// =====================================================
// RESET PASSWORD
// POST /api/auth/reset-password
// =====================================================

router.post(
  "/reset-password",
  async (req: Request, res: Response) => {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res.status(400).json({
          success: false,
          message:
            "Reset token and new password are required",
        });
      }

      const plainPassword = String(newPassword);

      // Password validation
      if (plainPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message:
            "Password must be at least 8 characters",
        });
      }

      // Hash received token
      const tokenHash = crypto
        .createHash("sha256")
        .update(String(token))
        .digest("hex");

      // Find reset token
      const tokenResult = await pool.query(
        `
        SELECT
          id,
          user_id,
          expires_at,
          used_at
        FROM password_reset_tokens
        WHERE token_hash = $1
        `,
        [tokenHash],
      );

      if (tokenResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid or expired password reset link",
        });
      }

      const resetToken = tokenResult.rows[0];

      // Token already used
      if (resetToken.used_at) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link has already been used",
        });
      }

      // Token expired
      if (
        new Date(resetToken.expires_at).getTime() <
        Date.now()
      ) {
        return res.status(400).json({
          success: false,
          message:
            "This password reset link has expired",
        });
      }

      // Hash new password
      const passwordHash = await bcrypt.hash(
        plainPassword,
        12,
      );

      // Update password
      await pool.query(
        `
        UPDATE users
        SET password_hash = $1
        WHERE id = $2
        `,
        [
          passwordHash,
          resetToken.user_id,
        ],
      );

      // Mark token as used
      await pool.query(
        `
        UPDATE password_reset_tokens
        SET used_at = NOW()
        WHERE id = $1
        `,
        [resetToken.id],
      );

      // Delete any other unused reset tokens
      await pool.query(
        `
        DELETE FROM password_reset_tokens
        WHERE user_id = $1
        AND id != $2
        AND used_at IS NULL
        `,
        [
          resetToken.user_id,
          resetToken.id,
        ],
      );

      return res.status(200).json({
        success: true,
        message:
          "Password reset successfully. You can now login with your new password.",
      });
    } catch (error) {
      console.error("Reset password error:", error);

      return res.status(500).json({
        success: false,
        message:
          "Something went wrong while resetting the password",
      });
    }
  },
);

export default router;