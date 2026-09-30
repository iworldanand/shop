// ============================================================================
// CaptionForge render worker
// Polls the Supabase `renders` queue, burns ASS captions into the source video
// with FFmpeg, uploads the result to Cloudinary, updates status, and emails the
// user a download link. Deploy on Railway / Fly.io / a GPU box.
// ============================================================================

import { createClient } from "@supabase/supabase-js";
import { spawn } from "node:child_process";
import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";

const {
  NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  RESEND_API_KEY,
  POLL_INTERVAL_MS = "4000",
} = process.env;

if (!NEXT_PUBLIC_SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const SCALE = { "720p": 720, "1080p": 1080, "4k": 2160 };
const ASPECT = { "9:16": [9, 16], "1:1": [1, 1], "16:9": [16, 9], "4:5": [4, 5] };

function run(cmd, args, onProgress) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args);
    let stderr = "";
    p.stderr.on("data", (d) => {
      stderr += d.toString();
      const m = /time=(\d+):(\d+):(\d+\.\d+)/.exec(d.toString());
      if (m && onProgress) {
        const secs = +m[1] * 3600 + +m[2] * 60 + +m[3];
        onProgress(secs);
      }
    });
    p.on("close", (code) => (code === 0 ? resolve() : reject(new Error(stderr.slice(-800)))));
    p.on("error", reject);
  });
}

async function uploadToCloudinary(filePath) {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = "captionforge/renders";
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1").update(toSign + CLOUDINARY_API_SECRET).digest("hex");

  const form = new FormData();
  const buf = await import("node:fs/promises").then((fs) => fs.readFile(filePath));
  form.append("file", new Blob([buf]), "export.mp4");
  form.append("api_key", CLOUDINARY_API_KEY);
  form.append("timestamp", String(timestamp));
  form.append("folder", folder);
  form.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
    { method: "POST", body: form }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message ?? "Cloudinary upload failed");
  return data.secure_url;
}

async function sendEmail(to, url) {
  if (!RESEND_API_KEY || !to) return;
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "CaptionForge <renders@captionforge.app>",
      to,
      subject: "Your video is ready 🎬",
      html: `<p>Your CaptionForge export is ready.</p><p><a href="${url}">Download your video</a></p>`,
    }),
  }).catch(() => {});
}

async function processJob(job) {
  const dir = await mkdtemp(join(tmpdir(), "cf-"));
  const srcPath = join(dir, "src.mp4");
  const assPath = join(dir, "subs.ass");
  const outPath = join(dir, "out.mp4");

  try {
    await supabase.from("renders").update({ status: "processing", progress: 1 }).eq("id", job.id);

    // Resolve source video URL from the project's video row.
    const { data: video } = await supabase
      .from("videos")
      .select("url")
      .eq("project_id", job.project_id)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!video?.url) throw new Error("Source video not found");

    // Download source
    const srcRes = await fetch(video.url);
    if (!srcRes.ok) throw new Error("Could not download source video");
    await writeFile(srcPath, Buffer.from(await srcRes.arrayBuffer()));
    await writeFile(assPath, job.ass_payload ?? "");

    // Get duration for progress %
    const { data: proj } = await supabase.from("projects").select("duration_sec, user_id").eq("id", job.project_id).single();
    const duration = proj?.duration_sec || 1;

    const [aw, ah] = ASPECT[job.aspect] ?? [9, 16];
    const targetH = SCALE[job.resolution] ?? 1080;
    const targetW = Math.round((targetH * aw) / ah / 2) * 2;

    // Build filter graph: scale -> pad -> burn ASS -> optional watermark
    let vf = `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH},ass=${assPath}`;
    if (job.watermark) {
      vf += `,drawtext=text='CaptionForge':fontcolor=white@0.65:fontsize=${Math.round(targetH / 40)}:x=w-tw-24:y=h-th-24`;
    }

    await run(
      "ffmpeg",
      ["-y", "-i", srcPath, "-vf", vf, "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", outPath],
      (secs) => {
        const pct = Math.min(99, Math.round((secs / duration) * 100));
        supabase.from("renders").update({ progress: pct }).eq("id", job.id);
      }
    );

    const outputUrl = await uploadToCloudinary(outPath);
    await supabase.from("renders").update({ status: "done", progress: 100, output_url: outputUrl }).eq("id", job.id);
    await supabase.from("projects").update({ status: "done" }).eq("id", job.project_id);

    if (proj?.user_id) {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", proj.user_id).single();
      await sendEmail(profile?.email, outputUrl);
    }

    console.log(`✓ Rendered ${job.id} -> ${outputUrl}`);
  } catch (err) {
    console.error(`✗ Render ${job.id} failed:`, err.message);
    await supabase.from("renders").update({ status: "failed", error: err.message }).eq("id", job.id);
    await supabase.from("projects").update({ status: "failed" }).eq("id", job.project_id);
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}

async function loop() {
  console.log("CaptionForge worker online. Polling for jobs…");
  // Recover any jobs stuck in 'processing' on restart.
  await supabase.from("renders").update({ status: "queued" }).eq("status", "processing");

  while (true) {
    const { data: jobs } = await supabase
      .from("renders")
      .select("*")
      .eq("status", "queued")
      .order("created_at", { ascending: true })
      .limit(1);

    if (jobs && jobs.length) {
      await processJob(jobs[0]);
    } else {
      await new Promise((r) => setTimeout(r, Number(POLL_INTERVAL_MS)));
    }
  }
}

loop().catch((e) => {
  console.error(e);
  process.exit(1);
});
