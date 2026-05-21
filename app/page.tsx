'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import ThemeToggle from '@/components/ThemeToggle'

export default function LandingPage() {
  const [isEntering, setIsEntering] = useState(false)
  const router = useRouter()

  const handleEnter = (e: React.MouseEvent) => {
    e.preventDefault()
    if (isEntering) return
    setIsEntering(true)
    
    // Navigate after the portal animation plays out
    setTimeout(() => {
      router.push('/auth')
    }, 1800)
  }

  // Staggered incense/prayer particles rising to the heavens
  const particles = Array.from({ length: 30 })

  return (
    <div className="min-h-screen bg-parchment dark:bg-parchment-dark flex flex-col items-center justify-center p-4 relative overflow-hidden transition-colors duration-1000">
      
      {/* Custom portal keyframes and classes */}
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(110vh) translateX(0) scale(0.4);
            opacity: 0;
          }
          10% {
            opacity: 0.8;
          }
          90% {
            opacity: 0.8;
          }
          100% {
            transform: translateY(-10vh) translateX(var(--drift, 20px)) scale(1.6);
            opacity: 0;
          }
        }
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes ripple {
          0% { transform: scale(0.95); opacity: 0.5; }
          50% { transform: scale(1.05); opacity: 0.8; }
          100% { transform: scale(1.2); opacity: 0; }
        }
        .particle {
          animation: floatUp 2.2s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin-slow 25s linear infinite;
        }
        .animate-ripple {
          animation: ripple 2s infinite ease-out;
        }
      `}</style>

      {/* Theme Toggle - Hidden during transition */}
      <div className={`absolute top-4 right-4 transition-opacity duration-500 ${isEntering ? 'opacity-0' : 'opacity-100'}`}>
        <ThemeToggle />
      </div>

      <div className={`max-w-2xl text-center space-y-8 transition-all duration-1000 ${isEntering ? 'opacity-0 scale-95 blur-md' : 'opacity-100 scale-100'}`}>
        <div className="space-y-4">
          <p className="text-gold text-xs tracking-[8px] ornament mx-auto"></p>
          <h1 className="font-serif text-5xl md:text-6xl font-semibold text-ink dark:text-ink-dark transition-all duration-700">
            Prayer Bank
          </h1>
          <div className="space-y-2">
            <p className="font-serif italic text-2xl text-gold dark:text-gold/80">
              "What is sweeter than telling 'I Love you'?"
            </p>
            <p className="font-serif text-xl text-gray-500 dark:text-gray-400">
              I prayed for you.
            </p>
          </div>
        </div>

        <p className="text-gray-600 dark:text-gray-400 leading-relaxed max-w-lg mx-auto">
          A global treasury of faith and hope.
          Deposit your prayers for others. Withdraw prayers when you need them. 
          Gift prayers to your loved ones. Join a worldwide community of believers 
          sharing spiritual wealth.
        </p>

        <div className="pt-8">
          <button 
            onClick={handleEnter}
            disabled={isEntering}
            className="btn-gold relative inline-flex items-center justify-center font-serif text-lg py-4 px-8 rounded-xl hover:scale-105 active:scale-95 transition-all duration-300 shadow-[0_4px_20px_rgba(181,144,42,0.05)] hover:shadow-[0_4px_30px_rgba(181,144,42,0.15)] group"
          >
            {/* Soft background pulse */}
            <span className="absolute inset-0 rounded-xl bg-gold/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <span className="relative z-10">✦ Enter the Sanctuary ✦</span>
          </button>
        </div>
      </div>

      {/* MAGNIFICENT ENTRY PORTAL OVERLAY */}
      <div 
        className={`fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none transition-all duration-1000 ease-in-out ${
          isEntering 
            ? 'bg-[#120b18]/98 backdrop-blur-md opacity-100 pointer-events-auto' 
            : 'bg-transparent opacity-0'
        }`}
      >
        {isEntering && (
          <div className="flex flex-col items-center max-w-md px-6 text-center">
            
            {/* Halo Rings radiating outwards */}
            <div className="relative flex items-center justify-center w-64 h-64">
              <div className="absolute inset-0 rounded-full border border-gold/15 animate-ripple" style={{ animationDelay: '0s' }} />
              <div className="absolute inset-0 rounded-full border border-gold/10 animate-ripple" style={{ animationDelay: '0.6s' }} />
              <div className="absolute inset-0 rounded-full border border-gold/5 animate-ripple" style={{ animationDelay: '1.2s' }} />
              
              {/* Spinning Sacred Monstrance Icon */}
              <svg 
                className="w-48 h-48 text-gold animate-spin-slow filter drop-shadow-[0_0_30px_rgba(232,208,138,0.75)] relative z-10" 
                viewBox="0 0 100 100" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="1.5"
              >
                {/* Central Host */}
                <circle cx="50" cy="50" r="10" className="fill-gold-light stroke-gold" strokeWidth="1" />
                <circle cx="50" cy="50" r="13" strokeDasharray="2 2" opacity="0.8" />
                
                {/* Major cross beams */}
                <path d="M50 12 V32 M50 68 V88 M12 50 H32 M68 50 H88" strokeWidth="2.5" strokeLinecap="round" />
                
                {/* Radiant rays */}
                <path d="M23 23 L34 34 M66 66 L77 77 M23 77 L34 66 M66 23 L77 34" strokeWidth="2" strokeLinecap="round" />
                <path d="M50 5 L50 8 M50 92 L50 95 M5 50 L8 50 M92 50 L95 50" strokeWidth="1" />
                <path d="M38 18 L43 27 M62 82 L57 73 M18 38 L27 43 M82 62 L73 57" strokeWidth="1" />
                <path d="M62 18 L57 27 M38 82 L43 73 M82 38 L73 43 M18 62 L27 57" strokeWidth="1" />

                {/* Concentric rings */}
                <circle cx="50" cy="50" r="28" strokeWidth="1" opacity="0.6" />
                <circle cx="50" cy="50" r="36" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.7" />
              </svg>
            </div>

            {/* Glowing scripture and portal welcome */}
            <div className="space-y-4 mt-8 animate-pulse duration-1000">
              <h2 className="font-serif text-3xl md:text-4xl text-gold-light tracking-[6px] font-light">
                SANCTUARY
              </h2>
              <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-gold to-transparent mx-auto" />
              <p className="font-serif italic text-lg text-gold-pale/80 max-w-sm">
                "Draw near to God, and He will draw near to you."
              </p>
              <p className="text-gold/40 text-[10px] uppercase tracking-[4px] pt-4">
                Preparing holy vault...
              </p>
            </div>

            {/* Rising incense particles */}
            {particles.map((_, i) => {
              const left = Math.floor(Math.random() * 100);
              const delay = Math.random() * 0.8;
              const duration = 1.4 + Math.random() * 0.8;
              const drift = -30 + Math.random() * 60; // horizontal drift amount
              return (
                <div 
                  key={i}
                  className="particle absolute w-1.5 h-1.5 rounded-full bg-gold-light/40 filter blur-[0.5px]"
                  style={{
                    left: `${left}%`,
                    bottom: `0%`,
                    animationDelay: `${delay}s`,
                    animationDuration: `${duration}s`,
                    '--drift': `${drift}px`
                  } as React.CSSProperties}
                />
              )
            })}
          </div>
        )}
      </div>

    </div>
  )
}

