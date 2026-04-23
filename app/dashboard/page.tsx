import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GlobalMap from '@/components/GlobalMap'

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

  // Fetch recent available prayers for the map
  const { data: recentPrayers } = await supabase
    .from('prayers')
    .select('id, country, type')
    .eq('status', 'available')
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-gold text-xs tracking-[8px] ornament mb-4"></p>
        <h1 className="font-serif text-4xl font-semibold text-ink dark:text-white">
          Welcome, {profile?.display_name || 'Friend'}
        </h1>
        <div className="mt-2">
          <p className="font-serif italic text-gold/80 dark:text-gold/60 text-lg">
            "What is sweeter than telling 'I Love you'?"
          </p>
          <p className="font-serif text-gray-500 dark:text-gray-400">
            I prayed for you.
          </p>
        </div>
      </div>

      {/* Global Activity Map */}
      <div className="mb-8">
        <GlobalMap recentPrayers={recentPrayers ?? []} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="card-gold rounded-xl p-4 text-center">
          <p className="font-serif text-3xl font-semibold text-ink dark:text-white">{profile?.total_deposited ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">My deposits</p>
        </div>
        <div className="card-gold rounded-xl p-4 text-center">
          <p className="font-serif text-3xl font-semibold text-ink dark:text-white">{profile?.credits ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">My credits</p>
        </div>
        <div className="card-gold rounded-xl p-4 text-center">
          <p className="font-serif text-3xl font-semibold text-ink dark:text-white">{globalCount ?? 0}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wide">Global prayers</p>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/dashboard/deposit" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-colors block">
          <span className="text-3xl">🤲</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Share a Prayer</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share the grace of your completed prayers</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/withdraw" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-colors block">
          <span className="text-3xl">📿</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Receive a Prayer</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive grace from the global treasury</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/gift" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-colors block">
          <span className="text-3xl">🎁</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Gift a Prayer</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Send a prayer as a gift card to someone</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/redeem" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-colors block">
          <span className="text-3xl">✨</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Redeem a Prayer Gift</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Enter a code from someone who gifted you</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>
      </div>
    </div>
  )
}
