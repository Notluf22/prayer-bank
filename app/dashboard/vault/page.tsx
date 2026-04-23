'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Prayer, PRAYER_TYPES } from '@/lib/types'

export default function VaultPage() {
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

      // Fetch grace received (withdrawn by me)
      const { data: received } = await supabase
        .from('prayers')
        .select('*, depositor:profiles!depositor_id(display_name, country)')
        .eq('withdrawn_by', user.id)
        .order('created_at', { ascending: false })

      setGivenPrayers(given ?? [])
      setReceivedPrayers(received ?? [])
      setLoading(false)
    }
    load()
  }, [])
  const prayerMeta: Record<string, { emoji: string; name: string }> = {}
  PRAYER_TYPES.forEach(p => { prayerMeta[p.id] = { emoji: p.emoji, name: p.name } })

  if (loading) {
    return <div className="text-center py-20 font-serif italic text-gray-400">Opening the vault...</div>
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">The Grace Vault</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">Your personal treasury of shared and received grace</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-6 border border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setActiveTab('given')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'given' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Grace Shared ({givenPrayers.length})
        </button>
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'received' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Grace Received ({receivedPrayers.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === 'given' ? (
          givenPrayers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
              <p className="text-gray-400 italic">You haven't shared any grace yet.</p>
            </div>
          ) : (
            givenPrayers.map(p => {
              const meta = prayerMeta[p.type] ?? { emoji: '🙏', name: p.type }
              return (
                <div key={p.id} className="card-gold rounded-xl p-4 flex gap-3">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold uppercase tracking-widest text-gold">{meta.name}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        p.status === 'available' ? 'bg-green-100 text-green-600' : 'bg-gold/10 text-gold'
                      }`}>
                        {p.status === 'available' ? 'Available' : 'Received'}
                      </span>
                    </div>
                    {p.intention && <p className="font-serif italic text-sm text-ink dark:text-gray-200 mt-1">"{p.intention}"</p>}
                    <p className="text-[10px] text-gray-400 mt-2">Shared on {new Date(p.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              )
            })
          )
        ) : (
          receivedPrayers.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
              <p className="text-gray-400 italic">You haven't received any grace yet.</p>
            </div>
          ) : (
            receivedPrayers.map(p => {
              const meta = prayerMeta[p.type] ?? { emoji: '🙏', name: p.type }
              return (
                <div key={p.id} className="card-gold rounded-xl p-4 flex gap-3">
                  <span className="text-2xl">{meta.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold uppercase tracking-widest text-gold">{meta.name}</p>
                    {p.intention && <p className="font-serif italic text-sm text-ink dark:text-gray-200 mt-1">"{p.intention}"</p>}
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
