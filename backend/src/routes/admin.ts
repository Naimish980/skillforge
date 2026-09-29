import { Router, Request, Response } from "express";
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
   PUBLIC COURSE CATALOG
   GET /api/admin/public-courses

   Public read-only catalog endpoint. No authentication is
   required because only course metadata is returned.
===================================================== */

router.get(
  "/public-courses",
  async (_req: Request, res: Response) => {
    try {
      const coursesResult = await pool.query(
        `
        SELECT
          c.id,
          c.title,
          c.description,
          c.category,
          c.level,
          c.price,
          c.original_price,
          c.thumbnail,
          c.is_published,
          c.overview_intro,
          c.what_you_learn,
          c.requirements,
          c.target_audience,
          c.skills_covered,
          c.overview_features,
          c.created_at,
          c.updated_at,

          (
            SELECT COUNT(*)::int
            FROM lectures l
            INNER JOIN modules m2
              ON m2.id = l.module_id
            WHERE m2.course_id = c.id
          ) AS lecture_count,

          (
            SELECT COALESCE(SUM(l2.duration), 0)::int
            FROM lectures l2
            INNER JOIN modules m3
              ON m3.id = l2.module_id
            WHERE m3.course_id = c.id
          ) AS duration_minutes,

          (
            SELECT COALESCE(
              json_agg(
                json_build_object(
                  'id', m.id,
                  'title', m.title,
                  'description', m.description,
                  'module_order', m.module_order
                )
                ORDER BY m.module_order ASC, m.id ASC
              ),
              '[]'::json
            )
            FROM modules m
            WHERE m.course_id = c.id
          ) AS modules

        FROM courses c
        WHERE c.is_published = true
        ORDER BY c.created_at DESC, c.id DESC
        `,
      );

      const knownSlugs: Record<string, string> = {
        "Linux Administration": "linux",
        "AWS Cloud Fundamentals": "aws",
        "Networking Fundamentals": "networking",
        "Windows Administration": "windows",
        "Cyber Security Essentials": "security",
        "System Administration": "sysadmin",
      };

      const slugify = (title: string, id: number) => {
        const base = title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

        if (knownSlugs[title]) {
          return knownSlugs[title];
        }

        return `${base || "course"}-${id}`;
      };

      const emojiForCourse = (title: string, category: string | null) => {
        const value = `${title} ${category ?? ""}`.toLowerCase();

        if (value.includes("linux")) return "🐧";
        if (value.includes("aws") || value.includes("cloud")) return "☁️";
        if (value.includes("network")) return "🌐";
        if (value.includes("windows")) return "🪟";
        if (value.includes("security")) return "🛡️";
        if (value.includes("system")) return "⚙️";
        return "📚";
      };

      const formatDuration = (minutes: number) => {
        if (!Number.isFinite(minutes) || minutes <= 0) {
          return "Self-paced";
        }

        if (minutes >= 60) {
          const hours = Math.floor(minutes / 60);
          const remaining = minutes % 60;
          return remaining > 0
            ? `${hours}h ${remaining}m`
            : `${hours}+ Hours`;
        }

        return `${minutes} min`;
      };

      const courses = coursesResult.rows.map((course) => ({
        id: slugify(String(course.title), Number(course.id)),
        dbId: Number(course.id),
        emoji: emojiForCourse(
          String(course.title),
          course.category ? String(course.category) : null,
        ),
        title: String(course.title),
        description: course.description
          ? String(course.description)
          : "Practical, structured learning from SkillForge.",
        lessons: Number(course.lecture_count) || 0,
        duration: formatDuration(Number(course.duration_minutes) || 0),
        category: course.category
          ? String(course.category)
          : "IT & Tech",
        level: course.level
          ? String(course.level)
          : "Beginner",
        price: Number(course.price) || 0,
        originalPrice: course.original_price == null ? null : Number(course.original_price),
        thumbnail: course.thumbnail
          ? String(course.thumbnail)
          : null,
        isPublished: Boolean(course.is_published),
        overviewIntro: course.overview_intro
          ? String(course.overview_intro)
          : "",
        whatYouLearn: Array.isArray(course.what_you_learn)
          ? course.what_you_learn.map((item: unknown) => String(item))
          : [],
        requirements: Array.isArray(course.requirements)
          ? course.requirements.map((item: unknown) => String(item))
          : [],
        targetAudience: course.target_audience
          ? String(course.target_audience)
          : "",
        skillsCovered: Array.isArray(course.skills_covered)
          ? course.skills_covered.map((item: unknown) => String(item))
          : [],
        overviewFeatures: Array.isArray(course.overview_features)
          ? course.overview_features
          : [],
        modules: Array.isArray(course.modules)
          ? course.modules.map((module: {
              id: number;
              title: string;
              description: string | null;
              module_order: number;
            }) => String(module.title))
          : [],
      }));

      return res.status(200).json({
        success: true,
        courses,
      });
    } catch (error) {
      console.error("Public course catalog error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load course catalog",
      });
    }
  },
);

