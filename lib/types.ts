export type PrayerType = {
  id: string
  name: string
  emoji: string
  creditValue: number
  description: string
}

export const PRAYER_TYPES: PrayerType[] = [
  { id: 'hail_mary',    name: 'Hail Mary',     emoji: '🌹', creditValue: 1,  description: 'A single Hail Mary' },
  { id: 'our_father',   name: 'Our Father',    emoji: '🙏', creditValue: 1,  description: 'The Lord\'s Prayer' },
  { id: 'divine_mercy', name: 'Divine Mercy',  emoji: '🕊', creditValue: 3,  description: 'Chaplet of Divine Mercy' },
  { id: 'chaplet',      name: 'Chaplet',       emoji: '⛪', creditValue: 4,  description: 'A devotional chaplet' },
  { id: 'holy_rosary',  name: 'Holy Rosary',   emoji: '📿', creditValue: 5,  description: 'The full Holy Rosary' },
  { id: 'novena',       name: 'Novena',        emoji: '🕯', creditValue: 7,  description: 'Nine-day novena' },
  { id: 'adoration',    name: 'Adoration',     emoji: '✨', creditValue: 8,  description: 'Eucharistic Adoration' },
  { id: 'holy_mass',    name: 'Holy Mass',     emoji: '✝️', creditValue: 10, description: 'Attendance at Holy Mass' },
]

export const OFFERED_FOR_OPTIONS = [
  'Anyone who needs it',
  'The sick & suffering',
  'Families in crisis',
  'Souls in purgatory',
  'Peace in the world',
  'Vocations',
  'The lonely & forgotten',
  'Children & youth',
  'The grieving',
]

export type Prayer = {
  id: string
  depositor_id: string
  type: string
  intention: string | null
  offered_for: string
  credit_value: number
  status: 'available' | 'withdrawn' | 'gifted'
  withdrawn_by: string | null
  gifted_via: string | null
  country: string | null
  created_at: string
  depositor?: { display_name: string; country: string }
}

export type GiftCard = {
  id: string
  code: string
  type: 'credits' | 'prayer'
  credit_amount: number | null
  prayer_id: string | null
  from_user_id: string
  gift_message: string | null
  redeemed_by: string | null
  redeemed_at: string | null
  created_at: string
  prayer?: Prayer
  from_user?: { display_name: string }
}

export type UserProfile = {
  id: string
  display_name: string
  country: string | null
  credits: number
  total_deposited: number
  created_at: string
}
