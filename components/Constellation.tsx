'use client'
import { useMemo } from 'react'

export default function Constellation({ sparks }: { sparks: number }) {
  // Generate random stars based on the sparks count
  const stars = useMemo(() => {
    return Array.from({ length: sparks }).map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3
    }))
  }, [sparks])

  if (sparks === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute inset-0 bg-gradient-to-b from-ink/20 to-transparent"></div>
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-gold animate-pulse"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            boxShadow: `0 0 ${star.size * 2}px rgba(212, 175, 55, 0.8)`
          }}
        />
      ))}
    </div>
  )
}
