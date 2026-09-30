"use client";

import * as React from "react";
import Link from "next/link";
import { Search, Sparkles } from "lucide-react";
import { CaptionPreview } from "@/components/caption-preview";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Zap } from "lucide-react";
import { CATEGORIES } from "@/lib/data/categories";
import { TEMPLATES, TEMPLATE_COUNT } from "@/lib/data/templates";
import type { TemplateCategory } from "@/lib/types";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { cn } from "@/lib/utils";

const GRADS = ["grad:violet", "grad:amber", "grad:emerald", "grad:pink", "grad:cyan", "grad:indigo"];

export default function TemplatesPage() {
  const [cat, setCat] = React.useState<TemplateCategory | "all">("all");
  const [q, setQ] = React.useState("");

  const list = TEMPLATES.filter(
    (t) => (cat === "all" || t.category === cat) && (t.name.toLowerCase().includes(q.toLowerCase()) || t.description.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Template library</h1>
          <p className="mt-1 text-sm text-muted-foreground">{TEMPLATE_COUNT}+ original styles across {CATEGORIES.length} categories</p>
        </div>
        <Button asChild>
          <Link href="/upload"><Sparkles className="h-4 w-4" /> Use in a video</Link>
        </Button>
      </div>

      <div className="relative mt-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search all templates…"
          className="h-9 w-full rounded-full border border-border bg-secondary/60 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="no-scrollbar mt-4 flex gap-1.5 overflow-x-auto pb-1">
        <button
          onClick={() => setCat("all")}
          className={cn("shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium", cat === "all" ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground")}
        >
          All
        </button>
        {CATEGORIES.filter((c) => c.id !== "for-you").map((c) => (
          <button
            key={c.id}
            onClick={() => setCat(c.id)}
            className={cn("flex shrink-0 items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium", cat === c.id ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground")}
          >
            {c.label}
            {c.hasAI && <span className="rounded-full bg-fuchsia-500/15 px-1 text-[9px] font-bold text-fuchsia-500">AI</span>}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {list.map((t, i) => (
          <Link key={t.id} href={`/styles?template=${t.id}`} className="group relative block overflow-hidden rounded-2xl border border-border transition-transform hover:-translate-y-1 hover:shadow-xl">
            {t.popular && <span className="absolute -left-8 top-3 z-10 -rotate-45 bg-primary px-8 py-0.5 text-[9px] font-bold uppercase text-primary-foreground">Popular</span>}
            {t.is_pro && <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur"><Crown className="h-3.5 w-3.5 text-amber-300" /></span>}
            {t.credits_per_min > 1 && <span className="absolute bottom-9 right-2 z-10 flex items-center gap-0.5 rounded-full bg-black/55 px-1.5 py-0.5 text-[10px] text-white"><Zap className="h-2.5 w-2.5 text-amber-300" />{t.credits_per_min}/min</span>}
            <CaptionPreview spec={t.spec} segments={SAMPLE_SEGMENTS} duration={SAMPLE_DURATION} aspect="9:16" background={GRADS[i % GRADS.length]} quality={0.7} />
            <div className="px-2.5 py-2">
              <p className="truncate text-xs font-medium">{t.name}</p>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-16 text-center text-muted-foreground">No templates found.</p>}
    </div>
  );
}
