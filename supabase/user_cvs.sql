-- ============================================================
-- Run this in your Supabase SQL Editor (once)
-- Dashboard → SQL Editor → New query → paste → Run
-- ============================================================

create table if not exists public.user_cvs (
  id          uuid        primary key default gen_random_uuid(),
  user_id     uuid        not null references auth.users(id) on delete cascade,
  name        text        not null default 'My CV',
  data        jsonb       not null default '{}',
  template    text        not null default 'modern-stack',
  accent      text        not null default '#1e3a8a',
  font_id     text        not null default 'outfit',
  font_size   text        not null default 'medium',
  paper       text        not null default 'a4',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user lookups
create index if not exists user_cvs_user_id_idx on public.user_cvs (user_id);

-- Row-Level Security
alter table public.user_cvs enable row level security;

create policy "Users can view own CVs"
  on public.user_cvs for select
  using (auth.uid() = user_id);

create policy "Users can insert own CVs"
  on public.user_cvs for insert
  with check (auth.uid() = user_id);

create policy "Users can update own CVs"
  on public.user_cvs for update
  using (auth.uid() = user_id);

create policy "Users can delete own CVs"
  on public.user_cvs for delete
  using (auth.uid() = user_id);

-- Auto-update updated_at on every row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_cvs_updated_at on public.user_cvs;
create trigger user_cvs_updated_at
  before update on public.user_cvs
  for each row execute function public.set_updated_at();
