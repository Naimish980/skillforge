import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

/* =========================================================
   TYPES
========================================================= */

type OfferRow = {
  id: number;
  title: string;
  description: string | null;
  badge_text: string | null;
  button_text: string;
  price: number;
  original_price: number | null;
  banner_image: string | null;
  course_ids: string[];
  is_active: boolean;
  show_home: boolean;
  show_dashboard: boolean;
  start_at: string | null;
  end_at: string | null;
  created_at: string;
  updated_at: string;
};

/* =========================================================
   HELPERS
========================================================= */

const normalizeCourseIds = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .map((item) => String(item).trim())
        .filter(Boolean),
    ),
  );
};

const normalizeNullableString = (value: unknown): string | null => {
  if (value === undefined || value === null) {
    return null;
  }

  const valueString = String(value).trim();

  return valueString === "" ? null : valueString;
};

const normalizeDate = (value: unknown): string | null => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const date = new Date(String(value));

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString();
};

const getOfferRequiredCourseCount = (
  title: string,
  courseIds: string[],
): number => {
  const match = String(title).match(
    /\bany\s+(2|3)\s+courses?\b/i,
  );

  if (match) {
    return Number(match[1]);
  }

  /*
    If an admin creates a custom offer title without
    "Any 2 Courses" / "Any 3 Courses", use the number
    of selected courses as the required count.
  */
  if (courseIds.length === 2 || courseIds.length === 3) {
    return courseIds.length;
  }

  return 0;
};

/* =========================================================
   GET ALL OFFERS - ADMIN
   GET /api/offers
========================================================= */

router.get(
  "/",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const result = await pool.query<OfferRow>(
        `
        SELECT
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        FROM offers
        ORDER BY created_at DESC, id DESC
        `,
      );

      return res.status(200).json({
        success: true,
        offers: result.rows,
      });
    } catch (error) {
      console.error("Get offers error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load offers",
      });
    }
  },
);

/* =========================================================
   GET PUBLIC ACTIVE OFFERS
   GET /api/offers/public/active

   IMPORTANT:
   - Does NOT require login
   - Does NOT filter show_home
   - Does NOT filter start_at
   - Does NOT filter end_at
   - Only is_active controls visibility
========================================================= */

router.get(
  "/public/active",
  async (_req, res: Response) => {
    try {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );

      res.setHeader("Pragma", "no-cache");
      res.setHeader("Expires", "0");

      const result = await pool.query<OfferRow>(
        `
        SELECT
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        FROM offers
        WHERE is_active = TRUE
        ORDER BY created_at DESC, id DESC
        `,
      );

      const offers = result.rows.map((offer) => ({
        ...offer,

        id: Number(offer.id),
        price: Number(offer.price),

        original_price:
          offer.original_price === null
            ? null
            : Number(offer.original_price),

        course_ids: normalizeCourseIds(
          offer.course_ids,
        ),

        is_active: Boolean(offer.is_active),
        show_home: Boolean(offer.show_home),
        show_dashboard: Boolean(
          offer.show_dashboard,
        ),
      }));

      return res.status(200).json({
        success: true,
        offers,
      });
    } catch (error) {
      console.error(
        "Get public active offers error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load active offers",
        offers: [],
      });
    }
  },
);

/* =========================================================
   CREATE OFFER
   POST /api/offers
========================================================= */

