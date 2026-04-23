import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
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

      {/* Soulful Header with Constellation - The Main Sanctuary Piece */}
      <div className="relative rounded-3xl p-12 mb-8 overflow-hidden bg-ink/40 border border-gold/10 shadow-2xl min-h-[260px] flex flex-col justify-center items-center text-center">
        <Constellation sparks={profile?.sparks_received ?? 0} />
        
        <div className="relative z-10 space-y-3">
          <p className="font-serif text-3xl md:text-4xl text-white dark:text-gray-100 italic">
            {profile?.sparks_received === 0 
              ? "Your sky is quiet and peaceful." 
              : "Your constellation is glowing with grace."}
          </p>
          <p className="text-sm text-gold/60 uppercase tracking-[4px] font-bold">
            {profile?.total_deposited ?? 0} Souls Blessed
          </p>
        </div>

        {/* Humble Grace Indicator */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-40">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Available Grace:</span>
          <span className="text-sm font-bold text-gold">{profile?.credits ?? 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Link href="/dashboard/needs" className="bg-ink dark:bg-white/5 rounded-xl p-5 flex items-center gap-4 hover:bg-ink/90 dark:hover:bg-white/10 transition-colors block border border-gold/10 group">
          <span className="text-3xl group-hover:scale-110 transition-transform">🕯️</span>
          <div className="flex-1">
            <p className="font-semibold text-white">The Needs Wall</p>
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
