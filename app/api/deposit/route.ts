import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

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

  if (needId) {
    // Check user credits first
    const { data: profile } = await supabase
      .from('profiles')
      .select('credits')
      .eq('id', user.id)
      .single()

    if (!profile || profile.credits < creditValue) {
      return NextResponse.json({ error: 'Not enough grace credits to offer this prayer.' }, { status: 400 })
    }

    // Fulfill the need
    await supabase
      .from('needs')
      .update({ status: 'fulfilled', prayed_by: user.id })
      .eq('id', needId)

    // Deduct credits from the user praying
    const { error: creditError } = await supabase.rpc('deduct_credits', {
      user_id: user.id,
      amount: creditValue,
    })
    if (creditError) return NextResponse.json({ error: creditError.message }, { status: 500 })

    // Log transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'withdraw',
      prayer_id: null,
      amount: -creditValue,
    })

  } else {
    // Normal flow: insert to bank, credit user
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
  }

  revalidatePath('/dashboard')
  return NextResponse.json({ success: true })
}
