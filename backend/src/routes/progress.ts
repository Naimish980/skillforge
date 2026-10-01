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

        /*
          IMPORTANT:
          The Admin Portal stores course IDs in offers.course_ids.
          The student frontend sends the public course ID/slug.

          Example:
            offer.course_ids -> ["12", "15", "18"]
            selected course  -> "cloud-computing-12"

          Therefore we must resolve every selected public ID first and
          compare BOTH the database ID and public ID against the offer.
        */
        const resolvedOfferCourses: Array<{
          publicId: string;
          dbId: string;
          isPublished: boolean;
        }> = [];

        for (const selectedId of normalizedCourseIds) {
          const course = await getCourseByPublicId(selectedId);

          if (!course || !course.is_published) {
            return res.status(400).json({
              success: false,
              message: "One or more selected courses are unavailable",
            });
          }

          const publicId = String(selectedId).trim();
          const dbId = String(course.id).trim();

          if (
            !eligibleCourseIds.includes(publicId) &&
            !eligibleCourseIds.includes(dbId)
          ) {
            return res.status(400).json({
              success: false,
              message: "One or more selected courses are not included in this offer",
            });
          }

          resolvedOfferCourses.push({
            publicId,
            dbId,
            isPublished: Boolean(course.is_published),
          });
        }

        /*
          Check existing enrollments using BOTH ID forms because older
          individual purchases may have stored a public ID while some
          older data may contain the database course ID.
        */
        const selectedPublicIds = resolvedOfferCourses.map((course) => course.publicId);
        const selectedDbIds = resolvedOfferCourses.map((course) => course.dbId);

        const existingEnrollment = await pool.query(
          `
          SELECT course_id
          FROM enrollments
          WHERE user_id = $1
            AND (
              course_id = ANY($2::text[])
              OR course_id = ANY($3::text[])
            )
          `,
          [userId, selectedPublicIds, selectedDbIds],
        );

        if (existingEnrollment.rows.length > 0) {
          return res.status(409).json({
            success: false,
            message: "You are already enrolled in one or more selected courses",
            alreadyEnrolled: existingEnrollment.rows.map((row) => String(row.course_id)),
          });
        }

        // Keep public IDs in the payment order so the existing frontend
        // enrollment flow remains compatible.
        normalizedCourseIds = selectedPublicIds;

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


/* =====================================================
   CERTIFICATES
   POST /api/payment/certificates/issue
   GET  /api/payment/certificates/mine
   GET  /api/payment/certificates/verify/:certificateId
   POST /api/payment/certificates/:certificateId/download
   GET  /api/payment/certificates/admin/all

   Certificate IDs are persistent per user + course.
   Download tracking records SkillForge's certificate
   download/print action without changing the certificate UI.
===================================================== */

