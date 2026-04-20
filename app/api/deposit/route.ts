import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { type, intention, offeredFor, creditValue } = await request.json()
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
  const { error: prayerError } = await supabase.from('prayers').insert({
    depositor_id: user.id,
    type,
    intention: intention || null,
    offered_for: offeredFor,
    credit_value: creditValue,
    status: 'available',
    country: profile?.country ?? null,
  })
  if (prayerError) return NextResponse.json({ error: prayerError.message }, { status: 500 })

  // Increment user credits and total_deposited
  const { error: profileError } = await supabase.rpc('add_credits', {
    user_id: user.id,
    amount: creditValue,
  })
  if (profileError) return NextResponse.json({ error: profileError.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
