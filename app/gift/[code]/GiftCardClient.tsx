'use client'
import { useState } from 'react'
import Link from 'next/link'
import { PRAYER_TYPES } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { motion, AnimatePresence } from 'framer-motion'

interface GiftCardClientProps {
  gift: {
    id: string
    code: string
    type: 'credits' | 'prayer'
    credit_amount: number | null
    gift_message: string | null
    card_image: string | null
    redeemed_at: string | null
    created_at: string
    prayer: {
      type: string
      intention: string | null
      offered_for: string | null
    } | null
    from_user: {
      display_name: string | null
    } | null
  }
}

export default function GiftCardClient({ gift }: GiftCardClientProps) {
  const { language, setLanguage } = useLanguage()
  const t = translations[language]
  const [isOpen, setIsOpen] = useState(false)

  const prayerMeta = gift.prayer
    ? PRAYER_TYPES.find(p => p.id === gift.prayer?.type)
    : null

  const displayFrom = gift.from_user?.display_name || (language === 'ml' ? 'ഒരു സുഹൃത്ത്' : 'a friend')

  // Theme support: public view is beautifully styled, we can provide a small toggle or adapt to the background
  const hasImage = !!gift.card_image

  return (
    <main className="min-h-screen relative flex flex-col items-center justify-center px-4 py-16 bg-slate-950 text-slate-100 overflow-hidden">
      {/* Mystical glowing background blur spheres */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-yellow-600/10 blur-[120px] pointer-events-none" />

      {/* Elegant Header with Language Switcher */}
      <div className="absolute top-6 right-6 flex items-center gap-4 z-50">
        <button
          onClick={() => setLanguage(language === 'en' ? 'ml' : 'en')}
          className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-amber-400 hover:bg-white/10 transition-all uppercase tracking-widest"
        >
          {language === 'en' ? 'മലയാളം' : 'English'}
        </button>
        <Link 
          href="/" 
          className="text-xs tracking-wider text-slate-400 hover:text-amber-400 transition-colors uppercase"
        >
          {language === 'en' ? 'Sanctuary ✦' : 'ആരാധനാലയം ✦'}
        </Link>
      </div>

      <div className="max-w-md w-full flex flex-col items-center justify-center relative z-10">
        {/* Section Title */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-amber-500/80 font-bold">
            {language === 'en' ? '✦ Sacred Offering ✦' : '✦ പവിത്രമായ സമർപ്പണം ✦'}
          </span>
          <h1 className="font-serif text-3xl font-medium mt-2 text-white">
            {language === 'en' ? 'A Blessing Awaits' : 'നിങ്ങൾക്കായി ഒരു അനുഗ്രഹം'}
          </h1>
          <p className="font-serif italic text-amber-200/60 mt-1">
            {language === 'en' ? `sent by ${displayFrom}` : `${displayFrom} അയച്ചത്`}
          </p>
        </motion.div>

        {/* Outer Envelope Wrapper */}
        <div className="relative w-full h-[400px] flex items-center justify-center perspective-[1500px]">
          <AnimatePresence mode="wait">
            {!isOpen ? (
              /* CLOSED ENVELOPE STATE */
              <motion.div
                key="envelope-closed"
                initial={{ opacity: 0, scale: 0.9, rotateX: 20 }}
                animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, scale: 0.95, rotateX: -20, y: 50 }}
                transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                onClick={() => setIsOpen(true)}
                className="w-full max-w-[360px] h-[250px] relative bg-slate-900 border border-amber-500/20 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] flex flex-col items-center justify-center cursor-pointer overflow-hidden group hover:border-amber-500/40 transition-colors duration-500"
              >
                {/* Envelope background geometric flap folds */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-900 to-slate-850 opacity-90" />
                
                {/* Diagonal lines to make it look like a physical envelope back */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" xmlns="http://www.w3.org/2000/svg">
                  <line x1="0" y1="0" x2="180" y2="125" stroke="#b5902a" strokeWidth="1" />
                  <line x1="360" y1="0" x2="180" y2="125" stroke="#b5902a" strokeWidth="1" />
                  <line x1="0" y1="250" x2="180" y2="125" stroke="#b5902a" strokeWidth="1" />
                  <line x1="360" y1="250" x2="180" y2="125" stroke="#b5902a" strokeWidth="1" />
                </svg>

                {/* Wax Seal */}
                <motion.div 
                  className="z-10 relative flex flex-col items-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {/* Outer glowing ring */}
                  <div className="absolute -inset-4 rounded-full bg-amber-500/20 blur-md group-hover:bg-amber-500/30 transition-all animate-pulse" />
                  
                  {/* Wax Seal Body */}
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400 shadow-[0_0_20px_rgba(217,119,6,0.5)] flex items-center justify-center text-2xl relative z-10">
                    🕊️
                  </div>
                  
                  <span className="font-serif text-sm text-amber-300 font-semibold tracking-wider mt-4 relative z-10 group-hover:text-amber-200 transition-colors">
                    {language === 'en' ? 'Break Seal & Open' : 'അനുഗ്രഹം തുറക്കുക'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">
                    {language === 'en' ? 'Click to Unfold' : 'തുറക്കാൻ ക്ലിക്ക് ചെയ്യുക'}
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              /* OPENED CARD STATE */
              <motion.div
                key="envelope-opened"
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 80, damping: 15 }}
                className="w-full max-w-[380px] relative"
              >
                {/* Greeting Card container */}
                <div 
                  className={`w-full rounded-2xl border border-amber-500/30 overflow-hidden relative shadow-[0_25px_60px_rgba(0,0,0,0.9)] min-h-[380px] flex flex-col justify-between p-6 ${
                    hasImage ? 'bg-black' : 'bg-gradient-to-b from-slate-900 to-slate-950'
                  }`}
                >
                  {/* Background Artwork */}
                  {hasImage && (
                    <>
                      <img 
                        src={gift.card_image!} 
                        alt="Blessing Card Art" 
                        className="absolute inset-0 w-full h-full object-cover opacity-80"
                      />
                      {/* Dark overlay to ensure beautiful glassmorphic high-contrast readability */}
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/70 via-black/80 to-slate-950/90 backdrop-blur-[2px]" />
                    </>
                  )}

                  {/* Elegant inner gold border */}
                  <div className="absolute inset-3 border border-amber-500/10 pointer-events-none rounded-xl" />

                  {/* Top content */}
                  <div className="relative z-10">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-amber-500/80">
                          {gift.type === 'credits' 
                            ? (language === 'en' ? 'Prayer Credits' : 'പുണ്യ ക്രെഡിറ്റുകൾ')
                            : (language === 'en' ? 'Dedicated Blessing' : 'പ്രാർത്ഥനാ അനുഗ്രഹം')}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {language === 'en' ? 'Offered with love' : 'സ്നേഹത്തോടെ സമർപ്പിക്കുന്നു'}
                        </p>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-xs">
                        🕊️
                      </div>
                    </div>

                    {/* Main payload */}
                    <div className="mt-8">
                      {gift.type === 'credits' ? (
                        <div className="text-center py-4">
                          <p className="font-serif text-6xl font-bold bg-gradient-to-b from-white via-amber-100 to-amber-300 bg-clip-text text-transparent">
                            {gift.credit_amount}
                          </p>
                          <p className="text-xs text-amber-200/60 uppercase tracking-widest mt-2 font-semibold">
                            {language === 'en' ? 'Grace Credits' : 'പുണ്യ ക്രെഡിറ്റുകൾ'}
                          </p>
                          <p className="text-xs text-slate-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                            {language === 'en' 
                              ? 'Use these to request prayers from the global sanctuary.' 
                              : 'ആഗോള സമൂഹത്തിൽ നിന്ന് പ്രാർത്ഥനകൾ അഭ്യർത്ഥിക്കാൻ ഇവ ഉപയോഗിക്കാം.'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{prayerMeta?.emoji ?? '🙏'}</span>
                            <span className="font-serif text-lg font-semibold text-amber-300">
                              {language === 'ml' ? prayerMeta?.name : (prayerMeta?.name ?? gift.prayer?.type)}
                            </span>
                          </div>
                          <p className="font-serif italic text-white text-lg leading-relaxed pl-2 border-l border-amber-500/30 py-1">
                            "{gift.prayer?.intention || (language === 'en' ? 'A prayer offered with love for you.' : 'നിങ്ങൾക്കായി സ്നേഹത്തോടെ സമർപ്പിക്കുന്ന പ്രാർത്ഥന.')}"
                          </p>
                          <p className="text-xs text-slate-400">
                            {language === 'en' ? 'Offered for:' : 'ആർക്കുവേണ്ടി:'} <span className="text-amber-200">{gift.prayer?.offered_for}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Personal message and signature */}
                  <div className="relative z-10 mt-6 pt-4 border-t border-white/10">
                    {gift.gift_message && (
                      <p className="font-serif italic text-slate-200 text-sm leading-relaxed text-center mb-4">
                        "{gift.gift_message}"
                      </p>
                    )}
                    <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase tracking-widest font-mono">
                      <span>{gift.code}</span>
                      <span>— {displayFrom}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Redeem and Details Section */}
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-full text-center mt-6"
          >
            {gift.redeemed_at ? (
              <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4 shadow-lg backdrop-blur-sm max-w-sm mx-auto">
                <p className="text-sm text-emerald-400 font-semibold flex items-center justify-center gap-2">
                  <span>✓</span> {language === 'en' ? 'This blessing has already been redeemed.' : 'ഈ അനുഗ്രഹം നേരത്തെ ക്ലെയിം ചെയ്തതാണ്.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4 max-w-sm mx-auto">
                <Link
                  href={`/dashboard/redeem?code=${gift.code}`}
                  className="w-full py-3.5 px-6 rounded-2xl font-serif text-lg font-bold bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)] transition-all duration-300 block transform active:scale-98"
                >
                  ✦ {language === 'en' ? 'Claim This Grace' : 'അനുഗ്രഹം സ്വീകരിക്കുക'} ✦
                </Link>
                <p className="text-xs text-slate-500">
                  {language === 'en' 
                    ? 'You will need to sign in or create an account to claim your blessing.' 
                    : 'ഈ അനുഗ്രഹം നിങ്ങളുടെ പ്രൊഫൈലിലേക്ക് ചേർക്കാൻ അക്കൗണ്ട് ലോഗിൻ ചെയ്യേണ്ടതുണ്ട്.'}
                </p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </main>
  )
}
