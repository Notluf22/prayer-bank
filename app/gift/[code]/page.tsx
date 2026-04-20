import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PRAYER_TYPES } from '@/lib/types'

export default async function GiftViewPage({ params }: { params: { code: string } }) {
  const supabase = createClient()
  const { data: gift } = await supabase
    .from('gift_cards')
    .select('*, prayer:prayers(*), from_user:profiles!from_user_id(display_name)')
    .eq('code', params.code.toUpperCase())
    .single()

  if (!gift) return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-5xl mb-4">❓</p>
        <h1 className="font-serif text-2xl font-semibold text-ink mb-2">Gift not found</h1>
        <p className="text-gray-500">This code may be invalid or already redeemed.</p>
        <Link href="/" className="btn-gold mt-6 inline-block px-6 py-2 rounded-xl font-serif">Visit Prayer Bank</Link>
      </div>
    </main>
  )

  const prayerMeta = gift.prayer
    ? PRAYER_TYPES.find(p => p.id === gift.prayer.type)
    : null

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-16">
      <div className="max-w-sm w-full text-center">
        <p className="text-gold text-xs tracking-[8px] ornament mb-6"></p>
        <h1 className="font-serif text-4xl font-semibold text-ink mb-1">A Gift for You</h1>
        <p className="font-serif italic text-gray-500 mb-8">from {gift.from_user?.display_name ?? 'a friend'}</p>

        {/* Gift card */}
        <div className="card-gold rounded-2xl p-6 mb-6 text-left">
          {gift.type === 'credits' ? (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Prayer Credits</p>
              <p className="font-serif text-5xl font-semibold text-ink mb-1">{gift.credit_amount}</p>
              <p className="text-sm text-gray-500">prayer credits — use them to receive prayers</p>
            </>
          ) : (
            <>
              <p className="text-xs font-bold uppercase tracking-widest text-gold mb-2">
                {prayerMeta?.emoji} {prayerMeta?.name ?? gift.prayer?.type}
              </p>
              <p className="font-serif italic text-ink text-base leading-relaxed">
                "{gift.prayer?.intention || 'A prayer offered with love for you.'}"
              </p>
              <p className="text-xs text-gray-400 mt-3">Offered for: {gift.prayer?.offered_for}</p>
            </>
          )}
          {gift.gift_message && (
            <div className="mt-4 pt-4 border-t border-gold/20">
              <p className="font-serif italic text-gray-600 text-sm">"{gift.gift_message}"</p>
            </div>
          )}
        </div>

        {gift.redeemed_at ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-green-700 font-semibold">This gift has already been redeemed.</p>
          </div>
        ) : (
          <>
            <p className="font-mono text-sm tracking-widest text-gray-400 mb-4 bg-gray-50 border border-gray-200 rounded-lg py-2">{gift.code}</p>
            <Link
              href={`/dashboard/redeem?code=${gift.code}`}
              className="btn-gold w-full block text-center font-serif text-lg py-3 rounded-xl mb-3"
            >
              ✦ Receive this Gift ✦
            </Link>
            <p className="text-xs text-gray-400">You'll need to sign in to receive the gift.</p>
          </>
        )}
      </div>
    </main>
  )
}
