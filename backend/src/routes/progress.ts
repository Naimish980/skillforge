import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

/*
  SkillForge Progress API

  Mounted in server.ts as:
    app.use("/api/progress", progressLimiter, progressRoutes);

  Routes:
    GET  /api/progress/:courseId
    POST /api/progress/quiz
*/

/* =====================================================
   GET COURSE PROGRESS
   GET /api/progress/:courseId
===================================================== */

router.get(
  "/:courseId",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.userId;

      const publicCourseId = String(
        req.params.courseId ?? "",
      ).trim();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      if (!publicCourseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
      }

      const courseIds = [publicCourseId];

      const numericCourseId = Number(publicCourseId);

      if (
        Number.isInteger(numericCourseId) &&
        numericCourseId > 0
      ) {
        courseIds.push(String(numericCourseId));
      }

      const result = await pool.query(
        `
        SELECT
          course_id,
          module_id,
          lecture_id,
          passed,
          completed_at
        FROM lecture_progress
        WHERE user_id = $1
          AND course_id = ANY($2::text[])
        ORDER BY completed_at ASC NULLS LAST, lecture_id ASC
        `,
        [userId, courseIds],
      );

      return res.json({
        success: true,
        progress: result.rows,
      });
    } catch (error) {
      console.error("Get course progress error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to fetch course progress",
      });
    }
  },
);

/* =====================================================
   SAVE QUIZ PROGRESS
   POST /api/progress/quiz

   Passing percentage: 70%

   Expected body:
   {
     courseId,
     moduleId,
     lectureId,
     quizScore,
     quizTotal
   }
===================================================== */

router.post(
  "/quiz",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const userId = req.userId;

      const {
        courseId,
        moduleId,
        lectureId,
        quizScore,
        quizTotal,
      } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      const normalizedCourseId = String(
        courseId ?? "",
      ).trim();

      const normalizedModuleId = String(
        moduleId ?? "",
      ).trim();

      const normalizedLectureId = String(
        lectureId ?? "",
      ).trim();

      const score = Number(quizScore);
      const total = Number(quizTotal);

      if (
        !normalizedCourseId ||
        !normalizedModuleId ||
        !normalizedLectureId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "courseId, moduleId and lectureId are required",
        });
      }

      if (
        !Number.isFinite(score) ||
        !Number.isFinite(total) ||
        total <= 0 ||
        score < 0 ||
        score > total
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid quiz score or total",
        });
      }

      const passingScore = Math.ceil(total * 0.7);
      const passed = score >= passingScore;

      const existing = await pool.query(
        `
        SELECT id
        FROM lecture_progress
        WHERE user_id = $1
          AND course_id = $2
          AND module_id = $3
          AND lecture_id = $4
        LIMIT 1
        `,
        [
          userId,
          normalizedCourseId,
          normalizedModuleId,
          normalizedLectureId,
        ],
      );

      if (existing.rows.length > 0) {
        await pool.query(
          `
          UPDATE lecture_progress
          SET
            passed = $1,
            completed_at = CASE
              WHEN $1 = TRUE THEN COALESCE(completed_at, NOW())
              ELSE completed_at
            END
          WHERE id = $2
          `,
          [passed, existing.rows[0].id],
        );
      } else {
        await pool.query(
          `
          INSERT INTO lecture_progress (
            user_id,
            course_id,
            module_id,
            lecture_id,
            passed,
            completed_at
          )
          VALUES (
            $1,
            $2,
            $3,
            $4,
            $5,
            CASE
              WHEN $5 = TRUE THEN NOW()
              ELSE NULL
            END
          )
          `,
          [
            userId,
            normalizedCourseId,
            normalizedModuleId,
            normalizedLectureId,
            passed,
          ],
        );
      }

      return res.json({
        success: true,
        passed,
        quizScore: score,
        quizTotal: total,
        passingScore,
        message: passed
          ? "Quiz passed and progress saved"
          : "Quiz failed and progress saved",
      });
    } catch (error) {
      console.error("Save quiz progress error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to save quiz progress",
      });
    }
  },
);

export default router;