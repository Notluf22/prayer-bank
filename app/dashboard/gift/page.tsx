'use client'
import { useState } from 'react'

const BUNDLES = [
  { credits: 5,  label: 'Small Blessing',  description: 'Enough for 5 Hail Marys or 1 Divine Mercy' },
  { credits: 15, label: 'Rosary Bundle',   description: 'Enough for 3 full Rosaries' },
  { credits: 30, label: 'Mass Bundle',     description: 'Enough for 3 Holy Mass prayers' },
]

export default function GiftPage() {
  const [selected, setSelected] = useState(BUNDLES[0])
  const [recipientEmail, setRecipientEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ code: string; shareUrl: string } | null>(null)

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'credits',
        creditAmount: selected.credits,
        recipientEmail,
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
      <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Gift Card Sent!</h2>
      <p className="text-gray-500 mb-6">
        {recipientEmail ? `An email has been sent to ${recipientEmail}` : 'Share the link below with your friend.'}
      </p>
      <div className="card-gold rounded-xl p-5 mb-6 text-left">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Gift code</p>
        <p className="font-mono text-lg font-bold text-ink tracking-wider">{result.code}</p>
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mt-4 mb-2">Shareable link</p>
        <p className="text-sm text-blue-600 break-all">{result.shareUrl}</p>
        <button
          onClick={() => { navigator.clipboard.writeText(result.shareUrl); alert('Link copied!') }}
          className="mt-3 text-xs border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gold"
        >
          Copy link
        </button>
      </div>
      <button onClick={() => { setResult(null); setRecipientEmail(''); setMessage('') }} className="btn-gold px-6 py-2 rounded-xl font-serif">
        Send another gift
      </button>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink">Gift Prayer Credits</h1>
        <p className="font-serif italic text-gray-500 mt-1">Send a blessing to someone you love</p>
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
                    ? 'border-gold bg-amber-50'
                    : 'border-gray-200 bg-white hover:border-gold/50'
                }`}
              >
                <div className="font-serif text-3xl font-semibold text-ink w-12 text-center">{b.credits}</div>
                <div>
                  <p className="font-semibold text-ink text-sm">{b.label}</p>
                  <p className="text-xs text-gray-400">{b.description}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recipient email (optional) */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">
            Recipient Email <span className="normal-case font-normal">(optional — leave blank for link only)</span>
          </label>
          <input
            type="email"
            value={recipientEmail}
            onChange={e => setRecipientEmail(e.target.value)}
            placeholder="friend@email.com"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold bg-white"
          />
        </div>

        {/* Message */}
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Personal Message</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="e.g. Praying for you during this difficult time…"
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold bg-white resize-none"
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
