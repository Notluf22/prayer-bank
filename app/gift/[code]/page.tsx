import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GiftCardClient from './GiftCardClient'
import type { Metadata } from 'next'

interface Props {
  params: { code: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: gift } = await supabase
    .from('gift_cards')
    .select('*, from_user:profiles!from_user_id(display_name)')
    .eq('code', params.code.toUpperCase())
    .single()

  if (!gift) {
    return {
      title: 'Gift Not Found — PrayerBank',
      description: 'The requested spiritual gift was not found in the sanctuary.',
    }
  }

  const sender = gift.from_user?.display_name ?? 'a friend'
  return {
    title: `A Spiritual Blessing for You — PrayerBank`,
    description: `A customized spiritual blessing card containing grace has been gifted to you by ${sender} via PrayerBank.`,
  }
}

export default async function GiftViewPage({ params }: Props) {
  const supabase = createClient()
  const { data: gift } = await supabase
    .from('gift_cards')
    .select('*, prayer:prayers(*), from_user:profiles!from_user_id(display_name)')
    .eq('code', params.code.toUpperCase())
    .single()

  if (!gift) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-slate-950 text-slate-100">
        <div className="text-center">
          <p className="text-5xl mb-4">❓</p>
          <h1 className="font-serif text-2xl font-semibold text-white mb-2">Gift not found</h1>
          <p className="text-slate-400">This code may be invalid or already redeemed.</p>
          <Link href="/" className="btn-gold mt-6 inline-block px-6 py-2.5 rounded-xl font-serif text-amber-400 border border-amber-500/30 hover:bg-amber-500/10">
            Visit Prayer Bank
          </Link>
        </div>
      </main>
    )
  }

  return <GiftCardClient gift={gift} />
}

