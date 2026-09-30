import type { CaptionSegment, Project, Subscription, UsageMeter } from "@/lib/types";

/** A short sample transcript with word-level timestamps used for previews. */
function words(phrase: string, start: number, end: number) {
  const parts = phrase.split(" ");
  const step = (end - start) / parts.length;
  return parts.map((text, i) => ({
    text,
    start: +(start + i * step).toFixed(2),
    end: +(start + (i + 1) * step).toFixed(2),
  }));
}

export const SAMPLE_SEGMENTS: CaptionSegment[] = [
  { id: "s1", start: 0.2, end: 2.2, text: "This changed everything", words: words("This changed everything", 0.2, 2.2), language: "en" },
  { id: "s2", start: 2.3, end: 4.6, text: "for short form creators", words: words("for short form creators", 2.3, 4.6), language: "en" },
  { id: "s3", start: 4.7, end: 7.2, text: "captions in one click", words: words("captions in one click", 4.7, 7.2), language: "en" },
  { id: "s4", start: 7.3, end: 10.0, text: "fifty plus languages ready", words: words("fifty plus languages ready", 7.3, 10.0), language: "en" },
];

export const SAMPLE_DURATION = 10.2;

export const SAMPLE_PROJECTS: Project[] = [
  { id: "p_launch", title: "Product launch teaser", status: "done", aspectRatio: "9:16", durationSec: 42, thumbnailUrl: "grad:violet", videoUrl: null, templateId: "big-money", language: "en", createdAt: "2026-09-28T10:00:00Z", updatedAt: "2026-09-29T09:00:00Z" },
  { id: "p_recipe", title: "60s pasta recipe", status: "ready", aspectRatio: "9:16", durationSec: 58, thumbnailUrl: "grad:amber", videoUrl: null, templateId: "clean-pop", language: "en", createdAt: "2026-09-27T14:00:00Z", updatedAt: "2026-09-27T15:00:00Z" },
  { id: "p_tour", title: "Downtown condo tour", status: "rendering", aspectRatio: "9:16", durationSec: 75, thumbnailUrl: "grad:emerald", videoUrl: null, templateId: "listing-clean", language: "en", createdAt: "2026-09-26T11:00:00Z", updatedAt: "2026-09-29T08:00:00Z" },
  { id: "p_tamil", title: "தமிழ் மோட்டிவேஷன்", status: "done", aspectRatio: "9:16", durationSec: 33, thumbnailUrl: "grad:pink", videoUrl: null, templateId: "tamil-bold-தமழ", language: "ta", createdAt: "2026-09-25T09:00:00Z", updatedAt: "2026-09-25T10:00:00Z" },
  { id: "p_gym", title: "Gym transformation", status: "ready", aspectRatio: "9:16", durationSec: 51, thumbnailUrl: "grad:cyan", videoUrl: null, templateId: "hook-sync", language: "en", createdAt: "2026-09-24T09:00:00Z", updatedAt: "2026-09-24T10:00:00Z" },
  { id: "p_travel", title: "Bali travel diary", status: "done", aspectRatio: "16:9", durationSec: 90, thumbnailUrl: "grad:indigo", videoUrl: null, templateId: "golden-hour", language: "en", createdAt: "2026-09-20T09:00:00Z", updatedAt: "2026-09-21T10:00:00Z" },
];

export const DEMO_SUBSCRIPTION: Subscription = {
  plan: "pro",
  status: "active",
  renewsAt: "2026-10-28T00:00:00Z",
  provider: "stripe",
};

export const DEMO_USAGE: UsageMeter = {
  previewMinutesUsed: 214,
  previewMinutesTotal: 600,
  creditsUsed: 430,
  creditsTotal: 1200,
  expiresAt: "2026-10-28T00:00:00Z",
};

/** Tailwind gradient classes keyed by the `grad:*` thumbnail token. */
export const GRADIENTS: Record<string, string> = {
  "grad:violet": "from-violet-500 via-indigo-500 to-purple-600",
  "grad:amber": "from-amber-400 via-orange-500 to-rose-500",
  "grad:emerald": "from-emerald-400 via-teal-500 to-cyan-600",
  "grad:pink": "from-pink-500 via-fuchsia-500 to-purple-600",
  "grad:cyan": "from-cyan-400 via-sky-500 to-blue-600",
  "grad:indigo": "from-indigo-500 via-blue-500 to-violet-600",
};

export function gradientFor(token: string): string {
  return GRADIENTS[token] ?? GRADIENTS["grad:violet"];
}
