"use client";

import * as React from "react";
import { Check, Crown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS } from "@/lib/data/plans";
import { DEMO_SUBSCRIPTION } from "@/lib/data/sample";
import { formatCurrency, cn } from "@/lib/utils";

export default function PricingPage() {
  const [currency, setCurrency] = React.useState<"USD" | "INR">("USD");
  const [loading, setLoading] = React.useState<string | null>(null);

  async function checkout(planId: string) {
    setLoading(planId);
    try {
      const provider = currency === "INR" ? "razorpay" : "stripe";
      const res = await fetch(`/api/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId, provider, currency }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.info(data.message ?? `Checkout via ${provider} (demo mode — configure keys to go live).`);
      }
    } catch {
      toast.error("Could not start checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Plans & billing</h1>
        <p className="mt-2 text-muted-foreground">
          You’re on the <span className="font-medium text-foreground capitalize">{DEMO_SUBSCRIPTION.plan}</span> plan.
        </p>

        <div className="mt-6 inline-flex items-center rounded-full border border-border bg-secondary p-0.5">
          {(["USD", "INR"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCurrency(c)}
              className={cn("rounded-full px-4 py-1.5 text-sm font-medium transition-colors", currency === c ? "bg-background shadow-sm" : "text-muted-foreground")}
            >
              {c === "USD" ? "🌍 International (Stripe)" : "🇮🇳 India (Razorpay)"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-10 grid gap-4 lg:grid-cols-4">
        {PLANS.map((plan) => {
          const current = plan.id === DEMO_SUBSCRIPTION.plan;
          const price = currency === "USD" ? plan.priceUsd : plan.priceInr;
          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xl border p-6",
                plan.highlight ? "border-primary bg-primary/[0.04]" : "border-border bg-card"
              )}
            >
              {plan.highlight && <Badge variant="pro" className="absolute -top-3 left-1/2 -translate-x-1/2">Most popular</Badge>}
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                {plan.id !== "free" && plan.id !== "starter" && <Crown className="h-4 w-4 text-amber-400" />}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-3xl font-semibold tracking-tight">{formatCurrency(price, currency)}</span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <Button
                className="mt-5"
                variant={current ? "outline" : plan.highlight ? "default" : "outline"}
                disabled={current || !!loading}
                onClick={() => checkout(plan.id)}
              >
                {loading === plan.id ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {current ? "Current plan" : plan.id === "free" ? "Downgrade" : "Upgrade"}
              </Button>
              <ul className="mt-6 space-y-2.5 text-sm">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2 text-muted-foreground">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <h3 className="font-semibold">Manage subscription</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Upgrade, downgrade or cancel anytime. Changes are prorated. Invoices are available in your account.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("Opening billing portal (demo)")}>Billing portal</Button>
          <Button variant="outline" size="sm" onClick={() => toast.info("Cancellation scheduled at period end (demo)")}>Cancel plan</Button>
        </div>
      </div>
    </div>
  );
}
