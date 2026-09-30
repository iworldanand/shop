import { createHmac, timingSafeEqual } from "crypto";
import { apiError, hasEnv, json } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

function verifyRazorpay(payload: string, signature: string, secret: string): boolean {
  const expected = createHmac("sha256", secret).update(payload).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const payload = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!hasEnv("RAZORPAY_WEBHOOK_SECRET")) {
    return json({ received: true, demo: true, message: "RAZORPAY_WEBHOOK_SECRET not set." });
  }
  if (!verifyRazorpay(payload, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    return apiError("Invalid signature", 400);
  }

  const event = JSON.parse(payload);
  const supabase = createAdminClient();

  try {
    switch (event.event) {
      case "subscription.activated":
      case "subscription.charged": {
        const sub = event.payload.subscription?.entity;
        if (supabase && sub) {
          await supabase.from("subscriptions").upsert({
            razorpay_subscription_id: sub.id,
            status: "active",
            provider: "razorpay",
            current_period_end: sub.current_end ? new Date(sub.current_end * 1000).toISOString() : null,
            updated_at: new Date().toISOString(),
          });
        }
        if (supabase && event.payload.payment?.entity) {
          const p = event.payload.payment.entity;
          await supabase.from("payments").insert({
            provider: "razorpay",
            provider_ref: p.id,
            amount: (p.amount ?? 0) / 100,
            currency: p.currency ?? "INR",
            status: "succeeded",
          });
        }
        break;
      }
      case "subscription.cancelled":
      case "subscription.completed": {
        const sub = event.payload.subscription?.entity;
        if (supabase && sub) {
          await supabase.from("subscriptions").update({ status: "canceled" }).eq("razorpay_subscription_id", sub.id);
        }
        break;
      }
      default:
        break;
    }
  } catch (err: any) {
    return apiError(err?.message ?? "Webhook handler error", 500);
  }

  return json({ received: true });
}
