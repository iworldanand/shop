import { createHmac, timingSafeEqual } from "crypto";
import { apiError, hasEnv, json } from "@/lib/api-helpers";
import { createAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/** Verify Stripe's `Stripe-Signature` header against the raw body. */
function verifyStripe(payload: string, header: string, secret: string): boolean {
  const parts = Object.fromEntries(header.split(",").map((p) => p.split("=")));
  const timestamp = parts["t"];
  const sig = parts["v1"];
  if (!timestamp || !sig) return false;
  const expected = createHmac("sha256", secret).update(`${timestamp}.${payload}`).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(sig));
  } catch {
    return false;
  }
}

const PRICE_TO_PLAN: Record<string, string> = {
  [process.env.STRIPE_PRICE_STARTER ?? "price_starter"]: "starter",
  [process.env.STRIPE_PRICE_PRO ?? "price_pro"]: "pro",
  [process.env.STRIPE_PRICE_BUSINESS ?? "price_business"]: "business",
};

export async function POST(req: Request) {
  const payload = await req.text();
  const sig = req.headers.get("stripe-signature") ?? "";

  if (!hasEnv("STRIPE_WEBHOOK_SECRET")) {
    return json({ received: true, demo: true, message: "STRIPE_WEBHOOK_SECRET not set." });
  }
  if (!verifyStripe(payload, sig, process.env.STRIPE_WEBHOOK_SECRET!)) {
    return apiError("Invalid signature", 400);
  }

  const event = JSON.parse(payload);
  const supabase = createAdminClient();

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object;
        const plan = s.client_reference_id ?? "pro";
        if (supabase && s.customer) {
          await supabase.from("subscriptions").upsert({
            stripe_customer_id: s.customer,
            stripe_subscription_id: s.subscription,
            plan,
            status: "active",
            provider: "stripe",
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      case "customer.subscription.updated": {
        const sub = event.data.object;
        const priceId = sub.items?.data?.[0]?.price?.id;
        if (supabase) {
          await supabase
            .from("subscriptions")
            .update({
              plan: PRICE_TO_PLAN[priceId] ?? "pro",
              status: sub.status,
              current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
            })
            .eq("stripe_subscription_id", sub.id);
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object;
        if (supabase) {
          await supabase.from("subscriptions").update({ status: "canceled" }).eq("stripe_subscription_id", sub.id);
        }
        break;
      }
      case "invoice.payment_succeeded": {
        const inv = event.data.object;
        if (supabase && inv.customer) {
          await supabase.from("payments").insert({
            provider: "stripe",
            provider_ref: inv.id,
            amount: (inv.amount_paid ?? 0) / 100,
            currency: (inv.currency ?? "usd").toUpperCase(),
            status: "succeeded",
          });
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
