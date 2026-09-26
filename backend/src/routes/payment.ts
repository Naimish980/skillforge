import { Router, Response } from "express";
import Razorpay from "razorpay";
import crypto from "crypto";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

if (!keyId || !keySecret) {
  throw new Error("Razorpay credentials are not configured in .env");
}

const razorpay = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

/* =====================================================
   CREATE PAYMENT ORDER
   POST /api/payment/create-order
===================================================== */

router.post(
  "/create-order",
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

      const { type, courseId, courseIds } = req.body;

      let amount = 0;
      let receipt = "";
      let normalizedCourseIds: string[] = [];

      /* =================================================
         INDIVIDUAL COURSE
      ================================================= */

      if (type === "course") {
        if (
          courseId === undefined ||
          courseId === null ||
          String(courseId).trim() === ""
        ) {
          return res.status(400).json({
            success: false,
            message: "Course ID is required",
          });
        }

        const normalizedCourseId = String(courseId).trim();

        normalizedCourseIds = [normalizedCourseId];

        /* ---------------------------------------------
           Check existing enrollment
        --------------------------------------------- */

        const existingEnrollment = await pool.query(
          `
          SELECT id
          FROM enrollments
          WHERE user_id = $1
            AND course_id = $2
          LIMIT 1
          `,
          [userId, normalizedCourseId],
        );

        if (existingEnrollment.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "You are already enrolled in this course",
          });
        }

        amount = 79900;
        receipt = `course_${normalizedCourseId}_${Date.now()}`;
      }

      /* =================================================
         TWO COURSE COMBO
      ================================================= */

      else if (type === "combo") {
        if (
          !Array.isArray(courseIds) ||
          courseIds.length !== 2
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Exactly 2 course IDs are required for the combo",
          });
        }

        normalizedCourseIds = courseIds.map((id) =>
          String(id).trim(),
        );

        if (
          normalizedCourseIds.some(
            (id) => id.length === 0,
          )
        ) {
          return res.status(400).json({
            success: false,
            message: "Invalid course IDs",
          });
        }

        const uniqueCourseIds = [
          ...new Set(normalizedCourseIds),
        ];

        if (uniqueCourseIds.length !== 2) {
          return res.status(400).json({
            success: false,
            message:
              "Combo must contain 2 different courses",
          });
        }

        normalizedCourseIds = uniqueCourseIds;

        /* ---------------------------------------------
           Check existing enrollments
        --------------------------------------------- */

        const existingEnrollment =
          await pool.query(
            `
            SELECT course_id
            FROM enrollments
            WHERE user_id = $1
              AND course_id = ANY($2::text[])
            `,
            [userId, normalizedCourseIds],
          );

        if (existingEnrollment.rows.length > 0) {
          const alreadyEnrolled =
            existingEnrollment.rows.map(
              (row) => row.course_id,
            );

          return res.status(409).json({
            success: false,
            message:
              "You are already enrolled in one or more selected courses",
            alreadyEnrolled,
          });
        }

        amount = 149900;
        receipt = `combo_${Date.now()}`;
      }

      /* =================================================
         INVALID PAYMENT TYPE
      ================================================= */

      else {
        return res.status(400).json({
          success: false,
          message: "Invalid payment type",
        });
      }

      /* =================================================
         CREATE RAZORPAY ORDER
      ================================================= */

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt,
        notes: {
          userId: String(userId),
          type,
          courseId:
            type === "course"
              ? normalizedCourseIds[0]
              : "",
          courseIds:
            type === "combo"
              ? normalizedCourseIds.join(",")
              : "",
        },
      });

      /* =================================================
         SAVE PAYMENT ORDER
      ================================================= */

      const paymentOrderResult = await pool.query(
        `
        INSERT INTO payment_orders (
          user_id,
          razorpay_order_id,
          amount,
          currency,
          payment_type,
          course_id,
          course_ids,
          status
        )
        VALUES (
          $1,
          $2,
          $3,
          $4,
          $5,
          $6,
          $7,
          'created'
        )
        RETURNING
          id,
          razorpay_order_id,
          amount,
          currency,
          payment_type,
          course_id,
          course_ids,
          status,
          created_at
        `,
        [
          userId,
          order.id,
          amount,
          "INR",
          type,
          type === "course"
            ? normalizedCourseIds[0]
            : null,
          normalizedCourseIds,
        ],
      );

      const paymentOrder =
        paymentOrderResult.rows[0];

      return res.status(200).json({
        success: true,
        message: "Payment order created successfully",
        order: {
          id: order.id,
          amount: order.amount,
          currency: order.currency,
        },
        paymentOrderId: paymentOrder.id,
        keyId,
      });
    } catch (error) {
      console.error(
        "Create Razorpay order error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to create payment order",
      });
    }
  },
);

