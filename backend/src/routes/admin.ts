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

      const studentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM users
        WHERE role = 'student'
        `,
      );

      const enrollmentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM enrollments
        `,
      );

      const paymentsResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM payment_orders
        WHERE status = 'paid'
        `,
      );

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

/* =====================================================
   CREATE COURSE
   POST /api/admin/courses
===================================================== */

router.post(
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

      if (
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid course price is required",
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
          description
            ? String(description).trim()
            : null,

          category
            ? String(category).trim()
            : null,

          level
            ? String(level).trim()
            : null,

          parsedPrice,

          thumbnail
            ? String(thumbnail).trim()
            : null,

          Boolean(isPublished),
        ],
      );

      return res.status(201).json({
        success: true,
        message:
          "Course created successfully",
        course: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create admin course error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create course",
      });
    }
  },
);

/* =====================================================
   GET COURSE CONTENT
   GET /api/admin/courses/:courseId/content

   Returns:
   Course
   └── Modules
       └── Lectures
           └── Quizzes
===================================================== */

router.get(
  "/courses/:courseId/content",
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

      const courseId = Number(
        req.params.courseId,
      );

      if (!Number.isInteger(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const courseResult = await pool.query(
        `
        SELECT
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
        FROM courses
        WHERE id = $1
        LIMIT 1
        `,
        [courseId],
      );

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const modulesResult = await pool.query(
        `
        SELECT
          id,
          course_id,
          title,
          description,
          module_order,
          created_at,
          updated_at
        FROM modules
        WHERE course_id = $1
        ORDER BY module_order ASC, id ASC
        `,
        [courseId],
      );

      return res.status(200).json({
        success: true,
        course: courseResult.rows[0],
        modules: modulesResult.rows,
      });
    } catch (error) {
      console.error(
        "Get course content error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load course content",
      });
    }
  },
);

/* =====================================================
   CREATE MODULE
   POST /api/admin/courses/:courseId/modules
===================================================== */

router.post(
  "/courses/:courseId/modules",
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

      const courseId = Number(
        req.params.courseId,
      );

      if (!Number.isInteger(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const {
        title,
        description,
        moduleOrder,
      } = req.body;

      if (
        !title ||
        String(title).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Module title is required",
        });
      }

      const courseResult = await pool.query(
        `
        SELECT id
        FROM courses
        WHERE id = $1
        LIMIT 1
        `,
        [courseId],
      );

      if (courseResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      let parsedModuleOrder: number;

      if (
        moduleOrder !== undefined &&
        moduleOrder !== null &&
        String(moduleOrder).trim() !== ""
      ) {
        parsedModuleOrder = Number(
          moduleOrder,
        );
      } else {
        const orderResult =
          await pool.query(
            `
            SELECT COALESCE(
              MAX(module_order),
              0
            ) + 1 AS next_order
            FROM modules
            WHERE course_id = $1
            `,
            [courseId],
          );

        parsedModuleOrder = Number(
          orderResult.rows[0].next_order,
        );
      }

      if (
        !Number.isInteger(parsedModuleOrder) ||
        parsedModuleOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Module order must be a positive number",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO modules
        (
          course_id,
          title,
          description,
          module_order
        )
        VALUES ($1, $2, $3, $4)
        RETURNING
          id,
          course_id,
          title,
          description,
          module_order,
          created_at,
          updated_at
        `,
        [
          courseId,
          String(title).trim(),
          description
            ? String(description).trim()
            : null,
          parsedModuleOrder,
        ],
      );

      return res.status(201).json({
        success: true,
        message:
          "Module created successfully",
        module: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create module error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create module",
      });
    }
  },
);

/* =====================================================
   UPDATE MODULE
   PUT /api/admin/modules/:moduleId
===================================================== */

