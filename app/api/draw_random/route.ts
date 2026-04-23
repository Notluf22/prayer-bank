import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type')

  if (!type) {
    return NextResponse.json({ error: 'Missing prayer type' }, { status: 400 })
  }

  // Fetch up to 50 available prayers of this type
  const { data: prayers, error } = await supabase
    .from('prayers')
    .select('*, depositor:profiles!depositor_id(display_name, country)')
    .eq('status', 'available')
    .eq('type', type)
    .neq('depositor_id', user.id)
    .limit(50)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!prayers || prayers.length === 0) {
    return NextResponse.json({ error: 'No prayers of this type are available right now.' }, { status: 404 })
  }

  // Pick a random one
  const randomIndex = Math.floor(Math.random() * prayers.length)
  const selectedPrayer = prayers[randomIndex]

  return NextResponse.json({ prayer: selectedPrayer })
}