/* =====================================================
   PUBLIC COURSE CONTENT
   GET /api/admin/public-courses/:courseId/content

   Public read-only content endpoint used by the student
   course player. No authentication is required.
===================================================== */

router.get(
  "/public-courses/:courseId/content",
  async (req: Request, res: Response) => {
    try {
      const courseId = Number(req.params.courseId);

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
          original_price,
          thumbnail,
          is_published,
          overview_intro,
          what_you_learn,
          requirements,
          target_audience
        FROM courses
        WHERE id = $1
          AND is_published = true
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
          m.id,
          m.title,
          m.description,
          m.module_order
        FROM modules m
        WHERE m.course_id = $1
        ORDER BY m.module_order ASC, m.id ASC
        `,
        [courseId],
      );

      const lecturesResult = await pool.query(
        `
        SELECT
          l.id,
          l.module_id,
          l.title,
          l.description,
          l.video_url,
          l.lecture_order,
          l.duration,
          l.is_free
        FROM lectures l
        INNER JOIN modules m
          ON m.id = l.module_id
        WHERE m.course_id = $1
        ORDER BY
          m.module_order ASC,
          m.id ASC,
          l.lecture_order ASC,
          l.id ASC
        `,
        [courseId],
      );

      const quizzesResult = await pool.query(
        `
        SELECT
          q.id,
          q.lecture_id,
          q.question,
          q.options,
          q.correct_answer
        FROM quizzes q
        INNER JOIN lectures l
          ON l.id = q.lecture_id
        INNER JOIN modules m
          ON m.id = l.module_id
        WHERE m.course_id = $1
        ORDER BY q.id ASC
        `,
        [courseId],
      );

      const quizzesByLecture = new Map<number, Array<{
        id: number;
        question: string;
        options: unknown;
        correct_answer: string;
      }>>();

      for (const quiz of quizzesResult.rows) {
        const lectureId = Number(quiz.lecture_id);
        const existing = quizzesByLecture.get(lectureId) ?? [];

        existing.push({
          id: Number(quiz.id),
          question: String(quiz.question),
          options: quiz.options,
          correct_answer: String(quiz.correct_answer),
        });

        quizzesByLecture.set(lectureId, existing);
      }

      const lecturesByModule = new Map<number, Array<{
        id: number;
        title: string;
        description: string | null;
        videoUrl: string;
        lectureOrder: number;
        duration: number;
        isFree: boolean;
        questions: Array<{
          id: number;
          question: string;
          options: unknown;
          correct_answer: string;
        }>;
      }>>();

      for (const lecture of lecturesResult.rows) {
        const moduleId = Number(lecture.module_id);
        const existing = lecturesByModule.get(moduleId) ?? [];

        existing.push({
          id: Number(lecture.id),
          title: String(lecture.title),
          description: lecture.description
            ? String(lecture.description)
            : null,
          videoUrl: lecture.video_url
            ? String(lecture.video_url)
            : "",
          lectureOrder: Number(lecture.lecture_order) || 1,
          duration: Number(lecture.duration) || 0,
          isFree: Boolean(lecture.is_free),
          questions: quizzesByLecture.get(Number(lecture.id)) ?? [],
        });

        lecturesByModule.set(moduleId, existing);
      }

      const modules = modulesResult.rows.map((module) => ({
        id: Number(module.id),
        title: String(module.title),
        description: module.description
          ? String(module.description)
          : null,
        moduleOrder: Number(module.module_order) || 1,
        lectures: lecturesByModule.get(Number(module.id)) ?? [],
      }));

      return res.status(200).json({
        success: true,
        course: {
          id: Number(courseResult.rows[0].id),
          title: String(courseResult.rows[0].title),
          description: courseResult.rows[0].description
            ? String(courseResult.rows[0].description)
            : null,
          category: courseResult.rows[0].category
            ? String(courseResult.rows[0].category)
            : null,
          level: courseResult.rows[0].level
            ? String(courseResult.rows[0].level)
            : null,
          price: Number(courseResult.rows[0].price) || 0,
          originalPrice:
            courseResult.rows[0].original_price == null
              ? null
              : Number(courseResult.rows[0].original_price),
          thumbnail: courseResult.rows[0].thumbnail
            ? String(courseResult.rows[0].thumbnail)
            : null,
          isPublished: Boolean(courseResult.rows[0].is_published),
          overviewIntro: courseResult.rows[0].overview_intro
            ? String(courseResult.rows[0].overview_intro)
            : "",
          whatYouLearn: Array.isArray(courseResult.rows[0].what_you_learn)
            ? courseResult.rows[0].what_you_learn.map((item: unknown) => String(item))
            : [],
          requirements: Array.isArray(courseResult.rows[0].requirements)
            ? courseResult.rows[0].requirements.map((item: unknown) => String(item))
            : [],
          targetAudience: courseResult.rows[0].target_audience
            ? String(courseResult.rows[0].target_audience)
            : "",
          skillsCovered: Array.isArray(courseResult.rows[0].skills_covered)
            ? courseResult.rows[0].skills_covered.map((item: unknown) => String(item))
            : [],
          overviewFeatures: Array.isArray(courseResult.rows[0].overview_features)
            ? courseResult.rows[0].overview_features
            : [],
        },
        modules,
      });
    } catch (error) {
      console.error("Public course content error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load course content",
      });
    }
  },
);

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
          c.original_price,
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
          c.original_price,
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
        originalPrice,
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
      const parsedOriginalPrice =
        originalPrice === undefined ||
        originalPrice === null ||
        String(originalPrice).trim() === ""
          ? null
          : Number(originalPrice);

      if (
        !Number.isFinite(parsedPrice) ||
        parsedPrice < 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid offer price is required",
        });
      }

      if (
        parsedOriginalPrice !== null &&
        (!Number.isFinite(parsedOriginalPrice) ||
          parsedOriginalPrice < parsedPrice)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Actual price must be greater than or equal to offer price",
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
          original_price,
          thumbnail,
          is_published
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING
          id,
          title,
          description,
          category,
          level,
          price,
          original_price,
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
          parsedOriginalPrice,

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
   UPDATE COURSE
   PUT /api/admin/courses/:courseId
===================================================== */

router.put(
  "/courses/:courseId",
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

      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const existingResult = await pool.query(
        `
        SELECT
          id,
          title,
          description,
          category,
          level,
          price,
          original_price,
          thumbnail,
          is_published
        FROM courses
        WHERE id = $1
        LIMIT 1
        `,
        [courseId],
      );

      if (existingResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const existing = existingResult.rows[0];
      const {
        title,
        description,
        category,
        level,
        price,
        originalPrice,
        thumbnail,
        isPublished,
      } = req.body;

      const finalTitle =
        title === undefined
          ? String(existing.title)
          : String(title).trim();

      if (!finalTitle) {
        return res.status(400).json({
          success: false,
          message: "Course title is required",
        });
      }

      const finalPrice =
        price === undefined
          ? Number(existing.price)
          : Number(price);

      if (!Number.isFinite(finalPrice) || finalPrice < 0) {
        return res.status(400).json({
          success: false,
          message: "Valid offer price is required",
        });
      }

      const finalOriginalPrice =
        originalPrice === undefined
          ? existing.original_price === null ||
            existing.original_price === undefined
            ? null
            : Number(existing.original_price)
          : originalPrice === null ||
            String(originalPrice).trim() === ""
            ? null
            : Number(originalPrice);

      if (
        finalOriginalPrice !== null &&
        (!Number.isFinite(finalOriginalPrice) ||
          finalOriginalPrice < finalPrice)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Actual price must be greater than or equal to offer price",
        });
      }

      const result = await pool.query(
        `
        UPDATE courses
        SET
          title = $1,
          description = $2,
          category = $3,
          level = $4,
          price = $5,
          original_price = $6,
          thumbnail = $7,
          is_published = $8,
          updated_at = NOW()
        WHERE id = $9
        RETURNING
          id,
          title,
          description,
          category,
          level,
          price,
          original_price,
          thumbnail,
          is_published,
          created_at,
          updated_at
        `,
        [
          finalTitle,
          description === undefined
            ? existing.description
            : description
              ? String(description).trim()
              : null,
          category === undefined
            ? existing.category
            : category
              ? String(category).trim()
              : null,
          level === undefined
            ? existing.level
            : level
              ? String(level).trim()
              : null,
          finalPrice,
          finalOriginalPrice,
          thumbnail === undefined
            ? existing.thumbnail
            : thumbnail
              ? String(thumbnail).trim()
              : null,
          isPublished === undefined
            ? Boolean(existing.is_published)
            : Boolean(isPublished),
          courseId,
        ],
      );

      return res.status(200).json({
        success: true,
        message: "Course updated successfully",
        course: result.rows[0],
      });
    } catch (error) {
      console.error("Update admin course error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update course",
      });
    }
  },
);

/* =====================================================
   TOGGLE COURSE PUBLISH STATUS
   PATCH /api/admin/courses/:courseId/publish
===================================================== */

router.patch(
  "/courses/:courseId/publish",
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

      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const { isPublished } = req.body;

      if (typeof isPublished !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "isPublished must be true or false",
        });
      }

      const result = await pool.query(
        `
        UPDATE courses
        SET
          is_published = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING
          id,
          title,
          is_published,
          updated_at
        `,
        [isPublished, courseId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: isPublished
          ? "Course published successfully"
          : "Course unpublished successfully",
        course: result.rows[0],
      });
    } catch (error) {
      console.error("Publish course error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to change course publish status",
      });
    }
  },
);

/* =====================================================
   DELETE COURSE
   DELETE /api/admin/courses/:courseId

   Existing enrollments/payments are preserved. A course with
   enrollments cannot be deleted accidentally.
===================================================== */

router.delete(
  "/courses/:courseId",
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

      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const enrollmentResult = await pool.query(
        `
        SELECT COUNT(*)::int AS total
        FROM enrollments
        WHERE course_id = $1
        `,
        [courseId],
      );

      if (Number(enrollmentResult.rows[0].total) > 0) {
        return res.status(409).json({
          success: false,
          message:
            "This course has enrollments and cannot be deleted. Unpublish it instead.",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM courses
        WHERE id = $1
        RETURNING id, title
        `,
        [courseId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Course deleted successfully",
        courseId: result.rows[0].id,
        title: result.rows[0].title,
      });
    } catch (error) {
      console.error("Delete admin course error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete course",
      });
    }
  },
);

