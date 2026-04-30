'use client'
import { useMemo, useState } from 'react'

export default function Constellation({ sparks, prayers = [] }: { sparks: number, prayers?: any[] }) {
  const [hoveredStar, setHoveredStar] = useState<any | null>(null)

  // Generate random stars based on the sparks count
  const stars = useMemo(() => {
    return Array.from({ length: sparks }).map((_, i) => ({
      id: i,
      x: Math.random() * 90 + 5, // Keep away from edges
      y: Math.random() * 90 + 5,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3,
      prayer: prayers[i] || null
    }))
  }, [sparks, prayers])

  if (sparks === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-auto z-0 group/constellation">
      <div className="absolute inset-0 bg-gradient-to-b from-ink/20 to-transparent pointer-events-none"></div>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-gold animate-pulse-subtle hover:scale-150 transition-transform cursor-help z-10"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size * 2}px`, // slightly larger hit area
            height: `${star.size * 2}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            boxShadow: `0 0 ${star.size * 3}px rgba(212, 175, 55, 0.8)`
          }}
          onMouseEnter={() => setHoveredStar(star)}
          onMouseLeave={() => setHoveredStar(null)}
        />
      ))}
      
      {hoveredStar?.prayer && (
        <div className="absolute z-20 pointer-events-none transition-opacity duration-300 bg-ink/90 backdrop-blur-sm border border-gold/30 rounded-lg p-3 text-left w-48 shadow-xl"
             style={{
               left: `calc(${hoveredStar.x}% + 10px)`,
               top: `calc(${hoveredStar.y}% - 20px)`,
             }}>
           <p className="text-[10px] text-gold uppercase tracking-widest font-bold mb-1">A grace received</p>
           <p className="text-white text-xs italic line-clamp-3">&ldquo;{hoveredStar.prayer.intention || `A prayer for ${hoveredStar.prayer.offered_for}`}&rdquo;</p>
        </div>
      )}
    </div>
  )
}
