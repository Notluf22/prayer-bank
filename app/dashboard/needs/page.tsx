'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

interface Need {
  id: string
  user_id: string
  intention: string
  status: string
  created_at: string
  user?: { display_name: string }
}

export default function NeedsPage() {
  const [needs, setNeeds] = useState<Need[]>([])
  const [newNeed, setNewNeed] = useState('')
  const [loading, setLoading] = useState(true)
  const [posting, setPosting] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language]
  const trackingClass = language === 'ml' ? '' : 'tracking-widest'

  useEffect(() => {
    fetchNeeds()
  }, [])

  async function fetchNeeds() {
    setLoading(true)
    setFetchError(null)
    try {
      const { data, error } = await supabase
        .from('needs')
        .select('*, user:profiles!user_id(display_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setNeeds(data || [])
    } catch (err: any) {
      console.error('Error fetching needs:', err)
      setFetchError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [error, setError] = useState('')

  const VULGAR_WORDS = ['badword1', 'badword2', 'vulgar', 'inappropriate'] 

  function isSafe(text: string) {
    const lower = text.toLowerCase()
    return !VULGAR_WORDS.some(word => lower.includes(word))
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newNeed.trim()) return
    setError('')
    
    if (!isSafe(newNeed)) {
      setError('Please keep the Needs Wall sacred and respectful.')
      return
    }
    
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error: postError } = await supabase.from('needs').insert({
      user_id: user.id,
      intention: newNeed
    })

    setPosting(false)
    if (!postError) {
      setNewNeed('')
      fetchNeeds()
    } else {
      setError(postError.message)
    }
  }

  async function handleCommit(need: Need) {
    await supabase
      .from('needs')
      .update({ status: 'praying' })
      .eq('id', need.id)
    
    router.push(`/dashboard/deposit?needId=${need.id}&intention=${encodeURIComponent(need.intention)}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">{t.needs}</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">{t.post_burden}</p>
      </div>

      <form onSubmit={handlePost} className="mb-10 bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gold/10 shadow-lg">
        <label className={`text-xs font-bold uppercase ${trackingClass} text-gold block mb-3 text-center`}>{t.request_prayer}</label>
        <textarea
          value={newNeed}
          onChange={(e) => setNewNeed(e.target.value)}
          placeholder="..."
          className="w-full bg-white dark:bg-ink border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:text-white resize-none shadow-inner"
          rows={3}
        />
        <button
          type="submit"
          disabled={posting || !newNeed.trim()}
          className="w-full mt-3 btn-gold py-3 rounded-xl font-serif text-lg disabled:opacity-50 active:scale-[0.98] transition-transform hover:scale-[1.01] hover:shadow-xl"
        >
          {posting ? '...' : t.post_wall}
        </button>
        {(error || fetchError) && <p className={`text-center text-red-400 text-[10px] mt-2 font-bold uppercase ${trackingClass}`}>{error || fetchError}</p>}
      </form>

      <div className="space-y-4">
        <h2 className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 mb-2`}>{t.pending_needs}</h2>
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-2xl p-5 h-32 border border-white/5"></div>
            ))}
          </div>
        ) : needs.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
             <p className="text-gray-400 italic">{t.wall_empty}</p>
          </div>
        ) : (
          needs.map((need) => (
            <div key={need.id} className="card-gold rounded-2xl p-5 shadow-md flex flex-col gap-4 group hover:border-gold/40 transition-all active:scale-[0.99]">
              <div>
                <p className={`text-xs font-bold text-gold uppercase ${trackingClass} mb-1`}>A Soul in Need</p>
                <p className="font-serif italic text-lg text-ink dark:text-gray-200 leading-snug text-balance">
                  "{need.intention}"
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400">{new Date(need.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => handleCommit(need)}
                  className="bg-ink dark:bg-white/10 text-white dark:text-gold px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-ink transition-all active:scale-95 hover:scale-105 hover:shadow-lg"
                >
                  {t.praying_for_this}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
