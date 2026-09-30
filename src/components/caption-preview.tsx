"use client";

import * as React from "react";
import type { AspectRatio, CaptionSegment, RenderSpec } from "@/lib/types";
import { drawFrame } from "@/lib/render/canvas";
import { cn } from "@/lib/utils";

const RATIO: Record<AspectRatio, number> = {
  "9:16": 9 / 16,
  "1:1": 1,
  "16:9": 16 / 9,
  "4:5": 4 / 5,
};

interface CaptionPreviewProps {
  spec: RenderSpec;
  segments: CaptionSegment[];
  duration: number;
  aspect?: AspectRatio;
  /** Background: a "grad:*" token, hsl/hex color, or "video" (uses <video>). */
  background?: string;
  videoSrc?: string | null;
  className?: string;
  /** Controlled playback time (seconds). If provided, the loop is external. */
  time?: number;
  playing?: boolean;
  loop?: boolean;
  showSafeZone?: boolean;
  onTimeUpdate?: (t: number) => void;
  /** Render resolution multiplier (device pixel ratio handled internally). */
  quality?: number;
}

const GRAD_STOPS: Record<string, [string, string, string]> = {
  "grad:violet": ["#7c3aed", "#6366f1", "#a855f7"],
  "grad:amber": ["#f59e0b", "#f97316", "#f43f5e"],
  "grad:emerald": ["#10b981", "#14b8a6", "#0891b2"],
  "grad:pink": ["#ec4899", "#d946ef", "#a855f7"],
  "grad:cyan": ["#06b6d4", "#0ea5e9", "#2563eb"],
  "grad:indigo": ["#6366f1", "#3b82f6", "#7c3aed"],
};

function paintBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  background: string | undefined,
  t: number
) {
  if (!background || background === "video") {
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
    return;
  }
  if (background.startsWith("grad:")) {
    const [a, b, c] = GRAD_STOPS[background] ?? GRAD_STOPS["grad:violet"];
    const angle = t * 0.15;
    const g = ctx.createLinearGradient(
      w / 2 + Math.cos(angle) * w,
      0,
      w / 2 - Math.cos(angle) * w,
      h
    );
    g.addColorStop(0, a);
    g.addColorStop(0.5, b);
    g.addColorStop(1, c);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    // subtle vignette
    const v = ctx.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(1, "rgba(0,0,0,0.45)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, w, h);
    // a faux "subject" block so behind-the-person styles read correctly
    ctx.fillStyle = "rgba(0,0,0,0.18)";
    ctx.beginPath();
    ctx.ellipse(w / 2, h * 0.62, w * 0.26, h * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, w, h);
}

export function CaptionPreview({
  spec,
  segments,
  duration,
  aspect = "9:16",
  background = "grad:violet",
  videoSrc,
  className,
  time: controlledTime,
  playing = true,
  loop = true,
  showSafeZone = false,
  onTimeUpdate,
  quality = 1,
}: CaptionPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const rafRef = React.useRef<number>();
  const startRef = React.useRef<number>(0);
  const localTimeRef = React.useRef<number>(0);
  const [dims, setDims] = React.useState({ w: 0, h: 0 });
  const wrapRef = React.useRef<HTMLDivElement>(null);

  // Measure container to size the canvas backing store.
  React.useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ w: Math.round(r.width), h: Math.round(r.height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dims.w === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, (typeof window !== "undefined" ? window.devicePixelRatio : 1) || 1) * quality;
    canvas.width = Math.round(dims.w * dpr);
    canvas.height = Math.round(dims.h * dpr);

    const render = (ts: number) => {
      let t: number;
      if (controlledTime != null) {
        t = controlledTime;
      } else {
        if (!startRef.current) startRef.current = ts;
        if (playing) {
          localTimeRef.current = ((ts - startRef.current) / 1000) % (loop ? duration : Infinity);
          if (!loop && localTimeRef.current > duration) localTimeRef.current = duration;
        }
        t = localTimeRef.current;
        onTimeUpdate?.(t);
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, dims.w, dims.h);

      if (background === "video" && videoRef.current) {
        const vid = videoRef.current;
        try {
          if (vid.readyState >= 2) {
            const vr = vid.videoWidth / vid.videoHeight || RATIO[aspect];
            const cr = dims.w / dims.h;
            let dw = dims.w,
              dh = dims.h,
              dx = 0,
              dy = 0;
            if (vr > cr) {
              dh = dims.h;
              dw = dh * vr;
              dx = (dims.w - dw) / 2;
            } else {
              dw = dims.w;
              dh = dw / vr;
              dy = (dims.h - dh) / 2;
            }
            ctx.drawImage(vid, dx, dy, dw, dh);
          } else {
            paintBackground(ctx, dims.w, dims.h, "grad:violet", t);
          }
        } catch {
          paintBackground(ctx, dims.w, dims.h, "grad:violet", t);
        }
      } else {
        paintBackground(ctx, dims.w, dims.h, background, t);
      }

      if (showSafeZone) {
        ctx.strokeStyle = "rgba(255,255,255,0.35)";
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 1.5;
        const mx = dims.w * 0.06;
        const my = dims.h * 0.08;
        ctx.strokeRect(mx, my, dims.w - mx * 2, dims.h - my * 2);
        ctx.setLineDash([]);
      }

      drawFrame(ctx, spec, segments, t, dims.w, dims.h);
      ctx.restore();

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      startRef.current = 0;
    };
  }, [spec, segments, duration, dims, background, aspect, controlledTime, playing, loop, showSafeZone, onTimeUpdate, quality]);

  // Keep external video element in sync when controlled.
  React.useEffect(() => {
    const vid = videoRef.current;
    if (!vid || background !== "video") return;
    if (playing) vid.play().catch(() => {});
    else vid.pause();
  }, [playing, background]);

  return (
    <div
      ref={wrapRef}
      className={cn("relative overflow-hidden bg-black", className)}
      style={{ aspectRatio: `${aspect.split(":")[0]} / ${aspect.split(":")[1]}` }}
    >
      {background === "video" && videoSrc && (
        <video
          ref={videoRef}
          src={videoSrc}
          muted
          loop={loop}
          playsInline
          className="hidden"
          crossOrigin="anonymous"
        />
      )}
      <canvas ref={canvasRef} className="h-full w-full" style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