router.post(
  "/",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const {
        title,
        description,
        badgeText,
        buttonText,
        price,
        originalPrice,
        bannerImage,
        courseIds,
        isActive,
        showHome,
        showDashboard,
        startAt,
        endAt,
      } = req.body;

      const cleanTitle = String(
        title ?? "",
      ).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Offer title is required",
        });
      }

      const numericPrice = Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0 ||
        !Number.isInteger(numericPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be a valid positive integer",
        });
      }

      let numericOriginalPrice:
        | number
        | null = null;

      if (
        originalPrice !== undefined &&
        originalPrice !== null &&
        String(originalPrice).trim() !== ""
      ) {
        numericOriginalPrice = Number(
          originalPrice,
        );

        if (
          !Number.isFinite(
            numericOriginalPrice,
          ) ||
          numericOriginalPrice < 0 ||
          !Number.isInteger(
            numericOriginalPrice,
          )
        ) {
          return res.status(400).json({
            success: false,
            message:
              "Original price must be a valid non-negative integer",
          });
        }
      }

      if (
        numericOriginalPrice !== null &&
        numericOriginalPrice < numericPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Original price cannot be lower than offer price",
        });
      }

      const normalizedCourseIds =
        normalizeCourseIds(courseIds);

      const requiredCourseCount =
        getOfferRequiredCourseCount(
          cleanTitle,
          normalizedCourseIds,
        );

      if (
        requiredCourseCount > 0 &&
        normalizedCourseIds.length <
          requiredCourseCount
      ) {
        return res.status(400).json({
          success: false,
          message: `Please select at least ${requiredCourseCount} courses for this offer`,
        });
      }

      const normalizedStartAt =
        normalizeDate(startAt);

      const normalizedEndAt =
        normalizeDate(endAt);

      if (
        normalizedStartAt &&
        normalizedEndAt &&
        new Date(normalizedEndAt) <=
          new Date(normalizedStartAt)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "End date must be later than start date",
        });
      }

      const result = await pool.query<OfferRow>(
        `
        INSERT INTO offers (
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
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
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          NOW(),
          NOW()
        )
        RETURNING
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        `,
        [
          cleanTitle,
          normalizeNullableString(description),
          normalizeNullableString(badgeText),
          normalizeNullableString(buttonText) ||
            "Get Offer Now",
          numericPrice,
          numericOriginalPrice,
          normalizeNullableString(
            bannerImage,
          ),
          normalizedCourseIds,
          Boolean(isActive),
          showHome === undefined
            ? true
            : Boolean(showHome),
          showDashboard === undefined
            ? true
            : Boolean(showDashboard),
          normalizedStartAt,
          normalizedEndAt,
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Offer created successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Create offer error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to create offer",
      });
    }
  },
);

/* =========================================================
   UPDATE OFFER
   PUT /api/offers/:offerId
========================================================= */

router.put(
  "/:offerId",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const offerId = Number(
        req.params.offerId,
      );

      if (
        !Number.isInteger(offerId) ||
        offerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

      const existing = await pool.query<OfferRow>(
        `
        SELECT
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        FROM offers
        WHERE id = $1
        LIMIT 1
        `,
        [offerId],
      );

      if (existing.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      const current =
        existing.rows[0];

      const {
        title,
        description,
        badgeText,
        buttonText,
        price,
        originalPrice,
        bannerImage,
        courseIds,
        isActive,
        showHome,
        showDashboard,
        startAt,
        endAt,
      } = req.body;

      const cleanTitle =
        title === undefined
          ? current.title
          : String(title).trim();

      if (!cleanTitle) {
        return res.status(400).json({
          success: false,
          message: "Offer title is required",
        });
      }

      const numericPrice =
        price === undefined
          ? Number(current.price)
          : Number(price);

      if (
        !Number.isFinite(numericPrice) ||
        numericPrice <= 0 ||
        !Number.isInteger(numericPrice)
      ) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be a valid positive integer",
        });
      }

      let numericOriginalPrice:
        | number
        | null =
        originalPrice === undefined
          ? current.original_price === null
            ? null
            : Number(current.original_price)
          : String(originalPrice).trim() === ""
            ? null
            : Number(originalPrice);

      if (
        numericOriginalPrice !== null &&
        (
          !Number.isFinite(
            numericOriginalPrice,
          ) ||
          numericOriginalPrice < 0 ||
          !Number.isInteger(
            numericOriginalPrice,
          )
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Original price must be a valid non-negative integer",
        });
      }

      if (
        numericOriginalPrice !== null &&
        numericOriginalPrice < numericPrice
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Original price cannot be lower than offer price",
        });
      }

      const normalizedCourseIds =
        courseIds === undefined
          ? normalizeCourseIds(
              current.course_ids,
            )
          : normalizeCourseIds(courseIds);

      const requiredCourseCount =
        getOfferRequiredCourseCount(
          cleanTitle,
          normalizedCourseIds,
        );

      if (
        requiredCourseCount > 0 &&
        normalizedCourseIds.length <
          requiredCourseCount
      ) {
        return res.status(400).json({
          success: false,
          message: `Please select at least ${requiredCourseCount} courses for this offer`,
        });
      }

      const normalizedStartAt =
        startAt === undefined
          ? current.start_at
          : normalizeDate(startAt);

      const normalizedEndAt =
        endAt === undefined
          ? current.end_at
          : normalizeDate(endAt);

      if (
        normalizedStartAt &&
        normalizedEndAt &&
        new Date(normalizedEndAt) <=
          new Date(normalizedStartAt)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "End date must be later than start date",
        });
      }

      const result = await pool.query<OfferRow>(
        `
        UPDATE offers
        SET
          title = $1,
          description = $2,
          badge_text = $3,
          button_text = $4,
          price = $5,
          original_price = $6,
          banner_image = $7,
          course_ids = $8,
          is_active = $9,
          show_home = $10,
          show_dashboard = $11,
          start_at = $12,
          end_at = $13,
          updated_at = NOW()
        WHERE id = $14
        RETURNING
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        `,
        [
          cleanTitle,
          description === undefined
            ? current.description
            : normalizeNullableString(
                description,
              ),
          badgeText === undefined
            ? current.badge_text
            : normalizeNullableString(
                badgeText,
              ),
          buttonText === undefined
            ? current.button_text
            : normalizeNullableString(
                buttonText,
              ) || "Get Offer Now",
          numericPrice,
          numericOriginalPrice,
          bannerImage === undefined
            ? current.banner_image
            : normalizeNullableString(
                bannerImage,
              ),
          normalizedCourseIds,
          isActive === undefined
            ? current.is_active
            : Boolean(isActive),
          showHome === undefined
            ? current.show_home
            : Boolean(showHome),
          showDashboard === undefined
            ? current.show_dashboard
            : Boolean(showDashboard),
          normalizedStartAt,
          normalizedEndAt,
          offerId,
        ],
      );

      return res.status(200).json({
        success: true,
        message: "Offer updated successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update offer error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to update offer",
      });
    }
  },
);

