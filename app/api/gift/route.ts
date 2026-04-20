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

  const { type, creditAmount, prayerId, recipientEmail, giftMessage } = await request.json()

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
      amount: creditAmount,
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

  // Send email if recipient provided
  if (recipientEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    await resend.emails.send({
      from: 'Prayer Bank <noreply@prayerbank.org>',
      to: recipientEmail,
      subject: `${profile?.display_name ?? 'Someone'} sent you a prayer gift 🕊`,
      html: buildEmailHtml({ code, shareUrl, giftMessage, senderName: profile?.display_name ?? 'A friend', type, creditAmount }),
    })
  }

  return NextResponse.json({ code, shareUrl })
}

function buildEmailHtml({ code, shareUrl, giftMessage, senderName, type, creditAmount }: {
  code: string; shareUrl: string; giftMessage?: string; senderName: string; type: string; creditAmount?: number
}) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#faf6ef;font-family:Georgia,serif;">
  <div style="max-width:480px;margin:40px auto;background:#fff;border-radius:16px;border:1px solid rgba(181,144,42,0.2);overflow:hidden;">
    <div style="background:#fdf8ee;padding:32px;text-align:center;border-bottom:1px solid rgba(181,144,42,0.15);">
      <p style="font-size:11px;letter-spacing:8px;color:#b5902a;margin:0 0 12px;">✦  ✦  ✦</p>
      <h1 style="font-size:28px;font-weight:600;color:#2d1f3d;margin:0;">Prayer Bank</h1>
      <p style="font-style:italic;color:#888;margin:6px 0 0;font-size:14px;">A treasury of faith</p>
    </div>
    <div style="padding:32px;">
      <p style="color:#555;font-size:15px;line-height:1.7;margin:0 0 16px;">
        <strong>${senderName}</strong> has sent you a prayer gift.
      </p>
      ${giftMessage ? `<div style="background:#fdf8ee;border-left:3px solid #b5902a;padding:12px 16px;border-radius:0 8px 8px 0;margin-bottom:20px;font-style:italic;color:#555;">"${giftMessage}"</div>` : ''}
      <div style="background:#fdf8ee;border-radius:12px;padding:20px;text-align:center;margin-bottom:24px;">
        ${type === 'credits'
          ? `<p style="font-size:48px;font-weight:600;color:#2d1f3d;margin:0;">${creditAmount}</p><p style="color:#888;font-size:13px;margin:4px 0 0;">prayer credits</p>`
          : `<p style="font-size:32px;margin:0;">🕊</p><p style="color:#2d1f3d;font-weight:600;margin:8px 0 4px;">A Prayer Gifted to You</p><p style="color:#888;font-size:13px;margin:0;">A prayer offered with love</p>`
        }
        <p style="font-family:monospace;font-size:16px;letter-spacing:3px;color:#b5902a;margin-top:16px;font-weight:bold;">${code}</p>
      </div>
      <div style="text-align:center;">
        <a href="${shareUrl}" style="display:inline-block;background:transparent;border:1px solid #b5902a;color:#2d1f3d;font-family:Georgia,serif;font-size:16px;padding:14px 32px;border-radius:12px;text-decoration:none;">
          ✦ Receive this Gift ✦
        </a>
      </div>
    </div>
    <div style="padding:20px 32px;border-top:1px solid rgba(181,144,42,0.15);text-align:center;">
      <p style="font-size:12px;color:#aaa;margin:0;">Prayer Bank · Free forever · Powered by faith</p>
    </div>
  </div>
</body>
</html>`
}
