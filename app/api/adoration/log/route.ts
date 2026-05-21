import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { durationMinutes } = await request.json()
  if (typeof durationMinutes !== 'number' || durationMinutes < 1) {
    return NextResponse.json({ error: 'Invalid duration' }, { status: 400 })
  }

  // Calculate credits on the server to avoid front-end manipulation
  // Rate: 8 credits per hour (0.1333 credits per minute)
  const creditsEarned = Math.round(durationMinutes * (8 / 60) * 100) / 100

  // 1. Fetch user's profile to get country
  const { data: profile } = await supabase
    .from('profiles')
    .select('country')
    .eq('id', user.id)
    .single()

  // 2. Insert into adoration_sessions table for auditing
  const { error: sessionError } = await supabase
    .from('adoration_sessions')
    .insert({
      user_id: user.id,
      duration_minutes: durationMinutes,
      credits_earned: creditsEarned,
    })
  
  if (sessionError) {
    return NextResponse.json({ error: sessionError.message }, { status: 500 })
  }

  // 3. Deposit a prayer into the general treasury representing this adoration offering
  const { error: prayerError } = await supabase
    .from('prayers')
    .insert({
      depositor_id: user.id,
      type: 'adoration',
      intention: 'Offered in Perpetual Eucharistic Adoration',
      offered_for: 'Anyone who needs it',
      credit_value: creditsEarned,
      status: 'available',
      country: profile?.country ?? null,
    })

  if (prayerError) {
    return NextResponse.json({ error: prayerError.message }, { status: 500 })
  }

  // 4. Call RPC add_credits to award credits to the user's profile
  const { error: profileError } = await supabase.rpc('add_credits', {
    user_id: user.id,
    amount: creditsEarned,
  })

  if (profileError) {
    return NextResponse.json({ error: profileError.message }, { status: 500 })
  }

  // 5. Revalidate dashboards to reflect new balance and histories
  revalidatePath('/dashboard')
  
  return NextResponse.json({ 
    success: true, 
    durationMinutes, 
    creditsEarned 
  })
}
