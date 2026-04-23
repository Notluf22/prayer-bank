'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Constellation from '@/components/Constellation'

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [greeting, setGreeting] = useState('')
  const [globalCount, setGlobalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      setProfile(profileData)

      const { count } = await supabase.from('prayers').select('*', { count: 'exact', head: true })
      setGlobalCount(count || 0)
      setLoading(false)
    }
    loadData()

    // Set a soulful greeting
    const hours = new Date().getHours()
    if (hours < 12) setGreeting('Peace be with you this morning.')
    else if (hours < 18) setGreeting('Grace attend you this afternoon.')
    else setGreeting('A blessed evening to you.')

    const channel = supabase
      .channel('global-pulse')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayers' }, () => {
        setGlobalCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-32 bg-white/5 rounded-3xl"></div>
      <div className="h-64 bg-white/5 rounded-3xl"></div>
      <div className="space-y-4">
        <div className="h-16 bg-white/5 rounded-xl"></div>
        <div className="h-16 bg-white/5 rounded-xl"></div>
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
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
      <div className="relative rounded-3xl p-12 mb-8 overflow-hidden bg-ink/40 border border-gold/10 shadow-2xl min-h-[260px] flex flex-col justify-center items-center text-center group">
        <Constellation sparks={profile?.sparks_received ?? 0} />
        
        {/* Daily Blessing Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

        <div className="relative z-10 space-y-3">
          <p className="text-gold/80 text-[10px] font-bold uppercase tracking-[4px] mb-2 animate-in fade-in slide-in-from-top duration-1000">
            {greeting}
          </p>
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
      <div className="space-y-3 mb-16">
        <Link href="/dashboard/needs" className="bg-ink dark:bg-white/5 rounded-xl p-5 flex items-center gap-4 hover:bg-ink/90 dark:hover:bg-white/10 transition-all block border border-gold/10 group hover:scale-[1.01]">
          <span className="text-3xl group-hover:scale-110 transition-transform">🕯️</span>
          <div className="flex-1">
            <p className="font-semibold text-white">The Needs Wall</p>
            <p className="text-sm text-gray-400">Post a need or pray for a stranger's intention</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/deposit" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-all block hover:scale-[1.01]">
          <span className="text-3xl">🤲</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Share a Prayer</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Share grace from your completed prayers</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/withdraw" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-all block hover:scale-[1.01]">
          <span className="text-3xl">📿</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">Receive a Prayer</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Receive grace from the global treasury</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>
      </div>

      {/* Real-time Treasury Pulse Footer */}
      <div className="text-center py-8 border-t border-gold/10 mt-8">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-gold/20 shadow-inner">
          <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(212,175,55,1)]"></div>
          <p className="text-xs text-gray-400 font-serif italic">
            The Treasury currently holds <span className="text-gold font-bold not-italic px-1">{globalCount}</span> offerings of grace
          </p>
        </div>
      </div>
    </div>
  )
}
