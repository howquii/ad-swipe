import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// POST /api/setup — creates tables if they don't exist, using service role
export async function POST() {
  const supabase = createServiceClient()
  const results: Record<string, string> = {}

  // Test collections table
  const { error: colCheck } = await supabase.from('collections').select('id').limit(1)

  if (colCheck?.code === '42P01') {
    // Table doesn't exist — seed a default collection using insert to force create
    // (We rely on Supabase dashboard to create tables in production)
    results.collections = 'Table missing — create via Supabase dashboard'
  } else if (colCheck) {
    results.collections = `error: ${colCheck.message}`
  } else {
    results.collections = 'ok'
  }

  // Test saved_ads table
  const { error: saCheck } = await supabase.from('saved_ads').select('id').limit(1)
  if (saCheck?.code === '42P01') {
    results.saved_ads = 'Table missing — create via Supabase dashboard'
  } else if (saCheck) {
    results.saved_ads = `error: ${saCheck.message}`
  } else {
    results.saved_ads = 'ok'
  }

  // Test ads table
  const { count, error: adsErr } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true })
  results.ads = adsErr ? `error: ${adsErr.message}` : `ok (${count} rows)`

  return NextResponse.json({ results })
}
