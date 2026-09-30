import { apiError, hasEnv, json, safeJson } from "@/lib/api-helpers";
import { SAMPLE_SEGMENTS } from "@/lib/data/sample";
import type { CaptionSegment } from "@/lib/types";

interface Body {
  audioUrl: string; // Cloudinary URL of extracted audio
  language?: string; // "auto" or ISO code
  projectId?: string;
}

/**
 * Transcribes audio with OpenAI Whisper (word-level timestamps).
 * Requires OPENAI_API_KEY. Falls back to sample segments in demo mode so the
 * editor is always populated.
 */
export async function POST(req: Request) {
  const body = await safeJson<Body>(req);
  if (!body?.audioUrl) return apiError("audioUrl is required", 422);

  if (!hasEnv("OPENAI_API_KEY")) {
    return json({ demo: true, detectedLanguage: "en", segments: SAMPLE_SEGMENTS });
  }

  try {
    // Fetch the audio and forward to Whisper with verbose_json + word granularity.
    const audioRes = await fetch(body.audioUrl);
    if (!audioRes.ok) return apiError("Could not fetch audio", 502);
    const audioBlob = await audioRes.blob();

    const form = new FormData();
    form.append("file", audioBlob, "audio.mp3");
    form.append("model", "whisper-1");
    form.append("response_format", "verbose_json");
    form.append("timestamp_granularities[]", "word");
    form.append("timestamp_granularities[]", "segment");
    if (body.language && body.language !== "auto") form.append("language", body.language);

    const res = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) return apiError(data.error?.message ?? "Whisper error", 502);

    const words: { text: string; start: number; end: number }[] =
      (data.words ?? []).map((w: any) => ({ text: w.word, start: w.start, end: w.end }));

    const segments: CaptionSegment[] = (data.segments ?? []).map((s: any, i: number) => ({
      id: `seg-${i}`,
      start: s.start,
      end: s.end,
      text: (s.text ?? "").trim(),
      language: data.language ?? "en",
      words: words.filter((w) => w.start >= s.start && w.end <= s.end + 0.01),
    }));

    return json({ detectedLanguage: data.language ?? "en", segments });
  } catch (err: any) {
    return apiError(err?.message ?? "Transcription failed", 500);
  }
}
