import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getMockAds } from '@/lib/meta-library/mock-data'
import { randomUUID } from 'crypto'

export async function POST() {
  const supabase = createServiceClient()

  // Delete all existing rows first
  await supabase.from('ads').delete().neq('id', '00000000-0000-0000-0000-000000000000')

  const ads = getMockAds().map(ad => ({
    ...ad,
    id: randomUUID(),
  }))

  const { error, data } = await supabase
    .from('ads')
    .insert(ads)
    .select('id')

  if (error) {
    console.error('[seed] error:', error.message)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  console.log(`[seed] seeded ${data?.length ?? 0} demo ads`)
  return NextResponse.json({ ok: true, saved: data?.length ?? 0 })
}
