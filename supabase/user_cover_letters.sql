-- ============================================================
-- Run this in your Supabase SQL Editor (once)
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

create table if not exists public.user_cover_letters (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default 'My Cover Letter',
  data        jsonb       not null default '{}',
  letter      text        not null default '',
  template    text        not null default 'modern',
  accent      text        not null default '#1e3a8a',
  font_id     text        not null default 'outfit',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user lookups
create index if not exists user_cover_letters_user_id_idx on public.user_cover_letters (user_id);

-- Row-Level Security
alter table public.user_cover_letters enable row level security;

create policy "Users can view own cover letters"
  on public.user_cover_letters for select
  using (auth.uid() = user_id);

create policy "Users can insert own cover letters"
  on public.user_cover_letters for insert
  with check (auth.uid() = user_id);

create policy "Users can update own cover letters"
  on public.user_cover_letters for update
  using (auth.uid() = user_id);

create policy "Users can delete own cover letters"
  on public.user_cover_letters for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at (reuses the function created by user_cvs.sql)
drop trigger if exists user_cover_letters_updated_at on public.user_cover_letters;
create trigger user_cover_letters_updated_at
  before update on public.user_cover_letters
  for each row execute function public.set_updated_at();
