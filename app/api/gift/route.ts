import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { customAlphabet } from 'nanoid'
import { Resend } from 'resend'

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 12)

function generateCode(): string {
  const id = nanoid()
  return `${id.slice(0, 5)}-${id.slice(5, 9)}-${id.slice(9)}`
}

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { type, creditAmount, prayerId, giftMessage } = await request.json()

  const { data: profile } = await supabase
    .from('profiles')
    .select('credits, display_name')
    .eq('id', user.id)
    .single()

  // For credit gifts: check the user has enough credits
  if (type === 'credits') {
    if (!creditAmount || creditAmount <= 0) return NextResponse.json({ error: 'Invalid credit amount' }, { status: 400 })
    if (!profile || profile.credits < creditAmount) return NextResponse.json({ error: 'Not enough credits' }, { status: 400 })

    // Deduct credits immediately when gifting credits
    const { error: deductError } = await supabase.rpc('deduct_credits', {
      user_id: user.id,
      amount: Number(creditAmount),
    })
    if (deductError) return NextResponse.json({ error: deductError.message }, { status: 500 })
  }

  // For prayer gifts: the prayer must be withdrawn first (handled in withdraw route)
  // Here we just create the gift card linking to an already-withdrawn prayer
  if (type === 'prayer') {
    if (!prayerId) return NextResponse.json({ error: 'Missing prayerId' }, { status: 400 })
    const { data: prayer } = await supabase
      .from('prayers')
      .select('*')
      .eq('id', prayerId)
      .eq('withdrawn_by', user.id)
      .single()
    if (!prayer) return NextResponse.json({ error: 'Prayer not found or not yours to gift' }, { status: 404 })
  }

  const code = generateCode()
  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/gift/${code}`

  const { error: giftError } = await supabase.from('gift_cards').insert({
    code,
    type,
    credit_amount: type === 'credits' ? creditAmount : null,
    prayer_id: type === 'prayer' ? prayerId : null,
    from_user_id: user.id,
    gift_message: giftMessage || null,
  })
  if (giftError) return NextResponse.json({ error: giftError.message }, { status: 500 })

  // Update prayer status to gifted
  if (type === 'prayer' && prayerId) {
    await supabase.from('prayers').update({ status: 'gifted', gifted_via: code }).eq('id', prayerId)
  }

  return NextResponse.json({ code, shareUrl })
}
