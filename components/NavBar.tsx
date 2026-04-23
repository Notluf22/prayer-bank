'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'

import ThemeToggle from './ThemeToggle'

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
    <nav className="border-b border-gold/20 bg-white/80 dark:bg-ink/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href="/dashboard" className="font-serif text-lg font-semibold text-ink dark:text-ink-dark">
          Prayer Bank
        </Link>

        <div className="flex items-center gap-1">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              title={l.title}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-base transition-all ${
                pathname === l.href 
                  ? 'bg-amber-50 dark:bg-gold/20 border border-gold/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-white/5'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-1">
          <ThemeToggle />
          {profile && (
            <span className="hidden sm:inline-block text-[10px] font-bold text-gold bg-amber-50 dark:bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5 ml-2">
              {profile.credits}
            </span>
          )}
          <button
            onClick={signOut}
            className="ml-2 text-[10px] uppercase tracking-wider text-gray-400 hover:text-ink dark:hover:text-white transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </nav>
  )
}
