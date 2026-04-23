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
    <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden bg-black border border-white/5 shadow-2xl">
      {/* The new cleaner map image */}
      <Image 
        src="/sacred_world_map_clean_1776967774479.png"
        alt="Sacred World Map"
        fill
        className="object-contain"
      />
      
      {/* Pulse points - made smaller and more subtle */}
      {activities.map((act) => (
        <div 
          key={act.id}
          className="absolute group"
          style={{ left: `${act.x}%`, top: `${act.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          <div className="relative">
            {/* Minimal pulse */}
            <div className="absolute -inset-1.5 bg-gold/30 rounded-full animate-ping"></div>
            <div className="relative w-2 h-2 bg-gold rounded-full shadow-[0_0_10px_rgba(212,175,55,0.8)]"></div>
            
            {/* Tooltip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] py-1 px-2 rounded border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
              <span className="text-gold font-bold">{act.country}</span>: {act.type.replace('_', ' ')}
            </div>
          </div>
        </div>
      ))}

      <div className="absolute bottom-3 right-4 flex items-center gap-2 opacity-50">
        <div className="w-1 h-1 bg-gold rounded-full animate-pulse"></div>
        <p className="text-[8px] text-gray-500 uppercase tracking-widest">Global Activity</p>
      </div>
    </div>
  )
}
