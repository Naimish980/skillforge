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

/*
  Student-facing course IDs intentionally remain stable slugs.

  Existing courses:
    Linux Administration      -> linux
    AWS Cloud Fundamentals    -> aws
    Networking Fundamentals   -> networking
    Windows Administration    -> windows
    Cyber Security Essentials -> security
    System Administration     -> sysadmin

  New courses use the public catalog format:
    <slugified-title>-<database-id>
*/

const knownSlugs: Record<string, string> = {
  "Linux Administration": "linux",
  "AWS Cloud Fundamentals": "aws",
  "Networking Fundamentals": "networking",
  "Windows Administration": "windows",
  "Cyber Security Essentials": "security",
  "System Administration": "sysadmin",
};

const slugify = (title: string, id: number) => {
  const known = knownSlugs[title];

  if (known) {
    return known;
  }

  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return `${base || "course"}-${id}`;
};

async function getCourseByPublicId(publicCourseId: string) {
  const normalizedId = String(publicCourseId).trim();

  const knownTitle = Object.entries(knownSlugs).find(
    ([, slug]) => slug === normalizedId,
  )?.[0];

  if (knownTitle) {
    const result = await pool.query(
      `
      SELECT
        id,
        title,
        price,
        is_published
      FROM courses
      WHERE title = $1
      ORDER BY id DESC
      LIMIT 1
      `,
      [knownTitle],
    );

    return result.rows[0] ?? null;
  }

  const match = normalizedId.match(/^(.*)-(\d+)$/);

  if (!match) {
    return null;
  }

  const dbId = Number(match[2]);

  if (!Number.isInteger(dbId) || dbId <= 0) {
    return null;
  }

  const result = await pool.query(
    `
    SELECT
      id,
      title,
      price,
      is_published
    FROM courses
    WHERE id = $1
    LIMIT 1
    `,
    [dbId],
  );

  const course = result.rows[0];

  if (!course) {
    return null;
  }

  const expectedPublicId = slugify(
    String(course.title),
    Number(course.id),
  );

  if (expectedPublicId !== normalizedId) {
    return null;
  }

  return course;
};

/* =====================================================
   GET USER ENROLLMENTS
   GET /api/payment/enrollments
===================================================== */

