// ============================================================================
// CaptionForge — shared domain types
// These types are the single source of truth for the template render spec,
// used identically by the browser preview (Canvas) and the FFmpeg export worker.
// ============================================================================

export type AspectRatio = "9:16" | "1:1" | "16:9" | "4:5";

export type CaptionPosition =
  | "top"
  | "center"
  | "bottom"
  | "lower-third"
  | "upper-third";

export type TextAlign = "left" | "center" | "right";

export type CaptionInAnimation =
  | "none"
  | "fade"
  | "pop"
  | "bounce"
  | "slide-up"
  | "slide-down"
  | "typewriter"
  | "zoom"
  | "wave"
  | "glitch"
  | "flip"
  | "blur-in"
  | "drop";

export type CaptionOutAnimation = "none" | "fade" | "pop" | "slide" | "zoom";

export type WordEffect =
  | "none"
  | "color"
  | "scale"
  | "underline"
  | "box"
  | "glow"
  | "karaoke"
  | "bounce"
  | "rainbow"
  | "neon"
  | "sweep";

export type BoxStyle = "none" | "solid" | "blur" | "glass" | "gradient" | "glow";

// ---------------------------------------------------------------------------
// The RenderSpec — the exact, serializable style contract.
// Anything here can be produced by the preview and re-created by FFmpeg (ASS).
// ---------------------------------------------------------------------------
export interface RenderFont {
  family: string;
  weight: number; // 100–900
  size: number; // px at a 1080-wide reference frame
  letterSpacing: number; // px
  lineHeight: number; // multiplier
  uppercase: boolean;
}

export interface RenderColors {
  text: string;
  stroke: string;
  strokeWidth: number; // px
  highlight: string; // active-word color
  background: string; // caption box color (rgba ok)
  shadow: string; // shadow color (rgba ok)
}

export interface RenderLayout {
  position: CaptionPosition;
  maxLines: number;
  maxWordsPerLine: number;
  alignment: TextAlign;
  safeZone: boolean;
  marginX: number; // % of width
  marginY: number; // % of height
}

export interface RenderAnimation {
  in: CaptionInAnimation;
  out: CaptionOutAnimation;
  wordEffect: WordEffect;
  easing: string;
  duration: number; // ms for in/out
}

export interface RenderEffects {
  glow: number; // 0–1 intensity
  blur: number; // px (for box blur)
  gradient: boolean; // apply gradient fill to text
  gradientColors?: [string, string];
  boxStyle: BoxStyle;
  depth3d: number; // 0–1, for spatial / behind-person parallax
}

export interface RenderAI {
  autoEmphasis: boolean; // scale/bolden important words
  emojiInsert: boolean;
  keywordHighlight: boolean;
  sceneAwareTitle: boolean;
}

/** The complete, serializable render specification for a caption style. */
export interface RenderSpec {
  font: RenderFont;
  colors: RenderColors;
  layout: RenderLayout;
  animation: RenderAnimation;
  effects: RenderEffects;
  ai: RenderAI;
}

// ---------------------------------------------------------------------------
// Template — matches the Supabase `templates` table.
// ---------------------------------------------------------------------------
export type TemplateCategory =
  | "for-you"
  | "popular"
  | "ai-edits"
  | "real-estate"
  | "spatial"
  | "behind-the-person"
  | "playful"
  | "multiline"
  | "dynamic"
  | "minimal"
  | "bold"
  | "karaoke"
  | "cinematic"
  | "business"
  | "regional-india";

export interface Template {
  id: string;
  name: string;
  category: TemplateCategory;
  tags: string[];
  is_pro: boolean;
  credits_per_min: number;
  popular: boolean;
  aspect_ratios: AspectRatio[];
  preview_video_url: string | null;
  thumbnail_url: string | null;
  description: string;
  spec: RenderSpec;
  published: boolean;
  created_by?: string | null;
}

export interface CategoryMeta {
  id: TemplateCategory;
  label: string;
  hasAI: boolean;
  description: string;
}

// ---------------------------------------------------------------------------
// Captions / transcripts
// ---------------------------------------------------------------------------
export interface Word {
  text: string;
  start: number; // seconds
  end: number;
  emphasis?: boolean;
}

export interface CaptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: Word[];
  language: string;
}

export interface Transcript {
  id: string;
  projectId: string;
  language: string;
  detectedLanguage: string;
  segments: CaptionSegment[];
}

// ---------------------------------------------------------------------------
// Projects / renders / billing
// ---------------------------------------------------------------------------
export type ProjectStatus =
  | "uploading"
  | "transcribing"
  | "ready"
  | "rendering"
  | "done"
  | "failed";

export interface Project {
  id: string;
  title: string;
  status: ProjectStatus;
  aspectRatio: AspectRatio;
  durationSec: number;
  thumbnailUrl: string;
  videoUrl: string | null;
  templateId: string | null;
  language: string;
  createdAt: string;
  updatedAt: string;
}

export type RenderStatus = "queued" | "processing" | "done" | "failed";

export interface RenderJob {
  id: string;
  projectId: string;
  resolution: "720p" | "1080p" | "4k";
  format: "mp4" | "srt" | "vtt";
  status: RenderStatus;
  progress: number; // 0–100
  watermark: boolean;
  outputUrl: string | null;
  error?: string | null;
  createdAt: string;
}

export type PlanId = "free" | "starter" | "pro" | "business";

export interface Plan {
  id: PlanId;
  name: string;
  priceUsd: number;
  priceInr: number;
  tagline: string;
  creditsPerMonth: number;
  previewMinutes: number;
  maxResolution: "720p" | "1080p" | "4k";
  watermark: boolean;
  proTemplates: boolean;
  features: string[];
  highlight?: boolean;
}

export interface Subscription {
  plan: PlanId;
  status: "active" | "trialing" | "past_due" | "canceled";
  renewsAt: string;
  provider: "stripe" | "razorpay" | "none";
}

export interface UsageMeter {
  previewMinutesUsed: number;
  previewMinutesTotal: number;
  creditsUsed: number;
  creditsTotal: number;
  expiresAt: string;
}

export interface BrandKit {
  id: string;
  name: string;
  logoUrl: string | null;
  fonts: string[];
  colors: string[];
  defaultTemplateId: string | null;
}

export interface UserStyle extends Template {
  basedOn: string; // template id
}
