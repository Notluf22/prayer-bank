'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

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
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    fetchNeeds()
  }, [])

  async function fetchNeeds() {
    const { data } = await supabase
      .from('needs')
      .select('*, user:profiles!user_id(display_name)')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
    
    setNeeds(data || [])
    setLoading(false)
  }

  async function handlePost(e: React.FormEvent) {
    e.preventDefault()
    if (!newNeed.trim()) return
    
    setPosting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('needs').insert({
      user_id: user.id,
      intention: newNeed
    })

    setPosting(false)
    if (!error) {
      setNewNeed('')
      fetchNeeds()
    }
  }

  async function handleCommit(need: Need) {
    // We mark it as 'praying' and redirect to deposit
    await supabase
      .from('needs')
      .update({ status: 'praying' })
      .eq('id', need.id)
    
    router.push(`/dashboard/deposit?needId=${need.id}&intention=${encodeURIComponent(need.intention)}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">The Needs Wall</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">Post a burden, carry a cross for another</p>
      </div>

      <form onSubmit={handlePost} className="mb-10 bg-white/50 dark:bg-white/5 p-6 rounded-2xl border border-gold/10 shadow-lg">
        <label className="text-xs font-bold uppercase tracking-widest text-gold block mb-3 text-center">Request a Prayer</label>
        <textarea
          value={newNeed}
          onChange={(e) => setNewNeed(e.target.value)}
          placeholder="What can we pray for you today? (e.g. My grandmother's surgery, strength for my exams...)"
          className="w-full bg-white dark:bg-ink border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:text-white resize-none"
          rows={3}
        />
        <button
          type="submit"
          disabled={posting || !newNeed.trim()}
          className="w-full mt-3 btn-gold py-3 rounded-xl font-serif text-lg disabled:opacity-50"
        >
          {posting ? 'Posting...' : 'Post to the Wall'}
        </button>
      </form>

      <div className="space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Pending Needs</h2>
        {loading ? (
          <p className="text-center py-10 text-gray-400 italic">Listening for requests...</p>
        ) : needs.length === 0 ? (
          <div className="text-center py-10 border-2 border-dashed border-gray-200 dark:border-white/5 rounded-2xl">
             <p className="text-gray-400 italic">The wall is currently empty. Everyone is blessed!</p>
          </div>
        ) : (
          needs.map((need) => (
            <div key={need.id} className="card-gold rounded-2xl p-5 shadow-md flex flex-col gap-4 group hover:border-gold/40 transition-all">
              <div>
                <p className="text-xs font-bold text-gold uppercase tracking-tighter mb-1">{need.user?.display_name || 'Anonymous'}</p>
                <p className="font-serif italic text-lg text-ink dark:text-gray-200 leading-snug">
                  "{need.intention}"
                </p>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-gray-400">{new Date(need.created_at).toLocaleDateString()}</span>
                <button
                  onClick={() => handleCommit(need)}
                  className="bg-ink dark:bg-white/10 text-white dark:text-gold px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-gold hover:text-white dark:hover:bg-gold dark:hover:text-ink transition-all"
                >
                  I'm praying for this
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
