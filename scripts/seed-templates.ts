/**
 * Seeds the `templates` and `feature_flags` tables from the typed config.
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npm run seed:templates
 *
 * Templates become editable from the admin panel after seeding.
 */
import { createClient } from "@supabase/supabase-js";
import { TEMPLATES } from "../src/lib/data/templates";
import { FEATURE_FLAGS } from "../src/lib/data/admin";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("✗ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log(`→ Seeding ${TEMPLATES.length} templates…`);

  const rows = TEMPLATES.map((t) => ({
    id: t.id,
    name: t.name,
    category: t.category,
    tags: t.tags,
    is_pro: t.is_pro,
    credits_per_min: t.credits_per_min,
    popular: t.popular,
    aspect_ratios: t.aspect_ratios,
    preview_video_url: t.preview_video_url,
    thumbnail_url: t.thumbnail_url,
    description: t.description,
    spec: t.spec,
    published: t.published,
  }));

  // Upsert in chunks to stay well within request limits.
  const chunkSize = 50;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from("templates").upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error("✗ Template upsert failed:", error.message);
      process.exit(1);
    }
    console.log(`  ✓ ${Math.min(i + chunkSize, rows.length)}/${rows.length}`);
  }

  console.log(`→ Seeding ${FEATURE_FLAGS.length} feature flags…`);
  const { error: flagErr } = await supabase.from("feature_flags").upsert(
    FEATURE_FLAGS.map((f) => ({ id: f.id, label: f.label, description: f.desc, enabled: f.on })),
    { onConflict: "id" }
  );
  if (flagErr) {
    console.error("✗ Feature flag upsert failed:", flagErr.message);
    process.exit(1);
  }

  console.log("✓ Seed complete.");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
