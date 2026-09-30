import type { RenderSpec } from "@/lib/types";

/** Reference frame width the spec sizes are authored against. */
export const REFERENCE_WIDTH = 1080;

export const DEFAULT_SPEC: RenderSpec = {
  font: {
    family: "Inter",
    weight: 800,
    size: 64,
    letterSpacing: 0,
    lineHeight: 1.15,
    uppercase: false,
  },
  colors: {
    text: "#ffffff",
    stroke: "#000000",
    strokeWidth: 6,
    highlight: "#8b5cf6",
    background: "rgba(0,0,0,0)",
    shadow: "rgba(0,0,0,0.55)",
  },
  layout: {
    position: "bottom",
    maxLines: 2,
    maxWordsPerLine: 4,
    alignment: "center",
    safeZone: true,
    marginX: 8,
    marginY: 12,
  },
  animation: {
    in: "pop",
    out: "fade",
    wordEffect: "color",
    easing: "cubic-bezier(0.34,1.56,0.64,1)",
    duration: 220,
  },
  effects: {
    glow: 0,
    blur: 0,
    gradient: false,
    boxStyle: "none",
    depth3d: 0,
  },
  ai: {
    autoEmphasis: false,
    emojiInsert: false,
    keywordHighlight: false,
    sceneAwareTitle: false,
  },
};

/** Deep-merge a partial spec onto the defaults (used when customizing). */
export function mergeSpec(base: RenderSpec, patch: Partial<RenderSpec>): RenderSpec {
  return {
    font: { ...base.font, ...patch.font },
    colors: { ...base.colors, ...patch.colors },
    layout: { ...base.layout, ...patch.layout },
    animation: { ...base.animation, ...patch.animation },
    effects: { ...base.effects, ...patch.effects },
    ai: { ...base.ai, ...patch.ai },
  };
}
