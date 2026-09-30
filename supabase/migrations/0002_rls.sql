-- ============================================================================
-- CaptionForge — Row Level Security
-- Owner-scoped access for user data; public read for published templates;
-- admin override via profiles.role = 'admin'.
-- ============================================================================

-- Helper: is the current user an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin');
$$;

-- Enable RLS everywhere.
alter table public.profiles         enable row level security;
alter table public.projects         enable row level security;
alter table public.videos           enable row level security;
alter table public.transcripts      enable row level security;
alter table public.caption_segments enable row level security;
alter table public.translations     enable row level security;
alter table public.templates        enable row level security;
alter table public.user_styles      enable row level security;
alter table public.brand_kits       enable row level security;
alter table public.renders          enable row level security;
alter table public.subscriptions    enable row level security;
alter table public.payments         enable row level security;
alter table public.credits_ledger   enable row level security;
alter table public.admin_logs       enable row level security;
alter table public.feature_flags    enable row level security;

-- ---------- profiles ----------
drop policy if exists "profiles self read" on public.profiles;
create policy "profiles self read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles self update" on public.profiles;
create policy "profiles self update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());

-- ---------- projects (owner) ----------
drop policy if exists "projects owner all" on public.projects;
create policy "projects owner all" on public.projects
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- videos (via project owner) ----------
drop policy if exists "videos via project" on public.videos;
create policy "videos via project" on public.videos
  for all using (
    exists (select 1 from public.projects p where p.id = videos.project_id and (p.user_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.projects p where p.id = videos.project_id and p.user_id = auth.uid())
  );

-- ---------- transcripts (via project owner) ----------
drop policy if exists "transcripts via project" on public.transcripts;
create policy "transcripts via project" on public.transcripts
  for all using (
    exists (select 1 from public.projects p where p.id = transcripts.project_id and (p.user_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.projects p where p.id = transcripts.project_id and p.user_id = auth.uid())
  );

-- ---------- caption_segments (via transcript -> project owner) ----------
drop policy if exists "segments via transcript" on public.caption_segments;
create policy "segments via transcript" on public.caption_segments
  for all using (
    exists (
      select 1 from public.transcripts t join public.projects p on p.id = t.project_id
      where t.id = caption_segments.transcript_id and (p.user_id = auth.uid() or public.is_admin())
    )
  ) with check (
    exists (
      select 1 from public.transcripts t join public.projects p on p.id = t.project_id
      where t.id = caption_segments.transcript_id and p.user_id = auth.uid()
    )
  );

-- ---------- translations (via transcript -> project owner) ----------
drop policy if exists "translations via transcript" on public.translations;
create policy "translations via transcript" on public.translations
  for all using (
    exists (
      select 1 from public.transcripts t join public.projects p on p.id = t.project_id
      where t.id = translations.transcript_id and (p.user_id = auth.uid() or public.is_admin())
    )
  ) with check (
    exists (
      select 1 from public.transcripts t join public.projects p on p.id = t.project_id
      where t.id = translations.transcript_id and p.user_id = auth.uid()
    )
  );

-- ---------- templates ----------
drop policy if exists "templates public read" on public.templates;
create policy "templates public read" on public.templates
  for select using (published = true or public.is_admin());
drop policy if exists "templates admin write" on public.templates;
create policy "templates admin write" on public.templates
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- user_styles ----------
drop policy if exists "user_styles owner or approved" on public.user_styles;
create policy "user_styles owner or approved" on public.user_styles
  for select using (user_id = auth.uid() or (published = true and approved = true) or public.is_admin());
drop policy if exists "user_styles owner write" on public.user_styles;
create policy "user_styles owner write" on public.user_styles
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- brand_kits (owner) ----------
drop policy if exists "brand_kits owner" on public.brand_kits;
create policy "brand_kits owner" on public.brand_kits
  for all using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid());

-- ---------- renders (via project owner) ----------
drop policy if exists "renders via project" on public.renders;
create policy "renders via project" on public.renders
  for all using (
    exists (select 1 from public.projects p where p.id = renders.project_id and (p.user_id = auth.uid() or public.is_admin()))
  ) with check (
    exists (select 1 from public.projects p where p.id = renders.project_id and p.user_id = auth.uid())
  );

-- ---------- subscriptions (owner read; writes via service role) ----------
drop policy if exists "subscriptions owner read" on public.subscriptions;
create policy "subscriptions owner read" on public.subscriptions
  for select using (user_id = auth.uid() or public.is_admin());

-- ---------- payments (owner read) ----------
drop policy if exists "payments owner read" on public.payments;
create policy "payments owner read" on public.payments
  for select using (user_id = auth.uid() or public.is_admin());

-- ---------- credits_ledger (owner read) ----------
drop policy if exists "credits owner read" on public.credits_ledger;
create policy "credits owner read" on public.credits_ledger
  for select using (user_id = auth.uid() or public.is_admin());

-- ---------- admin_logs (admin only) ----------
drop policy if exists "admin_logs admin" on public.admin_logs;
create policy "admin_logs admin" on public.admin_logs
  for all using (public.is_admin()) with check (public.is_admin());

-- ---------- feature_flags (public read, admin write) ----------
drop policy if exists "flags read" on public.feature_flags;
create policy "flags read" on public.feature_flags for select using (true);
drop policy if exists "flags admin write" on public.feature_flags;
create policy "flags admin write" on public.feature_flags
  for all using (public.is_admin()) with check (public.is_admin());

-- NOTE: subscriptions / payments / credits inserts+updates are performed by the
-- service-role key (webhooks, worker), which bypasses RLS.
