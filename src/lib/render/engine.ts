// ============================================================================
// Pure caption layout engine.
// Given a RenderSpec, the caption segments, the current time, and the frame
// dimensions, it produces a fully-resolved "FrameModel" describing every line,
// word, position and animation value. The Canvas preview and the FFmpeg export
// both consume the same model, guaranteeing identical output.
// ============================================================================

import type { CaptionSegment, RenderSpec, Word } from "@/lib/types";
import { REFERENCE_WIDTH } from "./defaults";
import { clamp } from "@/lib/utils";

export interface LaidOutWord extends Word {
  x: number;
  y: number;
  width: number;
  active: boolean;
  progress: number; // karaoke fill 0..1
}

export interface LaidOutLine {
  words: LaidOutWord[];
  y: number;
  width: number;
}

export interface FrameModel {
  visible: boolean;
  lines: LaidOutLine[];
  inProgress: number; // 0..1 entrance animation
  outProgress: number; // 0..1 exit animation
  boxRect?: { x: number; y: number; w: number; h: number };
  scale: number;
  fontSize: number;
}

function easeOutBack(t: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

function activeSegment(segments: CaptionSegment[], time: number): CaptionSegment | null {
  for (const s of segments) {
    if (time >= s.start && time <= s.end) return s;
  }
  return null;
}

/** Approximate text width without a canvas (used for headless/export). */
function approxWordWidth(word: string, fontSize: number, weight: number): number {
  // Average glyph width ratio; heavier weights are marginally wider.
  const ratio = 0.54 + (weight >= 700 ? 0.04 : 0);
  return word.length * fontSize * ratio;
}

export interface LayoutOptions {
  /** Optional real text-measuring function (canvas). Falls back to approximation. */
  measure?: (text: string, fontPx: number, weight: number, family: string) => number;
}

export function computeFrame(
  spec: RenderSpec,
  segments: CaptionSegment[],
  time: number,
  width: number,
  height: number,
  opts: LayoutOptions = {}
): FrameModel {
  const seg = activeSegment(segments, time);
  const scale = width / REFERENCE_WIDTH;
  const fontSize = spec.font.size * scale;

  const empty: FrameModel = {
    visible: false,
    lines: [],
    inProgress: 0,
    outProgress: 0,
    scale,
    fontSize,
  };
  if (!seg) return empty;

  const measure = (t: string) =>
    (opts.measure
      ? opts.measure(t, fontSize, spec.font.weight, spec.font.family)
      : approxWordWidth(t, fontSize, spec.font.weight)) +
    spec.font.letterSpacing * scale * t.length;

  // Build lines from words respecting maxWordsPerLine and maxLines.
  const words = seg.words.length
    ? seg.words
    : seg.text.split(/\s+/).map((w, i, arr) => ({
        text: w,
        start: seg.start + (i / arr.length) * (seg.end - seg.start),
        end: seg.start + ((i + 1) / arr.length) * (seg.end - seg.start),
      }));

  const transform = (t: string) => (spec.font.uppercase ? t.toUpperCase() : t);

  const rawLines: Word[][] = [];
  let current: Word[] = [];
  const maxWidth = width * (1 - (spec.layout.marginX * 2) / 100);
  for (const w of words) {
    const tentative = [...current, w];
    const lineWidth = tentative
      .map((x) => measure(transform(x.text)) + fontSize * 0.28)
      .reduce((a, b) => a + b, 0);
    if (
      (current.length >= spec.layout.maxWordsPerLine || lineWidth > maxWidth) &&
      current.length > 0
    ) {
      rawLines.push(current);
      current = [w];
    } else {
      current = tentative;
    }
  }
  if (current.length) rawLines.push(current);

  // Keep only the window of lines around the active word (for maxLines).
  const activeWordIdx = words.findIndex((w) => time >= w.start && time <= w.end);
  const flatIdx = activeWordIdx < 0 ? 0 : activeWordIdx;
  let startLine = 0;
  {
    let counted = 0;
    for (let i = 0; i < rawLines.length; i++) {
      counted += rawLines[i].length;
      if (flatIdx < counted) {
        startLine = Math.max(0, i - (spec.layout.maxLines - 1));
        break;
      }
    }
  }
  const shownLines = rawLines.slice(startLine, startLine + spec.layout.maxLines);

  const lineHeight = fontSize * spec.font.lineHeight;
  const blockHeight = shownLines.length * lineHeight;

  // Vertical anchor
  const marginYpx = (spec.layout.marginY / 100) * height;
  let blockTop: number;
  switch (spec.layout.position) {
    case "top":
    case "upper-third":
      blockTop = marginYpx + (spec.layout.position === "upper-third" ? height * 0.08 : 0);
      break;
    case "center":
      blockTop = height / 2 - blockHeight / 2;
      break;
    case "lower-third":
      blockTop = height * 0.66 - blockHeight / 2;
      break;
    case "bottom":
    default:
      blockTop = height - marginYpx - blockHeight;
      break;
  }

  const gap = fontSize * 0.28;
  const laidOut: LaidOutLine[] = shownLines.map((lineWords, li) => {
    const widths = lineWords.map((w) => measure(transform(w.text)));
    const totalW = widths.reduce((a, b) => a + b, 0) + gap * (lineWords.length - 1);
    let startX: number;
    if (spec.layout.alignment === "left") startX = (spec.layout.marginX / 100) * width;
    else if (spec.layout.alignment === "right")
      startX = width - (spec.layout.marginX / 100) * width - totalW;
    else startX = width / 2 - totalW / 2;

    let cursor = startX;
    const y = blockTop + li * lineHeight + lineHeight / 2;
    const outWords: LaidOutWord[] = lineWords.map((w, wi) => {
      const wWidth = widths[wi];
      const isActive = time >= w.start && time <= w.end;
      const dur = Math.max(0.001, w.end - w.start);
      const progress = clamp((time - w.start) / dur, 0, 1);
      const lw: LaidOutWord = {
        ...w,
        text: transform(w.text),
        x: cursor,
        y,
        width: wWidth,
        active: isActive,
        progress,
      };
      cursor += wWidth + gap;
      return lw;
    });
    return { words: outWords, y, width: totalW };
  });

  // Entrance / exit progress
  const inDur = spec.animation.duration / 1000;
  const inProgress = clamp((time - seg.start) / inDur, 0, 1);
  const outStart = seg.end - inDur;
  const outProgress = clamp((time - outStart) / inDur, 0, 1);

  const model: FrameModel = {
    visible: true,
    lines: laidOut,
    inProgress: spec.animation.in === "bounce" ? easeOutBack(inProgress) : inProgress,
    outProgress,
    scale,
    fontSize,
  };

  // Caption box rect
  if (spec.effects.boxStyle !== "none" && laidOut.length) {
    const pad = fontSize * 0.35;
    const minX = Math.min(...laidOut.map((l) => l.words[0]?.x ?? 0)) - pad;
    const maxX =
      Math.max(...laidOut.map((l) => (l.words.at(-1)?.x ?? 0) + (l.words.at(-1)?.width ?? 0))) +
      pad;
    model.boxRect = {
      x: minX,
      y: blockTop - pad,
      w: maxX - minX,
      h: blockHeight + pad * 2,
    };
  }

  return model;
}