/* =====================================================
   VERIFY PAYMENT
   POST /api/payment/verify
===================================================== */

router.post(
  "/verify",
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

      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      } = req.body;

      /* =================================================
         REQUIRED FIELDS
      ================================================= */

      if (
        !razorpay_order_id ||
        !razorpay_payment_id ||
        !razorpay_signature
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Razorpay payment details are required",
        });
      }

      /* =================================================
         FIND PAYMENT ORDER
      ================================================= */

      const paymentOrderResult =
        await pool.query(
          `
          SELECT
            id,
            user_id,
            razorpay_order_id,
            amount,
            currency,
            payment_type,
            course_id,
            course_ids,
            status
          FROM payment_orders
          WHERE razorpay_order_id = $1
            AND user_id = $2
          LIMIT 1
          `,
          [
            String(razorpay_order_id),
            userId,
          ],
        );

      if (paymentOrderResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message:
            "Payment order not found",
        });
      }

      const paymentOrder =
        paymentOrderResult.rows[0];

      /* =================================================
         PREVENT REPROCESSING
      ================================================= */

      if (paymentOrder.status === "paid") {
        return res.status(200).json({
          success: true,
          message: "Payment was already verified",
        });
      }

      /* =================================================
         VERIFY RAZORPAY SIGNATURE
      ================================================= */

      const generatedSignature =
        crypto
          .createHmac(
            "sha256",
            keySecret,
          )
          .update(
            `${razorpay_order_id}|${razorpay_payment_id}`,
          )
          .digest("hex");

      const expectedBuffer =
        Buffer.from(
          generatedSignature,
          "utf8",
        );

      const receivedBuffer =
        Buffer.from(
          String(razorpay_signature),
          "utf8",
        );

      if (
        expectedBuffer.length !==
          receivedBuffer.length ||
        !crypto.timingSafeEqual(
          expectedBuffer,
          receivedBuffer,
        )
      ) {
        await pool.query(
          `
          UPDATE payment_orders
          SET status = 'failed'
          WHERE id = $1
          `,
          [paymentOrder.id],
        );

        return res.status(400).json({
          success: false,
          message:
            "Payment signature verification failed",
        });
      }

      /* =================================================
         DATABASE TRANSACTION
      ================================================= */

      const client =
        await pool.connect();

      try {
        await client.query("BEGIN");

        /* ---------------------------------------------
           Mark payment as paid
        --------------------------------------------- */

        await client.query(
          `
          UPDATE payment_orders
          SET
            status = 'paid',
            razorpay_payment_id = $1,
            razorpay_signature = $2,
            paid_at = NOW()
          WHERE id = $3
          `,
          [
            String(razorpay_payment_id),
            String(razorpay_signature),
            paymentOrder.id,
          ],
        );

        /* ---------------------------------------------
           Prepare courses for enrollment
        --------------------------------------------- */

        let enrollmentCourseIds: string[] = [];

        if (
          paymentOrder.payment_type ===
            "course" &&
          paymentOrder.course_id
        ) {
          enrollmentCourseIds = [
            String(paymentOrder.course_id),
          ];
        }

        if (
          paymentOrder.payment_type ===
            "combo" &&
          Array.isArray(paymentOrder.course_ids)
        ) {
          enrollmentCourseIds =
            paymentOrder.course_ids.map(
              (id: string) => String(id),
            );
        }

        /* ---------------------------------------------
           Create enrollments
        --------------------------------------------- */

        for (const courseId of enrollmentCourseIds) {
          await client.query(
            `
            INSERT INTO enrollments (
              user_id,
              course_id,
              payment_order_id
            )
            VALUES ($1, $2, $3)
            ON CONFLICT (
              user_id,
              course_id
            )
            DO NOTHING
            `,
            [
              userId,
              courseId,
              paymentOrder.id,
            ],
          );
        }

        await client.query("COMMIT");

        return res.status(200).json({
          success: true,
          message:
            "Payment verified and course unlocked successfully",
          payment: {
            orderId:
              razorpay_order_id,
            paymentId:
              razorpay_payment_id,
            status: "paid",
          },
          enrolledCourseIds:
            enrollmentCourseIds,
        });
      } catch (transactionError) {
        await client.query("ROLLBACK");

        throw transactionError;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error(
        "Payment verification error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to verify payment",
      });
    }
  },
);

export default router;