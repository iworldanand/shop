// ============================================================================
// ASS (Advanced SubStation Alpha) generator.
// Converts a RenderSpec + caption segments into an .ass file that FFmpeg burns
// into the exported MP4 via the `ass` / `subtitles` filter. Derived from the
// same RenderSpec used by the Canvas preview so exports match the preview.
// ============================================================================

import type { CaptionSegment, RenderSpec, AspectRatio } from "@/lib/types";
import { toSrtTimestamp, toVttTimestamp } from "@/lib/utils";

const DIMS: Record<AspectRatio, { w: number; h: number }> = {
  "9:16": { w: 1080, h: 1920 },
  "1:1": { w: 1080, h: 1080 },
  "16:9": { w: 1920, h: 1080 },
  "4:5": { w: 1080, h: 1350 },
};

/** #rrggbb or rgba() -> ASS &HAABBGGRR& */
function toAssColor(css: string): string {
  let r = 255,
    g = 255,
    b = 255,
    a = 0; // ASS alpha: 00 = opaque
  const hex = css.replace("#", "");
  if (/^[0-9a-fA-F]{6}$/.test(hex)) {
    r = parseInt(hex.slice(0, 2), 16);
    g = parseInt(hex.slice(2, 4), 16);
    b = parseInt(hex.slice(4, 6), 16);
  } else {
    const m = css.match(/rgba?\(([^)]+)\)/);
    if (m) {
      const parts = m[1].split(",").map((s) => parseFloat(s.trim()));
      [r, g, b] = parts;
      const alpha = parts[3] ?? 1;
      a = Math.round((1 - alpha) * 255);
    }
  }
  const h2 = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, "0").toUpperCase();
  return `&H${h2(a)}${h2(b)}${h2(g)}${h2(r)}`;
}

function assTime(sec: number): string {
  const s = Math.max(0, sec);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const secs = (s % 60).toFixed(2).padStart(5, "0");
  return `${h}:${String(m).padStart(2, "0")}:${secs}`;
}

const ALIGN: Record<string, number> = { left: 1, center: 2, right: 3 };

export function specToAss(
  spec: RenderSpec,
  segments: CaptionSegment[],
  aspect: AspectRatio
): string {
  const { w, h } = DIMS[aspect];
  const scale = w / 1080;
  const fontSize = Math.round(spec.font.size * scale);

  // Alignment number in ASS (numpad). Bottom center = 2.
  let alignBase = ALIGN[spec.layout.alignment] ?? 2;
  if (spec.layout.position === "center") alignBase += 3; // middle row
  if (spec.layout.position === "top" || spec.layout.position === "upper-third") alignBase += 6;

  const marginV = Math.round((spec.layout.marginY / 100) * h);
  const marginH = Math.round((spec.layout.marginX / 100) * w);

  const primary = toAssColor(spec.colors.text);
  const highlight = toAssColor(spec.colors.highlight);
  const outline = toAssColor(spec.colors.stroke);
  const back = toAssColor(spec.colors.shadow);
  const borderStyle = spec.effects.boxStyle === "solid" ? 3 : 1;

  const header = `[Script Info]
Title: CaptionForge Export
ScriptType: v4.00+
PlayResX: ${w}
PlayResY: ${h}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Main,${spec.font.family},${fontSize},${primary},${highlight},${outline},${back},${
    spec.font.weight >= 700 ? -1 : 0
  },0,${spec.animation.wordEffect === "underline" ? -1 : 0},0,100,100,${Math.round(
    spec.font.letterSpacing
  )},0,${borderStyle},${Math.round(spec.colors.strokeWidth * scale)},${
    spec.colors.shadow && spec.colors.shadow !== "transparent" ? 3 : 0
  },${alignBase},${marginH},${marginH},${marginV},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text`;

  const events: string[] = [];
  const uppercase = spec.font.uppercase;
  const wordEffect = spec.animation.wordEffect;

  for (const seg of segments) {
    const words = seg.words.length
      ? seg.words
      : seg.text.split(/\s+/).map((t, i, arr) => ({
          text: t,
          start: seg.start + (i / arr.length) * (seg.end - seg.start),
          end: seg.start + ((i + 1) / arr.length) * (seg.end - seg.start),
        }));

    if (wordEffect === "karaoke" || wordEffect === "color") {
      // Karaoke: use \k timing so each word highlights in sync.
      let text = "";
      for (const wd of words) {
        const cs = Math.max(1, Math.round((wd.end - wd.start) * 100));
        const t = uppercase ? wd.text.toUpperCase() : wd.text;
        text += `{\\kf${cs}}${t} `;
      }
      const fadeIn = spec.animation.in === "fade" ? `{\\fad(${spec.animation.duration},${spec.animation.duration})}` : "";
      events.push(
        `Dialogue: 0,${assTime(seg.start)},${assTime(seg.end)},Main,,0,0,0,,${fadeIn}${text.trim()}`
      );
    } else {
      const t = uppercase ? seg.text.toUpperCase() : seg.text;
      const fx =
        spec.animation.in === "fade"
          ? `{\\fad(${spec.animation.duration},${spec.animation.duration})}`
          : spec.animation.in === "pop" || spec.animation.in === "zoom"
          ? `{\\fscx60\\fscy60\\t(0,${spec.animation.duration},\\fscx100\\fscy100)}`
          : "";
      events.push(`Dialogue: 0,${assTime(seg.start)},${assTime(seg.end)},Main,,0,0,0,,${fx}${t}`);
    }
  }

  return `${header}\n${events.join("\n")}\n`;
}

// -------- Plain subtitle exports (SRT / VTT) --------
export function segmentsToSrt(segments: CaptionSegment[]): string {
  return segments
    .map((s, i) => `${i + 1}\n${toSrtTimestamp(s.start)} --> ${toSrtTimestamp(s.end)}\n${s.text}\n`)
    .join("\n");
}

export function segmentsToVtt(segments: CaptionSegment[]): string {
  const body = segments
    .map((s) => `${toVttTimestamp(s.start)} --> ${toVttTimestamp(s.end)}\n${s.text}\n`)
    .join("\n");
  return `WEBVTT\n\n${body}`;
}
