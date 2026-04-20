'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Prayer, PRAYER_TYPES } from '@/lib/types'
import GiftModal from '@/components/GiftModal'

export default function WithdrawPage() {
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const [credits, setCredits] = useState(0)
  const [filter, setFilter] = useState('All')
  const [loading, setLoading] = useState(true)
  const [withdrawing, setWithdrawing] = useState<string | null>(null)
  const [giftPrayer, setGiftPrayer] = useState<Prayer | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
      setCredits(profile?.credits ?? 0)
      const { data } = await supabase
        .from('prayers')
        .select('*, depositor:profiles!depositor_id(display_name, country)')
        .eq('status', 'available')
        .neq('depositor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)
      setPrayers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter === 'All' ? prayers : prayers.filter(p => p.type === filter)

  async function handleWithdraw(prayer: Prayer) {
    if (credits < prayer.credit_value) {
      alert(`You need ${prayer.credit_value} credits but only have ${credits}. Deposit more prayers first!`)
      return
    }
    setWithdrawing(prayer.id)
    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prayerId: prayer.id }),
    })
    if (res.ok) {
      setCredits(c => c - prayer.credit_value)
      setPrayers(ps => ps.filter(p => p.id !== prayer.id))
    } else {
      const err = await res.json()
      alert(err.error || 'Something went wrong.')
    }
    setWithdrawing(null)
  }

  async function handleGift(prayer: Prayer) {
    if (credits < prayer.credit_value) {
      alert(`You need ${prayer.credit_value} credits but only have ${credits}. Deposit more prayers first!`)
      return
    }
    setGiftPrayer(prayer)
  }

  const filters = ['All', ...PRAYER_TYPES.map(p => p.id)]
  const filterLabels: Record<string, string> = { All: 'All' }
  PRAYER_TYPES.forEach(p => { filterLabels[p.id] = p.name })
  const prayerMeta: Record<string, { emoji: string; name: string }> = {}
  PRAYER_TYPES.forEach(p => { prayerMeta[p.id] = { emoji: p.emoji, name: p.name } })

  return (
    <div>
      <div className="text-center mb-6">
        <h1 className="font-serif text-3xl font-semibold text-ink">Withdraw a Prayer</h1>
        <p className="font-serif italic text-gray-500 mt-1">
          You have <strong>{credits}</strong> credit{credits !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap mb-5">
        {['All', 'hail_mary', 'holy_rosary', 'holy_mass', 'divine_mercy', 'novena'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
              filter === f ? 'border-gold bg-amber-50 text-ink' : 'border-gray-200 text-gray-500 hover:border-gold/50'
            }`}
          >
            {filterLabels[f] ?? f}
          </button>
        ))}
      </div>

      {loading && <p className="text-center text-gray-400 font-serif italic py-12">Loading prayers…</p>}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🙏</p>
          <p className="font-serif italic text-gray-500">No prayers available in this category yet.</p>
          <p className="text-sm text-gray-400 mt-1">Be the first to deposit one!</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(prayer => {
          const meta = prayerMeta[prayer.type] ?? { emoji: '🙏', name: prayer.type }
          const canAfford = credits >= prayer.credit_value
          return (
            <div key={prayer.id} className="card-gold rounded-xl p-4 flex gap-3">
              <span className="text-2xl mt-1">{meta.emoji}</span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-gold mb-1">{meta.name}</p>
                {prayer.intention && (
                  <p className="font-serif italic text-ink text-sm leading-relaxed mb-1">"{prayer.intention}"</p>
                )}
                <p className="text-xs text-gray-400">
                  {prayer.depositor?.country && `🌍 ${prayer.depositor.country} · `}
                  For: {prayer.offered_for}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className="text-xs text-gray-400 border border-gray-200 rounded-full px-2 py-0.5">
                  {prayer.credit_value} credit{prayer.credit_value > 1 ? 's' : ''}
                </span>
                <button
                  onClick={() => handleWithdraw(prayer)}
                  disabled={!canAfford || withdrawing === prayer.id}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-semibold transition-all ${
                    canAfford
                      ? 'border-gray-300 hover:border-gold text-ink'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  {withdrawing === prayer.id ? '…' : 'Keep for me'}
                </button>
                <button
                  onClick={() => handleGift(prayer)}
                  disabled={!canAfford || withdrawing === prayer.id}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-bold transition-all ${
                    canAfford
                      ? 'border-gold bg-amber-50 text-gold hover:bg-amber-100'
                      : 'border-gray-100 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Gift as card ↗
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {giftPrayer && (
        <GiftModal
          prayer={giftPrayer}
          onClose={() => setGiftPrayer(null)}
          onGifted={(code) => {
            setCredits(c => c - giftPrayer.credit_value)
            setPrayers(ps => ps.filter(p => p.id !== giftPrayer.id))
            setGiftPrayer(null)
            alert(`Gift card created! Code: ${code}\nShare the link or email it to your friend.`)
          }}
        />
      )}
    </div>
  )
}
