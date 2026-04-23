'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

const BUNDLES = [
  { credits: 5,  label: 'Small Blessing',  description: 'Enough for 5 Hail Marys or 1 Divine Mercy' },
  { credits: 15, label: 'Rosary Bundle',   description: 'Enough for 3 full Rosaries' },
  { credits: 30, label: 'Mass Bundle',     description: 'Enough for 3 Holy Mass prayers' },
]

export default function GiftPage() {
  const searchParams = useSearchParams()
  const initialMessage = searchParams.get('message') || ''
  const initialCredits = parseInt(searchParams.get('credits') || '5')
  const isBouquet = searchParams.get('type') === 'bouquet'

  const [selected, setSelected] = useState(BUNDLES.find(b => b.credits === initialCredits) || BUNDLES[0])
  const [message, setMessage] = useState(initialMessage)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ code: string; shareUrl: string; emailError?: string | null } | null>(null)

  useEffect(() => {
    if (initialMessage) setMessage(initialMessage)
    if (initialCredits) {
      const bundle = BUNDLES.find(b => b.credits === initialCredits)
      if (bundle) setSelected(bundle)
      else setSelected({ credits: initialCredits, label: 'Spiritual Bouquet', description: 'A custom collection of prayers' })
    }
  }, [initialMessage, initialCredits])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credits',
        creditAmount: selected.credits,
        giftMessage: message,
      }),
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
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">Gift Card Sent!</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        Share the link below with your friend.
      </p>
      <div className="card-gold rounded-xl p-5 mb-6 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Gift code</p>
        <p className="font-mono text-lg font-bold text-ink dark:text-white tracking-wider">{result.code}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-4 mb-2">Shareable link</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 break-all">{result.shareUrl}</p>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => { navigator.clipboard.writeText(result.shareUrl); alert('Link copied!') }}
            className="text-xs border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg hover:border-gold dark:hover:border-gold dark:text-gray-300"
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
            className="text-xs border border-[#25D366] text-[#25D366] px-3 py-1.5 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Send on WhatsApp
          </a>
        </div>
      </div>
      <button onClick={() => { setResult(null); setMessage('') }} className="btn-gold px-6 py-2 rounded-xl font-serif">
        Send another gift
      </button>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">Gift Prayer Credits</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">Send a blessing to someone you love</p>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {/* Bundle selection */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-3">Choose a Bundle</label>
          <div className="space-y-2">
            {BUNDLES.map(b => (
              <button
                key={b.credits}
                type="button"
                onClick={() => setSelected(b)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                  selected.credits === b.credits
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



        {/* Message */}
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
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Creating gift…' : '✦ Create Gift Card ✦'}
        </button>
      </form>
    </div>
  )
}
