import { Router, Response } from "express";
import { pool } from "../db";
import {
  AuthenticatedRequest,
  authenticateToken,
} from "../middleware/auth";

const router = Router();

/* =========================================================
   ADMIN VERIFICATION
========================================================= */

async function verifyAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: () => void,
) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await pool.query(
      `
      SELECT role
      FROM users
      WHERE id = $1
      LIMIT 1
      `,
      [userId],
    );

    if (!result.rows.length) {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    if (result.rows[0].role !== "admin") {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin verification error:", error);

    return res.status(500).json({
      message: "Unable to verify admin",
    });
  }
}

/* =========================================================
   ADMIN - GET ALL OFFERS
========================================================= */

router.get(
  "/",
  authenticateToken,
  verifyAdmin,
  async (_req, res) => {
    try {
      const result = await pool.query(`
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
        ORDER BY created_at DESC
      `);

      return res.json({
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
   ADMIN - CREATE OFFER
========================================================= */

router.post(
  "/",
  authenticateToken,
  verifyAdmin,
  async (req, res) => {
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

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Offer title is required",
        });
      }

      const offerPrice = Number(price);

      if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be greater than 0",
        });
      }

      const original =
        originalPrice === null ||
        originalPrice === undefined ||
        originalPrice === ""
          ? null
          : Number(originalPrice);

      if (
        original !== null &&
        (!Number.isFinite(original) || original < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid original price",
        });
      }

      const ids = Array.isArray(courseIds)
        ? courseIds.map((id: unknown) => String(id))
        : [];

      const result = await pool.query(
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
          end_at
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        RETURNING *
        `,
        [
          String(title).trim(),
          description
            ? String(description).trim()
            : null,
          badgeText
            ? String(badgeText).trim()
            : null,
          buttonText
            ? String(buttonText).trim()
            : "Get Offer Now",
          offerPrice,
          original,
          bannerImage
            ? String(bannerImage).trim()
            : null,
          ids,
          Boolean(isActive),
          showHome !== false,
          showDashboard !== false,
          startAt || null,
          endAt || null,
        ],
      );

      return res.status(201).json({
        success: true,
        message: "Offer created successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error("Create offer error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to create offer",
      });
    }
  },
);

/* =========================================================
   ADMIN - UPDATE OFFER
========================================================= */

router.put(
  "/:offerId",
  authenticateToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const offerId = Number(req.params.offerId);

      if (!Number.isInteger(offerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

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

      if (!title || !String(title).trim()) {
        return res.status(400).json({
          success: false,
          message: "Offer title is required",
        });
      }

      const offerPrice = Number(price);

      if (!Number.isFinite(offerPrice) || offerPrice <= 0) {
        return res.status(400).json({
          success: false,
          message: "Offer price must be greater than 0",
        });
      }

      const original =
        originalPrice === null ||
        originalPrice === undefined ||
        originalPrice === ""
          ? null
          : Number(originalPrice);

      if (
        original !== null &&
        (!Number.isFinite(original) || original < 0)
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid original price",
        });
      }

      const ids = Array.isArray(courseIds)
        ? courseIds.map((id: unknown) => String(id))
        : [];

      const result = await pool.query(
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
        RETURNING *
        `,
        [
          String(title).trim(),
          description
            ? String(description).trim()
            : null,
          badgeText
            ? String(badgeText).trim()
            : null,
          buttonText
            ? String(buttonText).trim()
            : "Get Offer Now",
          offerPrice,
          original,
          bannerImage
            ? String(bannerImage).trim()
            : null,
          ids,
          Boolean(isActive),
          showHome !== false,
          showDashboard !== false,
          startAt || null,
          endAt || null,
          offerId,
        ],
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      return res.json({
        success: true,
        message: "Offer updated successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error("Update offer error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update offer",
      });
    }
  },
);

/* =========================================================
   ADMIN - ACTIVATE / DEACTIVATE
========================================================= */

router.patch(
  "/:offerId/status",
  authenticateToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const offerId = Number(req.params.offerId);

      if (!Number.isInteger(offerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

      const isActive = Boolean(req.body.isActive);

      const result = await pool.query(
        `
        UPDATE offers
        SET
          is_active = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING *
        `,
        [isActive, offerId],
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      return res.json({
        success: true,
        message: isActive
          ? "Offer activated successfully"
          : "Offer deactivated successfully",
        offer: result.rows[0],
      });
    } catch (error) {
      console.error("Offer status error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to update offer status",
      });
    }
  },
);

/* =========================================================
   ADMIN - DELETE
========================================================= */

router.delete(
  "/:offerId",
  authenticateToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const offerId = Number(req.params.offerId);

      if (!Number.isInteger(offerId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid offer ID",
        });
      }

      const result = await pool.query(
        `
        DELETE FROM offers
        WHERE id = $1
        RETURNING id
        `,
        [offerId],
      );

      if (!result.rows.length) {
        return res.status(404).json({
          success: false,
          message: "Offer not found",
        });
      }

      return res.json({
        success: true,
        message: "Offer deleted successfully",
      });
    } catch (error) {
      console.error("Delete offer error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to delete offer",
      });
    }
  },
);

/* =========================================================
   PUBLIC - ACTIVE OFFERS
   IMPORTANT:
   This route is intentionally ABOVE any future
   GET /:offerId route.
========================================================= */

router.get(
  "/public/active",
  async (_req, res) => {
    try {
      const result = await pool.query(`
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
          show_home,
          show_dashboard,
          start_at,
          end_at
        FROM offers
        WHERE is_active = TRUE
          AND show_home = TRUE
          AND (
            start_at IS NULL
            OR start_at <= NOW()
          )
          AND (
            end_at IS NULL
            OR end_at >= NOW()
          )
        ORDER BY
          CASE
            WHEN title ILIKE '%any 2%' THEN 1
            WHEN title ILIKE '%any 3%' THEN 2
            ELSE 3
          END,
          created_at DESC
      `);

      return res.json({
        success: true,
        offers: result.rows,
      });
    } catch (error) {
      console.error("Get public offers error:", error);

      return res.status(500).json({
        success: false,
        message: "Unable to load offers",
        offers: [],
      });
    }
  },
);

export default router;