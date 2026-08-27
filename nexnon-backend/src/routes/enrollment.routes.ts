import { Router } from "express";
import { z } from "zod";
import { EnrollmentModel } from "../models/Enrollment";
import { ClassModel } from "../models/Class";
import { PaymentModel } from "../models/Payment";
import { NotificationModel } from "../models/Notification";
import { requireAuth, AuthRequest } from "../middleware/auth";
import Stripe from "stripe";
import { ENV } from "../config/env";

const router = Router();

const stripe = ENV.STRIPE_SECRET_KEY
  ? new Stripe(ENV.STRIPE_SECRET_KEY, { apiVersion: "2024-12-18" })
  : null;

const enrollSchema = z.object({
  classId: z.string(),
  paymentMethodId: z.string().optional(),
});

router.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = enrollSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: parsed.error.issues.map((i) => ({
        field: i.path.join("."),
        message: i.message,
      })),
    });
  }

  const { classId, paymentMethodId } = parsed.data;

  const cls = await ClassModel.findById(classId);
  if (!cls) {
    return res.status(404).json({ success: false, message: "Class not found" });
  }

  let paymentRecord;

  if (stripe && paymentMethodId) {
    const amountInCents = Math.round(cls.price * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      automatic_payment_methods: { enabled: true },
      metadata: {
        classId: cls.id,
        userId: req.user!.id,
      },
    });

    paymentRecord = await PaymentModel.create({
      userId: req.user!.id,
      classId: cls.id,
      amount: cls.price,
      currency: "usd",
      status: paymentIntent.status === "succeeded" ? "completed" : "pending",
      paymentMethod: paymentIntent.payment_method_types.join(","),
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: (paymentIntent.latest_charge as string) || undefined,
    });

    if (paymentIntent.status !== "succeeded") {
      return res.status(402).json({
        success: false,
        message: "Payment not completed",
      });
    }
  } else {
    // Demo mode: no real Stripe key configured
    paymentRecord = await PaymentModel.create({
      userId: req.user!.id,
      classId: cls.id,
      amount: cls.price,
      currency: "usd",
      status: "completed",
      paymentMethod: "demo",
    });
  }

  const enrollment = await EnrollmentModel.create({
    classId: cls.id,
    userId: req.user!.id,
    status: "active",
    progress: 0,
  });

  cls.enrolledStudents += 1;
  await cls.save();

  await NotificationModel.create({
    userId: req.user!.id,
    type: "payment",
    title: "Enrolled successfully",
    message: `You're now enrolled in ${cls.title}`,
    read: false,
    actionUrl: `/class/${cls.id}`,
  }).catch(() => {});

  return res.status(201).json({
    success: true,
    data: enrollment,
    message: "Enrolled successfully",
  });
});

router.get("/my", requireAuth, async (req: AuthRequest, res) => {
  const page = Number(req.query.page || 1);
  const pageSize = Number(req.query.pageSize || 10);

  const query = { userId: req.user!.id };

  const [items, totalItems] = await Promise.all([
    EnrollmentModel.find(query)
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    EnrollmentModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  return res.json({
    success: true,
    data: {
      data: items,
      pagination: {
        page,
        pageSize,
        totalPages,
        totalItems,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
      },
    },
  });
});

router.delete("/:id", requireAuth, async (req: AuthRequest, res) => {
  const enrollment = await EnrollmentModel.findById(req.params.id);
  if (!enrollment) {
    return res
      .status(404)
      .json({ success: false, message: "Enrollment not found" });
  }

  if (String(enrollment.userId) !== req.user!.id) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  enrollment.status = "dropped";
  await enrollment.save();

  return res.json({
    success: true,
    data: null,
    message: "Enrollment dropped",
  });
});

export default router;
