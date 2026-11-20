import express from "express";
import {
  getPlans,
  createOrder,
  verifyPayment,
  getSubscriptionStatus,
  cancelSubscription,
} from "../controllers/paymentController.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

// Public route to view plans
router.get("/plans", getPlans);

// Authenticated subscription & payment routes
router.get("/subscription", isAuth, getSubscriptionStatus);
router.post("/create-order", isAuth, createOrder);
router.post("/verify", isAuth, verifyPayment);
router.post("/cancel", isAuth, cancelSubscription);

export default router;
