export const ADMIN_STATS = {
  mrr: 48620,
  users: 12480,
  activeSubs: 3120,
  rendersToday: 8642,
  churnRate: 2.4,
  arpu: 15.6,
};

export const REVENUE_MONTHS = [
  { m: "Apr", v: 28000 }, { m: "May", v: 31500 }, { m: "Jun", v: 35200 },
  { m: "Jul", v: 38900 }, { m: "Aug", v: 43100 }, { m: "Sep", v: 48620 },
];

export const ADMIN_USERS = [
  { id: "u1", name: "Priya Nair", email: "priya@reels.co", plan: "pro", status: "active", role: "user", spend: 348, joined: "2026-01-12" },
  { id: "u2", name: "Marcus Lee", email: "marcus@studio.io", plan: "business", status: "active", role: "user", spend: 948, joined: "2025-11-03" },
  { id: "u3", name: "Aisha Khan", email: "aisha@creator.me", plan: "starter", status: "past_due", role: "user", spend: 144, joined: "2026-03-22" },
  { id: "u4", name: "Diego Santos", email: "diego@viral.mx", plan: "pro", status: "active", role: "admin", spend: 522, joined: "2025-09-18" },
  { id: "u5", name: "Chen Wei", email: "chen@shorts.cn", plan: "free", status: "active", role: "user", spend: 0, joined: "2026-08-30" },
  { id: "u6", name: "Sara Björk", email: "sara@nordic.se", plan: "pro", status: "canceled", role: "user", spend: 261, joined: "2026-02-14" },
];

export const FAILED_RENDERS = [
  { id: "r_8821", project: "60s pasta recipe", user: "aisha@creator.me", res: "4k", error: "ffmpeg: codec h264_nvenc not available", at: "2026-09-29T14:22:00Z" },
  { id: "r_8790", project: "Gym transformation", user: "chen@shorts.cn", res: "1080p", error: "Whisper timeout after 120s", at: "2026-09-29T11:08:00Z" },
  { id: "r_8744", project: "Condo tour", user: "marcus@studio.io", res: "4k", error: "Cloudinary upload 413 (payload too large)", at: "2026-09-28T19:47:00Z" },
];

export const PENDING_STYLES = [
  { id: "c1", name: "Sunset Vlog", author: "priya@reels.co", category: "cinematic", submitted: "2026-09-27" },
  { id: "c2", name: "Meme Slam", author: "diego@viral.mx", category: "playful", submitted: "2026-09-28" },
];

export const FEATURE_FLAGS = [
  { id: "spatial_v2", label: "Spatial captions v2", desc: "New depth engine for spatial templates", on: true },
  { id: "gemini_translate", label: "Gemini translation", desc: "Use Gemini for translation instead of GPT", on: false },
  { id: "community_publish", label: "Community publishing", desc: "Allow Pro users to publish styles", on: true },
  { id: "team_seats", label: "Team seats", desc: "Multi-seat Business plan", on: false },
  { id: "waveform_v2", label: "Waveform v2", desc: "Higher-resolution timeline waveform", on: true },
];
