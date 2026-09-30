// ============================================================================
// Canvas painter — draws a FrameModel (from engine.ts) onto a 2D context.
// This is the real-time preview path. The FFmpeg export path (ass.ts) derives
// from the same RenderSpec + engine, keeping preview and export in lockstep.
// ============================================================================

import type { RenderSpec } from "@/lib/types";
import { computeFrame, type FrameModel } from "./engine";
import type { CaptionSegment } from "@/lib/types";

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

export function makeMeasurer(ctx: CanvasRenderingContext2D) {
  return (text: string, fontPx: number, weight: number, family: string) => {
    ctx.font = `${weight} ${fontPx}px ${family}, Inter, sans-serif`;
    return ctx.measureText(text).width;
  };
}

export function drawFrame(
  ctx: CanvasRenderingContext2D,
  spec: RenderSpec,
  segments: CaptionSegment[],
  time: number,
  width: number,
  height: number
) {
  const model: FrameModel = computeFrame(spec, segments, time, width, height, {
    measure: makeMeasurer(ctx),
  });
  if (!model.visible) return;

  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  const { fontSize } = model;
  const entrance = model.inProgress;

  // Global entrance transform (scale/translate/opacity)
  let alpha = 1;
  let dx = 0;
  let dy = 0;
  let scale = 1;
  switch (spec.animation.in) {
    case "fade":
      alpha = entrance;
      break;
    case "pop":
    case "zoom":
      scale = 0.7 + 0.3 * entrance;
      alpha = entrance;
      break;
    case "bounce":
      scale = entrance;
      break;
    case "slide-up":
      dy = (1 - entrance) * fontSize * 1.5;
      alpha = entrance;
      break;
    case "slide-down":
      dy = -(1 - entrance) * fontSize * 1.5;
      alpha = entrance;
      break;
    default:
      break;
  }
  if (spec.animation.out === "fade") alpha *= 1 - model.outProgress;

  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Box background
  if (model.boxRect && spec.effects.boxStyle !== "none") {
    const b = model.boxRect;
    ctx.save();
    const radius = fontSize * 0.35;
    if (spec.effects.boxStyle === "gradient") {
      const g = ctx.createLinearGradient(b.x, b.y, b.x + b.w, b.y + b.h);
      const [c1, c2] = spec.effects.gradientColors ?? ["#6d28d9", "#4f46e5"];
      g.addColorStop(0, c1);
      g.addColorStop(1, c2);
      ctx.fillStyle = g;
    } else if (spec.effects.boxStyle === "glass") {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
    } else if (spec.effects.boxStyle === "glow") {
      ctx.shadowColor = spec.colors.highlight;
      ctx.shadowBlur = 40 * model.scale;
      ctx.fillStyle = spec.colors.background || "rgba(0,0,0,0.4)";
    } else {
      ctx.fillStyle = spec.colors.background || "rgba(0,0,0,0.5)";
    }
    roundRect(ctx, b.x, b.y, b.w, b.h, radius);
    ctx.fill();
    ctx.restore();
  }

  for (const line of model.lines) {
    for (const w of line.words) {
      const cx = w.x + dx;
      const cy = w.y + dy;
      ctx.save();

      // per-word transform origin
      ctx.translate(cx + w.width / 2, cy);
      let wScale = scale;
      if (w.active) {
        if (spec.animation.wordEffect === "scale") wScale *= 1.12;
        if (spec.animation.wordEffect === "bounce") wScale *= 1 + 0.15 * Math.sin(w.progress * Math.PI);
      }
      ctx.scale(wScale, wScale);
      ctx.translate(-(cx + w.width / 2), -cy);

      ctx.font = `${spec.font.weight} ${fontSize}px ${spec.font.family}, Inter, sans-serif`;

      // Shadow
      if (spec.colors.shadow && spec.colors.shadow !== "transparent") {
        ctx.shadowColor = spec.colors.shadow;
        ctx.shadowBlur = fontSize * 0.18;
        ctx.shadowOffsetY = fontSize * 0.05;
      }
      // Glow effect
      if (spec.effects.glow > 0) {
        ctx.shadowColor = spec.colors.highlight;
        ctx.shadowBlur = fontSize * spec.effects.glow * 0.9;
      }

      // Stroke
      if (spec.colors.strokeWidth > 0) {
        ctx.lineJoin = "round";
        ctx.lineWidth = spec.colors.strokeWidth * model.scale;
        ctx.strokeStyle = spec.colors.stroke;
        ctx.strokeText(w.text, cx, cy);
      }

      // Fill color (active-word highlight)
      let fill = spec.colors.text;
      const useHighlight =
        w.active && ["color", "karaoke", "box", "glow", "underline"].includes(spec.animation.wordEffect);
      if (useHighlight) fill = spec.colors.highlight;

      if (spec.effects.gradient) {
        const g = ctx.createLinearGradient(cx, cy - fontSize / 2, cx, cy + fontSize / 2);
        const [c1, c2] = spec.effects.gradientColors ?? [spec.colors.text, spec.colors.highlight];
        g.addColorStop(0, c1);
        g.addColorStop(1, c2);
        ctx.fillStyle = g;
      } else {
        ctx.fillStyle = fill;
      }

      // Active-word box highlight
      if (w.active && spec.animation.wordEffect === "box") {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.fillStyle = spec.colors.highlight;
        roundRect(ctx, cx - fontSize * 0.12, cy - fontSize * 0.6, w.width + fontSize * 0.24, fontSize * 1.2, fontSize * 0.18);
        ctx.fill();
        ctx.restore();
        ctx.fillStyle = spec.colors.text;
      }

      ctx.fillText(w.text, cx, cy);

      // Underline
      if (w.active && spec.animation.wordEffect === "underline") {
        ctx.shadowBlur = 0;
        ctx.strokeStyle = spec.colors.highlight;
        ctx.lineWidth = fontSize * 0.08;
        ctx.beginPath();
        ctx.moveTo(cx, cy + fontSize * 0.55);
        ctx.lineTo(cx + w.width, cy + fontSize * 0.55);
        ctx.stroke();
      }

      // Karaoke wipe fill
      if (w.active && spec.animation.wordEffect === "karaoke") {
        ctx.save();
        ctx.beginPath();
        ctx.rect(cx, cy - fontSize, w.width * w.progress, fontSize * 2);
        ctx.clip();
        ctx.fillStyle = spec.colors.highlight;
        ctx.shadowBlur = 0;
        ctx.fillText(w.text, cx, cy);
        ctx.restore();
      }

      ctx.restore();
    }
  }
  ctx.restore();
}
