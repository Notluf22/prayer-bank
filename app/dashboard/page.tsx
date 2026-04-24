'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Constellation from '@/components/Constellation'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'



const SAINT_QUOTES = [
  { text: "Love is the beauty of the soul.", saint: "St. Augustine" },
  { text: "Let nothing disturb you, let nothing frighten you. All things are passing; God never changes.", saint: "St. Teresa of Avila" },
  { text: "The world's thy ship and not thy home.", saint: "St. Thérèse of Lisieux" },
  { text: "He who knows how to forgive prepares for himself many graces from God.", saint: "St. Faustina" },
  { text: "Pray as though everything depended on God. Work as though everything depended on you.", saint: "St. Augustine" },
  { text: "Charity is the measure by which Our Lord judges all things.", saint: "St. Padre Pio" },
  { text: "If you want to find God, look for Him in the poor.", saint: "St. Vincent de Paul" },
  { text: "The soul is like a castle made of a single diamond.", saint: "St. Teresa of Avila" },
  { text: "Peace begins with a smile.", saint: "St. Mother Teresa" },
  { text: "To have a right to do a thing is not at all the same as to be right in doing it.", saint: "G.K. Chesterton" }
]

export default function DashboardPage() {
  const [profile, setProfile] = useState<any>(null)
  const [greeting, setGreeting] = useState('')
  const [dailyQuote, setDailyQuote] = useState({ text: '', saint: '' })
  const [globalCount, setGlobalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { language } = useLanguage()
  const t = translations[language]

  useEffect(() => {
    // 1. Set Daily Quote & Greeting Immediately
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24))
    setDailyQuote(SAINT_QUOTES[dayOfYear % SAINT_QUOTES.length])

    const hours = new Date().getHours()
    if (hours < 12) setGreeting(t.peace_morning)
    else if (hours < 18) setGreeting(t.grace_afternoon)
    else setGreeting(t.blessed_evening)

    // 2. Load Async Data
    async function loadData() {
      try {
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
      } catch (err) {
        console.error("Data loading failed", err)
      } finally {
        setLoading(false)
      }
    }
    loadData()

    const channel = supabase
      .channel('global-pulse')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'prayers' }, () => {
        setGlobalCount(prev => prev + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [language, t])

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8 animate-pulse">
      <div className="h-40 bg-white/5 rounded-3xl"></div>
      <div className="h-64 bg-white/5 rounded-3xl"></div>
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-white/5 rounded-xl"></div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <div className="ornament mb-6"></div>
        <h1 className="font-serif text-4xl font-semibold text-ink dark:text-white mb-6">
          {t.welcome}, {profile?.display_name || 'Friend'}
        </h1>
        <div className="max-w-lg mx-auto bg-gold/5 dark:bg-gold/10 p-6 rounded-2xl border border-gold/10 relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-parchment dark:bg-parchment-dark px-4 text-gold text-sm">✦ {t.wisdom} ✦</span>
          <p className="font-serif italic text-gold-dark dark:text-gold-light text-xl leading-relaxed">
            "{dailyQuote.text}"
          </p>
          <p className="text-[10px] uppercase tracking-[4px] text-gray-500 mt-4 font-bold">
            — {dailyQuote.saint}
          </p>
        </div>
      </div>

      {/* Soulful Header with Constellation - The Main Sanctuary Piece */}
      <div className="relative rounded-3xl p-12 mb-10 overflow-hidden bg-ink/40 border border-gold/10 shadow-2xl min-h-[280px] flex flex-col justify-center items-center text-center group">

        <Constellation sparks={profile?.sparks_received ?? 0} />
        
        {/* Daily Blessing Shimmer */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gold/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></div>

        <div className="relative z-10 space-y-3">
          <p className="text-gold/80 text-[10px] font-bold uppercase tracking-[4px] mb-2 animate-in fade-in slide-in-from-top duration-1000">
            {greeting}
          </p>
          <p className="font-serif text-3xl md:text-4xl text-white dark:text-gray-100 italic">
            {profile?.sparks_received === 0 
              ? t.sky_quiet
              : t.constellation_glowing}
          </p>
          <p className="text-sm text-gold/60 uppercase tracking-[4px] font-bold">
            {profile?.total_deposited ?? 0} {t.souls_blessed}
          </p>
        </div>

        {/* Humble Grace Indicator */}
        <div className="absolute bottom-6 right-8 flex items-center gap-2 opacity-40">
          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{t.available_grace}:</span>
          <span className="text-sm font-bold text-gold">{profile?.credits ?? 0}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3 mb-16">
      {/* Primary Actions */}
      <div className="space-y-3 mb-8">
        <Link href="/dashboard/needs" className="bg-ink dark:bg-white/5 rounded-xl p-5 flex items-center gap-4 hover:bg-ink/90 dark:hover:bg-white/10 transition-all block border border-gold/10 group hover:scale-[1.01] active:scale-95">
          <span className="text-3xl group-hover:scale-110 transition-transform">🕯️</span>
          <div className="flex-1">
            <p className="font-semibold text-white">{t.needs}</p>
            <p className="text-sm text-gray-400">Ask for prayers from the community</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/deposit" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-all block hover:scale-[1.01] active:scale-95">
          <span className="text-3xl">🤲</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">{t.share}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Deposit prayers you have completed</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>

        <Link href="/dashboard/withdraw" className="card-gold rounded-xl p-5 flex items-center gap-4 hover:bg-amber-50 dark:hover:bg-gold/10 transition-all block hover:scale-[1.01] active:scale-95">
          <span className="text-3xl">📿</span>
          <div className="flex-1">
            <p className="font-semibold text-ink dark:text-white">{t.receive}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Collect prayers for your intentions</p>
          </div>
          <span className="text-gold text-lg">→</span>
        </Link>
      </div>

      {/* Secondary Actions - Fixed Scaling */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 mb-16">
        <Link href="/dashboard/vault" className="bg-white/5 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 hover:bg-white/10 transition-all border border-white/5 group active:scale-90">
          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🏛️</span>
          <div className="flex-1">
            <p className="font-semibold text-white text-xs sm:text-sm">{t.vault}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-bold">Records</p>
          </div>
        </Link>

        <Link href="/dashboard/gift" className="bg-white/5 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 hover:bg-white/10 transition-all border border-white/5 group active:scale-90">
          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">🎁</span>
          <div className="flex-1">
            <p className="font-semibold text-white text-xs sm:text-sm">{t.gift}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-bold">Gift</p>
          </div>
        </Link>

        <Link href="/dashboard/redeem" className="bg-white/5 rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-2 sm:gap-3 hover:bg-white/10 transition-all border border-white/5 group col-span-2 sm:col-span-1 active:scale-90">
          <span className="text-xl sm:text-2xl group-hover:scale-110 transition-transform">✨</span>
          <div className="flex-1">
            <p className="font-semibold text-white text-xs sm:text-sm">{t.redeem}</p>
            <p className="text-[8px] sm:text-[10px] text-gray-500 uppercase tracking-wider font-bold">Claim</p>
          </div>
        </Link>
      </div>

      {/* Real-time Treasury Pulse Footer */}
      <div className="text-center py-8 border-t border-gold/10 mt-8">
        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-gold/20 shadow-inner">
          <div className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse shadow-[0_0_8px_rgba(212,175,55,1)]"></div>
          <p className="text-xs text-gray-400 font-serif italic text-balance">
            {t.treasury_holds} <span className="text-gold font-bold not-italic px-1">{globalCount}</span> {t.offerings_grace}
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
