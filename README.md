<div align="center">

# 🎬 CaptionForge

**AI video caption & subtitle editor for short‑form creators.**
Upload → auto‑caption (Whisper) → pick a style → edit → export 4K MP4 / SRT / VTT.

Next.js 14 · TypeScript · Tailwind + shadcn/ui · Framer Motion · Supabase · Cloudinary · FFmpeg · Stripe + Razorpay

</div>

---

> **Rebranding:** the product name lives in a few obvious spots (`src/components/brand/logo.tsx`, `src/app/layout.tsx` metadata, `public/manifest.webmanifest`). Search‑and‑replace “CaptionForge” to rename.

## ✨ Highlights

- **One‑click AI captions** — OpenAI Whisper with word‑level timestamps + auto language detection.
- **50+ languages** incl. Tamil, Hindi, Telugu, Malayalam, Kannada, Arabic, Spanish — with proper Indic fonts. SRT/VTT export.
- **130+ original styles** across 15 categories (Popular, AI Edits, Spatial, Behind‑the‑Person, Bold/Hormozi, Karaoke, Cinematic, Regional India, …).
- **Shared render spec** — the browser preview (Canvas) and the FFmpeg export (ASS) are driven by the *same* `RenderSpec`, so **what you preview is what you export**.
- **Full editor** — waveform timeline, draggable/trimmable caption blocks, split/merge, retime, undo/redo, keyboard shortcuts, word‑highlight effects.
- **Style picker** — Moonshot‑style “Pick a style” screen with live per‑card previews (using your own frame), search, filter chips, POPULAR ribbons, Pro crowns, credits/min pills, and a full **Customize** drawer (“Save as my style”).
- **Payments** — Stripe (international) + Razorpay (India), webhooks, credits, upgrade/downgrade/cancel.
- **Admin** — revenue dashboard, users, template manager (publish toggles + live preview), moderation, feature flags, failed render logs.
- **Design** — premium black/white theme + electric‑indigo accent, glassmorphism, light/dark, WCAG‑minded, mobile bottom‑nav, PWA manifest.

## 🏃 Quick start (demo mode)

No external services needed — the app ships with local mock data.

```bash
npm install
npm run dev        # http://localhost:3000
```

Log in with any email/password (or Google) — auth falls back to demo mode until Supabase is configured.

## 🔌 Going live

1. **Copy env**: `cp .env.example .env.local` and fill in the keys you need. Any missing service degrades gracefully to demo mode.
2. **Supabase**
   ```bash
   # In the Supabase SQL editor (or `supabase db push`), run in order:
   supabase/migrations/0001_schema.sql
   supabase/migrations/0002_rls.sql
   # Seed the 130+ templates + feature flags from the typed config:
   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:templates
   ```
   Enable Google OAuth + email/magic‑link in Supabase Auth. Make a user an admin with
   `update profiles set role='admin' where email='you@example.com';`
3. **Cloudinary** — create a cloud, set `CLOUDINARY_*`. The browser uploads directly using the signature from `/api/cloudinary/sign`.
4. **OpenAI / Gemini** — set `OPENAI_API_KEY` (Whisper + translation) and optionally `GEMINI_API_KEY` with `TRANSLATION_PROVIDER=gemini`.
5. **Payments** — set Stripe + Razorpay keys and create prices/plans; point webhooks at `/api/webhooks/stripe` and `/api/webhooks/razorpay`.

## 🧱 Architecture

```
Upload ──▶ Cloudinary ──▶ FFmpeg (extract audio) ──▶ Whisper (word timestamps)
      ──▶ segment captions ──▶ optional translation ──▶ Style picker ──▶ Editor
      ──▶ POST /api/render (enqueues job, precomputes ASS from RenderSpec)
      ──▶ FFmpeg worker (burns ASS, uploads MP4) ──▶ download link + email
```

### The shared render spec (the important bit)
`src/lib/types.ts` defines `RenderSpec`. Everything renders from it:
- `src/lib/render/engine.ts` — pure layout → a `FrameModel` (lines, word positions, animation values).
- `src/lib/render/canvas.ts` — paints the `FrameModel` for the real‑time preview.
- `src/lib/render/ass.ts` — serializes the same spec to an `.ass` file for FFmpeg.

Because preview and export consume identical data, a template *looks the same* in the editor and in the final 4K MP4.

## 📁 Project structure

```
src/
  app/
    (app)/                  # authenticated area (sidebar shell)
      dashboard/ projects/ templates/ upload/ pricing/ account/ admin/ help/
    styles/                 # ⭐ the "Pick a style" screen (own sticky top bar)
    editor/[projectId]/     # timeline + preview + style panel
    login/ signup/ forgot-password/
    api/
      transcribe/ translate/ render/ checkout/
      cloudinary/sign/ webhooks/{stripe,razorpay}/
    page.tsx                # marketing landing
  components/               # ui/ (shadcn), editor/, styles/, marketing/, brand/
  lib/
    render/                 # engine, canvas, ass, defaults  (shared spec)
    data/                   # templates (130+), categories, languages, plans, fonts
    store/editor.ts         # zustand editor state + undo/redo
    supabase/               # browser + server + service clients
supabase/migrations/        # schema + RLS
scripts/seed-templates.ts   # seed templates from the typed config
worker/                     # FFmpeg render worker + Dockerfile
```

## 🚀 Deploy

### App → Vercel
- Import the repo, set the env vars from `.env.example`, deploy. (App Router, Node runtime for webhooks.)

### Worker → Railway / Fly.io
```bash
cd worker
docker build -t captionforge-worker .
docker run -e NEXT_PUBLIC_SUPABASE_URL=... -e SUPABASE_SERVICE_ROLE_KEY=... \
           -e NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=... -e CLOUDINARY_API_KEY=... \
           -e CLOUDINARY_API_SECRET=... -e RESEND_API_KEY=... captionforge-worker
```
The worker polls `renders` where `status='queued'`, burns captions, uploads the MP4, and emails the user.

## 📈 Scaling notes

- **Render throughput** — the worker is stateless and horizontally scalable; run N replicas. Each replica claims one queued job at a time (upgrade to `select … for update skip locked` via an RPC for stricter locking under high concurrency). Use GPU images (`h264_nvenc`) for 4K.
- **Uploads** — go **directly** browser → Cloudinary (signed), so the app server never proxies 500MB files.
- **AI cost control** — the `credits_ledger` table + `credits_per_min` on templates meter Whisper/LLM usage per plan.
- **DB** — all user data is protected by RLS (owner‑scoped); service‑role key is used only by webhooks/worker. Add read replicas + `pgbouncer` as you grow.
- **Caching** — templates are static config; cache `/templates` and the style picker at the edge.

## ⌨️ Editor shortcuts
`Space` play/pause · `←/→` nudge · `⌘/Ctrl+Z` undo · `⌘/Ctrl+⇧+Z` redo · split/merge from the timeline toolbar.

---

Built as a production‑ready foundation. All template artwork, names and designs are original to CaptionForge; only layout/UX patterns are inspired by common creator tools.
