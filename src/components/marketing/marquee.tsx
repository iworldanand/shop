"use client";

import * as React from "react";
import { CaptionPreview } from "@/components/caption-preview";
import { TEMPLATES } from "@/lib/data/templates";
import { SAMPLE_SEGMENTS, SAMPLE_DURATION } from "@/lib/data/sample";
import { Crown } from "lucide-react";

const GRADS = ["grad:violet", "grad:amber", "grad:emerald", "grad:pink", "grad:cyan", "grad:indigo"];

export function TemplateMarquee() {
  const picks = React.useMemo(
    () => TEMPLATES.filter((t) => t.popular || t.category === "bold" || t.category === "karaoke").slice(0, 12),
    []
  );
  const row = [...picks, ...picks];

  return (
    <div className="relative w-full overflow-hidden py-4">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-background to-transparent" />
      <div className="flex w-max animate-marquee gap-4">
        {row.map((t, i) => (
          <div
            key={`${t.id}-${i}`}
            className="relative w-[150px] shrink-0 overflow-hidden rounded-2xl border border-border shadow-lg"
          >
            {t.is_pro && (
              <span className="absolute right-2 top-2 z-10 rounded-full bg-black/50 p-1 backdrop-blur">
                <Crown className="h-3 w-3 text-amber-300" />
              </span>
            )}
            <CaptionPreview
              spec={t.spec}
              segments={SAMPLE_SEGMENTS}
              duration={SAMPLE_DURATION}
              aspect="9:16"
              background={GRADS[i % GRADS.length]}
              quality={0.75}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2">
              <p className="truncate text-xs font-medium text-white">{t.name}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
