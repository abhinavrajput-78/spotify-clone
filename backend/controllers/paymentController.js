import crypto from "crypto";
import Payment from "../models/Payment.js";
import User from "../models/User.js";

// Real Spotify Premium Plans Data
export const SPOTIFY_PREMIUM_PLANS = [
  {
    id: "mini",
    name: "Mini",
    badge: "1 Day Pass",
    price: 7,
    currency: "INR",
    period: "1 day",
    durationDays: 1,
    accounts: 1,
    tagline: "1 day of Ad-free listening on mobile",
    features: [
      "1 day ad-free music listening",
      "Download 30 songs on 1 mobile device",
      "Mobile-only listening",
      "Basic audio quality",
    ],
    recommended: false,
    color: "#4687d6",
  },
  {
    id: "individual",
    name: "Individual",
    badge: "Most Popular",
    price: 119,
    currency: "INR",
    period: "month",
    durationDays: 30,
    accounts: 1,
    tagline: "1 Premium account for unlimited music & podcasts",
    features: [
      "Ad-free music listening on all devices",
      "Download up to 10,000 songs/device on 5 devices",
      "Play songs in any order with unlimited skips",
      "High-fidelity Lossless 320 kbps audio quality",
      "Listen with friends in real time with Jam",
      "Cancel anytime online",
    ],
    recommended: true,
    color: "#1ed760",
  },
  {
    id: "duo",
    name: "Duo",
    badge: "For 2 People",
    price: 149,
    currency: "INR",
    period: "month",
    durationDays: 30,
    accounts: 2,
    tagline: "2 Premium accounts for a couple under one roof",
    features: [
      "2 Premium accounts for people living together",
      "Duo Mix: a playlist for two, regularly updated",
      "Ad-free music listening on mobile, desktop, TV",
      "Download songs for offline listening",
      "Play songs in any order",
      "Cancel anytime online",
    ],
    recommended: false,
    color: "#ffc862",
  },
  {
    id: "family",
    name: "Family",
    badge: "Best Value",
    price: 179,
    currency: "INR",
    period: "month",
    durationDays: 30,
    accounts: 6,
    tagline: "Up to 6 Premium accounts for family living together",
    features: [
      "Up to 6 Premium accounts for family members",
      "Block explicit music with parental controls",
      "Spotify Kids: app made for young listeners",
      "Family Mix: playlist for your whole family",
      "Ad-free music listening & offline downloads",
      "Separate accounts with individual recommendations",
    ],
    recommended: false,
    color: "#a55eea",
  },
  {
    id: "student",
    name: "Student",
    badge: "50% Discount",
    price: 59,
    currency: "INR",
    period: "month",
    durationDays: 30,
    accounts: 1,
    tagline: "Discount for eligible university & college students",
    features: [
      "Special discount for verified university students",
      "100% ad-free music listening",
      "Download songs to listen offline without Wi-Fi",
      "Play songs in any order with unlimited skips",
      "High Fidelity 320 kbps audio quality",
      "Renewable every year for up to 4 years",
    ],
    recommended: false,
    color: "#ff6b81",
  },
];

// 1. Get All Plans
export const getPlans = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      data: SPOTIFY_PREMIUM_PLANS,
    });
  } catch (error) {
    console.error("Error in getPlans:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch plans",
    });
  }
};

