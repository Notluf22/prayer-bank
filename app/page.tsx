import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const { count: globalCount } = await supabase
    .from('prayers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'available')

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-gold text-xs tracking-[8px] ornament mb-4"></p>
        <h1 className="font-serif text-4xl font-semibold text-ink">
          Welcome, {profile?.display_name || 'Friend'}
        </h1>
        <p className="font-serif italic text-gray-500 mt-1">Your treasury of faith</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card-gold rounded-xl p-4 text-center">
          <p className="font-serif text-3xl font-semibold text-ink">{profile?.total_deposited ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">My deposits</p>
        </div>
        <div className="card-gold rounded-xl p-4 text-center">
          <p className="font-serif text-3xl font-semibold text-ink">{profile?.credits ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">My credits</p>
        </div>
        <div className="card-gold rounded-xl p-4 text-center">
          <p className="font-serif text-3xl font-semibold text-ink">{globalCount ?? 0}</p>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Global prayers</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/dashboard/deposit" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 transition-colors block">
          <span className="text-3xl">🕊</span>
          <div className="flex-1">
            <p className="font-semibold text-ink">Deposit a Prayer</p>
            <p className="text-sm text-gray-500">Offer a prayer and earn credits</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/withdraw" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 transition-colors block">
          <span className="text-3xl">📿</span>
          <div className="flex-1">
            <p className="font-semibold text-ink">Withdraw a Prayer</p>
            <p className="text-sm text-gray-500">Receive prayers from around the world</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/gift" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 transition-colors block">
          <span className="text-3xl">🎁</span>
          <div className="flex-1">
            <p className="font-semibold text-ink">Gift a Prayer</p>
            <p className="text-sm text-gray-500">Send a prayer as a gift card to someone</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/redeem" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 transition-colors block">
          <span className="text-3xl">✨</span>
          <div className="flex-1">
            <p className="font-semibold text-ink">Redeem a Gift Card</p>
            <p className="text-sm text-gray-500">Enter a code from someone who gifted you</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>
      </div>
    </div>
  )
}
