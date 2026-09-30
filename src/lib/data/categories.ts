import type { CategoryMeta, TemplateCategory } from "@/lib/types";

export const CATEGORIES: CategoryMeta[] = [
  { id: "for-you", label: "For You", hasAI: true, description: "Personalized from your recent projects and styles." },
  { id: "popular", label: "Popular", hasAI: false, description: "The most-used styles across CaptionForge this week." },
  { id: "ai-edits", label: "AI Edits", hasAI: true, description: "Auto titles, scene-aware emphasis and motion." },
  { id: "real-estate", label: "Real Estate", hasAI: false, description: "Clean listing overlays and price callouts." },
  { id: "spatial", label: "Spatial", hasAI: true, description: "Text placed in 3D space around your subject." },
  { id: "behind-the-person", label: "Behind the Person", hasAI: true, description: "Captions rendered behind the speaker via segmentation." },
  { id: "playful", label: "Playful", hasAI: false, description: "Bouncy, colorful, emoji-friendly styles." },
  { id: "multiline", label: "Multiline", hasAI: false, description: "Balanced multi-line blocks for dense narration." },
  { id: "dynamic", label: "Dynamic", hasAI: true, description: "High-energy motion and word-by-word reveals." },
  { id: "minimal", label: "Minimal", hasAI: false, description: "Understated, editorial, low-distraction." },
  { id: "bold", label: "Bold", hasAI: false, description: "Hormozi-style punchy, high-contrast captions." },
  { id: "karaoke", label: "Karaoke", hasAI: true, description: "Word-synced fill and highlight for lyrics & hooks." },
  { id: "cinematic", label: "Cinematic", hasAI: false, description: "Filmic lower-thirds and title cards." },
  { id: "business", label: "Business", hasAI: false, description: "Corporate, trustworthy, on-brand." },
  { id: "regional-india", label: "Regional India", hasAI: true, description: "Tamil, Hindi, Telugu & Malayalam with proper Indic fonts." },
];

export const CATEGORY_LABEL: Record<TemplateCategory, string> = Object.fromEntries(
  CATEGORIES.map((c) => [c.id, c.label])
) as Record<TemplateCategory, string>;