const ensureCertificatesTable = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id BIGSERIAL PRIMARY KEY,
      certificate_id TEXT NOT NULL UNIQUE,
      user_id INTEGER NOT NULL,
      course_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course_title TEXT NOT NULL,
      course_description TEXT,
      course_category TEXT,
      course_level TEXT,
      lesson_count INTEGER NOT NULL DEFAULT 0,
      module_titles TEXT[] NOT NULL DEFAULT '{}',
      issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      download_count INTEGER NOT NULL DEFAULT 0,
      first_downloaded_at TIMESTAMPTZ NULL,
      last_downloaded_at TIMESTAMPTZ NULL,
      UNIQUE (user_id, course_id)
    )
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS course_description TEXT
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS course_category TEXT
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS course_level TEXT
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS lesson_count INTEGER NOT NULL DEFAULT 0
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS module_titles TEXT[] NOT NULL DEFAULT '{}'
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS download_count INTEGER NOT NULL DEFAULT 0
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS first_downloaded_at TIMESTAMPTZ NULL
  `);

  await pool.query(`
    ALTER TABLE certificates
    ADD COLUMN IF NOT EXISTS last_downloaded_at TIMESTAMPTZ NULL
  `);
};

async function getCertificateCourseDetails(courseId: number) {
  const result = await pool.query(
    `
    SELECT
      c.id,
      c.title,
      c.description,
      c.category,
      c.level,
      c.is_published,
      (
        SELECT COUNT(*)::int
        FROM lectures l
        INNER JOIN modules m
          ON m.id = l.module_id
        WHERE m.course_id = c.id
      ) AS lesson_count,
      COALESCE(
        (
          SELECT ARRAY_AGG(
            m.title
            ORDER BY m.module_order ASC, m.id ASC
          )
          FROM modules m
          WHERE m.course_id = c.id
        ),
        ARRAY[]::text[]
      ) AS module_titles
    FROM courses c
    WHERE c.id = $1
    LIMIT 1
    `,
    [courseId],
  );

  return result.rows[0] ?? null;
}

const mapCertificateRow = (row: any) => ({
  certificateId: String(row.certificate_id),
  studentName: String(row.student_name),
  courseId: String(row.course_id),
  courseTitle: String(row.course_title),
  courseDescription: row.course_description
    ? String(row.course_description)
    : null,
  courseCategory: row.course_category
    ? String(row.course_category)
    : null,
  courseLevel: row.course_level
    ? String(row.course_level)
    : null,
  lessonCount: Number(row.lesson_count) || 0,
  moduleTitles: Array.isArray(row.module_titles)
    ? row.module_titles.map((item: unknown) => String(item))
    : [],
  issuedAt: row.issued_at,
  downloadCount: Number(row.download_count) || 0,
  firstDownloadedAt: row.first_downloaded_at ?? null,
  lastDownloadedAt: row.last_downloaded_at ?? null,
});

/* =====================================================
   CERTIFICATE COMPLETION CHECK

   A certificate may only be issued when every lecture in
   every module of the current course has a passed quiz and
   a completed_at timestamp for this student.

   This check intentionally reads the live module/lecture
   tables, so lectures added later automatically become part
   of the certificate requirement. Already-issued certificates
   are returned before this check and therefore remain valid.
===================================================== */

async function getCertificateCompletionStatus(
  userId: number,
  courseDbId: number,
  publicCourseId: string,
) {
  const result = await pool.query(
    `
    SELECT
      COUNT(DISTINCT m.id) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM lectures module_lecture
          WHERE module_lecture.module_id = m.id
        )
      )::int AS total_modules,
      COUNT(DISTINCT l.id)::int AS total_lectures,
      COUNT(DISTINCT m.id) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM lectures module_lecture
          WHERE module_lecture.module_id = m.id
        )
        AND NOT EXISTS (
          SELECT 1
          FROM lectures incomplete_lecture
          WHERE incomplete_lecture.module_id = m.id
            AND NOT EXISTS (
              SELECT 1
              FROM lecture_progress lp
              WHERE lp.user_id = $1
                AND lp.module_id = CAST(m.id AS text)
                AND lp.lecture_id = CAST(incomplete_lecture.id AS text)
                AND lp.course_id = ANY($3::text[])
                AND lp.passed = TRUE
                AND lp.completed_at IS NOT NULL
            )
        )
      )::int AS completed_modules,
      COUNT(DISTINCT l.id) FILTER (
        WHERE EXISTS (
          SELECT 1
          FROM lecture_progress lp
          WHERE lp.user_id = $1
            AND lp.module_id = CAST(m.id AS text)
            AND lp.lecture_id = CAST(l.id AS text)
            AND lp.course_id = ANY($3::text[])
            AND lp.passed = TRUE
            AND lp.completed_at IS NOT NULL
        )
      )::int AS completed_lectures
    FROM modules m
    LEFT JOIN lectures l
      ON l.module_id = m.id
    WHERE m.course_id = $2
    `,
    [
      userId,
      courseDbId,
      [publicCourseId, String(courseDbId)],
    ],
  );

  const row = result.rows[0] ?? {};

  return {
    totalModules: Number(row.total_modules) || 0,
    completedModules: Number(row.completed_modules) || 0,
    totalLectures: Number(row.total_lectures) || 0,
    completedLectures: Number(row.completed_lectures) || 0,
  };
}

/* =====================================================
   ISSUE / GET EXISTING CERTIFICATE
===================================================== */

router.post(
  "/certificates/issue",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const normalizedCourseId = String(
        req.body?.courseId ?? "",
      ).trim();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      if (!normalizedCourseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
      }

      const course = await getCourseByPublicId(
        normalizedCourseId,
      );

      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }

      const enrollmentResult = await pool.query(
        `
        SELECT id
        FROM enrollments
        WHERE user_id = $1
          AND course_id = ANY($2::text[])
        LIMIT 1
        `,
        [
          userId,
          [
            normalizedCourseId,
            String(course.id),
          ],
        ],
      );

      if (enrollmentResult.rows.length === 0) {
        return res.status(403).json({
          success: false,
          message: "You are not enrolled in this course",
        });
      }

      await ensureCertificatesTable();

      const existingResult = await pool.query(
        `
        SELECT
          certificate_id,
          student_name,
          course_id,
          course_title,
          course_description,
          course_category,
          course_level,
          lesson_count,
          module_titles,
          issued_at,
          download_count,
          first_downloaded_at,
          last_downloaded_at
        FROM certificates
        WHERE user_id = $1
          AND course_id = $2
        LIMIT 1
        `,
        [
          userId,
          String(course.id),
        ],
      );

      if (existingResult.rows.length > 0) {
        return res.status(200).json({
          success: true,
          certificate: mapCertificateRow(
            existingResult.rows[0],
          ),
        });
      }

      const completion =
        await getCertificateCompletionStatus(
          Number(userId),
          Number(course.id),
          normalizedCourseId,
        );

      if (
        completion.totalLectures === 0 ||
        completion.totalModules === 0 ||
        completion.completedLectures !== completion.totalLectures ||
        completion.completedModules !== completion.totalModules
      ) {
        return res.status(403).json({
          success: false,
          certificateLocked: true,
          message:
            "Complete all lectures in all modules before requesting your certificate",
          totalModules: completion.totalModules,
          completedModules: completion.completedModules,
          totalLectures: completion.totalLectures,
          completedLectures: completion.completedLectures,
        });
      }

      const courseDetails =
        await getCertificateCourseDetails(
          Number(course.id),
        );

      if (!courseDetails) {
        return res.status(404).json({
          success: false,
          message: "Course details not found",
        });
      }

      const userResult = await pool.query(
        `
        SELECT name
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId],
      );

      if (userResult.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Student account not found",
        });
      }

      const certificateId =
        `SF-${new Date().getFullYear()}-${crypto
          .randomBytes(5)
          .toString("hex")
          .toUpperCase()}`;

      const studentName =
        String(userResult.rows[0].name || "").trim() ||
        "SkillForge Student";

      const insertResult = await pool.query(
        `
        INSERT INTO certificates (
          certificate_id,
          user_id,
          course_id,
          student_name,
          course_title,
          course_description,
          course_category,
          course_level,
          lesson_count,
          module_titles
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10
        )
        ON CONFLICT (user_id, course_id)
        DO NOTHING
        RETURNING
          certificate_id,
          student_name,
          course_id,
          course_title,
          course_description,
          course_category,
          course_level,
          lesson_count,
          module_titles,
          issued_at,
          download_count,
          first_downloaded_at,
          last_downloaded_at
        `,
        [
          certificateId,
          userId,
          String(course.id),
          studentName,
          String(courseDetails.title),
          courseDetails.description ?? null,
          courseDetails.category ?? null,
          courseDetails.level ?? null,
          Number(courseDetails.lesson_count) || 0,
          Array.isArray(courseDetails.module_titles)
            ? courseDetails.module_titles
            : [],
        ],
      );

      if (insertResult.rows.length > 0) {
        return res.status(201).json({
          success: true,
          certificate: mapCertificateRow(
            insertResult.rows[0],
          ),
        });
      }

      // Another request may have created the same user/course
      // certificate concurrently. Return that persistent record.
      const concurrentResult = await pool.query(
        `
        SELECT
          certificate_id,
          student_name,
          course_id,
          course_title,
          course_description,
          course_category,
          course_level,
          lesson_count,
          module_titles,
          issued_at,
          download_count,
          first_downloaded_at,
          last_downloaded_at
        FROM certificates
        WHERE user_id = $1
          AND course_id = $2
        LIMIT 1
        `,
        [
          userId,
          String(course.id),
        ],
      );

      if (concurrentResult.rows.length === 0) {
        return res.status(500).json({
          success: false,
          message: "Unable to create certificate",
        });
      }

      return res.status(200).json({
        success: true,
        certificate: mapCertificateRow(
          concurrentResult.rows[0],
        ),
      });
    } catch (error) {
      console.error(
        "Issue certificate error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to create certificate",
      });
    }
  },
);

