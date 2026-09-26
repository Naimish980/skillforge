import { Router, Request, Response } from "express";
import Razorpay from "razorpay";

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

router.post("/create-order", async (req: Request, res: Response) => {
  try {
    const { type, courseId, courseIds } = req.body;

    let amount = 0;
    let receipt = "";

    // Individual course
    if (type === "course") {
      if (!courseId) {
        return res.status(400).json({
          success: false,
          message: "Course ID is required",
        });
      }

      amount = 79900; // ₹799 in paise
      receipt = `course_${courseId}_${Date.now()}`;
    }

    // Any 2-course combo
    else if (type === "combo") {
      if (!Array.isArray(courseIds) || courseIds.length !== 2) {
        return res.status(400).json({
          success: false,
          message: "Exactly 2 course IDs are required for the combo",
        });
      }

      amount = 149900; // ₹1499 in paise
      receipt = `combo_${Date.now()}`;
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
        type,
        courseId: courseId ? String(courseId) : "",
        courseIds: Array.isArray(courseIds)
          ? courseIds.join(",")
          : "",
      },
    });

    return res.status(200).json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId,
    });
  } catch (error) {
    console.error("Create Razorpay order error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to create payment order",
    });
  }
});

export default router;