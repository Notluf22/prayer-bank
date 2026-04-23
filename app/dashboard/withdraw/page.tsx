'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Prayer, PRAYER_TYPES } from '@/lib/types'
import GiftModal from '@/components/GiftModal'

export default function WithdrawPage() {
  const [credits, setCredits] = useState(0)
  const [loadingInitial, setLoadingInitial] = useState(true)
  const [drawing, setDrawing] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [drawnPrayer, setDrawnPrayer] = useState<Prayer | null>(null)
  const [giftPrayer, setGiftPrayer] = useState<Prayer | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('credits').eq('id', user.id).single()
      setCredits(profile?.credits ?? 0)
      setLoadingInitial(false)
    }
    load()
  }, [])

  async function handleDraw(typeId: string, cost: number) {
    if (credits < cost) {
      alert(`You need ${cost} credits but only have ${credits}. Deposit more prayers first!`)
      return
    }
    setDrawing(true)
    const res = await fetch(`/api/draw_random?type=${typeId}`)
    setDrawing(false)
    
    if (res.ok) {
      const { prayer } = await res.json()
      setDrawnPrayer(prayer)
    } else {
      const err = await res.json()
      alert(err.error || 'Something went wrong.')
    }
  }

  async function handleKeep() {
    if (!drawnPrayer) return
    if (credits < drawnPrayer.credit_value) return

    setWithdrawing(true)
    const res = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prayerId: drawnPrayer.id }),
    })
    setWithdrawing(false)

    if (res.ok) {
      setCredits(c => c - drawnPrayer.credit_value)
      alert("This prayer has been received. May the grace of this intention be with you! \n\nWe have sent a 'Spark of Gratitude' to the anonymous giver for you. ✨")
      setDrawnPrayer(null) // Reset to draw again
    } else {
      const err = await res.json()
      alert(err.error || 'Someone else might have received this prayer! Try again.')
      setDrawnPrayer(null)
    }
  }

  async function handleGift() {
    if (!drawnPrayer) return
    if (credits < drawnPrayer.credit_value) return
    setGiftPrayer(drawnPrayer)
  }

  if (loadingInitial) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 font-serif italic">Loading your treasury...</p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">Receive a Prayer</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">
          You have <strong>{credits}</strong> credit{credits !== 1 ? 's' : ''}
        </p>
      </div>

      {drawing && (
        <div className="text-center py-20 flex flex-col items-center justify-center space-y-4">
          <div className="text-5xl animate-bounce">✨</div>
          <p className="font-serif italic text-xl text-ink dark:text-white">Seeking grace for you...</p>
        </div>
      )}

      {!drawing && !drawnPrayer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PRAYER_TYPES.map(p => {
            const canAfford = credits >= p.creditValue
            return (
              <div key={p.id} className="card-gold rounded-xl p-5 flex flex-col relative overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <span className="text-4xl">{p.emoji}</span>
                  <span className="text-xs font-bold text-gray-500 bg-gray-100 dark:bg-white/10 dark:text-gray-300 px-3 py-1 rounded-full">
                    {p.creditValue} credit{p.creditValue !== 1 ? 's' : ''}
                  </span>
                </div>
                <h3 className="font-serif text-xl font-semibold text-ink dark:text-white mb-1">{p.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1">{p.description}</p>
                
                <button
                  onClick={() => handleDraw(p.id, p.creditValue)}
                  disabled={!canAfford}
                  className={`w-full py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${
                    canAfford
                      ? 'btn-gold shadow-md'
                      : 'bg-gray-100 text-gray-400 dark:bg-white/5 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  Receive this Prayer
                </button>
              </div>
            )
          })}
        </div>
      )}

      {!drawing && drawnPrayer && (
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-widest text-gold mb-2">You drew a</p>
            <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white flex items-center justify-center gap-2">
              {PRAYER_TYPES.find(p => p.id === drawnPrayer.type)?.emoji} 
              {PRAYER_TYPES.find(p => p.id === drawnPrayer.type)?.name}
            </h2>
          </div>

          <div className="card-gold rounded-2xl p-8 mb-6 shadow-xl relative overflow-hidden text-center bg-[#fdf8ee] dark:bg-card-bg">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gold/0 via-gold to-gold/0"></div>
            
            {drawnPrayer.intention && (
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Intention of the Giver</p>
                <p className="font-serif italic text-xl text-ink dark:text-gray-100 leading-relaxed">
                  "{drawnPrayer.intention}"
                </p>
              </div>
            )}
            
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-gray-400 bg-white/50 dark:bg-white/5 py-4 px-6 rounded-xl inline-block text-left mx-auto">
              {drawnPrayer.depositor?.country && (
                <p className="flex items-center gap-2">🌍 <span>From: <strong className="text-ink dark:text-white">{drawnPrayer.depositor.country}</strong></span></p>
              )}
              <p className="flex items-center gap-2">🤲 <span>Originally for: <strong className="text-ink dark:text-white">{drawnPrayer.offered_for}</strong></span></p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleKeep}
              disabled={withdrawing}
              className="w-full btn-gold py-4 rounded-xl font-bold uppercase tracking-wider shadow-lg flex items-center justify-center gap-2"
            >
              {withdrawing ? 'Receiving...' : 'Receive Grace'}
            </button>
            <button
              onClick={handleGift}
              disabled={withdrawing}
              className="w-full bg-white dark:bg-card-bg border-2 border-gold text-gold py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-amber-50 dark:hover:bg-white/5 transition-all"
            >
              Gift as Card
            </button>
            <button
              onClick={() => setDrawnPrayer(null)}
              disabled={withdrawing}
              className="w-full mt-4 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              Return to bank
            </button>
          </div>
        </div>
      )}

      {giftPrayer && (
        <GiftModal
          prayer={giftPrayer}
          onClose={() => setGiftPrayer(null)}
          onGifted={(code) => {
            setCredits(c => c - giftPrayer.credit_value)
            setDrawnPrayer(null) // Go back to main screen after gifting
            setGiftPrayer(null)
          }}
        />
      )}
    </div>
  )
}
