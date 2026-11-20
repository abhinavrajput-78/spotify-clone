import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  MdCheck,
  MdArrowBack,
  MdClose,
  MdSecurity,
  MdDownload,
  MdBlock,
  MdSkipNext,
  MdHighQuality,
  MdCreditCard,
  MdQrCode2,
  MdAccountBalance,
  MdVerified,
  MdStar,
} from "react-icons/md";
import { FaSpotify } from "react-icons/fa";
import { UserData } from "../context/User";
import { assets } from "../assets/assets";

const DEFAULT_PLANS = [
  {
    id: "mini",
    name: "Mini",
    badge: "1 Day Pass",
    price: 7,
    currency: "₹",
    period: "1 day",
    durationDays: 1,
    accounts: 1,
    tagline: "1 day of Ad-free listening on mobile",
    features: [
      "1 day ad-free music listening",
      "Download 30 songs on 1 mobile device",
      "Mobile-only listening",
      "Standard audio quality",
    ],
    accent: "from-blue-600 to-indigo-800",
  },
  {
    id: "individual",
    name: "Individual",
    badge: "Most Popular",
    price: 119,
    currency: "₹",
    period: "month",
    durationDays: 30,
    accounts: 1,
    tagline: "1 Premium account for unlimited music & podcasts",
    features: [
      "100% ad-free music listening on all devices",
      "Download 10,000 songs/device on up to 5 devices",
      "Play songs in any order with unlimited skips",
      "High-Fidelity Lossless 320 kbps audio quality",
      "Listen together with friends in real-time (Jam)",
      "Cancel anytime online with one click",
    ],
    popular: true,
    accent: "from-[#1ed760] to-[#128038]",
  },
  {
    id: "duo",
    name: "Duo",
    badge: "For 2 People",
    price: 149,
    currency: "₹",
    period: "month",
    durationDays: 30,
    accounts: 2,
    tagline: "2 Premium accounts for a couple under one roof",
    features: [
      "2 separate Premium accounts for people living together",
      "Duo Mix: shared playlist curated for two",
      "Ad-free music listening on mobile, desktop, TV",
      "Download songs for offline listening",
      "High-Fidelity 320 kbps audio quality",
      "Cancel anytime online",
    ],
    accent: "from-amber-500 to-orange-700",
  },
  {
    id: "family",
    name: "Family",
    badge: "Best Value",
    price: 179,
    currency: "₹",
    period: "month",
    durationDays: 30,
    accounts: 6,
    tagline: "Up to 6 Premium accounts for family members",
    features: [
      "Up to 6 separate Premium accounts for family",
      "Explicit content filter for kids",
      "Spotify Kids app access",
      "Family Mix: playlist for your whole family",
      "Ad-free music listening & offline downloads",
      "Separate recommendations for every account",
    ],
    accent: "from-purple-600 to-indigo-900",
  },
  {
    id: "student",
    name: "Student",
    badge: "50% Discount",
    price: 59,
    currency: "₹",
    period: "month",
    durationDays: 30,
    accounts: 1,
    tagline: "Discount for eligible university students",
    features: [
      "Special discount for verified university students",
      "100% ad-free music listening",
      "Download songs to listen offline without internet",
      "Play songs in any order with unlimited skips",
      "High-Fidelity Lossless 320 kbps audio",
      "Renewable every year for up to 4 years",
    ],
    accent: "from-pink-500 to-rose-700",
  },
];

