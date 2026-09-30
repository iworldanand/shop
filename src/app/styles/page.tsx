"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Search, Sliders, Sparkles, Video, FileText, X, Clock } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StyleCard } from "@/components/styles/style-card";
import { CustomizeDrawer } from "@/components/styles/customize-drawer";
import { CATEGORIES } from "@/lib/data/categories";
import { TEMPLATES, TEMPLATES_BY_ID } from "@/lib/data/templates";
import { LANGUAGES } from "@/lib/data/languages";
import type { RenderSpec, Template, TemplateCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

const GRADS = ["grad:violet", "grad:amber", "grad:emerald", "grad:pink", "grad:cyan", "grad:indigo"];
const FILTER_CHIPS = ["Free", "Pro", "Animated", "Multiline", "Minimal"] as const;

export default function StylePickerPage() {
  const router = useRouter();
  const [activeCat, setActiveCat] = React.useState<TemplateCategory>("popular");
  const [query, setQuery] = React.useState("");
  const [chips, setChips] = React.useState<string[]>([]);
  const [language, setLanguage] = React.useState("auto");
  const [outputMode, setOutputMode] = React.useState<"video" | "srt">("video");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const [customizeOpen, setCustomizeOpen] = React.useState(false);
  const [recentIds, setRecentIds] = React.useState<string[]>([]);
  const [myStyles, setMyStyles] = React.useState<Template[]>([]);

  React.useEffect(() => {
    try {
      const r = JSON.parse(localStorage.getItem("cf_recent_styles") || "[]");
      if (Array.isArray(r)) setRecentIds(r);
      const m = JSON.parse(localStorage.getItem("cf_my_styles") || "[]");
      if (Array.isArray(m)) setMyStyles(m);
    } catch {}
  }, []);

  const allTemplates = React.useMemo(() => [...myStyles, ...TEMPLATES], [myStyles]);

  const filtered = React.useMemo(() => {
    let list = allTemplates;

    if (activeCat === "for-you") {
      const recent = recentIds.map((id) => TEMPLATES_BY_ID[id]).filter(Boolean);
      const pop = TEMPLATES.filter((t) => t.popular);
      list = [...myStyles, ...recent, ...pop].filter((t, i, arr) => arr.findIndex((x) => x.id === t.id) === i);
    } else {
      list = allTemplates.filter((t) => t.category === activeCat);
    }

    if (query.trim()) {
      const q = query.toLowerCase();
      list = allTemplates.filter(
        (t) => t.name.toLowerCase().includes(q) || t.tags.some((tag) => tag.includes(q)) || t.description.toLowerCase().includes(q)
      );
    }

    for (const chip of chips) {
      if (chip === "Free") list = list.filter((t) => !t.is_pro);
      if (chip === "Pro") list = list.filter((t) => t.is_pro);
      if (chip === "Animated") list = list.filter((t) => t.tags.includes("animated") || t.spec.animation.in !== "none");
      if (chip === "Multiline") list = list.filter((t) => t.spec.layout.maxLines >= 2);
      if (chip === "Minimal") list = list.filter((t) => t.tags.includes("minimal") || t.category === "minimal");
    }
    return list;
  }, [allTemplates, activeCat, query, chips, recentIds, myStyles]);

  const selected = selectedId ? allTemplates.find((t) => t.id === selectedId) ?? TEMPLATES_BY_ID[selectedId] : null;
  const recentTemplates = recentIds.map((id) => TEMPLATES_BY_ID[id]).filter(Boolean).slice(0, 7);

  function toggleChip(chip: string) {
    setChips((c) => (c.includes(chip) ? c.filter((x) => x !== chip) : [...c, chip]));
  }

  function select(id: string) {
    setSelectedId(id);
    setRecentIds((prev) => {
      const next = [id, ...prev.filter((x) => x !== id)].slice(0, 12);
      try {
        localStorage.setItem("cf_recent_styles", JSON.stringify(next));
      } catch {}
      return next;
    });
  }

  function saveMyStyle(name: string, spec: RenderSpec) {
    if (!selected) return;
    const style: Template = {
      ...selected,
      id: `my-${Date.now()}`,
      name,
      spec,
      is_pro: false,
      popular: false,
      created_by: "me",
      tags: [...selected.tags, "custom"],
    };
    setMyStyles((prev) => {
      const next = [style, ...prev];
      try {
        localStorage.setItem("cf_my_styles", JSON.stringify(next));
      } catch {}
      return next;
    });
    setSelectedId(style.id);
  }

  function createVideo() {
    if (!selectedId) return toast.error("Pick a style first");
    try {
      localStorage.setItem("cf_selected_style", selectedId);
      localStorage.setItem("cf_language", language);
    } catch {}
    if (outputMode === "srt") {
      toast.success("Generating SRT with your selected language…");
    }
    router.push(`/editor/new?style=${selectedId}&lang=${language}&mode=${outputMode}`);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky top bar */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="icon-sm">
            <Link href="/upload"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="mr-2 hidden sm:block"><Logo showText={false} /></div>
          <h1 className="text-lg font-semibold tracking-tight">Pick a style</h1>

          <div className="ml-auto flex items-center gap-2">
            {/* Language dropdown */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="hidden w-40 sm:flex">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGES.map((l) => (
                  <SelectItem key={l.code} value={l.code}>
                    {l.name} {l.code !== "auto" && l.code !== "en" ? `· ${l.native}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Video / SRT toggle */}
            <div className="flex items-center rounded-full border border-border bg-secondary p-0.5">
              <button
                onClick={() => setOutputMode("video")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  outputMode === "video" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                <Video className="h-3.5 w-3.5" /> Video
              </button>
              <button
                onClick={() => setOutputMode("srt")}
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  outputMode === "srt" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                )}
              >
                <FileText className="h-3.5 w-3.5" /> SRT
              </button>
            </div>

            <ThemeToggle />
            <Button onClick={createVideo} className="gap-1.5">
              <Sparkles className="h-4 w-4" /> Create {outputMode === "video" ? "video" : "SRT"}
            </Button>
          </div>
        </div>

        {/* Category tabs */}
        <div className="no-scrollbar overflow-x-auto border-t border-border">
          <div className="mx-auto flex max-w-[1600px] items-center gap-1 px-4 py-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCat(cat.id);
                  setQuery("");
                }}
                className={cn(
                  "relative flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                  activeCat === cat.id && !query ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {activeCat === cat.id && !query && (
                  <motion.span layoutId="cat-pill" className="absolute inset-0 rounded-full bg-primary" transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                )}
                <span className="relative z-10">{cat.label}</span>
                {cat.hasAI && (
                  <span className={cn("relative z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold", activeCat === cat.id && !query ? "bg-white/25 text-white" : "bg-fuchsia-500/15 text-fuchsia-500")}>
                    AI
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Toolbar: search + filter chips */}
      <div className="mx-auto max-w-[1600px] px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative max-w-sm flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search styles…"
              className="h-9 w-full rounded-full border border-border bg-secondary/60 pl-9 pr-9 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => toggleChip(chip)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  chips.includes(chip) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>

        {/* Recently used */}
        {recentTemplates.length > 0 && !query && (
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" /> Recently used
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-7">
              {recentTemplates.map((t, i) => (
                <StyleCard key={`recent-${t.id}`} template={t} selected={selectedId === t.id} onSelect={() => select(t.id)} background={GRADS[i % GRADS.length]} index={i} />
              ))}
            </div>
          </div>
        )}

        {/* Category description */}
        {!query && (
          <p className="mt-6 text-sm text-muted-foreground">
            {CATEGORIES.find((c) => c.id === activeCat)?.description}{" "}
            <span className="text-foreground/60">· {filtered.length} styles</span>
          </p>
        )}

        {/* Grid */}
        <div className="mt-4 grid grid-cols-2 gap-3 pb-32 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-7">
          <AnimatePresence mode="popLayout">
            {filtered.map((t, i) => (
              <StyleCard key={t.id} template={t} selected={selectedId === t.id} onSelect={() => select(t.id)} background={GRADS[i % GRADS.length]} index={i} />
            ))}
          </AnimatePresence>
          {filtered.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center gap-2 py-20 text-center text-muted-foreground">
              <Search className="h-8 w-8" />
              <p>No styles match your filters.</p>
              <Button variant="outline" size="sm" onClick={() => { setChips([]); setQuery(""); }}>Clear filters</Button>
            </div>
          )}
        </div>
      </div>

      {/* Selected action bar */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 34 }}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 backdrop-blur-xl"
          >
            <div className="mx-auto flex max-w-[1600px] items-center gap-3 px-4 py-3">
              <div className="h-10 w-6 shrink-0 overflow-hidden rounded" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{selected.name}</p>
                  {selected.is_pro && <Badge variant="pro" className="text-[10px]">Pro</Badge>}
                  {selected.created_by === "me" && <Badge variant="secondary" className="text-[10px]">My style</Badge>}
                </div>
                <p className="truncate text-xs text-muted-foreground">{selected.description}</p>
              </div>
              <Button variant="outline" onClick={() => setCustomizeOpen(true)} className="gap-1.5">
                <Sliders className="h-4 w-4" /> Customize
              </Button>
              <Button onClick={createVideo} className="gap-1.5">
                <Sparkles className="h-4 w-4" /> Create
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <CustomizeDrawer
        template={selected ?? null}
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        onSave={saveMyStyle}
        background="grad:violet"
      />
    </div>
  );
}
