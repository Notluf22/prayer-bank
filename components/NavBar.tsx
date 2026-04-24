'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'

import ThemeToggle from './ThemeToggle'

export default function NavBar({ profile }: { profile: UserProfile | null }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()
  const { language, setLanguage } = useLanguage()
  const t = translations[language]

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: '🏠', title: t.home, mobile: true },
    { href: '/dashboard/needs', label: '🕯', title: t.needs, mobile: true },
    { href: '/dashboard/deposit', label: '🤲', title: t.share, mobile: true },
    { href: '/dashboard/withdraw', label: '📿', title: t.receive, mobile: true },
    { href: '/dashboard/gift', label: '🎁', title: t.gift, mobile: false },
    { href: '/dashboard/vault', label: '🏛', title: t.vault, mobile: true },
    { href: '/dashboard/redeem', label: '✨', title: t.redeem, mobile: false },
  ]

  return (
    <nav className="border-b border-gold/10 bg-white/70 dark:bg-ink/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-colors">
            <span className="text-sm">🕊</span>
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-ink dark:text-white hidden sm:inline">
            PrayerBank
          </span>
        </Link>

        {/* Desktop Navigation Icons */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              title={l.title}
              className={`px-3 py-1.5 flex items-center gap-2 rounded-lg text-sm font-medium transition-all active:scale-95 ${
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

        {/* Mobile/Tablet Navigation Icons - Better Labels */}
        <div className="flex lg:hidden items-center gap-1 sm:gap-2">
          {links.filter(l => l.mobile).map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`flex flex-col items-center justify-center min-w-[50px] py-1 rounded-lg transition-all active:scale-90 ${
                pathname === l.href 
                  ? 'text-gold bg-gold/10' 
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
              }`}
            >
              <span className="text-xl sm:text-2xl">{l.label}</span>
              <span className="text-[8px] sm:text-[10px] font-bold uppercase tracking-tighter sm:tracking-widest mt-0.5">{l.title}</span>
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden xs:flex flex-col items-end mr-1">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.grace}</span>
            <span className="text-xs font-bold text-gold leading-none">{profile?.credits ?? 0}</span>
          </div>
          
          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
            className="p-1.5 sm:p-2 rounded-lg bg-gold/5 dark:bg-white/5 text-[10px] sm:text-xs font-bold text-gold border border-gold/10 hover:bg-gold/10 transition-all uppercase tracking-widest"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            {language === 'en' ? 'മലയാളം' : 'English'}
          </button>

          <ThemeToggle />
          
          <button
            onClick={signOut}
            className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title={t.sign_out}
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
