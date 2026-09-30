import { apiError, hasEnv, json, safeJson } from "@/lib/api-helpers";
import { PLAN_MAP } from "@/lib/data/plans";
import type { PlanId } from "@/lib/types";

interface Body {
  planId: PlanId;
  provider: "stripe" | "razorpay";
  currency: "USD" | "INR";
}

/**
 * Creates a subscription checkout session.
 * - International: Stripe Checkout (STRIPE_SECRET_KEY + STRIPE_PRICE_* required)
 * - India: Razorpay Subscriptions (RAZORPAY_KEY_ID + RAZORPAY_KEY_SECRET required)
 * In demo mode (keys absent) it returns a friendly message so the UI still works.
 */
export async function POST(req: Request) {
  const body = await safeJson<Body>(req);
  if (!body?.planId || !PLAN_MAP[body.planId]) return apiError("Invalid plan", 422);

  const plan = PLAN_MAP[body.planId];
  if (plan.id === "free") return json({ message: "Free plan is already available — no checkout needed." });

  const origin = new URL(req.url).origin;

  // ---------- Stripe ----------
  if (body.provider === "stripe") {
    if (!hasEnv("STRIPE_SECRET_KEY")) {
      return json({ message: "Stripe is not configured. Add STRIPE_SECRET_KEY to go live." });
    }
    const priceId = process.env[`STRIPE_PRICE_${plan.id.toUpperCase()}`];
    if (!priceId) return apiError(`Missing STRIPE_PRICE_${plan.id.toUpperCase()}`, 500);

    const params = new URLSearchParams();
    params.set("mode", "subscription");
    params.set("line_items[0][price]", priceId);
    params.set("line_items[0][quantity]", "1");
    params.set("success_url", `${origin}/dashboard?checkout=success`);
    params.set("cancel_url", `${origin}/pricing?checkout=cancelled`);
    params.set("client_reference_id", body.planId);

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params,
    });
    const data = await res.json();
    if (!res.ok) return apiError(data.error?.message ?? "Stripe error", 502);
    return json({ url: data.url });
  }

  // ---------- Razorpay ----------
  if (body.provider === "razorpay") {
    if (!hasEnv("RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET")) {
      return json({ message: "Razorpay is not configured. Add RAZORPAY_KEY_ID / SECRET to go live." });
    }
    const planRef = process.env[`RAZORPAY_PLAN_${plan.id.toUpperCase()}`];
    if (!planRef) return apiError(`Missing RAZORPAY_PLAN_${plan.id.toUpperCase()}`, 500);

    const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64");
    const res = await fetch("https://api.razorpay.com/v1/subscriptions", {
      method: "POST",
      headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/json" },
      body: JSON.stringify({ plan_id: planRef, total_count: 12, customer_notify: 1 }),
    });
    const data = await res.json();
    if (!res.ok) return apiError(data.error?.description ?? "Razorpay error", 502);
    return json({ url: data.short_url, subscriptionId: data.id });
  }

  return apiError("Unknown provider", 422);
}
