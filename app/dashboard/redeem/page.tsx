'use client'
import { useState } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function RedeemPage() {
  const { language } = useLanguage()
  const t = translations[language]
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
      alert(err.error || t.invalid_code)
    }
  }

  const trackingClass = language === 'ml' ? '' : 'tracking-widest'

  if (result) return (
    <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
      <p className="text-5xl mb-4">{result.type === 'credits' ? '✨' : '🕊'}</p>
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">{t.claim_success}</h2>
      {result.type === 'credits' ? (
        <p className="text-gray-600 dark:text-gray-300 font-serif italic text-lg mb-6">
          +{result.credits} {t.credits} {t.claim_success_desc}
        </p>
      ) : (
        <div className="card-gold rounded-xl p-5 mb-6 text-left max-w-sm mx-auto">
          <p className={`text-xs font-bold uppercase ${trackingClass} text-gold mb-2`}>{result.prayer?.type}</p>
          <p className="font-serif italic text-ink dark:text-gray-200">"{result.prayer?.intention}"</p>
          <p className="text-sm text-gray-400 mt-3">{t.prayer_received_desc}</p>
        </div>
      )}
      <p className="font-serif italic text-gray-400 mb-8 max-w-sm mx-auto">{t.shared_treasury_desc}</p>
      <a href="/dashboard" className="btn-gold px-6 py-2 rounded-xl font-serif inline-block active:scale-95 transition-transform hover:scale-105 hover:shadow-lg">{t.back_to_dashboard}</a>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">{t.claim_code}</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">{t.claim_desc}</p>
      </div>

      <form onSubmit={handleRedeem} className="space-y-5">
        <div>
          <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-2`}>{t.enter_code}</label>
          <input
            type="text"
            required
            value={code}
            onChange={e => setCode(e.target.value.toUpperCase())}
            placeholder="e.g. GRACE-K7X2-9MQP"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-mono text-sm tracking-wider focus:outline-none focus:border-gold bg-white dark:bg-white/5 dark:text-white uppercase shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50 shadow-lg active:scale-[0.98] transition-transform hover:scale-[1.01] hover:shadow-xl"
        >
          {loading ? t.claiming_grace : t.claim_btn}
        </button>
      </form>

      <div className="mt-8 p-4 bg-amber-50 dark:bg-gold/10 rounded-xl border border-gold/20 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
        <p className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 mb-2`}>{t.how_it_works}</p>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic">
          {t.how_it_works_desc}
        </p>
      </div>
    </div>
  )
}