/* =====================================================
   GET MY CERTIFICATES
===================================================== */

router.get(
  "/certificates/mine",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      await ensureCertificatesTable();

      const result = await pool.query(
        `
        SELECT
          certificate_id,
          student_name,
          course_id,
          course_title,
          course_description,
          course_category,
          course_level,
          lesson_count,
          module_titles,
          issued_at,
          download_count,
          first_downloaded_at,
          last_downloaded_at
        FROM certificates
        WHERE user_id = $1
        ORDER BY issued_at DESC
        `,
        [userId],
      );

      return res.status(200).json({
        success: true,
        certificates: result.rows.map(
          mapCertificateRow,
        ),
      });
    } catch (error) {
      console.error(
        "Get certificates error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load certificates",
      });
    }
  },
);

/* =====================================================
   RECORD CERTIFICATE DOWNLOAD
   POST /api/payment/certificates/:certificateId/download

   This tracks SkillForge's Download/Print action.
   The browser cannot tell the server whether a user
   physically saved a file after the browser print dialog,
   so this records the actual SkillForge download action.
===================================================== */

router.post(
  "/certificates/:certificateId/download",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;
      const certificateId = String(
        req.params.certificateId ?? "",
      ).trim();

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          message: "Certificate ID is required",
        });
      }

      await ensureCertificatesTable();

      const result = await pool.query(
        `
        UPDATE certificates
        SET
          download_count = COALESCE(download_count, 0) + 1,
          first_downloaded_at =
            COALESCE(first_downloaded_at, NOW()),
          last_downloaded_at = NOW()
        WHERE certificate_id = $1
          AND user_id = $2
        RETURNING
          certificate_id,
          download_count,
          first_downloaded_at,
          last_downloaded_at
        `,
        [certificateId, userId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Certificate not found",
        });
      }

      const row = result.rows[0];

      return res.status(200).json({
        success: true,
        certificate: {
          certificateId: String(
            row.certificate_id,
          ),
          downloadCount:
            Number(row.download_count) || 0,
          firstDownloadedAt:
            row.first_downloaded_at ?? null,
          lastDownloadedAt:
            row.last_downloaded_at ?? null,
        },
      });
    } catch (error) {
      console.error(
        "Track certificate download error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to record certificate download",
      });
    }
  },
);