// 2. Create Checkout Order
export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const plan = SPOTIFY_PREMIUM_PLANS.find((p) => p.id === planId);

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan selected",
      });
    }

    // Generate unique order ID
    const orderId = `order_${crypto.randomBytes(8).toString("hex")}`;
    const receiptNumber = `SP-REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    res.status(200).json({
      success: true,
      order: {
        orderId,
        receiptNumber,
        planId: plan.id,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency,
        durationDays: plan.durationDays,
      },
    });
  } catch (error) {
    console.error("Error in createOrder:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
    });
  }
};

// 3. Verify Payment and Activate Spotify Premium
export const verifyPayment = async (req, res) => {
  try {
    const { orderId, planId, paymentMethod = "card", billingDetails = {} } = req.body;
    const userId = req.user._id || req.user.id;

    const plan = SPOTIFY_PREMIUM_PLANS.find((p) => p.id === planId);
    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Invalid subscription plan",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Calculate expiry date
    const now = new Date();
    let startDate = now;

    // If user already has active premium, extend from existing expiry date
    if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) > now) {
      startDate = new Date(user.premiumExpiresAt);
    }

    const expiresAt = new Date(startDate.getTime() + plan.durationDays * 24 * 60 * 60 * 1000);
    const paymentId = `pay_${crypto.randomBytes(10).toString("hex")}`;
    const receiptNumber = `SP-REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create payment record in DB
    const paymentRecord = await Payment.create({
      user: user._id,
      planId: plan.id,
      planName: plan.name,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod,
      status: "completed",
      orderId: orderId || `order_${crypto.randomBytes(8).toString("hex")}`,
      paymentId,
      receiptNumber,
      billingCycle: plan.period,
      billingDetails: {
        name: billingDetails.name || user.name,
        email: billingDetails.email || user.email,
        last4: billingDetails.last4 || "4242",
        upiId: billingDetails.upiId || "",
        bank: billingDetails.bank || "",
      },
      features: plan.features,
      startDate: now,
      expiresAt,
    });

    // Update user profile
    user.isPremium = true;
    user.premiumPlan = plan.name;
    user.premiumExpiresAt = expiresAt;
    user.subscriptionId = paymentRecord._id.toString();
    await user.save();

    res.status(200).json({
      success: true,
      message: `🎉 Welcome to Spotify Premium ${plan.name}! Your account is now upgraded.`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: user.profileImage,
        isPremium: user.isPremium,
        premiumPlan: user.premiumPlan,
        premiumExpiresAt: user.premiumExpiresAt,
      },
      receipt: {
        receiptNumber,
        paymentId,
        orderId: paymentRecord.orderId,
        planName: plan.name,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod,
        startDate: paymentRecord.startDate,
        expiresAt: paymentRecord.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error in verifyPayment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};

// 4. Get Current User Subscription Status and History
export const getSubscriptionStatus = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const now = new Date();
    let isExpired = false;

    // Check if subscription has expired
    if (user.isPremium && user.premiumExpiresAt && new Date(user.premiumExpiresAt) < now) {
      user.isPremium = false;
      user.premiumPlan = "Free";
      await user.save();
      isExpired = true;
    }

    const history = await Payment.find({ user: user._id }).sort({ createdAt: -1 });

    const latestPayment = history[0] || null;

    let daysRemaining = 0;
    if (user.isPremium && user.premiumExpiresAt) {
      const diff = new Date(user.premiumExpiresAt).getTime() - now.getTime();
      daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
      success: true,
      data: {
        isPremium: user.isPremium || false,
        planName: user.premiumPlan || "Free",
        expiresAt: user.premiumExpiresAt,
        daysRemaining,
        isExpired,
        latestPayment,
        history,
      },
    });
  } catch (error) {
    console.error("Error in getSubscriptionStatus:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get subscription status",
    });
  }
};

// 5. Cancel Subscription
export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!user.isPremium) {
      return res.status(400).json({
        success: false,
        message: "You do not have an active Premium subscription",
      });
    }

    // Keep active until expiresAt, but mark as cancelled
    if (user.subscriptionId) {
      await Payment.findByIdAndUpdate(user.subscriptionId, {
        status: "cancelled",
      });
    }

    res.status(200).json({
      success: true,
      message: `Your Spotify Premium plan will remain active until ${new Date(
        user.premiumExpiresAt
      ).toLocaleDateString()}. It will not renew after that.`,
    });
  } catch (error) {
    console.error("Error in cancelSubscription:", error);
    res.status(500).json({
      success: false,
      message: "Subscription cancellation failed",
    });
  }
};
