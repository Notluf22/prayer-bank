'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'

export default function NavBar({ profile }: { profile: UserProfile | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: '🏠', title: 'Home' },
    { href: '/dashboard/deposit', label: '🕊', title: 'Deposit' },
    { href: '/dashboard/withdraw', label: '📿', title: 'Withdraw' },
    { href: '/dashboard/gift', label: '🎁', title: 'Gift' },
    { href: '/dashboard/redeem', label: '✨', title: 'Redeem' },
  ]

  return (
    <nav className="border-b border-gold/20 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-serif text-lg font-semibold text-ink">
          Prayer Bank
        </Link>

        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              title={l.title}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all ${
                pathname === l.href ? 'bg-amber-50 border border-gold/30' : 'hover:bg-gray-50'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {profile && (
            <span className="text-xs font-bold text-gold bg-amber-50 border border-gold/20 rounded-full px-3 py-1">
              {profile.credits} credits
            </span>
          )}
          <button
            onClick={signOut}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  )
}
