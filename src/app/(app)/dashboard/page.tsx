"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Upload, Sparkles, Clock, Zap, Film, ArrowRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectCard } from "@/components/project-card";
import { CaptionPreview } from "@/components/caption-preview";
import { AnimatedCounter } from "@/components/animated-counter";
import { SAMPLE_PROJECTS, DEMO_USAGE, DEMO_SUBSCRIPTION } from "@/lib/data/sample";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { TEMPLATES } from "@/lib/data/templates";
import { formatDuration } from "@/lib/utils";

export default function DashboardPage() {
  const recentTemplates = React.useMemo(() => TEMPLATES.filter((t) => t.popular).slice(0, 6), []);
  const creditsLeft = DEMO_USAGE.creditsTotal - DEMO_USAGE.creditsUsed;
  const minutesLeft = DEMO_USAGE.previewMinutesTotal - DEMO_USAGE.previewMinutesUsed;
  const expiryDays = Math.max(
    0,
    Math.round((new Date(DEMO_USAGE.expiresAt).getTime() - Date.now()) / 86400000)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:px-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground">Welcome back 👋</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">Your studio</h1>
        </div>
        <Button asChild size="lg">
          <Link href="/upload">
            <Upload className="h-4 w-4" /> New video
          </Link>
        </Button>
      </motion.div>

      {/* Usage meters */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Zap, label: "AI credits left", value: creditsLeft, total: DEMO_USAGE.creditsTotal, color: "text-primary" },
          { icon: Clock, label: "Preview minutes", value: minutesLeft, total: DEMO_USAGE.previewMinutesTotal, color: "text-cyan-500" },
          { icon: Film, label: "Projects", value: SAMPLE_PROJECTS.length, total: null, color: "text-amber-500" },
          { icon: Sparkles, label: "Plan renews in", value: expiryDays, total: null, suffix: " days", color: "text-emerald-500" },
        ].map((m, i) => (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex items-center justify-between">
              <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-secondary ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </span>
              {m.total && (
                <Badge variant="secondary" className="text-[10px]">
                  of {m.total.toLocaleString()}
                </Badge>
              )}
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">
              <AnimatedCounter value={m.value} suffix={m.suffix ?? ""} />
            </div>
            <p className="text-xs text-muted-foreground">{m.label}</p>
            {m.total && (
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                <div className="h-full rounded-full accent-gradient" style={{ width: `${(m.value / m.total) * 100}%` }} />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Quick upload band */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-6"
      >
        <Link
          href="/upload"
          className="group flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-card/40 py-10 text-center transition-colors hover:border-primary/60 hover:bg-primary/[0.03]"
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl accent-gradient text-white shadow-lg transition-transform group-hover:scale-105">
            <Plus className="h-6 w-6" />
          </span>
          <div>
            <p className="font-medium">Drop a video to caption</p>
            <p className="text-sm text-muted-foreground">MP4, MOV up to 500MB · auto-detects duration & aspect ratio</p>
          </div>
        </Link>
      </motion.div>

      {/* My Projects */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">My projects</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/projects">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SAMPLE_PROJECTS.slice(0, 5).map((p, i) => (
            <ProjectCard key={p.id} project={p} index={i} />
          ))}
        </div>
      </section>

      {/* Recent templates */}
      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Recent templates</h2>
          <Button asChild variant="ghost" size="sm">
            <Link href="/templates">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {recentTemplates.map((t, i) => (
            <Link key={t.id} href={`/styles?template=${t.id}`} className="group">
              <div className="overflow-hidden rounded-xl border border-border transition-transform group-hover:-translate-y-1">
                <CaptionPreview
                  spec={t.spec}
                  segments={SAMPLE_SEGMENTS}
                  duration={SAMPLE_DURATION}
                  aspect="9:16"
                  background={["grad:violet", "grad:amber", "grad:cyan", "grad:pink", "grad:emerald", "grad:indigo"][i % 6]}
                  quality={0.7}
                />
              </div>
              <p className="mt-1.5 truncate text-xs font-medium">{t.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
