import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

router.get(
  "/dashboard",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      // Check whether logged-in user is an admin
      const adminResult = await pool.query(
        `
        SELECT id, name, email, role
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId],
      );

      if (adminResult.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      }

      const admin = adminResult.rows[0];

      if (admin.role !== "admin") {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      // Total students
      const studentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM users
        WHERE role = 'student'
        `,
      );

      // Total enrollments
      const enrollmentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM enrollments
        `,
      );

      // Total successful payments
      const paymentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM payment_orders
        WHERE status = 'paid'
        `,
      );

      // Total revenue in paise
      const revenueResult = await pool.query(
        `
        SELECT COALESCE(SUM(amount), 0)::bigint AS total
        FROM payment_orders
        WHERE status = 'paid'
        `,
      );

      const revenueInPaise = Number(
        revenueResult.rows[0].total,
      );

      const revenueInRupees =
        revenueInPaise / 100;

      return res.status(200).json({
        success: true,
        admin: {
          id: admin.id,
          name: admin.name,
          email: admin.email,
        },
        stats: {
          students: studentsResult.rows[0].total,
          enrollments:
            enrollmentsResult.rows[0].total,
          successfulPayments:
            paymentsResult.rows[0].total,
          revenue: revenueInRupees,
        },
      });
    } catch (error) {
      console.error(
        "Admin dashboard error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load admin dashboard",
      });
    }
  },
);

export default router;