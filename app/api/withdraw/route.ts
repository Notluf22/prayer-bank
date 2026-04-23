import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { prayerId } = await request.json()
  if (!prayerId) return NextResponse.json({ error: 'Missing prayerId' }, { status: 400 })

  // Get prayer
  const { data: prayer } = await supabase
    .from('prayers')
    .select('*')
    .eq('id', prayerId)
    .eq('status', 'available')
    .single()
  if (!prayer) return NextResponse.json({ error: 'Prayer not found or already withdrawn' }, { status: 404 })

  // Check user credits
  const { data: profile } = await supabase
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()
  if (!profile || profile.credits < prayer.credit_value) {
    return NextResponse.json({ error: 'Not enough credits' }, { status: 400 })
  }

  // Mark prayer as withdrawn
  const { error: prayerError } = await supabase
    .from('prayers')
    .update({ status: 'withdrawn', withdrawn_by: user.id })
    .eq('id', prayerId)
    .eq('status', 'available')
  if (prayerError) return NextResponse.json({ error: prayerError.message }, { status: 500 })

  // Deduct credits
  const { error: creditError } = await supabase.rpc('deduct_credits', {
    user_id: user.id,
    amount: prayer.credit_value,
  })
  if (creditError) return NextResponse.json({ error: creditError.message }, { status: 500 })

  // Log transaction
  await supabase.from('transactions').insert({
    user_id: user.id,
    type: 'withdraw',
    prayer_id: prayerId,
    amount: -prayer.credit_value,
  })

  // Increment sparks_received for the depositor (The Constellation logic)
  await supabase
    .from('profiles')
    .update({ sparks_received: (await supabase.from('profiles').select('sparks_received').eq('id', prayer.depositor_id).single()).data?.sparks_received + 1 })
    .eq('id', prayer.depositor_id)

  return NextResponse.json({ success: true })
}
