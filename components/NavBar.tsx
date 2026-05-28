'use client'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { UserProfile } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { motion } from 'framer-motion'

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
    { href: '/dashboard/adoration', label: '🛐', title: t.adoration_chapel, mobile: true },
    { href: '/dashboard/vault', label: '🏛', title: t.vault, mobile: true },
    { href: '/dashboard/redeem', label: '✨', title: t.redeem, mobile: false },
  ]

  const trackingClass = language === 'ml' ? '' : 'tracking-widest'
  const trackingTighterClass = language === 'ml' ? '' : 'tracking-tighter'

  return (
    <nav className="border-b border-gold/10 bg-white/70 dark:bg-ink/70 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-16 md:h-20">
        <Link href="/dashboard" className="group flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20 group-hover:bg-gold/20 transition-colors">
            <span className="text-sm leading-none">🕊</span>
          </div>
          <span className="font-serif text-lg font-bold tracking-tight text-ink dark:text-white hidden sm:inline">
            PrayerBank
          </span>
        </Link>

        {/* Desktop Navigation Icons */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-100/50 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5">
          {links.map(l => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                title={l.title}
                className={`relative group px-3 py-1.5 flex items-center gap-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'text-gold' 
                    : 'text-gray-500 hover:text-ink dark:hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div
                    className="absolute inset-0 bg-white dark:bg-white/10 shadow-sm rounded-lg"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
                {!isActive && (
                  <div className="absolute inset-0 rounded-lg bg-gray-200/50 dark:bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                )}
                <motion.span 
                  className="relative z-10 block origin-bottom"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {l.label}
                </motion.span>
                <span className={`relative z-10 whitespace-nowrap text-xs ${isActive ? 'inline' : 'hidden'}`}>{l.title}</span>
              </Link>
            )
          })}
        </div>

        {/* Mobile/Tablet Navigation Icons - Clean Emojis Only */}
        <div className="flex lg:hidden items-center gap-1.5 sm:gap-2">
          {links.filter(l => l.mobile).map(l => {
            const isActive = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                title={l.title}
                className={`relative group flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? 'text-gold bg-gold/10 border border-gold/20 shadow-sm' 
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/5'
                }`}
              >
                <motion.span 
                  className="text-lg sm:text-xl relative z-10 block origin-bottom"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  {l.label}
                </motion.span>
              </Link>
            )
          })}
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Credits indicator badge */}
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500 hidden sm:inline">{t.grace}</span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-xl bg-gold/5 dark:bg-gold/10 border border-gold/15 text-xs font-bold text-gold">
              <span>✨</span>
              <span>{profile?.credits ?? 0}</span>
            </div>
          </div>
          
          {/* Language Toggle - Compact Code on Mobile */}
          <button
            onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
            className="px-2 py-1 sm:py-1.5 sm:px-2.5 rounded-lg bg-gold/5 dark:bg-white/5 text-[10px] sm:text-xs font-bold text-gold border border-gold/10 hover:bg-gold/10 transition-all uppercase tracking-widest min-w-[32px] sm:min-w-[70px] text-center"
            title="Switch Language / ഭാഷ മാറ്റുക"
          >
            <span className="inline sm:hidden">{language === 'en' ? 'ML' : 'EN'}</span>
            <span className="hidden sm:inline">{language === 'en' ? 'മലയാളം' : 'English'}</span>
          </button>

          <ThemeToggle />
          
          <button
            onClick={signOut}
            className="p-1 sm:p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
            title={t.sign_out}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