/* =====================================================
   PUBLIC CERTIFICATE VERIFICATION
   GET /api/payment/certificates/verify/:certificateId

   Login is intentionally NOT required.
===================================================== */

router.get(
  "/certificates/verify/:certificateId",
  async (req, res: Response) => {
    try {
      const certificateId = String(
        req.params.certificateId ?? "",
      ).trim();

      if (!certificateId) {
        return res.status(400).json({
          success: false,
          verified: false,
          message: "Certificate ID is required",
        });
      }

      await ensureCertificatesTable();

      const result = await pool.query(
        `
        SELECT
          certificate_id,
          student_name,
          course_id,
          course_title,
          course_description,
          course_category,
          course_level,
          lesson_count,
          module_titles,
          issued_at
        FROM certificates
        WHERE certificate_id = $1
        LIMIT 1
        `,
        [certificateId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: true,
          verified: false,
          message:
            "Certificate not found. This certificate could not be verified by SkillForge.",
        });
      }

      const row = result.rows[0];

      return res.status(200).json({
        success: true,
        verified: true,
        issuer: "SkillForge",
        certificate: {
          certificateId: String(
            row.certificate_id,
          ),
          studentName: String(
            row.student_name,
          ),
          courseId: String(row.course_id),
          courseTitle: String(
            row.course_title,
          ),
          courseDescription:
            row.course_description
              ? String(row.course_description)
              : null,
          courseCategory:
            row.course_category
              ? String(row.course_category)
              : null,
          courseLevel:
            row.course_level
              ? String(row.course_level)
              : null,
          lessonCount:
            Number(row.lesson_count) || 0,
          moduleTitles:
            Array.isArray(row.module_titles)
              ? row.module_titles.map(
                  (item: unknown) =>
                    String(item),
                )
              : [],
          issuedAt: row.issued_at,
        },
      });
    } catch (error) {
      console.error(
        "Verify certificate error:",
        error,
      );

      return res.status(500).json({
        success: false,
        verified: false,
        message: "Unable to verify certificate",
      });
    }
  },
);

