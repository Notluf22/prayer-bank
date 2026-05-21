'use client'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { PRAYER_TYPES } from '@/lib/types'
import { useLanguage } from '@/lib/LanguageContext'
import { translations } from '@/lib/translations'
import { motion, AnimatePresence } from 'framer-motion'

const PRESET_IMAGES = {
  angel: 'https://gen.pollinations.ai/image/Sacred%20oil%20painting%20of%20a%20golden%20guardian%20angel%20with%20large%20soft%20wings%20warm%20celestial%20glow%20masterpiece?width=600&height=800&seed=77777&model=flux',
  heart: 'https://gen.pollinations.ai/image/Stained%20glass%20window%20of%20the%20Sacred%20Heart%20of%20Jesus%20radiating%20divine%20warm%20light%20spiritual%20fine%20art?width=600&height=800&seed=88888&model=flux',
  mary: 'https://gen.pollinations.ai/image/Blessed%20Virgin%20Mary%20in%20a%20heavenly%20garden%20classic%20Renaissance%20oil%20painting%20soft%20spiritual%20light?width=600&height=800&seed=99999&model=flux',
  eucharist: 'https://gen.pollinations.ai/image/Holy%20Eucharistic%20Monstrance%20on%20a%20candlelit%20altar%20shining%20brilliant%20golden%20rays%20fine%20art?width=600&height=800&seed=11111&model=flux',
  peace: 'https://gen.pollinations.ai/image/Holy%20Spirit%20dove%20of%20peace%20flying%20in%20golden%20sunrise%20clouds%20detailed%20spiritual%20oil%20painting?width=600&height=800&seed=22222&model=flux',
  cross: 'https://gen.pollinations.ai/image/Crucifix%20holy%20cross%20standing%20in%20a%20mystic%20forest%20at%20dawn%20with%20heavenly%20light%20rays%20oil%20painting?width=600&height=800&seed=33333&model=flux',
}

