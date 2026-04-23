'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState('')
  const [country, setCountry] = useState('')
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
        .select('display_name, country, is_anonymous')
        .eq('id', user.id)
        .single()

      if (profile) {
        setDisplayName(profile.display_name)
        setCountry(profile.country || '')
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
        country: country,
        is_anonymous: isAnonymous
      })
      .eq('id', user.id)

    setSaving(false)
    if (!error) {
      setMessage('Profile updated successfully! ✨')
      router.refresh()
    } else {
      setMessage('Error updating profile. Please try again.')
    }
  }

  if (loading) return <div className="text-center py-20 italic text-gray-400">Loading your profile...</div>

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">Profile Settings</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">Your identity in the Treasury</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 bg-white/50 dark:bg-white/5 p-8 rounded-3xl border border-gold/10 shadow-xl">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Display Name</label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full bg-white dark:bg-ink border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:text-white"
            placeholder="e.g. Brother Thomas"
          />
        </div>

        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-gray-400 block mb-2">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full bg-white dark:bg-ink border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:text-white appearance-none"
          >
            <option value="">Select Country</option>
            <option value="USA">USA</option>
            <option value="UK">United Kingdom</option>
            <option value="India">India</option>
            <option value="Brazil">Brazil</option>
            <option value="Philippines">Philippines</option>
            <option value="Nigeria">Nigeria</option>
            <option value="Australia">Australia</option>
            <option value="Italy">Italy</option>
            <option value="Canada">Canada</option>
            <option value="Mexico">Mexico</option>
            <option value="France">France</option>
            <option value="Germany">Germany</option>
          </select>
        </div>

        <div className="flex items-center justify-between p-4 bg-ink/10 dark:bg-white/5 rounded-2xl border border-gold/10">
          <div>
            <p className="text-sm font-semibold text-ink dark:text-white">Always Share Anonymously</p>
            <p className="text-[10px] text-gray-500">Hide your name across the entire Treasury</p>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-12 h-6 rounded-full transition-colors relative ${isAnonymous ? 'bg-gold' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAnonymous ? 'translate-x-6' : ''}`}></div>
          </button>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full btn-gold py-4 rounded-xl font-serif text-lg disabled:opacity-50 shadow-lg"
        >
          {saving ? 'Saving changes...' : '✦ Update Profile ✦'}
        </button>

        {message && (
          <p className={`text-center text-xs font-bold uppercase tracking-widest mt-4 ${message.includes('Error') ? 'text-red-400' : 'text-green-500'}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  )
}
