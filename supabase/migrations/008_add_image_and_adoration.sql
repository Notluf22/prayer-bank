-- ============================================================
-- ADD AI CARD ARTWORK IMAGE TO GIFT CARDS AND ADORATION TRACKER
-- ============================================================

-- 1. Alter gift_cards table to store generated/custom image links or keys
ALTER TABLE public.gift_cards 
  ADD COLUMN IF NOT EXISTS card_image text;

-- 2. Create adoration_sessions table to verify and audit logged adoration hours
CREATE TABLE IF NOT EXISTS public.adoration_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  duration_minutes integer NOT NULL,
  credits_earned numeric(10,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on adoration_sessions
ALTER TABLE public.adoration_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for adoration_sessions
CREATE POLICY "adoration_sessions_select" ON public.adoration_sessions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "adoration_sessions_insert" ON public.adoration_sessions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Index for performance
CREATE INDEX IF NOT EXISTS adoration_sessions_user_id_idx ON public.adoration_sessions(user_id);
