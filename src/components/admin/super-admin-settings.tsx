"use client";

import * as React from "react";
import { Eye, EyeOff, Save, ShieldCheck, KeyRound, CreditCard, Bot, Copy, IndianRupee, DollarSign } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PLANS } from "@/lib/data/plans";
import { cn } from "@/lib/utils";

type Role = "user" | "admin" | "superadmin";

/** Masked secret input with reveal toggle. */
function SecretInput({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="pr-9 font-mono text-xs"
        />
        <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

export function SuperAdminSettings() {
  const [role, setRole] = React.useState<Role>("superadmin");
  const [ai, setAi] = React.useState({ openai: "", gemini: "", model: "gpt-4o-mini", provider: "openai" });
  const [pay, setPay] = React.useState({
    defaultProvider: "razorpay",
    stripeSecret: "",
    stripePublishable: "",
    stripeWebhook: "",
    razorpayId: "",
    razorpaySecret: "",
    razorpayWebhook: "",
  });
  const [prices, setPrices] = React.useState(
    PLANS.map((p) => ({ id: p.id, name: p.name, usd: p.priceUsd, inr: p.priceInr }))
  );

  // Load any demo-saved values.
  React.useEffect(() => {
    try {
      const r = localStorage.getItem("cf_role") as Role | null;
      if (r) setRole(r);
      const a = JSON.parse(localStorage.getItem("cf_ai_settings") || "null");
      if (a) setAi(a);
      const p = JSON.parse(localStorage.getItem("cf_pay_settings") || "null");
      if (p) setPay(p);
      const pr = JSON.parse(localStorage.getItem("cf_price_settings") || "null");
      if (pr) setPrices(pr);
    } catch {}
  }, []);

  const isSuper = role === "superadmin";

  function save(key: string, value: unknown, msg: string) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {}
    toast.success(msg);
  }

  return (
    <div className="space-y-6">
      {/* Role & access */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-primary" /> Access & role</CardTitle>
          <CardDescription>Super admin can edit API keys, payment providers and pricing. Others are read-only.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-muted-foreground">Your role:</span>
            <Badge variant={isSuper ? "pro" : "secondary"} className="capitalize">{role}</Badge>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Preview as</span>
              <Select value={role} onValueChange={(v) => { setRole(v as Role); localStorage.setItem("cf_role", v); }}>
                <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="superadmin">Super admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="rounded-xl border border-border bg-secondary/40 p-4">
            <p className="text-sm font-medium">How to become super admin in production</p>
            <p className="mt-1 text-xs text-muted-foreground">Run this in the Supabase SQL editor (super admin = admin role):</p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 overflow-x-auto rounded-lg bg-background px-3 py-2 font-mono text-xs">
                update profiles set role=&apos;admin&apos; where email=&apos;you@example.com&apos;;
              </code>
              <Button variant="ghost" size="icon-sm" onClick={() => { navigator.clipboard?.writeText("update profiles set role='admin' where email='you@example.com';"); toast.success("Copied"); }}>
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">RLS then unlocks template/flag/settings writes automatically via the <code>is_admin()</code> policy.</p>
          </div>
        </CardContent>
      </Card>

      {/* AI providers */}
      <Card className={cn(!isSuper && "opacity-60")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bot className="h-4 w-4 text-primary" /> AI providers</CardTitle>
          <CardDescription>Whisper transcription (OpenAI) and translation (OpenAI or Gemini).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <fieldset disabled={!isSuper} className="space-y-4">
            <SecretInput label="OpenAI API key" value={ai.openai} onChange={(v) => setAi({ ...ai, openai: v })} placeholder="sk-..." />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>OpenAI model</Label>
                <Input value={ai.model} onChange={(e) => setAi({ ...ai, model: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>Translation provider</Label>
                <Select value={ai.provider} onValueChange={(v) => setAi({ ...ai, provider: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">OpenAI</SelectItem>
                    <SelectItem value="gemini">Google Gemini</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <SecretInput label="Gemini API key" value={ai.gemini} onChange={(v) => setAi({ ...ai, gemini: v })} placeholder="AIza..." />
            <Button onClick={() => save("cf_ai_settings", ai, "AI settings saved")}><Save className="h-4 w-4" /> Save AI settings</Button>
          </fieldset>
        </CardContent>
      </Card>

      {/* Payments */}
      <Card className={cn(!isSuper && "opacity-60")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-primary" /> Payment providers</CardTitle>
          <CardDescription>Razorpay for India, Stripe for international. Choose the default checkout.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <fieldset disabled={!isSuper} className="space-y-5">
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">Default provider</p>
                <p className="text-xs text-muted-foreground">Which gateway new checkouts use by default.</p>
              </div>
              <div className="flex items-center rounded-full border border-border bg-secondary p-0.5">
                {(["razorpay", "stripe"] as const).map((prov) => (
                  <button
                    key={prov}
                    onClick={() => setPay({ ...pay, defaultProvider: prov })}
                    className={cn("rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors", pay.defaultProvider === prov ? "bg-background shadow-sm" : "text-muted-foreground")}
                  >
                    {prov === "razorpay" ? "🇮🇳 Razorpay" : "🌍 Stripe"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4 rounded-xl border border-border p-4">
                <p className="flex items-center gap-1.5 text-sm font-semibold"><IndianRupee className="h-4 w-4" /> Razorpay (India)</p>
                <SecretInput label="Key ID" value={pay.razorpayId} onChange={(v) => setPay({ ...pay, razorpayId: v })} placeholder="rzp_live_..." />
                <SecretInput label="Key secret" value={pay.razorpaySecret} onChange={(v) => setPay({ ...pay, razorpaySecret: v })} />
                <SecretInput label="Webhook secret" value={pay.razorpayWebhook} onChange={(v) => setPay({ ...pay, razorpayWebhook: v })} />
              </div>
              <div className="space-y-4 rounded-xl border border-border p-4">
                <p className="flex items-center gap-1.5 text-sm font-semibold"><DollarSign className="h-4 w-4" /> Stripe (International)</p>
                <SecretInput label="Secret key" value={pay.stripeSecret} onChange={(v) => setPay({ ...pay, stripeSecret: v })} placeholder="sk_live_..." />
                <SecretInput label="Publishable key" value={pay.stripePublishable} onChange={(v) => setPay({ ...pay, stripePublishable: v })} placeholder="pk_live_..." />
                <SecretInput label="Webhook secret" value={pay.stripeWebhook} onChange={(v) => setPay({ ...pay, stripeWebhook: v })} placeholder="whsec_..." />
              </div>
            </div>
            <Button onClick={() => save("cf_pay_settings", pay, "Payment settings saved")}><Save className="h-4 w-4" /> Save payment settings</Button>
          </fieldset>
        </CardContent>
      </Card>

      {/* Plan pricing */}
      <Card className={cn(!isSuper && "opacity-60")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><KeyRound className="h-4 w-4 text-primary" /> Plan pricing</CardTitle>
          <CardDescription>Edit monthly prices shown on the pricing page (USD & INR).</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset disabled={!isSuper} className="space-y-3">
            {prices.map((p, i) => (
              <div key={p.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 rounded-xl border border-border p-3">
                <span className="text-sm font-medium">{p.name}</span>
                <div className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <Input type="number" value={p.usd} onChange={(e) => setPrices((pr) => pr.map((x, j) => j === i ? { ...x, usd: +e.target.value } : x))} className="h-8 w-24" />
                </div>
                <div className="flex items-center gap-1">
                  <IndianRupee className="h-3.5 w-3.5 text-muted-foreground" />
                  <Input type="number" value={p.inr} onChange={(e) => setPrices((pr) => pr.map((x, j) => j === i ? { ...x, inr: +e.target.value } : x))} className="h-8 w-28" />
                </div>
              </div>
            ))}
            <Button onClick={() => save("cf_price_settings", prices, "Pricing updated")}><Save className="h-4 w-4" /> Save pricing</Button>
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}
