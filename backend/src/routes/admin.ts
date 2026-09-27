import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

/* =====================================================
   ADMIN ACCESS HELPER
===================================================== */

async function verifyAdmin(
  req: AuthenticatedRequest,
  res: Response,
): Promise<boolean> {
  const userId = req.userId;

  if (!userId) {
    res.status(401).json({
      success: false,
      message: "Authenticated user not found",
    });

    return false;
  }

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
    res.status(401).json({
      success: false,
      message: "User not found",
    });

    return false;
  }

  const admin = adminResult.rows[0];

  if (admin.role !== "admin") {
    res.status(403).json({
      success: false,
      message: "Admin access required",
    });

    return false;
  }

  return true;
}

/* =====================================================
   ADMIN DASHBOARD
   GET /api/admin/dashboard
===================================================== */

router.get(
  "/dashboard",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const isAdmin = await verifyAdmin(req, res);

      if (!isAdmin) {
        return;
      }

      const userId = req.userId;

      const adminResult = await pool.query(
        `
        SELECT id, name, email, role
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId],
      );

      const admin = adminResult.rows[0];

      /* Total students */
      const studentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM users
        WHERE role = 'student'
        `,
      );

      /* Total enrollments */
      const enrollmentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM enrollments
        `,
      );

      /* Total successful payments */
      const paymentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM payment_orders
        WHERE status = 'paid'
        `,
      );

      /* Total revenue */
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
          students:
            studentsResult.rows[0].total,

          enrollments:
            enrollmentsResult.rows[0].total,

          successfulPayments:
            paymentsResult.rows[0].total,

          revenue:
            revenueInRupees,
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

/* =====================================================
   GET ALL STUDENTS
   GET /api/admin/students
===================================================== */

router.get(
  "/students",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const isAdmin = await verifyAdmin(req, res);

      if (!isAdmin) {
        return;
      }

      const studentsResult = await pool.query(
        `
        SELECT
          u.id,
          u.name,
          u.email,
          u.phone,
          u.created_at,

          COUNT(e.id)::int AS enrollment_count,

          COALESCE(
            ARRAY_AGG(e.course_id)
            FILTER (WHERE e.course_id IS NOT NULL),
            '{}'
          ) AS enrolled_course_ids

        FROM users u

        LEFT JOIN enrollments e
          ON e.user_id = u.id

        WHERE u.role = 'student'

        GROUP BY
          u.id,
          u.name,
          u.email,
          u.phone,
          u.created_at

        ORDER BY u.created_at DESC
        `,
      );

      return res.status(200).json({
        success: true,
        students: studentsResult.rows,
      });
    } catch (error) {
      console.error(
        "Get admin students error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load students",
      });
    }
  },
);

export default router;
/* =====================================================
   GET ALL COURSES
   GET /api/admin/courses
===================================================== */

router.get(
  "/courses",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const isAdmin = await verifyAdmin(req, res);

      if (!isAdmin) {
        return;
      }

      const coursesResult = await pool.query(
        `
        SELECT
          c.id,
          c.title,
          c.description,
          c.category,
          c.level,
          c.price,
          c.thumbnail,
          c.is_published,
          c.created_at,
          c.updated_at,

          COUNT(DISTINCT m.id)::int AS module_count,
          COUNT(DISTINCT l.id)::int AS lecture_count,
          COUNT(DISTINCT q.id)::int AS quiz_count

        FROM courses c

        LEFT JOIN modules m
          ON m.course_id = c.id

        LEFT JOIN lectures l
          ON l.module_id = m.id

        LEFT JOIN quizzes q
          ON q.lecture_id = l.id

        GROUP BY
          c.id,
          c.title,
          c.description,
          c.category,
          c.level,
          c.price,
          c.thumbnail,
          c.is_published,
          c.created_at,
          c.updated_at

        ORDER BY c.created_at DESC
        `,
      );

      return res.status(200).json({
        success: true,
        courses: coursesResult.rows,
      });
    } catch (error) {
      console.error(
        "Get admin courses error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load courses",
      });
    }
  },
);
router.post(
  "/courses",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const isAdmin = await verifyAdmin(req, res);
      if (!isAdmin) return;

      const {
        title,
        description,
        category,
        level,
        price,
        thumbnail,
        isPublished,
      } = req.body;

      if (!title || String(title).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Course title is required",
        });
      }

      const parsedPrice = Number(price);

      if (!Number.isFinite(parsedPrice) || parsedPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid course price is required",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO courses
        (
          title,
          description,
          category,
          level,
          price,
          thumbnail,
          is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING
          id,
          title,
          description,
          category,
          level,
          price,
          thumbnail,
          is_published,
          created_at,
          updated_at
        `,
        [
          String(title).trim(),
          description ? String(description).trim() : null,
          category ? String(category).trim() : null,
          level ? String(level).trim() : null,
          parsedPrice,
          thumbnail ? String(thumbnail).trim() : null,
          Boolean(isPublished),
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Course created successfully",
        course: result.rows[0],
      });
    } catch (error) {
      console.error("Create admin course error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create course",
      });
    }
  },
);