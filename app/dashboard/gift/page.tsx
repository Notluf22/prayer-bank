'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRAYER_TYPES } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

  const BUNDLES = [
    { id: 'small', credits: 5,  label: t.small_blessing,  description: t.small_blessing_desc },
    { id: 'medium', credits: 15, label: t.rosary_bundle,   description: t.rosary_bundle_desc },
    { id: 'large', credits: 30, label: t.holy_mass_bundle,     description: t.holy_mass_bundle_desc },
  ]

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

  const trackingClass = language === 'ml' ? '' : 'tracking-widest'

  if (result) return (
    <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
      <p className="text-5xl mb-4">🎁</p>
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">{t.gift_sent}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {t.gift_sent_desc}
      </p>
      <div className="card-gold rounded-xl p-5 mb-6 text-left">
        <p className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 mb-2`}>Gift code</p>
        <p className="font-mono text-lg font-bold text-ink dark:text-white tracking-wider">{result.code}</p>
        <p className={`text-[10px] text-gray-400 mt-4 mb-2 uppercase ${trackingClass} font-bold`}>Shareable link</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 break-all">{result.shareUrl}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { navigator.clipboard.writeText(result.shareUrl); alert('Link copied!') }}
            className="flex-1 text-xs border border-gray-200 dark:border-gray-700 py-3 rounded-lg hover:border-gold dark:hover:border-gold dark:text-gray-300 active:scale-95 transition-transform"
          >
            {t.copy_code}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              message 
                ? `I sent you a prayer gift! 🎁\n\n"${message}"\n\nRedeem it here: ${result.shareUrl}`
                : `I sent you a prayer gift! 🎁 Redeem it here: ${result.shareUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-xs border border-[#25D366] text-[#25D366] py-3 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <button onClick={() => { setResult(null); setMessage('') }} className="btn-gold px-6 py-2 rounded-xl font-serif active:scale-95 transition-transform hover:scale-105 hover:shadow-lg">
        {t.share_another}
      </button>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">{t.gift_prayer}</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">{t.gift_desc}</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-8 border border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setMode('credits')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
            mode === 'credits' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {t.credits}
        </button>
        <button
          onClick={() => setMode('prayer')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
            mode === 'prayer' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {t.prayer}
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {mode === 'credits' ? (
          <div>
            <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-3`}>{t.gift_type}</label>
            <div className="space-y-2">
              {BUNDLES.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBundle(b)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.98] hover:scale-[1.02] hover:shadow-md ${
                    selectedBundle.id === b.id
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
            <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-3`}>{t.prayer_type_completed}</label>
            <div className="grid grid-cols-2 gap-2">
              {PRAYER_TYPES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrayerType(p)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all active:scale-95 hover:scale-[1.02] hover:shadow-md group ${
                    selectedPrayerType.id === p.id
                      ? 'border-gold bg-amber-50 dark:bg-gold/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-gold/50 dark:hover:border-gold/50'
                  }`}
                >
                  <span className="text-3xl mb-1">{p.emoji}</span>
                  <p className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider">{p.name}</p>
                  <p className="text-[10px] text-gold">{p.creditValue} {t.credits}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">{t.share_merit_desc}</p>
          </div>
        )}

        <div>
          <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-2`}>{t.gift_message}</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="..."
            rows={3}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:bg-white/5 dark:text-white bg-white resize-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50 shadow-lg active:scale-[0.98] transition-transform hover:scale-[1.01] hover:shadow-xl"
        >
          {loading ? t.sending_gift : t.send_gift_btn}
        </button>
      </form>
    </div>
  )
}
