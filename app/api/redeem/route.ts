import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { code } = await request.json()
  if (!code) return NextResponse.json({ error: 'Missing code' }, { status: 400 })

  // Look up gift card
  const { data: gift } = await supabase
    .from('gift_cards')
    .select('*, prayer:prayers(*)')
    .eq('code', code.trim().toUpperCase())
    .single()

  if (!gift) return NextResponse.json({ error: 'Gift card not found' }, { status: 404 })
  if (gift.redeemed_by) return NextResponse.json({ error: 'This gift has already been redeemed' }, { status: 400 })
  if (gift.from_user_id === user.id) return NextResponse.json({ error: 'You cannot redeem your own gift card' }, { status: 400 })

  // Mark as redeemed
  const { error: redeemError } = await supabase
    .from('gift_cards')
    .update({ redeemed_by: user.id, redeemed_at: new Date().toISOString() })
    .eq('code', code.trim().toUpperCase())
    .is('redeemed_by', null)
  if (redeemError) return NextResponse.json({ error: redeemError.message }, { status: 500 })

  // Add credits or transfer prayer
  if (gift.type === 'credits' && gift.credit_amount) {
    const { error: creditError } = await supabase.rpc('add_credits', {
      user_id: user.id,
      amount: gift.credit_amount,
    })
    if (creditError) return NextResponse.json({ error: creditError.message }, { status: 500 })

    // Log transaction
    await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'gift_received',
      amount: gift.credit_amount,
    })

    return NextResponse.json({ type: 'credits', credits: gift.credit_amount })
  }

  if (gift.type === 'prayer' && gift.prayer) {
    // Transfer prayer ownership to redeemer
    await supabase
      .from('prayers')
      .update({ withdrawn_by: user.id, status: 'withdrawn' })
      .eq('id', gift.prayer.id)

    return NextResponse.json({
      type: 'prayer',
      prayer: { type: gift.prayer.type, intention: gift.prayer.intention },
    })
  }

  return NextResponse.json({ error: 'Unknown gift type' }, { status: 400 })
}
