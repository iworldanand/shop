import { createHash } from "crypto";
import { apiError, hasEnv, json } from "@/lib/api-helpers";

/**
 * Returns a signature for direct, unsigned-safe browser uploads to Cloudinary.
 * Client posts the file straight to Cloudinary using these params, keeping the
 * 500MB video off our server. Requires CLOUDINARY_* env vars.
 */
export async function GET() {
  if (!hasEnv("CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET", "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME")) {
    return json({
      demo: true,
      message: "Cloudinary not configured. Add CLOUDINARY_* env vars for real uploads.",
    });
  }

  const timestamp = Math.round(Date.now() / 1000);
  const folder = "captionforge/uploads";
  // Cloudinary signature = sha1 of sorted params + api_secret
  const toSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = createHash("sha1")
    .update(toSign + process.env.CLOUDINARY_API_SECRET)
    .digest("hex");

  return json({
    signature,
    timestamp,
    folder,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    uploadUrl: `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload`,
  });
}