router.get(
  "/enrollments",
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

      const result = await pool.query(
        `
        SELECT course_id
        FROM enrollments
        WHERE user_id = $1
        ORDER BY created_at ASC
        `,
        [userId],
      );

      const enrolledCourseIds = result.rows.map(
        (row) => String(row.course_id),
      );

      return res.status(200).json({
        success: true,
        enrolledCourseIds,
      });
    } catch (error) {
      console.error(
        "Get user enrollments error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load course enrollments",
      });
    }
  },
);

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

      const { type, courseId, offerId, courseIds } = req.body;

      let amount = 0;
      let receipt = "";
      let normalizedCourseIds: string[] = [];
      let paymentType = "";
      let selectedOfferId: number | null = null;

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

        const course = await getCourseByPublicId(normalizedCourseId);

        if (!course) {
          return res.status(404).json({
            success: false,
            message: "Course not found",
          });
        }

        if (!course.is_published) {
          return res.status(400).json({
            success: false,
            message: "This course is not currently available for purchase",
          });
        }

        const coursePrice = Number(course.price);

        if (
          !Number.isFinite(coursePrice) ||
          coursePrice < 0 ||
          !Number.isInteger(coursePrice)
        ) {
          return res.status(500).json({
            success: false,
            message: "Invalid course price configured by SkillForge admin",
          });
        }

        if (coursePrice === 0) {
          return res.status(400).json({
            success: false,
            message: "This course is free and does not require payment",
          });
        }

        amount = coursePrice * 100;
        receipt = `course_${normalizedCourseId}_${Date.now()}`;
        paymentType = "course";
      }

      /* =================================================
         MIX & MATCH OFFER
         Admin controls the price in offers.price.
         Frontend never sends the amount.
      ================================================= */
      else if (type === "offer") {
        const numericOfferId = Number(offerId);

        if (!Number.isInteger(numericOfferId) || numericOfferId <= 0) {
          return res.status(400).json({
            success: false,
            message: "Offer ID is required",
          });
        }

        if (!Array.isArray(courseIds)) {
          return res.status(400).json({
            success: false,
            message: "Selected course IDs are required",
          });
        }

        normalizedCourseIds = [
          ...new Set(
            courseIds
              .map((id: unknown) => String(id).trim())
              .filter(Boolean),
          ),
        ];

        const offerResult = await pool.query(
          `
          SELECT
            id,
            title,
            price,
            course_ids,
            is_active,
            start_at,
            end_at,
            (start_at IS NULL OR start_at <= (NOW() AT TIME ZONE 'Asia/Kolkata')) AS has_started,
            (end_at IS NULL OR end_at >= (NOW() AT TIME ZONE 'Asia/Kolkata')) AS has_not_ended
          FROM offers
          WHERE id = $1
          LIMIT 1
          `,
          [numericOfferId],
        );

        if (offerResult.rows.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Offer not found",
          });
        }

        const offer = offerResult.rows[0];

        // Admin `datetime-local` values are stored as India local wall-clock
        // time in the existing TIMESTAMP columns. Compare them explicitly
        // against India time so Render/UTC server timezone cannot shift the
        // offer window.
        if (!offer.is_active || !offer.has_started || !offer.has_not_ended) {
          return res.status(400).json({
            success: false,
            message: "This offer is not currently available",
          });
        }

        const eligibleCourseIds = Array.isArray(offer.course_ids)
          ? offer.course_ids.map((id: unknown) => String(id).trim()).filter(Boolean)
          : [];

        const titleMatch = String(offer.title).match(/any\s+(2|3)\s+courses?/i);
        if (!titleMatch) {
          return res.status(400).json({
            success: false,
            message: "This offer is not configured as an Any 2 or Any 3 course offer",
          });
        }

        const requiredCount = Number(titleMatch[1]);

        if (normalizedCourseIds.length !== requiredCount) {
          return res.status(400).json({
            success: false,
            message: `Please select exactly ${requiredCount} different courses for this offer`,
          });
        }

        if (normalizedCourseIds.some((id) => !eligibleCourseIds.includes(id))) {
          return res.status(400).json({
            success: false,
            message: "One or more selected courses are not included in this offer",
          });
        }

        const existingEnrollment = await pool.query(
          `
          SELECT course_id
          FROM enrollments
          WHERE user_id = $1
            AND course_id = ANY($2::text[])
          `,
          [userId, normalizedCourseIds],
        );

        if (existingEnrollment.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "You are already enrolled in one or more selected courses",
            alreadyEnrolled: existingEnrollment.rows.map((row) => String(row.course_id)),
          });
        }

        for (const selectedId of normalizedCourseIds) {
          const course = await getCourseByPublicId(selectedId);
          if (!course || !course.is_published) {
            return res.status(400).json({
              success: false,
              message: "One or more selected courses are unavailable",
            });
          }
        }

        const offerPrice = Number(offer.price);
        if (!Number.isFinite(offerPrice) || offerPrice <= 0 || !Number.isInteger(offerPrice)) {
          return res.status(500).json({
            success: false,
            message: "Invalid offer price configured by SkillForge admin",
          });
        }

        amount = offerPrice * 100;
        receipt = `offer_${numericOfferId}_${Date.now()}`;
        paymentType = "combo";
        selectedOfferId = numericOfferId;
      }

      else {
        return res.status(400).json({
          success: false,
          message: "Invalid payment type",
        });
      }

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt,
        notes: {
          userId: String(userId),
          type: paymentType,
          courseId: paymentType === "course" ? normalizedCourseIds[0] : "",
          courseIds: normalizedCourseIds.join(","),
          offerId: selectedOfferId ? String(selectedOfferId) : "",
        },
      });

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
        VALUES ($1,$2,$3,$4,$5,$6,$7,'created')
        RETURNING id, razorpay_order_id, amount, currency, payment_type, course_id, course_ids, status, created_at
        `,
        [
          userId,
          order.id,
          amount,
          "INR",
          paymentType,
          paymentType === "course" ? normalizedCourseIds[0] : null,
          normalizedCourseIds,
        ],
      );

      const paymentOrder = paymentOrderResult.rows[0];

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
      console.error("Create Razorpay order error:", error);
      return res.status(500).json({
        success: false,
        message: "Unable to create payment order",
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
          enrolledCourseIds:
            paymentOrder.payment_type === "course" && paymentOrder.course_id
              ? [String(paymentOrder.course_id)]
              : (paymentOrder.payment_type === "offer" || paymentOrder.payment_type === "combo") && Array.isArray(paymentOrder.course_ids)
                ? paymentOrder.course_ids.map((id: string) => String(id))
                : [],
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
          (paymentOrder.payment_type === "offer" ||
          paymentOrder.payment_type === "combo") &&
          Array.isArray(paymentOrder.course_ids)
        ) {
          enrollmentCourseIds = paymentOrder.course_ids.map(
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
