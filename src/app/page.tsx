"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Languages,
  Wand2,
  Gauge,
  Palette,
  Film,
  Check,
  Star,
  Download,
  Layers,
} from "lucide-react";
import { MarketingNav } from "@/components/marketing/nav";
import { TemplateMarquee } from "@/components/marketing/marquee";
import { CaptionPreview } from "@/components/caption-preview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Logo } from "@/components/brand/logo";
import { TEMPLATES_BY_ID, TEMPLATE_COUNT } from "@/lib/data/templates";
import { LANGUAGES } from "@/lib/data/languages";
import { PLANS } from "@/lib/data/plans";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { formatCurrency } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] } }),
};

const FEATURES = [
  { icon: Wand2, title: "One-click AI captions", body: "Whisper transcription with word-level timestamps and automatic language detection." },
  { icon: Languages, title: "50+ languages", body: "Caption and translate into Tamil, Hindi, Spanish, Arabic and dozens more — export SRT/VTT." },
  { icon: Palette, title: `${TEMPLATE_COUNT}+ original styles`, body: "Bold, karaoke, spatial, behind-the-person and regional Indic templates, all customizable." },
  { icon: Gauge, title: "60fps live preview", body: "A shared render spec means what you preview is exactly what exports — no surprises." },
  { icon: Film, title: "4K burned-in export", body: "Queue-based FFmpeg workers render 720p, 1080p and 4K MP4 with email notifications." },
  { icon: Layers, title: "Timeline & word effects", body: "Waveform timeline, draggable blocks, active-word highlights, glow, karaoke and more." },
];

const FAQ = [
  { q: "How accurate are the captions?", a: "CaptionForge uses OpenAI Whisper for transcription with word-level timestamps, then lets you fix anything instantly in the editor with undo/redo and keyboard shortcuts." },
  { q: "Which languages are supported?", a: `We support ${LANGUAGES.length - 1}+ languages including Tamil, Hindi, Telugu, Malayalam, Kannada, Arabic and Spanish, with fonts that render Indic scripts correctly.` },
  { q: "Do exports match the preview?", a: "Yes. Preview (Canvas) and export (FFmpeg/ASS) are driven by the same render spec, so your 4K MP4 looks identical to what you see while editing." },
  { q: "Can I pay in India?", a: "Absolutely. We support Razorpay for India and Stripe internationally, with monthly plans, credits, and easy upgrades or cancellation." },
  { q: "Is there a free plan?", a: "Yes — the Free plan includes 30 AI credits per month and 720p watermarked exports so you can try everything." },
];

