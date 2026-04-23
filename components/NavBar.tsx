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
    <nav className="border-b border-gold/10 bg-white/70 dark:bg-ink/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-3xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-colors">
            <span className="text-sm">🕊</span>
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-ink dark:text-white">
            PrayerBank
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1 bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              title={l.title}
              className={`px-3 py-1.5 flex items-center gap-2 rounded-lg text-sm font-medium transition-all ${
                pathname === l.href 
                  ? 'bg-white dark:bg-white/10 text-gold shadow-sm' 
                  : 'text-gray-500 hover:text-ink dark:hover:text-white'
              }`}
            >
              <span>{l.label}</span>
              <span className={pathname === l.href ? 'inline' : 'hidden'}>{l.title}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Navigation Icons */}
        <div className="flex md:hidden items-center gap-0.5">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg transition-all ${
                pathname === l.href 
                  ? 'text-gold bg-gold/10' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end mr-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Credits</span>
            <span className="text-sm font-bold text-gold">{profile?.credits ?? 0}</span>
          </div>
          
          <div className="h-8 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block"></div>
          
          <ThemeToggle />
          
          <button
            onClick={signOut}
            className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title="Sign Out"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  )
}
