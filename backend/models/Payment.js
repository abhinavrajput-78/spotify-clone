import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },
    planName: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      default: "INR",
    },
    paymentMethod: {
      type: String,
      enum: ["card", "upi", "netbanking", "wallet", "stripe", "razorpay"],
      default: "card",
    },
    status: {
      type: String,
      enum: ["completed", "pending", "failed", "cancelled"],
      default: "completed",
    },
    orderId: {
      type: String,
      required: true,
      unique: true,
    },
    paymentId: {
      type: String,
      required: true,
    },
    receiptNumber: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      default: "monthly",
    },
    billingDetails: {
      name: String,
      email: String,
      last4: String,
      upiId: String,
      bank: String,
    },
    features: [
      {
        type: String,
      },
    ],
    startDate: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Payment", paymentSchema);
