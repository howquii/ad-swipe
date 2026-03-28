import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hydrateAd } from '@/types/ad'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const country   = searchParams.get('country') ?? ''
  const industry  = searchParams.get('industry') ?? ''
  const mediaType = searchParams.get('media_type') ?? ''
  const minScore  = parseInt(searchParams.get('min_score') ?? '0')
  const sort      = searchParams.get('sort') ?? 'score'
  const page      = parseInt(searchParams.get('page') ?? '0')
  const limit     = 100

  const supabase = createServiceClient()

  let query = supabase
    .from('ads')
    .select('*', { count: 'exact' })
    .gte('performance_score', minScore > 0 ? minScore : 0)

  if (mediaType) query = query.eq('media_type', mediaType)

  // Filter by country and industry via raw_data jsonb
  if (country) {
    query = query.contains('raw_data', { country_code: country })
  }
  if (industry) {
    query = query.contains('raw_data', { industry })
  }

  // Sort
  if (sort === 'score') {
    query = query.order('performance_score', { ascending: false })
  } else if (sort === 'spend') {
    query = query.order('estimated_spend_max', { ascending: false })
  } else if (sort === 'days') {
    query = query.order('start_date', { ascending: true })
  } else {
    query = query.order('scraped_at', { ascending: false, nullsFirst: false })
  }

  query = query.range(page * limit, page * limit + limit - 1)

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const ads = (data ?? []).map(hydrateAd)

  return NextResponse.json({ ads, total: count ?? 0 })
}
