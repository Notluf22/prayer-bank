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
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const meta = PRAYER_TYPES.find(p => p.id === prayer.type)

  const [successData, setSuccessData] = useState<{ code: string; shareUrl: string; emailError?: string | null } | null>(null)

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
        giftMessage: message,
      }),
    })
    setLoading(false)
    if (gRes.ok) {
      const data = await gRes.json()
      setSuccessData(data)
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
        className="bg-white dark:bg-card-bg rounded-2xl p-6 w-full max-w-sm shadow-xl relative"
        onClick={e => e.stopPropagation()}
      >
        {successData ? (
          <div className="text-center py-4">
            <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-ink dark:hover:text-white">✕</button>
            <p className="text-4xl mb-3">🎁</p>
            <h2 className="font-serif text-2xl font-semibold text-ink dark:text-white mb-2">Prayer Gifted!</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
              Share the link below with your friend.
            </p>
            <div className="card-gold rounded-xl p-4 mb-5 text-left bg-[#fdf8ee] dark:bg-card-bg border border-gold/20">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">Gift code</p>
              <p className="font-mono text-base font-bold text-ink dark:text-white tracking-wider">{successData.code}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-3 mb-1">Shareable link</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 break-all">{successData.shareUrl}</p>
              
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { navigator.clipboard.writeText(successData.shareUrl); alert('Link copied!') }}
                  className="flex-1 text-xs border border-gray-200 dark:border-gray-700 px-3 py-2 rounded-lg hover:border-gold dark:hover:border-gold dark:text-gray-300 text-center"
                >
                  Copy link
                </button>
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    message 
                      ? `I sent you a prayer gift! 🎁\n\n"${message}"\n\nRedeem it here: ${successData.shareUrl}`
                      : `I sent you a prayer gift! 🎁 Redeem it here: ${successData.shareUrl}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 justify-center text-xs border border-[#25D366] text-[#25D366] px-3 py-2 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors flex items-center gap-1"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-serif text-2xl font-semibold text-ink dark:text-white mb-1">Gift this Prayer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">This will withdraw the prayer and create a gift card for someone.</p>

            {/* Prayer preview */}
            <div className="bg-amber-50 dark:bg-gold/10 rounded-xl p-3 mb-5 border border-gold/20">
              <p className="text-xs font-bold uppercase tracking-widest text-gold">{meta?.emoji} {meta?.name}</p>
              {prayer.intention && <p className="font-serif italic text-sm text-ink dark:text-gray-200 mt-1">"{prayer.intention}"</p>}
              <p className="text-xs text-gray-400 mt-1">Cost: {prayer.credit_value} credit{prayer.credit_value > 1 ? 's' : ''}</p>
            </div>

            <form onSubmit={handleGift} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-1">Personal Message</label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Praying for you…"
                  rows={2}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-gold bg-white dark:bg-white/5 dark:text-white resize-none"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={onClose} className="flex-1 border border-gray-200 dark:border-gray-700 dark:text-white rounded-xl py-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5">
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
          </>
        )}
      </div>
    </div>
  )
}
