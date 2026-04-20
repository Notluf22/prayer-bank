'use client'
import { useState } from 'react'
import { Prayer, PRAYER_TYPES } from '@/lib/types'

export default function GiftModal({
  prayer,
  onClose,
  onGifted,
}: {
  prayer: Prayer
  onClose: () => void
  onGifted: (code: string) => void
}) {
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const meta = PRAYER_TYPES.find(p => p.id === prayer.type)

  async function handleGift(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    // First withdraw the prayer
    const wRes = await fetch('/api/withdraw', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prayerId: prayer.id }),
    })
    if (!wRes.ok) {
      const err = await wRes.json()
      alert(err.error || 'Could not withdraw prayer')
      setLoading(false)
      return
    }

    // Then create the gift card
    const gRes = await fetch('/api/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'prayer',
        prayerId: prayer.id,
        recipientEmail,
        giftMessage: message,
      }),
    })
    setLoading(false)
    if (gRes.ok) {
      const data = await gRes.json()
      onGifted(data.code)
    } else {
      const err = await gRes.json()
      alert(err.error || 'Something went wrong.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-4 pb-4 sm:pb-0"
      style={{ background: 'rgba(0,0,0,0.4)' }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="font-serif text-2xl font-semibold text-ink mb-1">Gift this Prayer</h2>
        <p className="text-sm text-gray-500 mb-5">This will withdraw the prayer and create a gift card for someone.</p>

        {/* Prayer preview */}
        <div className="bg-amber-50 rounded-xl p-3 mb-5 border border-gold/20">
          <p className="text-xs font-bold uppercase tracking-widest text-gold">{meta?.emoji} {meta?.name}</p>
          {prayer.intention && <p className="font-serif italic text-sm text-ink mt-1">"{prayer.intention}"</p>}
          <p className="text-xs text-gray-400 mt-1">Cost: {prayer.credit_value} credit{prayer.credit_value > 1 ? 's' : ''}</p>
        </div>

        <form onSubmit={handleGift} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">
              Recipient Email <span className="normal-case font-normal">(optional)</span>
            </label>
            <input
              type="email"
              value={recipientEmail}
              onChange={e => setRecipientEmail(e.target.value)}
              placeholder="friend@email.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white"
            />
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Personal Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Praying for you…"
              rows={2}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white resize-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 rounded-xl py-3 text-sm hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-gold font-serif rounded-xl py-3 disabled:opacity-50"
            >
              {loading ? 'Sending…' : '✦ Gift it ✦'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