/* =========================================================
   UPDATE OFFER ACTIVE STATUS
   PATCH /api/offers/:offerId/status
========================================================= */

router.patch(
  "/:offerId/status",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const offerId = Number(
        req.params.offerId,
      );

      if (
        !Number.isInteger(offerId) ||
        offerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

      const { isActive } = req.body;

      if (typeof isActive !== "boolean") {
        return res.status(400).json({
          success: false,
          message:
            "isActive must be true or false",
        });
      }

      const result = await pool.query<OfferRow>(
        `
        UPDATE offers
        SET
          is_active = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        `,
        [isActive, offerId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: isActive
          ? "Offer activated successfully"
          : "Offer deactivated successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Update offer status error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update offer status",
      });
    }
  },
);

/* =========================================================
   DELETE OFFER
   DELETE /api/offers/:offerId
========================================================= */

router.delete(
  "/:offerId",
  authenticateToken,
  async (
    req: AuthenticatedRequest,
    res: Response,
  ) => {
    try {
      const offerId = Number(
        req.params.offerId,
      );

      if (
        !Number.isInteger(offerId) ||
        offerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM offers
        WHERE id = $1
        RETURNING id, title
        `,
        [offerId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Offer deleted successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error(
        "Delete offer error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to delete offer",
      });
    }
  },
);

/* =========================================================
   PUBLIC OFFER BY ID
   GET /api/offers/public/:offerId

   Useful for frontend/payment flow if needed.
========================================================= */

router.get(
  "/public/:offerId",
  async (
    req,
    res: Response,
  ) => {
    try {
      res.setHeader(
        "Cache-Control",
        "no-store, no-cache, must-revalidate, proxy-revalidate",
      );

      const offerId = Number(
        req.params.offerId,
      );

      if (
        !Number.isInteger(offerId) ||
        offerId <= 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

      const result = await pool.query<OfferRow>(
        `
        SELECT
          id,
          title,
          description,
          badge_text,
          button_text,
          price,
          original_price,
          banner_image,
          course_ids,
          is_active,
          show_home,
          show_dashboard,
          start_at,
          end_at,
          created_at,
          updated_at
        FROM offers
        WHERE id = $1
          AND is_active = TRUE
        LIMIT 1
        `,
        [offerId],
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Active offer not found",
        });
      }

      const offer = result.rows[0];

      return res.status(200).json({
        success: true,
        offer: {
          ...offer,
          id: Number(offer.id),
          price: Number(offer.price),
          original_price:
            offer.original_price === null
              ? null
              : Number(offer.original_price),
          course_ids:
            normalizeCourseIds(
              offer.course_ids,
            ),
          is_active: Boolean(
            offer.is_active,
          ),
          show_home: Boolean(
            offer.show_home,
          ),
          show_dashboard: Boolean(
            offer.show_dashboard,
          ),
        },
      });
    } catch (error) {
      console.error(
        "Get public offer error:",
        error,
      );

      return res.status(500).json({
        success: false,
        message: "Unable to load offer",
      });
    }
  },
);

export default router;