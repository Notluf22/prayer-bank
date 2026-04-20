'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AuthPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
  }

  async function handleEmail(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (!error) setSent(true)
    else alert('Error: ' + error.message)
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <p className="text-gold text-xs tracking-[8px] mb-4 ornament"></p>
          <h1 className="font-serif text-4xl font-semibold text-ink">Prayer Bank</h1>
          <p className="font-serif italic text-gray-500 mt-1">Sign in to begin</p>
        </div>

        <div className="card-gold rounded-2xl p-8 space-y-4">
          {sent ? (
            <div className="text-center py-4">
              <p className="text-3xl mb-3">✉️</p>
              <p className="font-semibold text-ink">Check your email</p>
              <p className="text-sm text-gray-500 mt-2">
                We sent a magic link to <strong>{email}</strong>. Click it to sign in — no password needed.
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-xl py-3 px-4 text-sm font-semibold text-ink hover:bg-gray-50 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18">
                  <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z"/>
                  <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2.04a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z"/>
                  <path fill="#FBBC05" d="M4.5 10.48A4.8 4.8 0 0 1 4.5 7.5V5.43H1.83a8 8 0 0 0 0 7.12l2.67-2.07z"/>
                  <path fill="#EA4335" d="M8.98 3.58c1.32 0 2.44.45 3.35 1.35l2.5-2.5A8 8 0 0 0 1.83 5.43L4.5 7.5c.67-2 2.52-3.92 4.48-3.92z"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200"></div>
                <span className="text-xs text-gray-400">or</span>
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <form onSubmit={handleEmail} className="space-y-3">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold bg-white"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-gold w-full font-serif text-base py-3 rounded-xl disabled:opacity-50"
                >
                  {loading ? 'Sending…' : '✦ Send Magic Link ✦'}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Free forever · No credit card · No password needed
        </p>
      </div>
    </main>
  )
}
