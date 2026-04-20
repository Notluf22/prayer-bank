-- ============================================================
-- PRAYER BANK — Full Database Setup
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Friend',
  country text,
  credits integer not null default 0,
  total_deposited integer not null default 0,
  created_at timestamptz not null default now()
);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1), 'Friend')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 2. PRAYERS TABLE
create type prayer_status as enum ('available', 'withdrawn', 'gifted');

create table if not exists public.prayers (
  id uuid primary key default gen_random_uuid(),
  depositor_id uuid not null references public.profiles(id) on delete cascade,
  type text not null,
  intention text,
  offered_for text not null,
  credit_value integer not null default 1,
  status prayer_status not null default 'available',
  withdrawn_by uuid references public.profiles(id),
  gifted_via text,
  country text,
  created_at timestamptz not null default now()
);

create index if not exists prayers_status_idx on public.prayers(status);
create index if not exists prayers_depositor_idx on public.prayers(depositor_id);


-- 3. GIFT CARDS TABLE
create type gift_type as enum ('credits', 'prayer');

create table if not exists public.gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  type gift_type not null,
  credit_amount integer,
  prayer_id uuid references public.prayers(id),
  from_user_id uuid not null references public.profiles(id) on delete cascade,
  gift_message text,
  redeemed_by uuid references public.profiles(id),
  redeemed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists gift_cards_code_idx on public.gift_cards(code);


-- 4. TRANSACTIONS TABLE (audit log)
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null, -- deposit, withdraw, gift_sent, gift_received
  prayer_id uuid references public.prayers(id),
  amount integer not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists transactions_user_idx on public.transactions(user_id);


-- 5. RPC FUNCTIONS (atomic credit operations)

create or replace function public.add_credits(user_id uuid, amount integer)
returns void as $$
begin
  update public.profiles
  set
    credits = credits + amount,
    total_deposited = case when amount > 0 then total_deposited + 1 else total_deposited end
  where id = user_id;

  insert into public.transactions(user_id, type, amount)
  values (user_id, 'deposit', amount);
end;
$$ language plpgsql security definer;

create or replace function public.deduct_credits(user_id uuid, amount integer)
returns void as $$
declare
  current_credits integer;
begin
  select credits into current_credits from public.profiles where id = user_id;
  if current_credits < amount then
    raise exception 'Not enough credits';
  end if;
  update public.profiles set credits = credits - amount where id = user_id;
end;
$$ language plpgsql security definer;


-- 6. ROW LEVEL SECURITY

alter table public.profiles enable row level security;
alter table public.prayers enable row level security;
alter table public.gift_cards enable row level security;
alter table public.transactions enable row level security;

-- Profiles: users can read all (for display names/countries), edit only their own
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Prayers: anyone can read available prayers; only depositor can see their own withdrawn/gifted
create policy "prayers_select_available" on public.prayers
  for select using (status = 'available' or depositor_id = auth.uid() or withdrawn_by = auth.uid());
create policy "prayers_insert_own" on public.prayers for insert with check (depositor_id = auth.uid());
create policy "prayers_update_own" on public.prayers for update using (
  depositor_id = auth.uid() or withdrawn_by = auth.uid()
);

-- Gift cards: senders and recipients can see their own
create policy "gift_cards_select" on public.gift_cards
  for select using (from_user_id = auth.uid() or redeemed_by = auth.uid() or redeemed_by is null);
create policy "gift_cards_insert_own" on public.gift_cards for insert with check (from_user_id = auth.uid());
create policy "gift_cards_update_redeem" on public.gift_cards
  for update using (redeemed_by is null);

-- Transactions: users see only their own
create policy "transactions_select_own" on public.transactions for select using (user_id = auth.uid());
create policy "transactions_insert" on public.transactions for insert with check (true);


-- ============================================================
-- Done! All tables, functions, triggers and policies created.
-- ============================================================
