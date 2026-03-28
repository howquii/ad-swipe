import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = createServiceClient()

  // Try to get collections — table may not exist yet
  const { data, error } = await supabase
    .from('collections')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    // If table doesn't exist, return empty
    if (error.code === '42P01') return NextResponse.json({ collections: [] })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ collections: data ?? [] })
}

export async function POST(req: NextRequest) {
  const { name, description } = await req.json()
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('collections')
    .insert({ name, description })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ collection: data })
}
