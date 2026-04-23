'use client'
import { useEffect, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'

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
  'France': { x: 49, y: 30 },
  'Germany': { x: 51, y: 28 },
}

export default function GlobalMap({ recentPrayers }: { recentPrayers: any[] }) {
  const [activities, setActivities] = useState<Activity[]>([])
  const supabase = createClient()

  useEffect(() => {
    // Initial load from props
    const pins = recentPrayers
      .filter(p => p.country && countryCoords[p.country])
      .map(p => ({
        id: p.id,
        country: p.country,
        type: p.type,
        ...countryCoords[p.country]
      }))
    setActivities(pins)

    // Real-time subscription
    const channel = supabase
      .channel('realtime-prayers')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'prayers',
        filter: 'status=eq.available'
      }, (payload) => {
        const newPrayer = payload.new as any
        if (newPrayer.country && countryCoords[newPrayer.country]) {
          const newPin = {
            id: newPrayer.id,
            country: newPrayer.country,
            type: newPrayer.type,
            ...countryCoords[newPrayer.country]
          }
          setActivities(prev => [newPin, ...prev.slice(0, 9)])
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [recentPrayers, supabase])

  return (
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-ink/50 border border-gold/10 shadow-2xl">
      {/* The generated map image */}
      <Image 
        src="/sacred_world_map.png"
        alt="Sacred World Map"
        fill
        className="object-cover opacity-60 grayscale-[0.2]"
      />
      
      {/* Pulse points */}
      {activities.map((act) => (
        <div 
          key={act.id}
          className="absolute group"
          style={{ left: `${act.x}%`, top: `${act.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            {/* The pulse animation */}
            <div className="absolute -inset-2 bg-gold/40 rounded-full animate-ping"></div>
            <div className="relative w-2.5 h-2.5 bg-gold rounded-full shadow-[0_0_15px_rgba(212,175,55,1)] border border-white/20"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-ink/90 text-white text-[10px] py-1 px-2 rounded border border-gold/20 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-xl">
              <span className="text-gold font-bold">{act.country}</span>: {act.type.replace('_', ' ')}
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-4 left-4 bg-ink/60 backdrop-blur-md border border-gold/20 rounded-lg p-2 flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_5px_rgba(34,197,94,1)]"></div>
        <div>
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest leading-none">Live Treasury</p>
          <p className="text-[8px] text-gray-400 mt-0.5">Real-time global activity</p>
        </div>
      </div>
    </div>
  )
}
