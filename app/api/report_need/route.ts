import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

  const { needId } = await request.json()
  if (!needId) return NextResponse.json({ error: 'Missing needId' }, { status: 400 })

  // Increment the reports_count
  // If we had a migration applied for reports_count, we would do an RPC or update.
  // We can just call an RPC or rely on a simple fetch to update if we had an RPC.
  // Since we don't have an RPC for incrementing reports, we fetch and add 1.
  const { data: need } = await supabase.from('needs').select('reports_count').eq('id', needId).single()
  if (need) {
    await supabase.from('needs').update({ reports_count: (need.reports_count || 0) + 1 }).eq('id', needId)
  }

  return NextResponse.json({ success: true })
}