const Premium = () => {
  const navigate = useNavigate();
  const {
    user,
    subscription,
    fetchSubscription,
    subscribePlan,
    cancelSubscription,
    paymentLoading,
  } = UserData();

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardName, setCardName] = useState(user?.name || "");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [receiptModal, setReceiptModal] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchSubscription();
  }, []);

  const handleOpenCheckout = (plan) => {
    setSelectedPlan(plan);
    setCheckoutModalOpen(true);
  };

  const formatCardNumber = (value) => {
    const raw = value.replace(/\D/g, "").slice(0, 16);
    return raw.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  const formatExpiry = (value) => {
    const raw = value.replace(/\D/g, "").slice(0, 4);
    if (raw.length >= 3) {
      return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
    }
    return raw;
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPlan) return;

    setIsProcessing(true);

    const billingDetails = {
      name: cardName || user?.name || "Spotify Listener",
      email: user?.email || "listener@spotify.com",
      last4: cardNumber ? cardNumber.replace(/\s/g, "").slice(-4) : "4242",
      upiId: paymentMethod === "upi" ? upiId : "",
      bank: paymentMethod === "netbanking" ? selectedBank : "",
    };

    // Simulate realistic bank verification latency
    setTimeout(async () => {
      const result = await subscribePlan(selectedPlan.id, paymentMethod, billingDetails);
      setIsProcessing(false);

      if (result?.success) {
        setCheckoutModalOpen(false);
        setReceiptModal(result.receipt || {
          planName: selectedPlan.name,
          amount: selectedPlan.price,
          currency: "INR",
          paymentMethod,
          receiptNumber: `SP-${Date.now().toString().slice(-6)}`,
          expiresAt: new Date(Date.now() + selectedPlan.durationDays * 24 * 60 * 60 * 1000),
        });
      }
    }, 1200);
  };

  const isUserPremium = user?.isPremium;

  return (
    <div className="min-h-screen bg-[#000000] text-white">
      {/* Top Header */}
      <header className="sticky top-0 z-40 border-b border-[#282828] bg-[#000000]/95 px-6 py-4 backdrop-blur-md md:px-12">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate("/home")}
              className="flex items-center gap-2 text-white transition hover:text-[#1ed760]"
            >
              <img
                src={assets.spotify_logo}
                alt="Spotify Logo"
                className="h-9 w-9 object-contain"
              />
              <span className="text-xl font-bold tracking-tight">Spotify</span>
              <span className="rounded bg-[#1ed760] px-1.5 py-0.5 text-[11px] font-bold text-black uppercase">
                Premium
              </span>
            </button>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1 text-sm font-semibold text-[#b3b3b3] hover:text-white"
            >
              <MdArrowBack className="text-lg" /> Back to Web Player
            </button>

            {isUserPremium && (
              <span className="flex items-center gap-1.5 rounded-full bg-[#1ed760]/20 px-3 py-1 text-xs font-bold text-[#1ed760] border border-[#1ed760]/40">
                <MdVerified /> Active: {user?.premiumPlan}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#1d3557] via-[#121212] to-[#000000] px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-5xl text-center">
          {isUserPremium ? (
            <div className="inline-flex items-center gap-2 rounded-full bg-[#1ed760] px-4 py-1.5 text-xs font-bold text-black mb-6">
              <MdStar className="text-base" /> PREMIUM MEMBER
            </div>
          ) : (
            <span className="inline-block rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-[#1ed760] mb-6 border border-[#1ed760]/30">
              Pick Your Premium Plan
            </span>
          )}

          <h1 className="text-4xl font-extrabold tracking-tight md:text-6xl text-white">
            {isUserPremium
              ? `You're on Spotify Premium ${user?.premiumPlan || ""}`
              : "Listen without limits. Try 1 month of Premium for ₹0."}
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-[#b3b3b3] md:text-xl">
            {isUserPremium
              ? `Enjoy unlimited ad-free music, offline listening, and high-fidelity audio. Your plan is active.`
              : "Only ₹119/month after. Cancel anytime. Ad-free music listening, offline playback, and unlimited skips."}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            {!isUserPremium ? (
              <>
                <button
                  onClick={() => handleOpenCheckout(DEFAULT_PLANS[1])}
                  className="spotify-btn-green text-base px-8 py-3.5 shadow-2xl"
                >
                  Get 1 Month Free
                </button>
                <a
                  href="#plans"
                  className="spotify-btn-outline text-base px-8 py-3.5"
                >
                  View All Plans
                </a>
              </>
            ) : (
              <div className="rounded-2xl border border-[#282828] bg-[#181818] p-6 max-w-md w-full text-left mx-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-[#b3b3b3] font-bold">Current Plan</span>
                  <span className="rounded bg-[#1ed760]/20 px-2.5 py-0.5 text-xs font-bold text-[#1ed760]">
                    Active
                  </span>
                </div>
                <h3 className="text-2xl font-bold mt-2">Spotify Premium {user?.premiumPlan}</h3>
                <p className="text-sm text-[#b3b3b3] mt-1">
                  Valid until: {user?.premiumExpiresAt ? new Date(user.premiumExpiresAt).toLocaleDateString() : "Active"}
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => cancelSubscription()}
                    className="text-xs text-red-400 hover:text-red-300 underline"
                  >
                    Cancel Subscription
                  </button>
                  <a href="#plans" className="text-xs text-[#1ed760] hover:underline ml-auto font-semibold">
                    Change Plan →
                  </a>
                </div>
              </div>
            )}
          </div>

          <p className="mt-6 text-xs text-[#727272]">
            Terms and conditions apply. 1 month free not available for users who have already tried Premium.
          </p>
        </div>
      </section>

      {/* Why Go Premium Features */}
      <section className="px-6 py-16 md:px-12 bg-[#121212]">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-center text-3xl font-bold text-white md:text-4xl">
            Why go Premium?
          </h2>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#282828] bg-[#181818] p-6 text-center transition hover:border-[#1ed760]/40 hover:bg-[#202020]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1ed760]/10 text-[#1ed760]">
                <MdDownload className="text-3xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Download music</h3>
              <p className="mt-2 text-sm text-[#b3b3b3]">
                Listen anywhere, even without Wi-Fi or data connection.
              </p>
            </div>

            <div className="rounded-xl border border-[#282828] bg-[#181818] p-6 text-center transition hover:border-[#1ed760]/40 hover:bg-[#202020]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1ed760]/10 text-[#1ed760]">
                <MdBlock className="text-3xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Ad-free music</h3>
              <p className="mt-2 text-sm text-[#b3b3b3]">
                Enjoy uninterrupted music without any annoying ads.
              </p>
            </div>

            <div className="rounded-xl border border-[#282828] bg-[#181818] p-6 text-center transition hover:border-[#1ed760]/40 hover:bg-[#202020]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1ed760]/10 text-[#1ed760]">
                <MdSkipNext className="text-3xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Play any song</h3>
              <p className="mt-2 text-sm text-[#b3b3b3]">
                Even on mobile, play any track in any order with unlimited skips.
              </p>
            </div>

            <div className="rounded-xl border border-[#282828] bg-[#181818] p-6 text-center transition hover:border-[#1ed760]/40 hover:bg-[#202020]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1ed760]/10 text-[#1ed760]">
                <MdHighQuality className="text-3xl" />
              </div>
              <h3 className="mt-4 text-lg font-bold">Lossless 320kbps Audio</h3>
              <p className="mt-2 text-sm text-[#b3b3b3]">
                Experience ultra-clear audio fidelity for true music lovers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Plan Cards Section */}
      <section id="plans" className="px-6 py-20 md:px-12 bg-[#000000]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-white md:text-5xl">
              Affordable plans for any situation
            </h2>
            <p className="mt-4 text-base text-[#b3b3b3]">
              Choose a Premium plan and listen to ad-free music without limits on your phone, speaker, and other devices.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {DEFAULT_PLANS.map((plan) => {
              const isCurrent = user?.premiumPlan?.toLowerCase() === plan.name.toLowerCase();

              return (
                <div
                  key={plan.id}
                  className={`relative flex flex-col justify-between rounded-2xl border p-6 transition duration-300 hover:scale-[1.02] ${
                    plan.popular
                      ? "border-[#1ed760] bg-[#1a1a1a] shadow-[0_0_30px_rgba(30,215,96,0.18)]"
                      : "border-[#282828] bg-[#181818] hover:border-[#3e3e3e]"
                  }`}
                >
                  <div>
                    {/* Badge */}
                    <div className="flex items-center justify-between">
                      <span className="rounded px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-black bg-[#ffd2d2]">
                        {plan.badge}
                      </span>
                      {plan.popular && (
                        <span className="rounded bg-[#1ed760] px-2 py-0.5 text-[10px] font-extrabold uppercase text-black">
                          Popular
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 text-2xl font-bold">{plan.name}</h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold">{plan.currency}{plan.price}</span>
                      <span className="text-xs text-[#b3b3b3]">/ {plan.period}</span>
                    </div>
                    <p className="mt-1 text-xs text-[#727272]">
                      {plan.accounts} account{plan.accounts > 1 ? "s" : ""}
                    </p>

                    <hr className="my-5 border-[#282828]" />

                    {/* Features list */}
                    <ul className="space-y-3 text-xs text-[#d1d1d1]">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2.5">
                          <MdCheck className="shrink-0 text-base text-[#1ed760] mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8">
                    {isCurrent ? (
                      <div className="rounded-full bg-[#1ed760]/20 py-3 text-center text-xs font-bold text-[#1ed760] border border-[#1ed760]/40">
                        Current Active Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenCheckout(plan)}
                        className={`w-full py-3.5 text-xs font-bold uppercase tracking-wider rounded-full transition ${
                          plan.popular
                            ? "bg-[#1ed760] text-black hover:bg-[#1fdf64] hover:scale-105"
                            : "bg-white text-black hover:bg-[#f0f0f0] hover:scale-105"
                        }`}
                      >
                        Get Started
                      </button>
                    )}
                    <p className="mt-3 text-center text-[10px] text-[#727272]">
                      Terms apply. Cancel anytime.
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="px-6 py-16 md:px-12 bg-[#121212] border-t border-[#282828]">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-2xl font-bold md:text-3xl">Experience the difference</h2>
          <div className="mt-8 overflow-x-auto">
            <table className="w-full text-left text-sm text-[#b3b3b3]">
              <thead>
                <tr className="border-b border-[#282828] text-white">
                  <th className="py-4">What you get</th>
                  <th className="py-4 text-center">Spotify Free</th>
                  <th className="py-4 text-center text-[#1ed760]">Spotify Premium</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#282828]">
                <tr>
                  <td className="py-3 font-medium text-white">Ad-free music listening</td>
                  <td className="py-3 text-center text-red-400">✕</td>
                  <td className="py-3 text-center text-[#1ed760] font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Download to listen offline</td>
                  <td className="py-3 text-center text-red-400">✕</td>
                  <td className="py-3 text-center text-[#1ed760] font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Play songs in any order</td>
                  <td className="py-3 text-center text-red-400">✕</td>
                  <td className="py-3 text-center text-[#1ed760] font-bold">✓</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Audio Quality</td>
                  <td className="py-3 text-center">Standard (160 kbps)</td>
                  <td className="py-3 text-center text-[#1ed760] font-bold">Lossless (320 kbps)</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium text-white">Unlimited Skips</td>
                  <td className="py-3 text-center text-red-400">✕ (6/hr)</td>
                  <td className="py-3 text-center text-[#1ed760] font-bold">✓ (Unlimited)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Checkout Modal */}
      {checkoutModalOpen && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-2xl border border-[#282828] bg-[#181818] p-6 shadow-2xl md:p-8">
            <button
              onClick={() => !isProcessing && setCheckoutModalOpen(false)}
              className="absolute right-4 top-4 text-gray-400 hover:text-white"
            >
              <MdClose className="text-2xl" />
            </button>

            <div className="flex items-center gap-3">
              <img src={assets.spotify_logo} alt="Spotify" className="h-8 w-8" />
              <div>
                <h3 className="text-xl font-bold text-white">
                  Spotify Premium {selectedPlan.name}
                </h3>
                <p className="text-xs text-[#b3b3b3]">
                  ₹{selectedPlan.price} / {selectedPlan.period} • Secure 256-bit SSL Checkout
                </p>
              </div>
            </div>

            {/* Payment Method Switcher */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition ${
                  paymentMethod === "card"
                    ? "border-[#1ed760] bg-[#1ed760]/10 text-white"
                    : "border-[#282828] bg-[#121212] text-[#b3b3b3] hover:border-white/20"
                }`}
              >
                <MdCreditCard className="text-xl" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition ${
                  paymentMethod === "upi"
                    ? "border-[#1ed760] bg-[#1ed760]/10 text-white"
                    : "border-[#282828] bg-[#121212] text-[#b3b3b3] hover:border-white/20"
                }`}
              >
                <MdQrCode2 className="text-xl" />
                <span>UPI / QR</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("netbanking")}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-semibold transition ${
                  paymentMethod === "netbanking"
                    ? "border-[#1ed760] bg-[#1ed760]/10 text-white"
                    : "border-[#282828] bg-[#121212] text-[#b3b3b3] hover:border-white/20"
                }`}
              >
                <MdAccountBalance className="text-xl" />
                <span>Net Banking</span>
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handlePaymentSubmit} className="mt-6 space-y-4">
              {paymentMethod === "card" && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-[#b3b3b3]">
                      Name on Card
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#282828] bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#1ed760]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#b3b3b3]">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={19}
                      placeholder="4242 •••• •••• 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      className="mt-1 w-full rounded-lg border border-[#282828] bg-[#121212] px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-[#1ed760]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-[#b3b3b3]">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={5}
                        placeholder="12/28"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                        className="mt-1 w-full rounded-lg border border-[#282828] bg-[#121212] px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-[#1ed760]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#b3b3b3]">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        required
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ""))}
                        className="mt-1 w-full rounded-lg border border-[#282828] bg-[#121212] px-3.5 py-2.5 text-sm font-mono text-white outline-none focus:border-[#1ed760]"
                      />
                    </div>
                  </div>
                </>
              )}

              {paymentMethod === "upi" && (
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#282828] bg-[#121212] p-4 text-center">
                    <p className="text-xs text-[#b3b3b3]">Scan to pay with any UPI App</p>
                    <div className="mx-auto my-3 flex h-36 w-36 items-center justify-center rounded-lg border border-[#282828] bg-white p-2">
                      <MdQrCode2 className="text-9xl text-black" />
                    </div>
                    <span className="text-[11px] font-semibold text-[#1ed760]">
                      Google Pay • PhonePe • Paytm • BHIM
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#b3b3b3]">
                      Or Enter UPI ID (VPA)
                    </label>
                    <input
                      type="text"
                      placeholder="username@okhdfcbank"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-[#282828] bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#1ed760]"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div>
                  <label className="block text-xs font-semibold text-[#b3b3b3]">
                    Select Your Bank
                  </label>
                  <select
                    value={selectedBank}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-[#282828] bg-[#121212] px-3.5 py-2.5 text-sm text-white outline-none focus:border-[#1ed760]"
                  >
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="State Bank of India">State Bank of India (SBI)</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                    <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                    <option value="Punjab National Bank">Punjab National Bank</option>
                  </select>
                </div>
              )}

              {/* Price summary */}
              <div className="rounded-xl bg-[#121212] p-3 text-xs text-[#b3b3b3] space-y-1">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="text-white font-semibold">Spotify Premium {selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Amount (incl. taxes):</span>
                  <span className="text-white font-bold text-sm">₹{selectedPlan.price}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isProcessing || paymentLoading}
                className="spotify-btn-green w-full py-3.5 text-sm font-bold shadow-lg disabled:opacity-50"
              >
                {isProcessing ? "Processing Secure Payment..." : `Pay ₹${selectedPlan.price} & Activate Premium`}
              </button>

              <p className="flex items-center justify-center gap-1.5 text-[11px] text-[#727272]">
                <MdSecurity className="text-sm text-[#1ed760]" />
                Encrypted via Spotify Secure Gateway. Cancel anytime.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
          <div className="w-full max-w-md rounded-2xl border border-[#1ed760]/40 bg-[#181818] p-6 text-center shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#1ed760] text-black">
              <MdCheck className="text-4xl" />
            </div>

            <h3 className="mt-4 text-2xl font-extrabold text-white">
              Welcome to Spotify Premium!
            </h3>
            <p className="mt-1 text-sm text-[#b3b3b3]">
              Your account has been upgraded to <strong className="text-[#1ed760]">{receiptModal.planName}</strong>
            </p>

            <div className="my-6 rounded-xl border border-[#282828] bg-[#121212] p-4 text-left text-xs space-y-2 text-[#b3b3b3]">
              <div className="flex justify-between">
                <span>Receipt Number:</span>
                <span className="font-mono text-white">{receiptModal.receiptNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>Plan:</span>
                <span className="text-white font-semibold">{receiptModal.planName}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount Paid:</span>
                <span className="text-[#1ed760] font-bold">₹{receiptModal.amount}</span>
              </div>
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="uppercase text-white">{receiptModal.paymentMethod}</span>
              </div>
              <div className="flex justify-between">
                <span>Valid Until:</span>
                <span className="text-white">
                  {new Date(receiptModal.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setReceiptModal(null);
                navigate("/home");
              }}
              className="spotify-btn-green w-full py-3 text-sm font-bold"
            >
              Start Listening Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Premium;
