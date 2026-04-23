'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { PRAYER_TYPES } from '@/lib/types'

export default function DepositPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState(PRAYER_TYPES[0])
  const [intention, setIntention] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleDeposit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/deposit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: selectedType.id, 
        intention, 
        offeredFor: 'General Intention', // Default since we removed the dropdown
        creditValue: selectedType.creditValue 
      }),
    })
    setLoading(false)
    if (res.ok) {
      setDone(true)
      router.refresh()
    } else {
      alert('Something went wrong. Please try again.')
    }
  }

  if (done) return (
    <div className="text-center py-16">
      <p className="text-5xl mb-4">🤲</p>
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">Prayer Shared</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-2">You shared grace and earned <strong>+{selectedType.creditValue} credit{selectedType.creditValue > 1 ? 's' : ''}</strong></p>
      <p className="font-serif italic text-gray-400 mb-8">Your prayer is now in the global treasury, waiting to bless someone.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setDone(false); setIntention('') }} className="btn-gold px-6 py-2 rounded-xl font-serif">Share another</button>
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

        {/* Intention */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">What was your prayer for? (Intention)</label>
          <textarea
            value={intention}
            onChange={e => setIntention(e.target.value)}
            placeholder="e.g. My family, peace in my heart, for a friend's healing…"
            rows={4}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold bg-white dark:bg-white/5 dark:text-white resize-none"
          />
          <p className="text-[10px] text-gray-400 mt-2 italic">Be as specific as you like. This will be shared with the person who receives your prayer.</p>
        </div>

        {/* Credit preview */}
        <div className="flex justify-between items-center bg-amber-50 dark:bg-gold/10 rounded-xl px-4 py-3 border border-gold/20">
          <span className="text-sm text-gray-600 dark:text-gray-300">Credits you will earn</span>
          <span className="font-serif text-lg font-semibold text-gold">+{selectedType.creditValue} credit{selectedType.creditValue > 1 ? 's' : ''}</span>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Sharing grace…' : '✦ Share this Prayer ✦'}
        </button>
      </form>
    </div>
  )
}
