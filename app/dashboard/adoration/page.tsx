'use client'
import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { motion, AnimatePresence } from 'framer-motion'

// Pre-configured live perpetual adoration shrine
const SHRINES = [
  { id: 'default', nameKey: 'shrine_default', videoId: 'qz8YE61BoXM', desc: 'Perpetual Eucharistic Adoration live stream' },
]

export default function AdorationPage() {
  const { language } = useLanguage()
  const t = translations[language]

  // Streams selection
  const [selectedShrine, setSelectedShrine] = useState(SHRINES[0])
  const [customVideoId, setCustomVideoId] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Player and timer states
  const [playerState, setPlayerState] = useState<number>(-1) // YT.PlayerState
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [activeSeconds, setActiveSeconds] = useState(0)
  const [isLogging, setIsLogging] = useState(false)
  const [sessionLogMessage, setSessionLogMessage] = useState('')

  // Presence Check (Heartbeat) states
  // Every 10 minutes (600 seconds) of active time, trigger presence check
  const PRESENCE_INTERVAL_SEC = 600
  const PRESENCE_TIMEOUT_SEC = 120 // 2 minutes to respond
  const [showPresenceCheck, setShowPresenceCheck] = useState(false)
  const [presenceCountdown, setPresenceCountdown] = useState(PRESENCE_TIMEOUT_SEC)
  const [isAbsent, setIsAbsent] = useState(false)
  const [lastPresenceTriggerTime, setLastPresenceTriggerTime] = useState(0)

  // Saint quotes rotation state
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0)

  const playerRef = useRef<any>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const presenceCountdownIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const quotesIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load and cycle saint quotes
  useEffect(() => {
    if (t.saint_quotes && t.saint_quotes.length > 0) {
      setCurrentQuoteIndex(Math.floor(Math.random() * t.saint_quotes.length))
      
      quotesIntervalRef.current = setInterval(() => {
        setCurrentQuoteIndex(prev => (prev + 1) % t.saint_quotes.length)
      }, 25000) // Cycle quote every 25 seconds
    }
    return () => {
      if (quotesIntervalRef.current) clearInterval(quotesIntervalRef.current)
    }
  }, [t.saint_quotes])

  // Watch for tab visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsTabVisible(document.visibilityState === 'visible')
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Dynamic load of YouTube Player Iframe API
  useEffect(() => {
    const w = window as any
    if (!w.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag)
    }

    w.onYouTubeIframeAPIReady = () => {
      initPlayer()
    }

    if (w.YT && w.YT.Player) {
      initPlayer()
    }

    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy()
        } catch (e) {}
      }
    }
  }, [selectedShrine, customVideoId, showCustomInput])

  const initPlayer = () => {
    const w = window as any
    if (!w.YT || !w.YT.Player) return

    const videoIdToLoad = showCustomInput 
      ? getYouTubeId(customVideoId) || 'qz8YE61BoXM' 
      : selectedShrine.videoId

    try {
      if (playerRef.current) {
        playerRef.current.destroy()
      }
    } catch (e) {}

    playerRef.current = new w.YT.Player('adoration-player', {
      videoId: videoIdToLoad,
      playerVars: {
        autoplay: 1,
        controls: 1,
        modestbranding: 1,
        rel: 0,
        mute: 0,
      },
      events: {
        onStateChange: (event: any) => {
          setPlayerState(event.data)
        },
      },
    })
  }

  // Helper to extract YouTube ID from full URL or just raw ID
  const getYouTubeId = (url: string) => {
    if (!url) return ''
    const trimmed = url.trim()
    // If it's already an 11-char ID
    if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('?')) {
      return trimmed
    }
    // Match /live/ID
    const liveMatch = trimmed.match(/\/live\/([a-zA-Z0-9_-]{11})/)
    if (liveMatch) return liveMatch[1]
    
    // Match watch?v=ID or embed/ID or youtu.be/ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = trimmed.match(regExp)
    return (match && match[2].length === 11) ? match[2] : trimmed
  }

  // Active status checks
  // User is tracking active prayer ONLY if:
  // 1. YouTube video is playing (state 1)
  // 2. Tab is currently visible in browser
  // 3. User is not flagged as absent (failed to answer presence check)
  // 4. Presence check popup is not open (or if open, during the 2 minute grace countdown we still track, but stop once failed)
  const isTrackingActive = playerState === 1 && isTabVisible && !isAbsent && !showPresenceCheck

  // Timer Core logic
  useEffect(() => {
    if (isTrackingActive) {
      timerIntervalRef.current = setInterval(() => {
        setActiveSeconds(prev => {
          const nextSec = prev + 1
          
          // Check if we hit the next 10-minute presence check boundary
          const elapsedSinceLastCheck = nextSec - lastPresenceTriggerTime
          if (elapsedSinceLastCheck >= PRESENCE_INTERVAL_SEC) {
            triggerPresenceCheck(nextSec)
          }

          return nextSec
        })
      }, 1000)
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
        timerIntervalRef.current = null
      }
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current)
    }
  }, [isTrackingActive, lastPresenceTriggerTime])

  // Presence check countdown timer
  useEffect(() => {
    if (showPresenceCheck) {
      presenceCountdownIntervalRef.current = setInterval(() => {
        setPresenceCountdown(prev => {
          if (prev <= 1) {
            // Presence timeout reached! Flag user as absent and pause active timer
            setIsAbsent(true)
            setShowPresenceCheck(false)
            if (presenceCountdownIntervalRef.current) clearInterval(presenceCountdownIntervalRef.current)
            return PRESENCE_TIMEOUT_SEC
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (presenceCountdownIntervalRef.current) {
        clearInterval(presenceCountdownIntervalRef.current)
        presenceCountdownIntervalRef.current = null
      }
    }

    return () => {
      if (presenceCountdownIntervalRef.current) clearInterval(presenceCountdownIntervalRef.current)
    }
  }, [showPresenceCheck])

  const triggerPresenceCheck = (currentSec: number) => {
    setShowPresenceCheck(true)
    setPresenceCountdown(PRESENCE_TIMEOUT_SEC)
    setLastPresenceTriggerTime(currentSec)
  }

  const handlePresenceAcknowledge = () => {
    setShowPresenceCheck(false)
    setIsAbsent(false)
    setPresenceCountdown(PRESENCE_TIMEOUT_SEC)
  }

  // Calculate live grace credits accumulated
  // 8 credits/hour = 0.1333 credits per minute = 0.002222 credits per second
  const accumulatedCredits = activeSeconds * (8 / 3600)

  // Log session to backend
  const handleLogSession = async () => {
    const minutes = Math.floor(activeSeconds / 60)
    if (minutes < 1) {
      alert(t.min_adore_required || 'You must adore for at least 1 minute to log a session.')
      return
    }

    setIsLogging(true)
    setSessionLogMessage('')

    try {
      const res = await fetch('/api/adoration/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ durationMinutes: minutes })
      })

      const data = await res.json()
      if (res.ok) {
        setSessionLogMessage(t.session_logged_success || 'Session logged successfully! Grace deposited.')
        setActiveSeconds(0)
        setLastPresenceTriggerTime(0)
        setIsAbsent(false)
        setShowPresenceCheck(false)
        
        // Refresh local details/credits context
        setTimeout(() => {
          window.location.reload()
        }, 3000)
      } else {
        alert(data.error || 'Failed to log session.')
      }
    } catch (e) {
      alert('An error occurred. Please try again.')
    } finally {
      setIsLogging(false)
    }
  }

  // Formatting utility (e.g. 02:45:09)
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600)
    const mins = Math.floor((totalSecs % 3600) / 60)
    const secs = totalSecs % 60
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      secs.toString().padStart(2, '0'),
    ].join(':')
  }

  const currentQuote = t.saint_quotes?.[currentQuoteIndex] ?? { text: '', saint: '' }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 relative overflow-hidden">
      {/* Visual background glows */}
      <div className="absolute top-10 left-1/3 w-96 h-96 rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 rounded-full bg-amber-600/5 blur-[120px] pointer-events-none" />

      <div className="max-w-5xl mx-auto flex flex-col gap-8 relative z-10">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-500 animate-pulse text-lg">✨</span>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-amber-500/80">
                {language === 'en' ? 'Sanctuary perpetual chapel' : 'നിത്യ ആരാധനാ ചാപ്പൽ'}
              </span>
            </div>
            <h1 className="font-serif text-3xl md:text-4xl font-medium mt-1 text-white">
              {t.adoration_chapel}
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              {t.adoration_chapel_desc}
            </p>
          </div>

          {/* Shrines dropdown and custom selection */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            <div className="relative">
              <span className="absolute -top-2 left-3 px-1 text-[9px] bg-slate-950 text-amber-500 uppercase tracking-wider font-bold">
                {t.choose_shrine}
              </span>
              <select
                value={showCustomInput ? 'custom' : selectedShrine.id}
                onChange={(e) => {
                  const val = e.target.value
                  setPlayerState(-1) // Pause timer logging immediately while switching streams
                  if (val === 'custom') {
                    setShowCustomInput(true)
                  } else {
                    setShowCustomInput(false)
                    const shr = SHRINES.find(s => s.id === val)
                    if (shr) setSelectedShrine(shr)
                  }
                }}
                className="w-full sm:w-64 bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 transition-colors font-serif font-semibold text-slate-200"
              >
                {SHRINES.map(s => (
                  <option key={s.id} value={s.id}>
                    {(t as any)[s.nameKey] || s.id}
                  </option>
                ))}
                <option value="custom">✦ {language === 'en' ? 'Custom Live Stream...' : 'മറ്റ് ലൈവ് സ്ട്രീം...'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Custom video URL Input panel */}
        {showCustomInput && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="flex-1 w-full">
              <input
                type="text"
                placeholder={language === 'en' ? "Enter YouTube Livestream URL or video ID..." : "യൂട്യൂബ് സ്ട്രീം ലിങ്ക് അല്ലെങ്കിൽ വീഡിയോ ഐഡി നൽകുക..."}
                value={customVideoId}
                onChange={(e) => setCustomVideoId(e.target.value)}
                className="w-full bg-slate-950 border border-white/15 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 text-slate-200"
              />
            </div>
            <button
              onClick={() => {
                setPlayerState(-1) // Pause timer logging while loading custom stream URL
                initPlayer()
              }}
              className="py-2.5 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 font-serif font-bold text-slate-950 text-sm transition-colors w-full sm:w-auto"
            >
              {language === 'en' ? 'Load Stream' : 'ലോഡ് ചെയ്യുക'}
            </button>
          </motion.div>
        )}

        {/* Main Grid: Player left, Dashboard right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* PLAYER COLUMN */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            
            {/* YouTube embed inside golden monstrance altar styling */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-[0_0_50px_rgba(217,119,6,0.15)] bg-black">
              {/* Altar golden framing corners */}
              <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-amber-500/40 pointer-events-none" />
              <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-amber-500/40 pointer-events-none" />
              <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-amber-500/40 pointer-events-none" />
              <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-amber-500/40 pointer-events-none" />
              
              {/* Player Iframe container target */}
              <div id="adoration-player" className="w-full h-full" />
            </div>

            {/* Live stream instruction indicator */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-2">
              <span>{showCustomInput ? (language === 'en' ? 'Custom Stream Loaded' : 'മറ്റൊരു സ്ട്രീം സജീവം') : selectedShrine.desc}</span>
              <span>{language === 'en' ? 'Ensure stream is playing & unmuted to track time' : 'സമയം കണക്കാക്കാൻ വീഡിയോ പ്ലേ ചെയ്യുക'}</span>
            </div>
          </div>

          {/* DASHBOARD COLUMN */}
          <div className="flex flex-col gap-6">
            
            {/* Status & Stats Panel */}
            <div className="rounded-2xl border border-white/10 bg-slate-900/40 backdrop-blur-md p-4 sm:p-6 flex flex-col gap-4 sm:gap-6 shadow-xl relative overflow-hidden">
              
              {/* Decorative gold ornament */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />

              {/* Presence Status Pill */}
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  {t.presence_status}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    isAbsent 
                      ? 'bg-red-500 animate-ping' 
                      : (isTrackingActive ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-amber-500')
                  }`} />
                  <span className="text-xs font-bold font-serif text-slate-200">
                    {isAbsent 
                      ? (language === 'en' ? 'Absent (Session Paused)' : 'സാന്നിധ്യമില്ല (പ്രാർത്ഥന നിന്നു)') 
                      : (isTrackingActive ? t.status_praying : t.status_paused)}
                  </span>
                </div>
              </div>

              {/* Premium Timer Block */}
              <div className="text-center py-5 bg-slate-950/60 rounded-xl border border-white/5 relative overflow-hidden shadow-inner">
                {/* Inner ambient amber light glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-16 bg-amber-500/5 blur-2xl rounded-full pointer-events-none" />
                
                <span className="text-[10px] text-amber-500/80 font-bold uppercase tracking-[0.2em] block mb-2 relative z-10">
                  {t.active_session_time}
                </span>
                <span className="font-mono text-3xl sm:text-4xl font-bold tracking-normal bg-gradient-to-b from-white via-slate-100 to-slate-300 bg-clip-text text-transparent relative z-10 filter drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                  {formatTime(activeSeconds)}
                </span>
              </div>

              {/* Logging and Actions */}
              <div className="space-y-3 mt-2">
                <button
                  onClick={handleLogSession}
                  disabled={isLogging || activeSeconds < 60}
                  className={`w-full py-3.5 rounded-xl font-serif text-base font-bold transition-all duration-300 ${
                    activeSeconds >= 60 
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.25)]' 
                      : 'bg-white/5 text-slate-500 border border-white/10 cursor-not-allowed'
                  }`}
                >
                  {isLogging ? t.logging_session : t.log_deposit_session}
                </button>
                
                {activeSeconds < 60 && (
                  <p className="text-[10px] text-center text-slate-500 leading-tight">
                    {t.min_adore_required || 'You must adore for at least 1 minute to log a session.'}
                  </p>
                )}

                {/* Reset button */}
                {activeSeconds > 0 && (
                  <button
                    onClick={() => {
                      if (confirm(language === 'en' ? 'Reset timer and discard active session?' : 'ഈ സമയം കളഞ്ഞ് റീസെറ്റ് ചെയ്യണോ?')) {
                        setActiveSeconds(0);
                        setLastPresenceTriggerTime(0);
                      }
                    }}
                    className="w-full py-2 bg-transparent hover:bg-white/5 border border-white/10 rounded-xl text-xs text-slate-400 font-semibold tracking-wider transition-colors"
                  >
                    {language === 'en' ? 'Reset Timer' : 'റീസെറ്റ് ചെയ്യുക'}
                  </button>
                )}
              </div>

              {/* Success Notification message */}
              <AnimatePresence>
                {sessionLogMessage && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="p-3 bg-emerald-950/50 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-semibold text-center mt-2 leading-relaxed"
                  >
                    {sessionLogMessage}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Saint Quote Panel (Wow aesthetic) */}
        {currentQuote.text && (
          <motion.div
            key={currentQuoteIndex}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 1 }}
            className="w-full max-w-3xl mx-auto mt-8 p-6 md:p-8 rounded-2xl border border-amber-500/10 bg-slate-900/20 backdrop-blur-sm text-center relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-slate-950 border border-amber-500/20 flex items-center justify-center text-xs text-amber-500 font-bold">
              “
            </div>
            <p className="font-serif italic text-lg md:text-xl text-slate-100 leading-relaxed">
              "{currentQuote.text}"
            </p>
            <p className="text-xs uppercase tracking-widest text-amber-500/70 font-semibold mt-4">
              — {currentQuote.saint} —
            </p>
          </motion.div>
        )}

      </div>

      {/* GLOWING PRESENCE CHECK (AMEN HEARTBEAT) DIALOG OVERLAY */}
      <AnimatePresence>
        {showPresenceCheck && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="max-w-sm w-full rounded-3xl border border-amber-500/30 bg-slate-900 p-8 text-center shadow-[0_0_50px_rgba(217,119,6,0.3)] relative overflow-hidden"
            >
              {/* Outer pulsing glow */}
              <div className="absolute -inset-10 rounded-full bg-amber-500/5 blur-xl pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400 flex items-center justify-center text-2xl mx-auto mb-6 shadow-lg shadow-amber-500/20">
                🛐
              </div>

              <h3 className="font-serif text-2xl font-semibold text-white mb-2">
                {t.presence_check_title}
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {t.presence_check_desc}
              </p>

              {/* Countdown timer visual bar */}
              <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-6 border border-white/5">
                <div 
                  className="bg-amber-500 h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(presenceCountdown / PRESENCE_TIMEOUT_SEC) * 100}%` }}
                />
              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={handlePresenceAcknowledge}
                  className="w-full py-3.5 rounded-xl font-serif text-lg font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-colors transform active:scale-98"
                >
                  {t.presence_check_btn}
                </button>
                <span className="text-[10px] text-slate-500 font-mono">
                  {language === 'en' ? `Time remaining: ${presenceCountdown}s` : `ശേഷിക്കുന്ന സമയം: ${presenceCountdown} സെ`}
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ABSENT RESUME POPUP OVERLAY */}
      <AnimatePresence>
        {isAbsent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="max-w-sm w-full rounded-3xl border border-red-500/30 bg-slate-900 p-8 text-center shadow-[0_0_40px_rgba(239,68,68,0.2)]"
            >
              <div className="w-16 h-16 rounded-full bg-red-950/50 border border-red-500 flex items-center justify-center text-2xl mx-auto mb-6 animate-pulse">
                ⏰
              </div>

              <h3 className="font-serif text-2xl font-semibold text-white mb-2">
                {language === 'en' ? 'Sanctuary Timer Paused' : 'പ്രാർത്ഥന സമയം നിർത്തി'}
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                {language === 'en' 
                  ? 'Presence verification expired. Confirm you are back in prayer to resume collecting grace.' 
                  : 'നിങ്ങളുടെ സാന്നിധ്യം ഉറപ്പുവരുത്താൻ സാധിച്ചില്ല. വീണ്ടും പ്രാർത്ഥന തുടരാൻ താഴെ ക്ലിക്ക് ചെയ്യുക.'}
              </p>

              <button
                onClick={handlePresenceAcknowledge}
                className="w-full py-3 px-6 rounded-xl font-serif text-base font-bold bg-white text-slate-950 hover:bg-slate-100 transition-colors"
              >
                {language === 'en' ? '✦ Resume Praying ✦' : '✦ പ്രാർത്ഥന തുടരുക ✦'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  )
}
