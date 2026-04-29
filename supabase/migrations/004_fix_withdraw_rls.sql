-- Drop existing overly restrictive policies
drop policy if exists "prayers_update_own" on public.prayers;

-- Create a new policy that allows anyone to update an 'available' prayer (which they do when withdrawing)
create policy "prayers_update" on public.prayers for update using (
  depositor_id = auth.uid() 
  or withdrawn_by = auth.uid()
  or status = 'available'
);

-- Fix the Constellation sparks logic: create an RPC to increment sparks securely
create or replace function public.increment_sparks(user_id uuid)
returns void as $$
begin
  update public.profiles
  set sparks_received = coalesce(sparks_received, 0) + 1
  where id = user_id;
end;
$$ language plpgsql security definer;
