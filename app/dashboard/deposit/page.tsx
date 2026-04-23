'use client'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRAYER_TYPES } from '@/lib/types'

export default function DepositPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState(PRAYER_TYPES[0])
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const searchParams = useSearchParams()
  const needId = searchParams.get('needId')
  const specificIntention = searchParams.get('intention')

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    // Optimistic UI: Transition to "Done" state immediately
    setDone(true)
    
    fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: selectedType.id, 
        intention: specificIntention || 'For the recipient of this grace', 
        offeredFor: 'The Global Treasury',
        creditValue: selectedType.creditValue,
        needId: needId
      }),
    }).then(() => {
      setLoading(false)
      router.refresh()
    }).catch(() => {
      setDone(false)
      setLoading(false)
      alert('Something went wrong. Please try again.')
    })
  }

  if (done) return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🤲</p>
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">Prayer Shared</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-2">You shared grace and earned <strong>+{selectedType.creditValue} credit{selectedType.creditValue > 1 ? 's' : ''}</strong></p>
      <p className="font-serif italic text-gray-400 mb-8">Your prayer is now in the global treasury, waiting to bless someone.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => setDone(false)} className="btn-gold px-6 py-2 rounded-xl font-serif">Share another</button>
        <button onClick={() => router.push('/dashboard')} className="border border-gray-200 px-6 py-2 rounded-xl text-sm">Back to dashboard</button>
      </div>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">Share a Prayer</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">Share the grace of a prayer you've completed</p>
      </div>

      <form onSubmit={handleDeposit} className="space-y-6">
        {specificIntention && (
          <div className="bg-ink dark:bg-white/5 border border-gold/30 rounded-2xl p-5 mb-4 shadow-xl animate-in fade-in zoom-in">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gold mb-2 text-center">Special Intention</p>
            <p className="font-serif italic text-white dark:text-gray-200 text-center text-lg leading-relaxed">
              "{specificIntention}"
            </p>
          </div>
        )}
        {/* Prayer type grid */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Type of Prayer Completed</label>
          <div className="grid grid-cols-2 gap-2">
            {PRAYER_TYPES.map(pt => (
              <button
                key={pt.id}
                type="button"
                onClick={() => setSelectedType(pt)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  selectedType.id === pt.id
                    ? 'border-gold bg-amber-50 dark:bg-gold/10 text-ink dark:text-white'
                    : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:border-gold/50 dark:hover:border-gold/50'
                }`}
              >
                <span className="text-xl">{pt.emoji}</span>
                <div>
                  <p className="text-sm font-semibold leading-tight">{pt.name}</p>
                  <p className="text-xs text-gray-400">+{pt.creditValue} credit{pt.creditValue > 1 ? 's' : ''}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Info box */}
        <div className="p-4 bg-amber-50 dark:bg-gold/10 rounded-xl border border-gold/20">
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">
            By sharing, you are releasing the merit of this completed prayer to whoever receives it from the treasury.
          </p>
        </div>

        {/* Credit preview */}
        <div className="flex justify-between items-center bg-white/50 dark:bg-white/5 rounded-xl px-4 py-3 border border-gray-100 dark:border-white/5">
          <span className="text-sm text-gray-500">Credits you will earn</span>
          <span className="font-serif text-lg font-semibold text-gold">+{selectedType.creditValue} credit{selectedType.creditValue > 1 ? 's' : ''}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50 shadow-lg"
        >
          {loading ? 'Sharing grace…' : '✦ Share this Prayer ✦'}
        </button>
      </form>
    </div>
  )
}
