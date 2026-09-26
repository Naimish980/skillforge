import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

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

      const {
        courseId,
        moduleId,
        lectureId,
        quizScore,
        quizTotal,
      } = req.body;

      if (
        typeof courseId !== "string" ||
        typeof moduleId !== "string" ||
        typeof lectureId !== "string" ||
        !Number.isInteger(quizScore) ||
        !Number.isInteger(quizTotal) ||
        quizTotal <= 0 ||
        quizScore < 0 ||
        quizScore > quizTotal
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid quiz data",
        });
        return;
      }

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

      const passed = (quizScore / quizTotal) * 100 >= 70;

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
          CASE WHEN $7 = TRUE THEN NOW() ELSE NULL END,
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
        percentage: Math.round((quizScore / quizTotal) * 100),
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

      const {
        courseId,
        moduleId,
        lectureId,
      } = req.body;

      if (
        typeof courseId !== "string" ||
        typeof moduleId !== "string" ||
        typeof lectureId !== "string"
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid lecture data",
        });
        return;
      }

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
          message: "Lecture cannot be completed before passing its quiz",
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