export default function GiftPage() {
  const { language } = useLanguage()
  const t = translations[language]
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'credits' | 'prayer'>('credits')
  const initialMessage = searchParams.get('message') || ''
  const initialCredits = parseInt(searchParams.get('credits') || '5')
  const isBouquet = searchParams.get('type') === 'bouquet'

  const BUNDLES = [
    { id: 'small', credits: 5,  label: t.small_blessing,  description: t.small_blessing_desc },
    { id: 'medium', credits: 15, label: t.rosary_bundle,   description: t.rosary_bundle_desc },
    { id: 'large', credits: 30, label: t.holy_mass_bundle,     description: t.holy_mass_bundle_desc },
  ]

  const [selectedBundle, setSelectedBundle] = useState(BUNDLES.find(b => b.credits === initialCredits) || BUNDLES[0])
  const [selectedPrayerType, setSelectedPrayerType] = useState(PRAYER_TYPES[0])
  const [message, setMessage] = useState(initialMessage)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ code: string; shareUrl: string; emailError?: string | null } | null>(null)

  // Card artwork states
  const [artworkMode, setArtworkMode] = useState<'parchment' | 'preset' | 'ai'>('parchment')
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof PRESET_IMAGES>('angel')
  const [aiPrompt, setAiPrompt] = useState('')
  const [generatedImageUrl, setGeneratedImageUrl] = useState('')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [aiLoadStep, setAiLoadStep] = useState(1)

  const cardImageSrc = artworkMode === 'parchment'
    ? null
    : (artworkMode === 'preset' ? PRESET_IMAGES[selectedPreset] : generatedImageUrl)

  const handleGenerateAiArt = () => {
    if (!aiPrompt.trim()) return
    setAiGenerating(true)
    setGeneratedImageUrl('')
    setAiLoadStep(1)

    // Cycle through spiritual progress statements
    const stepInterval = setInterval(() => {
      setAiLoadStep(prev => (prev < 4 ? prev + 1 : 4))
    }, 1800)

    const enhancedPrompt = `${aiPrompt}, sacred fine art, detailed oil painting, highly spiritual and peaceful atmosphere, glowing warm lighting, 8k resolution`;
    const randomSeed = Math.floor(Math.random() * 1000000);
    const generatedUrl = `https://gen.pollinations.ai/image/${encodeURIComponent(enhancedPrompt)}?width=600&height=600&seed=${randomSeed}&model=flux`;

    const img = new Image()
    img.src = generatedUrl
    img.onload = () => {
      clearInterval(stepInterval)
      setGeneratedImageUrl(generatedUrl)
      setAiGenerating(false)
    }
    img.onerror = () => {
      clearInterval(stepInterval)
      alert("Failed to generate custom artwork. Please try another prompt.")
      setAiGenerating(false)
    }
  }

  useEffect(() => {
    if (initialMessage) setMessage(initialMessage)
    if (isBouquet) setMode('credits')
  }, [initialMessage, isBouquet])

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    let body: any = { giftMessage: message }

    if (mode === 'credits') {
      body.type = 'credits'
      body.creditAmount = selectedBundle.credits
    } else {
      // Step 1: Draw a random prayer of this type
      const drawRes = await fetch(`/api/draw_random?type=${selectedPrayerType.id}`)
      if (!drawRes.ok) {
        const err = await drawRes.json()
        alert(err.error || 'No prayers of this type available right now.')
        setLoading(false)
        return
      }
      const { prayer } = await drawRes.json()

      // Step 2: Withdraw it
      const withdrawRes = await fetch('/api/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prayerId: prayer.id }),
      })
      if (!withdrawRes.ok) {
        alert('Could not claim the prayer. Please try again.')
        setLoading(false)
        return
      }

      // Step 3: Create the gift card
      body.type = 'prayer'
      body.prayerId = prayer.id
    }

    body.cardImage = artworkMode === 'parchment'
      ? null
      : (artworkMode === 'preset' ? PRESET_IMAGES[selectedPreset] : generatedImageUrl)

    const res = await fetch('/api/gift', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    
    setLoading(false)
    if (res.ok) {
      const data = await res.json()
      setResult(data)
    } else {
      const err = await res.json()
      alert(err.error || 'Something went wrong.')
    }
  }

  const trackingClass = language === 'ml' ? '' : 'tracking-widest'

  if (result) return (
    <div className="text-center py-10 animate-in fade-in zoom-in duration-500">
      <p className="text-5xl mb-4">🎁</p>
      <h2 className="font-serif text-3xl font-semibold text-ink dark:text-white mb-2">{t.gift_sent}</h2>
      <p className="text-gray-500 dark:text-gray-400 mb-6">
        {t.gift_sent_desc}
      </p>
      <div className="card-gold rounded-xl p-5 mb-6 text-left">
        <p className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 mb-2`}>{t.gift_code}</p>
        <p className="font-mono text-lg font-bold text-ink dark:text-white tracking-wider">{result.code}</p>
        <p className={`text-[10px] text-gray-400 mt-4 mb-2 uppercase ${trackingClass} font-bold`}>{t.shareable_link}</p>
        <p className="text-sm text-blue-600 dark:text-blue-400 break-all">{result.shareUrl}</p>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => { navigator.clipboard.writeText(result.shareUrl); alert('Link copied!') }}
            className="flex-1 text-xs border border-gray-200 dark:border-gray-700 py-3 rounded-lg hover:border-gold dark:hover:border-gold dark:text-gray-300 active:scale-95 transition-transform"
          >
            {t.copy_code}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              message 
                ? `I sent you a prayer gift! 🎁\n\n"${message}"\n\nRedeem it here: ${result.shareUrl}`
                : `I sent you a prayer gift! 🎁 Redeem it here: ${result.shareUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-xs border border-[#25D366] text-[#25D366] py-3 rounded-lg hover:bg-[#25D366] hover:text-white transition-colors flex items-center justify-center gap-1 active:scale-95 transition-transform"
          >
            WhatsApp
          </a>
        </div>
      </div>
      <button onClick={() => { setResult(null); setMessage('') }} className="btn-gold px-6 py-2 rounded-xl font-serif active:scale-95 transition-transform hover:scale-105 hover:shadow-lg">
        {t.share_another}
      </button>
    </div>
  )

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="font-serif text-3xl font-semibold text-ink dark:text-white">{t.gift_prayer}</h1>
        <p className="font-serif italic text-gray-500 dark:text-gray-400 mt-1">{t.gift_desc}</p>
      </div>

      <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl mb-8 border border-gray-200/50 dark:border-white/5">
        <button
          onClick={() => setMode('credits')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
            mode === 'credits' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {t.credits}
        </button>
        <button
          onClick={() => setMode('prayer')}
          className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all active:scale-95 ${
            mode === 'prayer' ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
          }`}
        >
          {t.prayer}
        </button>
      </div>

      <form onSubmit={handleSend} className="space-y-6">
        {mode === 'credits' ? (
          <div>
            <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-3`}>{t.gift_type}</label>
            <div className="space-y-2">
              {BUNDLES.map(b => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBundle(b)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all active:scale-[0.98] hover:scale-[1.02] hover:shadow-md ${
                    selectedBundle.id === b.id
                      ? 'border-gold bg-amber-50 dark:bg-gold/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-gold/50 dark:hover:border-gold/50'
                  }`}
                >
                  <div className="font-serif text-3xl font-semibold text-ink dark:text-white w-12 text-center">{b.credits}</div>
                  <div>
                    <p className="font-semibold text-ink dark:text-white text-sm">{b.label}</p>
                    <p className="text-xs text-gray-400">{b.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div>
            <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-3`}>{t.prayer_type_completed}</label>
            <div className="grid grid-cols-2 gap-2">
              {PRAYER_TYPES.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedPrayerType(p)}
                  className={`flex flex-col gap-1 p-4 rounded-xl border text-left transition-all active:scale-95 hover:scale-[1.02] hover:shadow-md group ${
                    selectedPrayerType.id === p.id
                      ? 'border-gold bg-amber-50 dark:bg-gold/10'
                      : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-white/5 hover:border-gold/50 dark:hover:border-gold/50'
                  }`}
                >
                  <span className="text-3xl mb-1">{p.emoji}</span>
                  <p className="font-bold text-ink dark:text-white text-xs uppercase tracking-wider">{p.name}</p>
                  <p className="text-[10px] text-gold">{p.creditValue} {t.credits}</p>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 mt-4 italic">{t.share_merit_desc}</p>
          </div>
        )}

        <div>
          <label className={`text-xs font-bold uppercase ${trackingClass} text-gray-400 block mb-2`}>{t.gift_message}</label>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="..."
            rows={3}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-gold dark:bg-white/5 dark:text-white bg-white resize-none shadow-inner mb-6"
          />
        </div>

        {/* AI & Preset Card Artwork Creator */}
        <div className="bg-white/50 dark:bg-white/5 p-5 sm:p-6 rounded-2xl border border-gold/10 shadow-lg space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gold/10">
            <span className="text-xl">🎨</span>
            <label className={`text-xs font-bold uppercase ${trackingClass} text-gold`}>{t.card_artwork}</label>
          </div>

          {/* Selector Tabs */}
          <div className="flex gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200/50 dark:border-white/5 relative">
            {(['parchment', 'preset', 'ai'] as const).map(tab => (
              <button
                key={tab}
                type="button"
                onClick={() => setArtworkMode(tab)}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all relative z-10 ${
                  artworkMode === tab ? 'bg-white dark:bg-white/10 text-gold shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'parchment' && t.simple_parchment}
                {tab === 'preset' && t.spiritual_presets}
                {tab === 'ai' && t.ai_custom_creator}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {artworkMode === 'preset' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-3 gap-2"
              >
                {(Object.keys(PRESET_IMAGES) as Array<keyof typeof PRESET_IMAGES>).map(presetKey => (
                  <button
                    key={presetKey}
                    type="button"
                    onClick={() => setSelectedPreset(presetKey)}
                    className={`relative aspect-[3/4] rounded-xl overflow-hidden border transition-all hover:scale-105 active:scale-95 shadow-sm group ${
                      selectedPreset === presetKey ? 'border-gold ring-1 ring-gold shadow-md' : 'border-gray-200 dark:border-gray-700 hover:border-gold/50'
                    }`}
                  >
                    <img
                      src={PRESET_IMAGES[presetKey]}
                      alt={presetKey}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/40 to-transparent p-1 text-[8px] sm:text-[10px] text-center font-bold uppercase tracking-wider text-white">
                      {presetKey === 'angel' && t.art_preset_angel}
                      {presetKey === 'heart' && t.art_preset_heart}
                      {presetKey === 'mary' && t.art_preset_mary}
                      {presetKey === 'eucharist' && t.art_preset_eucharist}
                      {presetKey === 'peace' && t.art_preset_peace}
                      {presetKey === 'cross' && t.art_preset_cross}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}

            {artworkMode === 'ai' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <textarea
                    value={aiPrompt}
                    onChange={e => setAiPrompt(e.target.value)}
                    placeholder={t.ai_prompt_placeholder}
                    rows={2}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-gold dark:bg-white/5 dark:text-white bg-white resize-none shadow-inner"
                  />
                  
                  {/* Preset prompt helper pills */}
                  <div className="flex flex-wrap gap-1">
                    {[
                      { en: "Sacred stained glass monstrance radiating warm golden light", ml: "അൾത്താരയിൽ പ്രകാശിക്കുന്ന പരിശുദ്ധ കുർബാന" },
                      { en: "Classic oil painting of guardian angel with large soft wings", ml: "സ്വർണ്ണ ചിറകുകളുള്ള കാവൽ മാലാഖയുടെ പെയിന്റിംഗ്" },
                      { en: "Statue of Virgin Mary in garden with white roses and sunlight", ml: "വെളുത്ത റോസാപ്പൂക്കൾക്കിടയിൽ മാതാവിന്റെ തിരുസ്വരൂപം" },
                      { en: "A peaceful dove flying in majestic cloud sunrise, religious fine art", ml: "സൂര്യോദയത്തിൽ പറക്കുന്ന സമാധാനത്തിന്റെ പ്രാവ്" }
                    ].map((pill, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setAiPrompt(language === 'en' ? pill.en : pill.ml)}
                        className="bg-gold/5 border border-gold/15 hover:bg-gold/15 text-gold-dark dark:text-gold-light px-2.5 py-1 rounded-full text-[9px] font-medium transition-colors"
                      >
                        {language === 'en' ? pill.en : pill.ml}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAiArt}
                  disabled={aiGenerating || !aiPrompt.trim()}
                  className="w-full btn-gold py-2.5 rounded-xl text-xs font-serif disabled:opacity-50 hover:scale-[1.01] active:scale-95 transition-transform"
                >
                  {aiGenerating ? t.generating_art : t.generate_ai_btn}
                </button>

                {aiGenerating && (
                  <div className="flex flex-col items-center justify-center p-8 bg-gold/5 border border-gold/10 rounded-xl animate-pulse space-y-3">
                    <div className="w-8 h-8 rounded-full border-2 border-t-gold border-gold/20 animate-spin"></div>
                    <p className="text-xs text-gold font-serif italic">
                      {aiLoadStep === 1 && "Casting spiritual canvas..."}
                      {aiLoadStep === 2 && "Blending celestial colors..."}
                      {aiLoadStep === 3 && "Applying digital oil strokes..."}
                      {aiLoadStep === 4 && "Shining warm holy light..."}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Real-time live greeting card preview */}
          <div className="pt-4 border-t border-gold/10 space-y-3">
            <p className={`text-[10px] font-bold text-gray-400 uppercase ${trackingClass}`}>{t.preview_card}</p>
            
            <div className="relative aspect-[3/4] w-full max-w-[280px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-gold/20 flex flex-col justify-between p-6 bg-parchment dark:bg-parchment-dark text-ink dark:text-ink-dark transition-all duration-500">
              
              {/* Dynamic Image Background with Glassmorphic Overlay */}
              {cardImageSrc && (
                <>
                  <img
                    src={cardImageSrc}
                    alt="Preview Background"
                    className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700"
                  />
                  <div className="absolute inset-0 bg-ink/30 dark:bg-ink/50 backdrop-blur-[1px] transition-all"></div>
                </>
              )}

              {/* Decorative Corner Ornaments */}
              <div className="absolute top-2 left-2 border-t border-l border-gold/40 w-4 h-4 rounded-tl-lg pointer-events-none"></div>
              <div className="absolute top-2 right-2 border-t border-r border-gold/40 w-4 h-4 rounded-tr-lg pointer-events-none"></div>
              <div className="absolute bottom-2 left-2 border-b border-l border-gold/40 w-4 h-4 rounded-bl-lg pointer-events-none"></div>
              <div className="absolute bottom-2 right-2 border-b border-r border-gold/40 w-4 h-4 rounded-br-lg pointer-events-none"></div>

              {/* Top Section */}
              <div className="relative z-10 text-center">
                <span className={`text-[9px] tracking-[6px] uppercase font-bold text-gold ${trackingClass} block mb-1`}>
                  ✦ Sanctuary Blessing ✦
                </span>
                <div className="w-12 h-px bg-gold/30 mx-auto"></div>
              </div>

              {/* Middle Section: Message */}
              <div className="relative z-10 text-center px-2 py-4 my-auto">
                {message ? (
                  <p className={`font-serif italic leading-relaxed text-sm md:text-base ${cardImageSrc ? 'text-white drop-shadow' : 'text-ink dark:text-gray-200'}`}>
                    &ldquo;{message}&rdquo;
                  </p>
                ) : (
                  <p className="font-serif italic text-xs text-gray-400">
                    &ldquo;{language === 'en' ? "Your blessing message will appear here..." : "നിങ്ങളുടെ അനുഗ്രഹ സന്ദേശം ഇവിടെ കാണാം..."}&rdquo;
                  </p>
                )}
              </div>

              {/* Bottom Section: Credit Value & Label */}
              <div className="relative z-10 text-center">
                <div className="w-8 h-px bg-gold/20 mx-auto mb-2"></div>
                <p className={`text-[9px] font-bold text-gold uppercase ${trackingClass}`}>
                  {mode === 'credits' ? `${selectedBundle.credits} ${t.credits}` : `${selectedPrayerType.emoji} ${selectedPrayerType.name}`}
                </p>
                <p className="text-[7px] text-gray-400 mt-1 uppercase tracking-wider">PrayerBank Treasury</p>
              </div>

            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-gold w-full font-serif text-lg py-4 rounded-xl disabled:opacity-50 shadow-lg active:scale-[0.98] transition-transform hover:scale-[1.01] hover:shadow-xl"
        >
          {loading ? t.sending_gift : t.send_gift_btn}
        </button>
      </form>
    </div>
  )
}
