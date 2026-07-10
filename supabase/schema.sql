-- ============================================================
-- Daily Discipline — Supabase schema
-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New query
-- ============================================================

create table if not exists public.settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  data jsonb not null,
  updated_at timestamptz default now()
);

create table if not exists public.entries (
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  data jsonb not null,
  updated_at timestamptz default now(),
  primary key (user_id, date)
);

-- Row Level Security: each user can only see their own data
alter table public.settings enable row level security;
alter table public.entries enable row level security;

create policy "own settings" on public.settings
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own entries" on public.entries
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
