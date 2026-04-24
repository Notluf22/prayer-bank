'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

export default function SettingsPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const [displayName, setDisplayName] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, is_anonymous')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name)
        setIsAnonymous(profile.is_anonymous || false)
      }
      setLoading(false)
    }
    loadProfile()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: displayName,
        is_anonymous: isAnonymous
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
      setMessage(t.profile_updated)
      router.refresh()
    } else {
      setMessage(t.profile_error)
    }
  }

  const trackingClass = language === 'ml' ? '' : 'tracking-widest'

  if (loading) return <div className="text-center py-20 italic text-gray-400">{t.welcome}...</div>

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">{t.profile_settings}</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">{t.identity_treasury}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white/50 dark:bg-white/5 p-8 rounded-3xl border border-gold/10 shadow-xl animate-in fade-in slide-in-from-bottom duration-500">
        <div>
          <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-2`}>{t.display_name}</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-white dark:bg-ink border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:text-white shadow-inner"
            placeholder="..."
          />
        </div>

        <div className="flex items-center justify-between p-4 bg-ink/10 dark:bg-white/5 rounded-2xl border border-gold/10">
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">{t.share_anonymously}</p>
            <p className="text-[10px] text-gray-500">{t.hide_name_desc}</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-12 h-6 rounded-full transition-colors relative active:scale-95 ${isAnonymous ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAnonymous ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-gold py-4 rounded-xl font-serif text-lg disabled:opacity-50 shadow-lg active:scale-[0.98] transition-transform hover:scale-[1.01] hover:shadow-xl"
        >
          {saving ? t.saving_changes : t.save_changes}
        </button>

        {message && (
          <p className={`text-center text-xs font-bold uppercase ${trackingClass} mt-4 ${message.includes('Error') || message.includes('വീണ്ടും') ? 'text-red-400' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
