'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Prayer, PRAYER_TYPES } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function VaultPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const [activeTab, setActiveTab] = useState<'given' | 'received'>('given')
  const [givenPrayers, setGivenPrayers] = useState<Prayer[]>([])
  const [receivedPrayers, setReceivedPrayers] = useState<Prayer[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch grace given (deposited by me)
      const { data: given } = await supabase
        .from('prayers')
        .select('*')
        .eq('depositor_id', user.id)
        .order('created_at', { ascending: false })

      // Fetch grace received (via transactions to get correct withdrawal order)
      const { data: trans } = await supabase
        .from('transactions')
        .select(`
          prayer:prayers (
            *,
            depositor:profiles!depositor_id(display_name, country)
          )
        `)
        .eq('user_id', user.id)
        .eq('type', 'withdraw')
        .order('created_at', { ascending: false })

      const received = trans?.map(t => t.prayer).filter(Boolean) as any[]
      
      setGivenPrayers(given ?? [])
      setReceivedPrayers(received ?? [])
      setLoading(false)
    }
    load()
  }, [])
  const prayerMeta: Record<string, { emoji: string; name: string }> = {}
  PRAYER_TYPES.forEach(p => { prayerMeta[p.id] = { emoji: p.emoji, name: p.name } })

  const trackingClass = language === 'ml' ? '' : 'tracking-widest'

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-10 space-y-8 animate-pulse">
        <div className="h-20 bg-white/5 rounded-3xl mx-auto w-2/3"></div>
        <div className="h-12 bg-white/5 rounded-xl"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 bg-white/5 rounded-2xl border border-white/5"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">{t.history}</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">{t.history_desc}</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-6 border border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setActiveTab('given')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
            activeTab === 'given' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {t.shared} ({givenPrayers.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
            activeTab === 'received' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {t.received} ({receivedPrayers.length})
        </button>
      </div>

      <div className="space-y-4 animate-in fade-in slide-in-from-bottom duration-500">
        {activeTab === 'given' ? (
          givenPrayers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
              <p className="text-gray-400 italic">{t.no_history}</p>
            </div>
          ) : (
            givenPrayers.map(p => {
              const meta = prayerMeta[p.type] ?? { emoji: '🙏', name: p.type }
              return (
                <div key={p.id} className="card-gold rounded-xl p-4 flex gap-3 hover:shadow-lg transition-all active:scale-[0.99] hover:scale-[1.01] group">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className={`text-xs font-bold uppercase ${trackingClass} text-gold`}>{meta.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-gold/10 text-gold'
                      }`}>
                        {p.status === 'available' ? 'Available' : 'Received'}
                      </span>
                    </div>
                    {p.intention && p.intention !== 'For the recipient of this grace' && (
                      <p className="font-serif italic text-sm text-ink dark:text-gray-200 mt-1">"{p.intention}"</p>
                    )}
                    <p className="text-[10px] text-gray-400 mt-2">Shared on {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })
          )
        ) : (
          receivedPrayers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
              <p className="text-gray-400 italic">{t.no_history}</p>
            </div>
          ) : (
            receivedPrayers.map(p => {
              const meta = prayerMeta[p.type] ?? { emoji: '🙏', name: p.type }
              return (
                <div key={p.id} className="card-gold rounded-xl p-4 flex gap-3 hover:shadow-lg transition-all active:scale-[0.99] hover:scale-[1.01] group">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold uppercase ${trackingClass} text-gold`}>{meta.name}</p>
                    {p.intention && p.intention !== 'For the recipient of this grace' && (
                      <p className="font-serif italic text-sm text-ink dark:text-gray-200 mt-1 text-balance">"{p.intention}"</p>
                    )}
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-[10px] text-gray-400">
                        {p.depositor?.country && `From: ${p.depositor.country} · `}
                        Received on {new Date(p.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })
          )
        )}
      </div>
    </div>
  )
}
