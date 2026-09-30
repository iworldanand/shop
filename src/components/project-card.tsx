"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Clock, CheckCircle2, Loader2, AlertTriangle, MoreVertical } from "lucide-react";
import type { Project } from "@/lib/types";
import { CaptionPreview } from "@/components/caption-preview";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES_BY_ID } from "@/lib/data/templates";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { DEFAULT_SPEC } from "@/lib/render/defaults";
import { formatDuration, relativeTime, cn } from "@/lib/utils";

const STATUS: Record<Project["status"], { label: string; icon: React.ElementType; variant: any }> = {
  uploading: { label: "Uploading", icon: Loader2, variant: "secondary" },
  transcribing: { label: "Transcribing", icon: Loader2, variant: "warning" },
  ready: { label: "Ready to edit", icon: Clock, variant: "secondary" },
  rendering: { label: "Rendering", icon: Loader2, variant: "warning" },
  done: { label: "Done", icon: CheckCircle2, variant: "success" },
  failed: { label: "Failed", icon: AlertTriangle, variant: "outline" },
};

export function ProjectCard({ project, index = 0 }: { project: Project; index?: number }) {
  const template = project.templateId ? TEMPLATES_BY_ID[project.templateId] : null;
  const spec = template?.spec ?? DEFAULT_SPEC;
  const status = STATUS[project.status];
  const spinning = ["uploading", "transcribing", "rendering"].includes(project.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="group"
    >
      <Link href={`/editor/${project.id}`} className="block">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-xl">
          <div className="relative">
            <CaptionPreview
              spec={spec}
              segments={SAMPLE_SEGMENTS}
              duration={SAMPLE_DURATION}
              aspect={project.aspectRatio}
              background={project.thumbnailUrl}
              quality={0.75}
              playing
            />
            <div className="absolute right-2 top-2">
              <Badge variant={status.variant} className="backdrop-blur">
                <status.icon className={cn("h-3 w-3", spinning && "animate-spin")} />
                {status.label}
              </Badge>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/90 text-black">
                <Play className="h-5 w-5 fill-current" />
              </span>
            </div>
          </div>
          <div className="flex items-center justify-between gap-2 p-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{project.title}</p>
              <p className="text-xs text-muted-foreground">
                {formatDuration(project.durationSec)} · {project.aspectRatio} · {relativeTime(project.updatedAt)}
              </p>
            </div>
            <button
              onClick={(e) => e.preventDefault()}
              className="rounded-lg p-1.5 text-muted-foreground opacity-0 transition-opacity hover:bg-secondary group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
