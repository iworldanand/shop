-- ============================================================================
-- CaptionForge — core schema
-- Postgres / Supabase. Run in order (0001 then 0002_rls).
-- ============================================================================

create extension if not exists "pgcrypto";

-- ---------- Enums ----------
do $$ begin
  create type plan_id as enum ('free','starter','pro','business');
exception when duplicate_object then null; end $$;

do $$ begin
  create type sub_status as enum ('active','trialing','past_due','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type project_status as enum ('uploading','transcribing','ready','rendering','done','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type render_status as enum ('queued','processing','done','failed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('user','admin');
exception when duplicate_object then null; end $$;

-- ---------- profiles (1:1 with auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text,
  avatar_url text,
  role user_role not null default 'user',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null default 'Untitled project',
  status project_status not null default 'uploading',
  aspect_ratio text not null default '9:16',
  duration_sec numeric not null default 0,
  language text not null default 'en',
  template_id text,
  thumbnail_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_user_idx on public.projects(user_id);

-- ---------- videos ----------
create table if not exists public.videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  cloudinary_public_id text,
  url text,
  audio_url text,
  width int,
  height int,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

-- ---------- transcripts + caption segments + translations ----------
create table if not exists public.transcripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  language text not null,
  detected_language text,
  created_at timestamptz not null default now()
);

create table if not exists public.caption_segments (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  idx int not null,
  start_sec numeric not null,
  end_sec numeric not null,
  text text not null,
  words jsonb not null default '[]'::jsonb
);
create index if not exists caption_segments_transcript_idx on public.caption_segments(transcript_id);

create table if not exists public.translations (
  id uuid primary key default gen_random_uuid(),
  transcript_id uuid not null references public.transcripts(id) on delete cascade,
  language text not null,
  segments jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  unique (transcript_id, language)
);

-- ---------- templates (seeded from typed config) ----------
create table if not exists public.templates (
  id text primary key,
  name text not null,
  category text not null,
  tags text[] not null default '{}',
  is_pro boolean not null default false,
  credits_per_min numeric not null default 1,
  popular boolean not null default false,
  aspect_ratios text[] not null default '{9:16}',
  preview_video_url text,
  thumbnail_url text,
  description text,
  spec jsonb not null,
  published boolean not null default true,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists templates_category_idx on public.templates(category);

-- ---------- user_styles (customized / saved styles) ----------
create table if not exists public.user_styles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  based_on text references public.templates(id) on delete set null,
  name text not null,
  spec jsonb not null,
  published boolean not null default false,       -- community publish request
  approved boolean not null default false,        -- admin approval
  created_at timestamptz not null default now()
);
create index if not exists user_styles_user_idx on public.user_styles(user_id);

-- ---------- brand_kits ----------
create table if not exists public.brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null default 'My brand',
  logo_url text,
  fonts text[] not null default '{}',
  colors text[] not null default '{}',
  default_template_id text references public.templates(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------- renders (queue) ----------
create table if not exists public.renders (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  resolution text not null default '1080p',
  format text not null default 'mp4',
  status render_status not null default 'queued',
  progress int not null default 0,
  watermark boolean not null default false,
  aspect text not null default '9:16',
  ass_payload text,
  output_url text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists renders_status_idx on public.renders(status);

-- ---------- subscriptions ----------
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique references public.profiles(id) on delete cascade,
  plan plan_id not null default 'free',
  status sub_status not null default 'active',
  provider text not null default 'none',
  stripe_customer_id text,
  stripe_subscription_id text,
  razorpay_subscription_id text,
  current_period_end timestamptz,
  updated_at timestamptz not null default now()
);

-- ---------- payments ----------
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  provider text not null,
  provider_ref text,
  amount numeric not null,
  currency text not null default 'USD',
  status text not null default 'succeeded',
  created_at timestamptz not null default now()
);

-- ---------- credits_ledger ----------
create table if not exists public.credits_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  delta int not null,               -- +granted / -consumed
  reason text not null,
  balance_after int,
  created_at timestamptz not null default now()
);
create index if not exists credits_user_idx on public.credits_ledger(user_id);

-- ---------- admin_logs ----------
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  actor uuid references public.profiles(id) on delete set null,
  action text not null,
  target text,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

-- ---------- feature_flags ----------
create table if not exists public.feature_flags (
  id text primary key,
  label text not null,
  description text,
  enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

-- ---------- updated_at trigger ----------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array['profiles','projects','templates','renders','subscriptions'] loop
    execute format('drop trigger if exists touch_%1$s on public.%1$s;', t);
    execute format('create trigger touch_%1$s before update on public.%1$s for each row execute function public.touch_updated_at();', t);
  end loop;
end $$;
