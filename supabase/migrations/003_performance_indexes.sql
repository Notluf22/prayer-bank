-- Performance Optimization Migration
-- 1. Index for history queries
create index if not exists prayers_withdrawn_by_idx on public.prayers(withdrawn_by);
create index if not exists transactions_created_at_idx on public.transactions(created_at desc);

-- 2. Index for needs wall sorting
create index if not exists needs_created_at_idx on public.needs(created_at desc);

-- 3. Optimization for gift cards
create index if not exists gift_cards_redeemed_by_idx on public.gift_cards(redeemed_by);