export default function LandingPage() {
  const heroTemplates = ["big-money", "lyric-fill", "clean-pop"].map((id) => TEMPLATES_BY_ID[id]).filter(Boolean);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 aurora" />
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_60%)]" />

      <div className="relative z-10">
        <MarketingNav />

        {/* HERO */}
        <section className="mx-auto max-w-6xl px-4 pt-16 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <motion.div initial="hidden" animate="show" variants={fadeUp}>
                <Badge variant="outline" className="mb-5 gap-1.5 py-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> AI captions that stop the scroll
                </Badge>
              </motion.div>
              <motion.h1
                initial="hidden"
                animate="show"
                custom={1}
                variants={fadeUp}
                className="text-balance text-5xl font-semibold leading-[0.98] tracking-[-0.03em] md:text-7xl"
              >
                Captions your <span className="text-primary">audience</span> can’t ignore.
              </motion.h1>
              <motion.p
                initial="hidden"
                animate="show"
                custom={2}
                variants={fadeUp}
                className="mt-6 max-w-lg text-lg text-muted-foreground"
              >
                Upload a clip, get perfectly-timed captions in {LANGUAGES.length - 1}+ languages, style them with{" "}
                {TEMPLATE_COUNT}+ studio-grade templates, and export in 4K. All in your browser.
              </motion.p>
              <motion.div
                initial="hidden"
                animate="show"
                custom={3}
                variants={fadeUp}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <Button asChild size="lg">
                  <Link href="/signup">
                    Start for free <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="glass">
                  <Link href="/styles">Explore styles</Link>
                </Button>
              </motion.div>
              <motion.div
                initial="hidden"
                animate="show"
                custom={4}
                variants={fadeUp}
                className="mt-8 flex items-center gap-4 text-sm text-muted-foreground"
              >
                <div className="flex -space-x-2">
                  {["from-violet-500", "from-pink-500", "from-cyan-500", "from-amber-500"].map((c, i) => (
                    <span key={i} className={`h-7 w-7 rounded-full border-2 border-background bg-gradient-to-br ${c} to-indigo-600`} />
                  ))}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="ml-1">Loved by 12,000+ creators</span>
                </div>
              </motion.div>
            </div>

            {/* Hero preview trio */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative mx-auto flex max-w-md items-end justify-center gap-3"
            >
              {heroTemplates.map((t, i) => (
                <div
                  key={t.id}
                  className={`relative overflow-hidden rounded-3xl border border-border shadow-2xl ${
                    i === 1 ? "z-10 w-40 -translate-y-4 md:w-48" : "w-28 opacity-90 md:w-36"
                  }`}
                >
                  <CaptionPreview
                    spec={t.spec}
                    segments={SAMPLE_SEGMENTS}
                    duration={SAMPLE_DURATION}
                    aspect="9:16"
                    background={["grad:violet", "grad:cyan", "grad:amber"][i]}
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Marquee */}
        <section className="mt-20">
          <p className="mb-2 text-center text-xs uppercase tracking-widest text-muted-foreground">
            {TEMPLATE_COUNT}+ styles · 15 categories · fully customizable
          </p>
          <TemplateMarquee />
        </section>

        {/* FEATURES */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">
              Everything you need to caption faster
            </h2>
            <p className="mt-4 text-muted-foreground">
              From transcription to a pixel-perfect 4K export — one polished workflow.
            </p>
          </div>
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-80px" }}
                custom={i}
                variants={fadeUp}
                className="group glass rounded-2xl p-6 transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/12 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.body}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* PRICING */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-4xl font-semibold tracking-tight md:text-5xl">Simple, creator-friendly pricing</h2>
            <p className="mt-4 text-muted-foreground">Pay in USD or INR. Cancel anytime.</p>
          </div>
          <div className="mt-14 grid gap-4 lg:grid-cols-4">
            {PLANS.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.highlight ? "border-primary bg-primary/[0.04] shadow-[0_0_40px_-12px_hsl(var(--primary)/0.5)]" : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <Badge variant="pro" className="absolute -top-3 left-1/2 -translate-x-1/2">
                    Most popular
                  </Badge>
                )}
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.tagline}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-semibold tracking-tight">{formatCurrency(plan.priceUsd)}</span>
                  <span className="text-sm text-muted-foreground">/mo</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">or {formatCurrency(plan.priceInr, "INR")}/mo</p>
                <Button asChild className="mt-5" variant={plan.highlight ? "default" : "outline"}>
                  <Link href="/signup">{plan.id === "free" ? "Get started" : "Choose plan"}</Link>
                </Button>
                <ul className="mt-6 space-y-2.5 text-sm">
                  {plan.features.slice(0, 5).map((feat) => (
                    <li key={feat} className="flex gap-2 text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {feat}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl px-4 py-24">
          <h2 className="text-center text-4xl font-semibold tracking-tight md:text-5xl">Questions, answered</h2>
          <div className="mt-12 divide-y divide-border rounded-2xl border border-border bg-card">
            {FAQ.map((item) => (
              <details key={item.q} className="group px-6 py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-medium">
                  {item.q}
                  <span className="ml-4 text-muted-foreground transition-transform group-open:rotate-45">＋</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24">
          <div className="relative overflow-hidden rounded-3xl border border-border p-10 text-center md:p-16">
            <div className="absolute inset-0 aurora opacity-80" />
            <div className="relative z-10">
              <h2 className="mx-auto max-w-2xl text-balance text-4xl font-semibold tracking-tight md:text-5xl">
                Ship your next viral clip today
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
                Join thousands of creators captioning smarter with CaptionForge.
              </p>
              <Button asChild size="lg" className="mt-8">
                <Link href="/signup">
                  <Download className="h-4 w-4" /> Start free — no card required
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 px-4 py-10 md:flex-row">
            <Logo />
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <Link href="/templates" className="hover:text-foreground">Templates</Link>
              <Link href="/pricing" className="hover:text-foreground">Pricing</Link>
              <Link href="/login" className="hover:text-foreground">Log in</Link>
              <Link href="/help" className="hover:text-foreground">Help</Link>
              <Link href="/admin" className="hover:text-foreground">Admin</Link>
            </nav>
            <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CaptionForge</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
