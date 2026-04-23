import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { type, intention, offeredFor, creditValue, needId } = await request.json()
  if (!type || !offeredFor || !creditValue) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
  }

  // Get user's country for display
  const { data: profile } = await supabase
    .from('profiles')
    .select('country')
    .eq('id', user.id)
    .single()

  // Insert prayer
  const { data: newPrayer, error: prayerError } = await supabase.from('prayers').insert({
    depositor_id: user.id,
    type,
    intention: intention || null,
    offered_for: offeredFor,
    credit_value: creditValue,
    status: 'available',
    country: profile?.country ?? null,
  }).select().single()
  if (prayerError) return NextResponse.json({ error: prayerError.message }, { status: 500 })

  // If this prayer was for a specific need, fulfill it
  if (needId) {
    await supabase
      .from('needs')
      .update({ status: 'fulfilled', prayed_by: user.id })
      .eq('id', needId)
  }

  // Increment user credits and total_deposited
  const { error: profileError } = await supabase.rpc('add_credits', {
    user_id: user.id,
    amount: creditValue,
  })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