/* =====================================================
   GET LECTURE QUIZZES
   GET /api/admin/lectures/:lectureId/quizzes
===================================================== */

router.get(
  "/lectures/:lectureId/quizzes",
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

      const lectureResult = await pool.query(
        `
        SELECT id, module_id, title
        FROM lectures
        WHERE id = $1
        LIMIT 1
        `,
        [lectureId],
      );

      if (lectureResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          lecture_id,
          question,
          options,
          correct_answer,
          created_at
        FROM quizzes
        WHERE lecture_id = $1
        ORDER BY id ASC
        `,
        [lectureId],
      );

      return res.status(200).json({
        success: true,
        lecture: lectureResult.rows[0],
        quizzes: result.rows,
      });
    } catch (error) {
      console.error("Get lecture quizzes error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load quizzes",
      });
    }
  },
);

/* =====================================================
   CREATE QUIZ
   POST /api/admin/lectures/:lectureId/quizzes

   Body:
   {
     question: string,
     options: string[],
     correctAnswer: string
   }
===================================================== */

router.post(
  "/lectures/:lectureId/quizzes",
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

      const { question, options, correctAnswer } = req.body;

      if (!question || String(question).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Quiz question is required",
        });
      }

      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least two quiz options are required",
        });
      }

      const cleanOptions = options
        .map((option: unknown) => String(option).trim())
        .filter((option: string) => option.length > 0);

      if (cleanOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least two non-empty quiz options are required",
        });
      }

      const cleanCorrectAnswer = String(correctAnswer ?? "").trim();

      if (!cleanCorrectAnswer || !cleanOptions.includes(cleanCorrectAnswer)) {
        return res.status(400).json({
          success: false,
          message: "Correct answer must match one of the quiz options",
        });
      }

      const lectureResult = await pool.query(
        `
        SELECT id
        FROM lectures
        WHERE id = $1
        LIMIT 1
        `,
        [lectureId],
      );

      if (lectureResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Lecture not found",
        });
      }

      const result = await pool.query(
        `
        INSERT INTO quizzes
        (
          lecture_id,
          question,
          options,
          correct_answer
        )
        VALUES ($1, $2, $3::jsonb, $4)
        RETURNING
          id,
          lecture_id,
          question,
          options,
          correct_answer,
          created_at
        `,
        [
          lectureId,
          String(question).trim(),
          JSON.stringify(cleanOptions),
          cleanCorrectAnswer,
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Quiz created successfully",
        quiz: result.rows[0],
      });
    } catch (error) {
      console.error("Create quiz error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create quiz",
      });
    }
  },
);

/* =====================================================
   UPDATE QUIZ
   PUT /api/admin/quizzes/:quizId
===================================================== */

router.put(
  "/quizzes/:quizId",
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

      const quizId = Number(req.params.quizId);

      if (!Number.isInteger(quizId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid quiz ID",
        });
      }

      const { question, options, correctAnswer } = req.body;

      if (!question || String(question).trim() === "") {
        return res.status(400).json({
          success: false,
          message: "Quiz question is required",
        });
      }

      if (!Array.isArray(options) || options.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least two quiz options are required",
        });
      }

      const cleanOptions = options
        .map((option: unknown) => String(option).trim())
        .filter((option: string) => option.length > 0);

      if (cleanOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: "At least two non-empty quiz options are required",
        });
      }

      const cleanCorrectAnswer = String(correctAnswer ?? "").trim();

      if (!cleanCorrectAnswer || !cleanOptions.includes(cleanCorrectAnswer)) {
        return res.status(400).json({
          success: false,
          message: "Correct answer must match one of the quiz options",
        });
      }

      const result = await pool.query(
        `
        UPDATE quizzes
        SET
          question = $1,
          options = $2::jsonb,
          correct_answer = $3
        WHERE id = $4
        RETURNING
          id,
          lecture_id,
          question,
          options,
          correct_answer,
          created_at
        `,
        [
          String(question).trim(),
          JSON.stringify(cleanOptions),
          cleanCorrectAnswer,
          quizId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quiz updated successfully",
        quiz: result.rows[0],
      });
    } catch (error) {
      console.error("Update quiz error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update quiz",
      });
    }
  },
);

/* =====================================================
   DELETE QUIZ
   DELETE /api/admin/quizzes/:quizId
===================================================== */

router.delete(
  "/quizzes/:quizId",
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

      const quizId = Number(req.params.quizId);

      if (!Number.isInteger(quizId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid quiz ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM quizzes
        WHERE id = $1
        RETURNING id, lecture_id
        `,
        [quizId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Quiz not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Quiz deleted successfully",
        quizId: result.rows[0].id,
        lectureId: result.rows[0].lecture_id,
      });
    } catch (error) {
      console.error("Delete quiz error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete quiz",
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
          original_price,
          thumbnail,
          is_published,
          overview_intro,
          what_you_learn,
          requirements,
          target_audience,
          skills_covered,
          overview_features,
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
   COURSE OVERVIEW
   GET /api/admin/courses/:courseId/overview
   PUT /api/admin/courses/:courseId/overview
===================================================== */

router.get(
  "/courses/:courseId/overview",
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

      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const result = await pool.query(
        `
        SELECT
          id,
          title,
          description,
          category,
          level,
          price,
          original_price,
          thumbnail,
          is_published,
          overview_intro,
          what_you_learn,
          requirements,
          target_audience
        FROM courses
        WHERE id = $1
        LIMIT 1
        `,
        [courseId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const course = result.rows[0];

      return res.status(200).json({
        success: true,
        course: {
          courseId: Number(course.id),
          title: String(course.title),
          description: course.description
            ? String(course.description)
            : "",
          category: course.category
            ? String(course.category)
            : "",
          level: course.level
            ? String(course.level)
            : "",
          price: Number(course.price) || 0,
          originalPrice:
            course.original_price == null
              ? null
              : Number(course.original_price),
          thumbnail: course.thumbnail
            ? String(course.thumbnail)
            : null,
          isPublished: Boolean(course.is_published),
          overviewIntro: course.overview_intro
            ? String(course.overview_intro)
            : "",
          whatYouLearn: Array.isArray(course.what_you_learn)
            ? course.what_you_learn.map((item: unknown) => String(item))
            : [],
          requirements: Array.isArray(course.requirements)
            ? course.requirements.map((item: unknown) => String(item))
            : [],
          targetAudience: course.target_audience
            ? String(course.target_audience)
            : "",
          skillsCovered: Array.isArray(course.skills_covered)
            ? course.skills_covered.map((item: unknown) => String(item))
            : [],
          overviewFeatures: Array.isArray(course.overview_features)
            ? course.overview_features
            : [],
        },
      });
    } catch (error) {
      console.error("Get course overview error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load course overview",
      });
    }
  },
);

router.put(
  "/courses/:courseId/overview",
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

      const courseId = Number(req.params.courseId);

      if (!Number.isInteger(courseId) || courseId <= 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid course ID",
        });
      }

      const {
        overviewIntro,
        whatYouLearn,
        requirements,
        targetAudience,
        skillsCovered,
        overviewFeatures,
      } = req.body ?? {};

      const cleanOverviewIntro =
        typeof overviewIntro === "string"
          ? overviewIntro.trim()
          : "";

      const cleanWhatYouLearn = Array.isArray(whatYouLearn)
        ? whatYouLearn
            .filter(
              (item: unknown): item is string =>
                typeof item === "string",
            )
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [];

      const cleanRequirements = Array.isArray(requirements)
        ? requirements
            .filter(
              (item: unknown): item is string =>
                typeof item === "string",
            )
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [];

      const cleanTargetAudience =
        typeof targetAudience === "string"
          ? targetAudience.trim()
          : "";

      const cleanSkillsCovered = Array.isArray(skillsCovered)
        ? skillsCovered
            .filter((item: unknown): item is string => typeof item === "string")
            .map((item: string) => item.trim())
            .filter(Boolean)
        : [];

      const cleanOverviewFeatures = Array.isArray(overviewFeatures)
        ? overviewFeatures
            .filter((item: unknown) => item && typeof item === "object")
            .map((item: any) => ({
              icon: typeof item.icon === "string" && item.icon.trim() ? item.icon.trim() : "BookOpen",
              title: typeof item.title === "string" ? item.title.trim() : "",
              description: typeof item.description === "string" ? item.description.trim() : "",
            }))
            .filter((item: { title: string; description: string }) => item.title && item.description)
        : [];

      const result = await pool.query(
        `
        UPDATE courses
        SET
          overview_intro = $1,
          what_you_learn = $2,
          requirements = $3,
          target_audience = $4,
          skills_covered = $5,
          overview_features = $6,
          updated_at = NOW()
        WHERE id = $7
        RETURNING
          id,
          title,
          description,
          category,
          level,
          price,
          original_price,
          thumbnail,
          is_published,
          overview_intro,
          what_you_learn,
          requirements,
          target_audience
        `,
        [
          cleanOverviewIntro,
          cleanWhatYouLearn,
          cleanRequirements,
          cleanTargetAudience,
          cleanSkillsCovered,
          JSON.stringify(cleanOverviewFeatures),
          courseId,
        ],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const course = result.rows[0];

      return res.status(200).json({
        success: true,
        message: "Course overview saved successfully",
        course: {
          courseId: Number(course.id),
          title: String(course.title),
          description: course.description
            ? String(course.description)
            : "",
          category: course.category
            ? String(course.category)
            : "",
          level: course.level
            ? String(course.level)
            : "",
          price: Number(course.price) || 0,
          originalPrice:
            course.original_price == null
              ? null
              : Number(course.original_price),
          thumbnail: course.thumbnail
            ? String(course.thumbnail)
            : null,
          isPublished: Boolean(course.is_published),
          overviewIntro: course.overview_intro
            ? String(course.overview_intro)
            : "",
          whatYouLearn: Array.isArray(course.what_you_learn)
            ? course.what_you_learn.map((item: unknown) => String(item))
            : [],
          requirements: Array.isArray(course.requirements)
            ? course.requirements.map((item: unknown) => String(item))
            : [],
          targetAudience: course.target_audience
            ? String(course.target_audience)
            : "",
          skillsCovered: Array.isArray(course.skills_covered)
            ? course.skills_covered.map((item: unknown) => String(item))
            : [],
          overviewFeatures: Array.isArray(course.overview_features)
            ? course.overview_features
            : [],
        },
      });
    } catch (error) {
      console.error("Save course overview error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save course overview",
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

      const courseResult = await pool.query(
        `
          SELECT m.course_id
          FROM modules m
          WHERE m.id = $1
          LIMIT 1
        `,
        [moduleId],
      );

      const courseId = Number(courseResult.rows[0].course_id);

      const existingCourseLecturesResult = await pool.query(
        `
          SELECT l.id
          FROM lectures l
          INNER JOIN modules m ON m.id = l.module_id
          WHERE m.course_id = $1
          ORDER BY m.module_order ASC, m.id ASC, l.lecture_order ASC, l.id ASC
          LIMIT 1
        `,
        [courseId],
      );

      const isFirstCourseLecture = existingCourseLecturesResult.rows.length === 0;
      const finalIsFree = isFirstCourseLecture ? true : Boolean(isFree);

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
          finalIsFree,
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

      const moduleCourseResult = await pool.query(
        `
        SELECT m.course_id
        FROM modules m
        INNER JOIN lectures l ON l.module_id = m.id
        WHERE l.id = $1
        LIMIT 1
        `,
        [lectureId],
      );

      if (moduleCourseResult.rows.length > 0) {
        const courseId = Number(moduleCourseResult.rows[0].course_id);

        const firstLectureResult = await pool.query(
          `
          SELECT l.id
          FROM lectures l
          INNER JOIN modules m ON m.id = l.module_id
          WHERE m.course_id = $1
          ORDER BY m.module_order ASC, m.id ASC, l.lecture_order ASC, l.id ASC
          LIMIT 1
          `,
          [courseId],
        );

        if (
          firstLectureResult.rows.length > 0 &&
          Number(firstLectureResult.rows[0].id) === lectureId
        ) {
          await pool.query(
            `UPDATE lectures SET is_free = true, updated_at = NOW() WHERE id = $1`,
            [lectureId],
          );
          result.rows[0].is_free = true;
        }
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