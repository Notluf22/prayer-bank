'use client'
import { useState } from 'react'

export default function RedeemPage() {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ type: string; credits?: number; prayer?: { type: string; intention: string } } | null>(null)

  async function handleRedeem(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/redeem', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: code.trim().toUpperCase() }),
    })
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setResult(data)
    } else {
      const err = await res.json()
      alert(err.error || 'Invalid or already redeemed code.')
    }
  }

  if (result) return (
    <div className="text-center py-10">
      <p className="text-5xl mb-4">{result.type === 'credits' ? '✨' : '🕊'}</p>
      <h2 className="font-serif text-3xl font-semibold text-ink mb-2">Gift Received!</h2>
      {result.type === 'credits' ? (
        <p className="text-gray-600 font-serif italic text-lg mb-6">
          +{result.credits} prayer credits added to your account
        </p>
      ) : (
        <div className="card-gold rounded-xl p-5 mb-6 text-left max-w-sm mx-auto">
          <p className="text-xs font-bold uppercase tracking-widest text-gold mb-2">{result.prayer?.type}</p>
          <p className="font-serif italic text-ink">"{result.prayer?.intention}"</p>
          <p className="text-sm text-gray-400 mt-3">This prayer has been received and is now yours.</p>
        </div>
      )}
      <p className="font-serif italic text-gray-400 mb-8">May this grace bless your life.</p>
      <a href="/dashboard" className="btn-gold px-6 py-2 rounded-xl font-serif inline-block">Back to dashboard</a>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink">Redeem a Gift Card</h1>
        <p className="font-serif italic text-gray-500 mt-1">Enter the code someone gifted you</p>
      </div>

      <form onSubmit={handleRedeem} className="space-y-5">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Gift Code</label>
          <input
            type="text"
            required
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. GRACE-K7X2-9MQP"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 font-mono text-sm tracking-wider focus:outline-none focus:border-gold bg-white uppercase"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50"
        >
          {loading ? 'Checking…' : '✦ Redeem Gift ✦'}
        </button>
      </form>

      <div className="mt-8 p-4 bg-amber-50 rounded-xl border border-gold/20">
        <p className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">How it works</p>
        <p className="text-sm text-gray-600">Someone deposited a prayer, withdrew it and gifted it to you as a card. Enter the code above to receive the prayer or the credits they sent you.</p>
      </div>
    </div>
  )
}
