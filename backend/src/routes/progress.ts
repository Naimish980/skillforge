import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

/**
 * GET COURSE PROGRESS
 * GET /progress/:courseId
 */
router.get(
  "/:courseId",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;
      const courseId = String(req.params.courseId || "").trim();

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      if (!courseId) {
        res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
        return;
      }

      const result = await pool.query(
        `
        SELECT
          module_id,
          lecture_id,
          quiz_score,
          quiz_total,
          passed,
          completed_at
        FROM lecture_progress
        WHERE user_id = $1
          AND course_id = $2
        ORDER BY created_at ASC
        `,
        [userId, courseId],
      );

      res.json({
        success: true,
        courseId,
        progress: result.rows,
      });
    } catch (error) {
      console.error("Get progress error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to load course progress",
      });
    }
  },
);

/**
 * SAVE QUIZ RESULT
 * POST /progress/quiz
 */
router.post(
  "/quiz",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const client = await pool.connect();

    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      /**
       * Normalize incoming values.
       *
       * Frontend may send:
       *   quizScore: 7
       * or
       *   quizScore: "7"
       *
       * Both are handled here.
       */
      const courseId = String(req.body?.courseId ?? "").trim();
      const moduleId = String(req.body?.moduleId ?? "").trim();
      const lectureId = String(req.body?.lectureId ?? "").trim();

      const quizScore = Number(req.body?.quizScore);
      const quizTotal = Number(req.body?.quizTotal);

      console.log("Quiz submission:", {
        userId,
        courseId,
        moduleId,
        lectureId,
        quizScore,
        quizTotal,
        body: req.body,
      });

      /**
       * Validate IDs
       */
      if (!courseId || !moduleId || !lectureId) {
        res.status(400).json({
          success: false,
          message: "Invalid quiz data",
          details: {
            courseId: !!courseId,
            moduleId: !!moduleId,
            lectureId: !!lectureId,
          },
        });
        return;
      }

      /**
       * Validate quiz numbers
       */
      if (
        !Number.isFinite(quizScore) ||
        !Number.isFinite(quizTotal) ||
        !Number.isInteger(quizScore) ||
        !Number.isInteger(quizTotal) ||
        quizTotal <= 0 ||
        quizScore < 0 ||
        quizScore > quizTotal
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid quiz data",
          details: {
            quizScore,
            quizTotal,
          },
        });
        return;
      }

      /**
       * Check course enrollment
       */
      const enrollment = await client.query(
        `
        SELECT id
        FROM enrollments
        WHERE user_id = $1
          AND course_id = $2
        LIMIT 1
        `,
        [userId, courseId],
      );

      if (enrollment.rowCount === 0) {
        res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
        return;
      }

      /**
       * Passing score = 70%
       */
      const percentage = Math.round(
        (quizScore / quizTotal) * 100,
      );

      const passed = percentage >= 70;

      /**
       * Save / update progress
       */
      await client.query(
        `
        INSERT INTO lecture_progress (
          user_id,
          course_id,
          module_id,
          lecture_id,
          quiz_score,
          quiz_total,
          passed,
          completed_at,
          updated_at
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          CASE
            WHEN $7 = TRUE THEN NOW()
            ELSE NULL
          END,
          NOW()
        )
        ON CONFLICT (user_id, course_id, lecture_id)
        DO UPDATE SET
          module_id = EXCLUDED.module_id,
          quiz_score = EXCLUDED.quiz_score,
          quiz_total = EXCLUDED.quiz_total,
          passed = EXCLUDED.passed,
          completed_at =
            CASE
              WHEN EXCLUDED.passed = TRUE
              THEN COALESCE(
                lecture_progress.completed_at,
                NOW()
              )
              ELSE lecture_progress.completed_at
            END,
          updated_at = NOW()
        `,
        [
          userId,
          courseId,
          moduleId,
          lectureId,
          quizScore,
          quizTotal,
          passed,
        ],
      );

      res.json({
        success: true,
        passed,
        quizScore,
        quizTotal,
        percentage,
        message: passed
          ? "Lecture completed successfully"
          : "Quiz not passed. Please retry.",
      });
    } catch (error) {
      console.error("Save quiz progress error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to save quiz progress",
      });
    } finally {
      client.release();
    }
  },
);

/**
 * MARK LECTURE COMPLETE
 * POST /progress/complete
 */
router.post(
  "/complete",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "Authentication required",
        });
        return;
      }

      const courseId = String(req.body?.courseId ?? "").trim();
      const moduleId = String(req.body?.moduleId ?? "").trim();
      const lectureId = String(req.body?.lectureId ?? "").trim();

      if (!courseId || !moduleId || !lectureId) {
        res.status(400).json({
          success: false,
          message: "Invalid lecture data",
        });
        return;
      }

      /**
       * Lecture can only be completed
       * after passing its quiz.
       */
      const result = await pool.query(
        `
        UPDATE lecture_progress
        SET
          completed_at = COALESCE(completed_at, NOW()),
          passed = TRUE,
          updated_at = NOW()
        WHERE user_id = $1
          AND course_id = $2
          AND module_id = $3
          AND lecture_id = $4
          AND passed = TRUE
        RETURNING
          module_id,
          lecture_id,
          quiz_score,
          quiz_total,
          passed,
          completed_at
        `,
        [
          userId,
          courseId,
          moduleId,
          lectureId,
        ],
      );

      if (result.rowCount === 0) {
        res.status(400).json({
          success: false,
          message:
            "Lecture cannot be completed before passing its quiz",
        });
        return;
      }

      res.json({
        success: true,
        message: "Lecture marked as completed",
        progress: result.rows[0],
      });
    } catch (error) {
      console.error("Complete lecture error:", error);

      res.status(500).json({
        success: false,
        message: "Failed to complete lecture",
      });
    }
  },
);

export default router;