'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRAYER_TYPES } from '@/lib/types'

const BUNDLES = [
  { credits: 5,  label: 'Small Blessing',  description: 'Enough for 5 Hail Marys or 1 Divine Mercy' },
  { credits: 15, label: 'Rosary Bundle',   description: 'Enough for 3 full Rosaries' },
  { credits: 30, label: '3 Holy Mass',     description: 'Enough for 3 Holy Mass prayers' },
]

export default function GiftPage() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'credits' | 'prayer'>('credits')
  const initialMessage = searchParams.get('message') || ''
  const initialCredits = parseInt(searchParams.get('credits') || '5')
  const isBouquet = searchParams.get('type') === 'bouquet'

  const [selectedBundle, setSelectedBundle] = useState(BUNDLES.find(b => b.credits === initialCredits) || BUNDLES[0])
  const [selectedPrayerType, setSelectedPrayerType] = useState(PRAYER_TYPES[0])
  const [message, setMessage] = useState(initialMessage)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ code: string; shareUrl: string; emailError?: string | null } | null>(null)

  useEffect(() => {
    if (initialMessage) setMessage(initialMessage)
    if (isBouquet) setMode('credits')
  }, [initialMessage, isBouquet])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let body: any = { giftMessage: message }

    if (mode === 'credits') {
      body.type = 'credits'
      body.creditAmount = selectedBundle.credits
    } else {
      // Step 1: Draw a random prayer of this type
      const drawRes = await fetch(`/api/draw_random?type=${selectedPrayerType.id}`)
      if (!drawRes.ok) {
        const err = await drawRes.json()
        alert(err.error || 'No prayers of this type available right now.')
        setLoading(false)
        return
      }
      const { prayer } = await drawRes.json()

      // Step 2: Withdraw it
      const withdrawRes = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId: prayer.id }),
      })
      if (!withdrawRes.ok) {
        alert('Could not claim the prayer. Please try again.')
        setLoading(false)
        return
      }

      // Step 3: Create the gift card
      body.type = 'prayer'
      body.prayerId = prayer.id
    }

    const res = await fetch('/api/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setResult(data)
    } else {
      const err = await res.json()
      alert(err.error || 'Something went wrong.')
    }
  }

  if (result) return (
    <div className="text-center py-10">
      <p className="text-5xl mb-4">🎁</p>
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">Gift Card Created!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Share the link below with your friend.
      </p>
      <div className="card-gold rounded-xl p-5 mb-6 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Gift code</p>
        <p className="font-mono text-lg font-bold text-ink dark:text-white tracking-wider">{result.code}</p>
        <p className="text-[10px] text-gray-400 mt-4 mb-2 uppercase tracking-widest font-bold">Shareable link</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 break-all">{result.shareUrl}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { navigator.clipboard.writeText(result.shareUrl); alert('Link copied!') }}
            className="flex-1 text-xs border border-gray-200 dark:border-gray-700 py-3 rounded-lg hover:border-gold dark:hover:border-gold dark:text-gray-300"
          >
            Copy link
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              message 
                ? `I sent you a prayer gift! 🎁\n\n"${message}"\n\nRedeem it here: ${result.shareUrl}`
                : `I sent you a prayer gift! 🎁 Redeem it here: ${result.shareUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-xs border border-[#25D366] text-[#25D366] py-3 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center gap-1"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <button onClick={() => { setResult(null); setMessage('') }} className="btn-gold px-6 py-2 rounded-xl font-serif">
        Create another gift
      </button>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">Gift a Prayer</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">Send a blessing from the global treasury</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-8 border border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setMode('credits')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mode === 'credits' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Gift a Blessing
        </button>
        <button
          onClick={() => setMode('prayer')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
            mode === 'prayer' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          Gift a Prayer
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {mode === 'credits' ? (
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Choose a Bundle</label>
            <div className="space-y-2">
              {BUNDLES.map(b => (
                <button
                  key={b.credits}
                  type="button"
                  onClick={() => setSelectedBundle(b)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                    selectedBundle.credits === b.credits
                      ? 'border-gold bg-amber-50 dark:bg-gold/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-gold/50 dark:hover:border-gold/50'
                  }`}
                >
                  <div className="font-serif text-3xl font-semibold text-ink dark:text-white w-12 text-center">{b.credits}</div>
                  <div>
                    <p className="font-semibold text-ink dark:text-white text-sm">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Select Prayer Type</label>
            <div className="grid grid-cols-2 gap-2">
              {PRAYER_TYPES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrayerType(p)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all ${
                    selectedPrayerType.id === p.id
                      ? 'border-gold bg-amber-50 dark:bg-gold/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-gold/50 dark:hover:border-gold/50'
                  }`}
                >
                  <span className="text-3xl mb-1">{p.emoji}</span>
                  <p className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider">{p.name}</p>
                  <p className="text-[10px] text-gold">{p.creditValue} credits</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">We will draw a random prayer of this type from the global bank to gift.</p>
          </div>
        )}

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Personal Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Praying for you during this difficult time…"
            rows={3}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:bg-white/5 dark:text-white bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50 shadow-lg"
        >
          {loading ? 'Creating gift…' : '✦ Create Gift Card ✦'}
        </button>
      </form>
    </div>
  )
}
