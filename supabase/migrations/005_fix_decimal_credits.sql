-- ============================================================
-- Fix: Allow decimal credit values (for Hail Mary = 0.1 credits)
-- The columns were INTEGER which silently rejected/truncated 0.1
-- ============================================================

-- 1. Alter profiles columns to support decimals
ALTER TABLE public.profiles
  ALTER COLUMN credits TYPE numeric(10,2) USING credits::numeric(10,2),
  ALTER COLUMN total_deposited TYPE numeric(10,2) USING total_deposited::numeric(10,2);

-- 2. Alter prayers credit_value to support decimals
ALTER TABLE public.prayers
  ALTER COLUMN credit_value TYPE numeric(10,2) USING credit_value::numeric(10,2),
  ALTER COLUMN credit_value SET DEFAULT 1;

-- 3. Recreate add_credits with numeric parameter
CREATE OR REPLACE FUNCTION public.add_credits(user_id uuid, amount numeric)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET
    credits = credits + amount,
    total_deposited = CASE WHEN amount > 0 THEN total_deposited + 1 ELSE total_deposited END
  WHERE id = user_id;

  INSERT INTO public.transactions(user_id, type, amount)
  VALUES (user_id, 'deposit', amount);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recreate deduct_credits with numeric parameter
CREATE OR REPLACE FUNCTION public.deduct_credits(user_id uuid, amount numeric)
RETURNS void AS $$
DECLARE
  current_credits numeric;
BEGIN
  SELECT credits INTO current_credits FROM public.profiles WHERE id = user_id;
  IF current_credits < amount THEN
    RAISE EXCEPTION 'Not enough credits';
  END IF;
  UPDATE public.profiles SET credits = credits - amount WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Also fix transactions amount column to support decimals
ALTER TABLE public.transactions
  ALTER COLUMN amount TYPE numeric(10,2) USING amount::numeric(10,2),
  ALTER COLUMN amount SET DEFAULT 0;
