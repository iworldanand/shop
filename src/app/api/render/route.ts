import { apiError, json, safeJson } from "@/lib/api-helpers";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { specToAss } from "@/lib/render/ass";
import type { AspectRatio, CaptionSegment, RenderSpec } from "@/lib/types";

interface Body {
  projectId: string;
  spec: RenderSpec;
  segments: CaptionSegment[];
  aspect: AspectRatio;
  resolution: "720p" | "1080p" | "4k";
  watermark: boolean;
}

/**
 * Enqueues an FFmpeg render job. The worker (see /worker) picks jobs from the
 * `renders` table, downloads the source video from Cloudinary, burns the ASS
 * subtitles generated here, uploads the result, and emails the user.
 * In demo mode (no Supabase) it returns a synthetic job id.
 */
export async function POST(req: Request) {
  const body = await safeJson<Body>(req);
  if (!body?.projectId || !body.spec || !body.segments) {
    return apiError("projectId, spec and segments are required", 422);
  }

  // Pre-compute the ASS so the worker only needs FFmpeg, not our render engine.
  let ass: string;
  try {
    ass = specToAss(body.spec, body.segments, body.aspect);
  } catch (err: any) {
    return apiError(`Invalid render spec: ${err?.message ?? "unknown"}`, 422);
  }

  const supabase = createAdminClient() ?? createClient();
  if (!supabase) {
    return json({
      demo: true,
      jobId: `r_demo_${Date.now()}`,
      status: "queued",
      message: "Render queued (demo). Configure Supabase + worker to produce real MP4s.",
    });
  }

  const { data, error } = await supabase
    .from("renders")
    .insert({
      project_id: body.projectId,
      resolution: body.resolution,
      format: "mp4",
      status: "queued",
      progress: 0,
      watermark: body.watermark,
      ass_payload: ass,
      aspect: body.aspect,
    })
    .select("id")
    .single();

  if (error) return apiError(error.message, 500);
  return json({ jobId: data.id, status: "queued" });
}

/** Poll render status. */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return apiError("id is required", 422);

  const supabase = createClient();
  if (!supabase) {
    return json({ id, status: "done", progress: 100, outputUrl: null, demo: true });
  }
  const { data, error } = await supabase.from("renders").select("*").eq("id", id).single();
  if (error) return apiError(error.message, 404);
  return json(data);
}
