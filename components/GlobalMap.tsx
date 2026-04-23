'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface Activity {
  id: string
  country: string
  type: string
  x: number // percentage
  y: number // percentage
}

// Simple mapping for demonstration
const countryCoords: Record<string, { x: number, y: number }> = {
  'USA': { x: 20, y: 35 },
  'UK': { x: 48, y: 25 },
  'India': { x: 72, y: 45 },
  'Brazil': { x: 32, y: 70 },
  'Philippines': { x: 85, y: 55 },
  'Nigeria': { x: 52, y: 55 },
  'Australia': { x: 85, y: 75 },
  'Italy': { x: 52, y: 32 },
  'Canada': { x: 20, y: 25 },
  'Mexico': { x: 20, y: 45 },
}

export default function GlobalMap({ recentPrayers }: { recentPrayers: any[] }) {
  const [activities, setActivities] = useState<Activity[]>([])

  useEffect(() => {
    // Map recent prayers to map pins
    const pins = recentPrayers
      .filter(p => p.country && countryCoords[p.country])
      .map(p => ({
        id: p.id,
        country: p.country,
        type: p.type,
        ...countryCoords[p.country]
      }))
    setActivities(pins)
  }, [recentPrayers])

  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-ink/50 border border-gold/10 shadow-2xl">
      {/* The generated map image */}
      <Image 
        src="/sacred_world_map.png" // We'll need to move the generated image to public/
        alt="Sacred World Map"
        fill
        className="object-cover opacity-60 grayscale-[0.2]"
      />
      
      {/* Pulse points */}
      {activities.map((act, i) => (
        <div 
          key={act.id}
          className="absolute group"
          style={{ left: `${act.x}%`, top: `${act.y}%` }}
        >
          <div className="relative">
            {/* The pulse animation */}
            <div className="absolute -inset-2 bg-gold/40 rounded-full animate-ping"></div>
            <div className="relative w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink/90 text-white text-[10px] py-1 px-2 rounded border border-gold/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              {act.country}: {act.type.replace('_', ' ')}
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 bg-ink/40 backdrop-blur-md border border-gold/10 rounded-lg p-2">
        <p className="text-[10px] text-gold font-bold uppercase tracking-widest">Global Activity</p>
        <p className="text-[9px] text-gray-400">Live prayers appearing in the treasury</p>
      </div>
    </div>
  )
}
