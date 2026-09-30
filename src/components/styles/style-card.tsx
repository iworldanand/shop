"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Crown, Zap, Check } from "lucide-react";
import type { Template } from "@/lib/types";
import { CaptionPreview } from "@/components/caption-preview";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface StyleCardProps {
  template: Template;
  selected: boolean;
  onSelect: () => void;
  background: string;
  index: number;
  userVideoSrc?: string | null;
}

export function StyleCard({ template, selected, onSelect, background, index, userVideoSrc }: StyleCardProps) {
  const [hover, setHover] = React.useState(false);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          layout
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.35 }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          onClick={onSelect}
          className={cn(
            "group relative block w-full overflow-hidden rounded-2xl border text-left transition-shadow focus:outline-none",
            selected ? "border-transparent" : "border-border hover:shadow-xl"
          )}
        >
          {/* Animated selected ring */}
          {selected && (
            <motion.span
              layoutId="style-ring"
              className="pointer-events-none absolute inset-0 z-20 rounded-2xl ring-2 ring-primary ring-offset-2 ring-offset-background"
              transition={{ type: "spring", stiffness: 500, damping: 34 }}
            />
          )}

          {/* POPULAR ribbon */}
          {template.popular && (
            <span className="absolute -left-8 top-3 z-10 -rotate-45 bg-primary px-8 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary-foreground shadow">
              Popular
            </span>
          )}

          {/* Pro crown */}
          {template.is_pro && (
            <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 backdrop-blur">
              <Crown className="h-3.5 w-3.5 text-amber-300" />
            </span>
          )}

          {/* Credits/min pill for AI-heavy styles */}
          {template.credits_per_min > 1 && (
            <span className="absolute bottom-10 right-2 z-10 flex items-center gap-1 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur">
              <Zap className="h-2.5 w-2.5 text-amber-300" />
              {template.credits_per_min}/min
            </span>
          )}

          {/* Live preview (uses user's own frame when available) */}
          <div className="relative">
            <CaptionPreview
              spec={template.spec}
              segments={SAMPLE_SEGMENTS}
              duration={SAMPLE_DURATION}
              aspect="9:16"
              background={userVideoSrc ? "video" : background}
              videoSrc={userVideoSrc ?? null}
              playing={hover || selected}
              quality={hover || selected ? 1 : 0.7}
            />
            {selected && (
              <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
                <Check className="h-3.5 w-3.5" />
              </span>
            )}
          </div>

          <div className="flex items-center justify-between gap-1 px-2.5 py-2">
            <p className="truncate text-xs font-medium">{template.name}</p>
          </div>
        </motion.button>
      </TooltipTrigger>
      <TooltipContent side="top">{template.description}</TooltipContent>
    </Tooltip>
  );
}
