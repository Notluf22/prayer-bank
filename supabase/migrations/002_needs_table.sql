-- ============================================================
-- NEEDS TABLE
-- ============================================================

create table if not exists public.needs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  intention text not null,
  status text not null default 'pending', -- pending, praying, fulfilled
  prayed_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- RLS
alter table public.needs enable row level security;

create policy "needs_select_all" on public.needs for select using (true);
create policy "needs_insert_own" on public.needs for insert with check (auth.uid() = user_id);
create policy "needs_update_any" on public.needs for update using (true);

-- Index
create index if not exists needs_status_idx on public.needs(status);
create index if not exists needs_user_id_idx on public.needs(user_id);