router.put(
  "/modules/:moduleId",
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

      const moduleId = Number(
        req.params.moduleId,
      );

      if (!Number.isInteger(moduleId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID",
        });
      }

      const {
        title,
        description,
        moduleOrder,
      } = req.body;

      if (
        !title ||
        String(title).trim() === ""
      ) {
        return res.status(400).json({
          success: false,
          message: "Module title is required",
        });
      }

      const parsedModuleOrder = Number(
        moduleOrder,
      );

      if (
        !Number.isInteger(
          parsedModuleOrder,
        ) ||
        parsedModuleOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Module order must be a positive number",
        });
      }

      const result = await pool.query(
        `
        UPDATE modules
        SET
          title = $1,
          description = $2,
          module_order = $3,
          updated_at = NOW()
        WHERE id = $4
        RETURNING
          id,
          course_id,
          title,
          description,
          module_order,
          created_at,
          updated_at
        `,
        [
          String(title).trim(),
          description
            ? String(description).trim()
            : null,
          parsedModuleOrder,
          moduleId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Module updated successfully",
        module: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update module error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update module",
      });
    }
  },
);

/* =====================================================
   DELETE MODULE
   DELETE /api/admin/modules/:moduleId

   Because modules.course_id and lectures.module_id
   use ON DELETE CASCADE, deleting a module will
   also delete its lectures and related quizzes.
===================================================== */

