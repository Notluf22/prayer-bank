import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import GlobalMap from '@/components/GlobalMap'
import Constellation from '@/components/Constellation'

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

      {/* Stats with Constellation Background */}
      <div className="relative card-gold rounded-2xl p-6 mb-8 overflow-hidden shadow-xl border-gold/20">
        <Constellation sparks={profile?.sparks_received ?? 0} />
        
        <div className="relative z-10 flex justify-between items-center">
          <div className="text-center flex-1 border-r border-gold/10">
            <p className="font-serif text-3xl font-semibold text-ink dark:text-white">{profile?.credits ?? 0}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[2px]">Credits</p>
          </div>
          <div className="text-center flex-1 border-r border-gold/10">
            <p className="font-serif text-3xl font-semibold text-gold">{profile?.sparks_received ?? 0}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[2px]">Stars</p>
          </div>
          <div className="text-center flex-1">
            <p className="font-serif text-3xl font-semibold text-ink dark:text-white">{profile?.total_deposited ?? 0}</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-[2px]">Shared</p>
          </div>
        </div>

        {profile?.sparks_received > 0 && (
          <p className="relative z-10 text-center text-[10px] text-gold/60 mt-4 italic font-serif">
            Your constellation is growing. Each star is a soul you've blessed.
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/dashboard/needs" className="bg-ink dark:bg-white/5 rounded-xl p-5 flex items-center gap-4 hover:bg-ink/90 dark:hover:bg-white/10 transition-colors block border border-gold/10 group">
          <span className="text-3xl group-hover:scale-110 transition-transform">🕯️</span>
          <div className="flex-1">
            <p className="font-semibold text-white">The Need Wall</p>
            <p className="text-sm text-gray-400">Post a need or pray for a stranger's intention</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/deposit" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-colors block">
          <span className="text-3xl">🤲</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Share a Prayer</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share grace from your completed prayers</p>
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
