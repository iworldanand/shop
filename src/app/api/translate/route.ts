import { apiError, hasEnv, json, safeJson } from "@/lib/api-helpers";
import { LANGUAGE_MAP } from "@/lib/data/languages";
import type { CaptionSegment } from "@/lib/types";

interface Body {
  segments: CaptionSegment[];
  targetLanguage: string; // ISO code
}

/**
 * Translates caption segments while preserving timing.
 * Uses OpenAI (TRANSLATION_PROVIDER=openai, default) or Gemini
 * (TRANSLATION_PROVIDER=gemini). Falls back to a passthrough in demo mode.
 */
export async function POST(req: Request) {
  const body = await safeJson<Body>(req);
  if (!body?.segments?.length) return apiError("segments are required", 422);
  const lang = LANGUAGE_MAP[body.targetLanguage];
  if (!lang) return apiError("Unsupported target language", 422);

  const provider = process.env.TRANSLATION_PROVIDER ?? "openai";
  const texts = body.segments.map((s) => s.text);

  // Demo fallback — return original text tagged with target language.
  if (
    (provider === "openai" && !hasEnv("OPENAI_API_KEY")) ||
    (provider === "gemini" && !hasEnv("GEMINI_API_KEY"))
  ) {
    return json({ demo: true, language: lang.code, segments: body.segments });
  }

  const prompt =
    `Translate each line of the following numbered list into ${lang.name} (${lang.native}). ` +
    `Return ONLY a JSON array of strings in the same order, no numbering, no commentary.\n\n` +
    texts.map((t, i) => `${i + 1}. ${t}`).join("\n");

  try {
    let translated: string[] = [];

    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: "application/json" },
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) return apiError(data.error?.message ?? "Gemini error", 502);
      translated = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]");
    } else {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
          messages: [
            { role: "system", content: "You are a professional subtitle translator." },
            { role: "user", content: prompt },
          ],
          response_format: { type: "json_object" },
          temperature: 0.2,
        }),
      });
      const data = await res.json();
      if (!res.ok) return apiError(data.error?.message ?? "OpenAI error", 502);
      const parsed = JSON.parse(data.choices?.[0]?.message?.content ?? "{}");
      translated = Array.isArray(parsed) ? parsed : parsed.translations ?? parsed.lines ?? [];
    }

    const segments = body.segments.map((s, i) => ({
      ...s,
      text: translated[i] ?? s.text,
      language: lang.code,
      // Word timing is re-derived client-side after translation.
      words: [],
    }));

    return json({ language: lang.code, segments });
  } catch (err: any) {
    return apiError(err?.message ?? "Translation failed", 500);
  }
}