router.delete(
  "/modules/:moduleId",
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

      const moduleId = Number(
        req.params.moduleId,
      );

      if (!Number.isInteger(moduleId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM modules
        WHERE id = $1
        RETURNING id, course_id
        `,
        [moduleId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      return res.status(200).json({
        success: true,
        message:
          "Module deleted successfully",
        moduleId: result.rows[0].id,
        courseId: result.rows[0].course_id,
      });
    } catch (error) {
      console.error(
        "Delete module error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to delete module",
      });
    }
  },
);


/* =====================================================
   GET MODULE LECTURES
   GET /api/admin/modules/:moduleId/lectures
===================================================== */

router.get(
  "/modules/:moduleId/lectures",
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

      const moduleId = Number(req.params.moduleId);

      if (!Number.isInteger(moduleId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID",
        });
      }

      const moduleResult = await pool.query(
        `
          SELECT
            id,
            course_id,
            title,
            description,
            module_order,
            created_at,
            updated_at
          FROM modules
          WHERE id = $1
          LIMIT 1
        `,
        [moduleId],
      );

      if (moduleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      const lecturesResult = await pool.query(
        `
          SELECT
            id,
            module_id,
            title,
            description,
            video_url,
            lecture_order,
            duration,
            is_free,
            created_at,
            updated_at
          FROM lectures
          WHERE module_id = $1
          ORDER BY lecture_order ASC, id ASC
        `,
        [moduleId],
      );

      return res.status(200).json({
        success: true,
        module: moduleResult.rows[0],
        lectures: lecturesResult.rows,
      });
    } catch (error) {
      console.error("Get module lectures error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load lectures",
      });
    }
  },
);

/* =====================================================
   CREATE LECTURE
   POST /api/admin/modules/:moduleId/lectures
===================================================== */

router.post(
  "/modules/:moduleId/lectures",
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

      const moduleId = Number(req.params.moduleId);

      if (!Number.isInteger(moduleId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid module ID",
        });
      }

      const {
        title,
        description,
        videoUrl,
        lectureOrder,
        duration,
        isFree,
      } = req.body;

      if (!title || String(title).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Lecture title is required",
        });
      }

      const moduleResult = await pool.query(
        `
          SELECT id
          FROM modules
          WHERE id = $1
          LIMIT 1
        `,
        [moduleId],
      );

      if (moduleResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Module not found",
        });
      }

      let parsedLectureOrder: number;

      if (
        lectureOrder !== undefined &&
        lectureOrder !== null &&
        String(lectureOrder).trim() !== ""
      ) {
        parsedLectureOrder = Number(lectureOrder);
      } else {
        const orderResult = await pool.query(
          `
            SELECT COALESCE(
              MAX(lecture_order),
              0
            ) + 1 AS next_order
            FROM lectures
            WHERE module_id = $1
          `,
          [moduleId],
        );

        parsedLectureOrder = Number(
          orderResult.rows[0].next_order,
        );
      }

      if (
        !Number.isInteger(parsedLectureOrder) ||
        parsedLectureOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Lecture order must be a positive number",
        });
      }

      const parsedDuration =
        duration === undefined ||
        duration === null ||
        String(duration).trim() === ""
          ? 0
          : Number(duration);

      if (
        !Number.isInteger(parsedDuration) ||
        parsedDuration < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duration must be a non-negative number",
        });
      }

      const result = await pool.query(
        `
          INSERT INTO lectures
          (
            module_id,
            title,
            description,
            video_url,
            lecture_order,
            duration,
            is_free
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING
            id,
            module_id,
            title,
            description,
            video_url,
            lecture_order,
            duration,
            is_free,
            created_at,
            updated_at
        `,
        [
          moduleId,
          String(title).trim(),
          description
            ? String(description).trim()
            : null,
          videoUrl
            ? String(videoUrl).trim()
            : null,
          parsedLectureOrder,
          parsedDuration,
          Boolean(isFree),
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Lecture created successfully",
        lecture: result.rows[0],
      });
    } catch (error) {
      console.error("Create lecture error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create lecture",
      });
    }
  },
);

/* =====================================================
   UPDATE LECTURE
   PUT /api/admin/lectures/:lectureId
===================================================== */

router.put(
  "/lectures/:lectureId",
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

      const lectureId = Number(req.params.lectureId);

      if (!Number.isInteger(lectureId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lecture ID",
        });
      }

      const {
        title,
        description,
        videoUrl,
        lectureOrder,
        duration,
        isFree,
      } = req.body;

      if (!title || String(title).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Lecture title is required",
        });
      }

      const parsedLectureOrder = Number(
        lectureOrder,
      );

      if (
        !Number.isInteger(parsedLectureOrder) ||
        parsedLectureOrder < 1
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Lecture order must be a positive number",
        });
      }

      const parsedDuration =
        duration === undefined ||
        duration === null ||
        String(duration).trim() === ""
          ? 0
          : Number(duration);

      if (
        !Number.isInteger(parsedDuration) ||
        parsedDuration < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Duration must be a non-negative number",
        });
      }

      const result = await pool.query(
        `
          UPDATE lectures
          SET
            title = $1,
            description = $2,
            video_url = $3,
            lecture_order = $4,
            duration = $5,
            is_free = $6,
            updated_at = NOW()
          WHERE id = $7
          RETURNING
            id,
            module_id,
            title,
            description,
            video_url,
            lecture_order,
            duration,
            is_free,
            created_at,
            updated_at
        `,
        [
          String(title).trim(),
          description
            ? String(description).trim()
            : null,
          videoUrl
            ? String(videoUrl).trim()
            : null,
          parsedLectureOrder,
          parsedDuration,
          Boolean(isFree),
          lectureId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lecture updated successfully",
        lecture: result.rows[0],
      });
    } catch (error) {
      console.error("Update lecture error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update lecture",
      });
    }
  },
);

/* =====================================================
   DELETE LECTURE
   DELETE /api/admin/lectures/:lectureId

   quizzes.lecture_id uses ON DELETE CASCADE,
   so deleting a lecture also deletes its quizzes.
===================================================== */

router.delete(
  "/lectures/:lectureId",
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

      const lectureId = Number(req.params.lectureId);

      if (!Number.isInteger(lectureId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid lecture ID",
        });
      }

      const result = await pool.query(
        `
          DELETE FROM lectures
          WHERE id = $1
          RETURNING id, module_id
        `,
        [lectureId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Lecture deleted successfully",
        lectureId: result.rows[0].id,
        moduleId: result.rows[0].module_id,
      });
    } catch (error) {
      console.error("Delete lecture error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete lecture",
      });
    }
  },
);

export default router;