/* =====================================================
   ADMIN CERTIFICATE LIST
   GET /api/payment/certificates/admin/all

   Admin-only endpoint. UI will be connected in the
   next certificate implementation step.
===================================================== */

router.get(
  "/certificates/admin/all",
  authenticateToken,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Authenticated user not found",
        });
      }

      const adminResult = await pool.query(
        `
        SELECT role
        FROM users
        WHERE id = $1
        LIMIT 1
        `,
        [userId],
      );

      if (
        adminResult.rows.length === 0 ||
        adminResult.rows[0].role !== "admin"
      ) {
        return res.status(403).json({
          success: false,
          message: "Admin access required",
        });
      }

      await ensureCertificatesTable();

      const result = await pool.query(
        `
        SELECT
          c.certificate_id,
          c.user_id,
          c.student_name,
          u.email AS student_email,
          u.phone AS student_phone,
          c.course_id,
          c.course_title,
          c.course_category,
          c.course_level,
          c.lesson_count,
          c.issued_at,
          c.download_count,
          c.first_downloaded_at,
          c.last_downloaded_at
        FROM certificates c
        LEFT JOIN users u
          ON u.id = c.user_id
        ORDER BY c.issued_at DESC
        `,
      );

      return res.status(200).json({
        success: true,
        certificates: result.rows.map(
          (row) => ({
            certificateId: String(
              row.certificate_id,
            ),
            userId: Number(row.user_id),
            studentName: String(
              row.student_name,
            ),
            studentEmail:
              row.student_email
                ? String(row.student_email)
                : "",
            studentPhone:
              row.student_phone
                ? String(row.student_phone)
                : "",
            courseId: String(row.course_id),
            courseTitle: String(
              row.course_title,
            ),
            courseCategory:
              row.course_category
                ? String(row.course_category)
                : null,
            courseLevel:
              row.course_level
                ? String(row.course_level)
                : null,
            lessonCount:
              Number(row.lesson_count) || 0,
            issuedAt: row.issued_at,
            downloadCount:
              Number(row.download_count) || 0,
            firstDownloadedAt:
              row.first_downloaded_at ?? null,
            lastDownloadedAt:
              row.last_downloaded_at ?? null,
          }),
        ),
      });
    } catch (error) {
      console.error(
        "Admin certificates error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load certificates",
      });
    }
  },
);

export default router;
