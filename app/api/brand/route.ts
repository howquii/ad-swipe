import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hydrateAd } from '@/types/ad'

// GET /api/brand?name=Airbnb&page_id=15087023444
// Returns brand intelligence: all ads in DB, aggregate stats, Meta library URL
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const name    = searchParams.get('name') ?? ''
  const page_id = searchParams.get('page_id') ?? ''

  if (!name && !page_id) {
    return NextResponse.json({ error: 'name or page_id required' }, { status: 400 })
  }

  const supabase = createServiceClient()

  let query = supabase
    .from('ads')
    .select('*')
    .order('performance_score', { ascending: false })

  if (name)    query = query.ilike('advertiser_name', name)
  if (page_id) query = query.eq('advertiser_page_id', page_id)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const ads = (data ?? []).map(hydrateAd)

  // Aggregate stats
  const total      = ads.length
  const active     = ads.filter(a => a.status === 'ACTIVE').length
  const avgScore   = total > 0
    ? Math.round(ads.reduce((s, a) => s + (a.performance_score ?? 0), 0) / total)
    : 0
  const topScore   = ads[0]?.performance_score ?? 0

  const spendMin   = ads.reduce((s, a) => s + (a.estimated_spend_min ?? 0), 0)
  const spendMax   = ads.reduce((s, a) => s + (a.estimated_spend_max ?? 0), 0)

  const formats: Record<string, number> = {}
  const countries: string[] = []
  const platforms: string[] = []

  for (const ad of ads) {
    const mt = ad.media_type ?? 'image'
    formats[mt] = (formats[mt] ?? 0) + 1

    const cc = ad.country_code
    if (cc && !countries.includes(cc)) countries.push(cc)

    for (const p of ad.publisher_platforms ?? []) {
      if (!platforms.includes(p)) platforms.push(p)
    }
  }

  // Build Meta Ad Library URL for this brand
  const effectivePageId = page_id || ads[0]?.advertiser_page_id
  const metaLibraryUrl = effectivePageId
    ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&search_type=page&view_all_page_id=${effectivePageId}&sort_data[direction]=desc&sort_data[mode]=total_impressions`
    : name
      ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&search_terms=${encodeURIComponent(name)}`
      : null

  return NextResponse.json({
    brand: {
      name: ads[0]?.advertiser_name ?? name,
      page_id: effectivePageId,
      meta_library_url: metaLibraryUrl,
    },
    stats: {
      total_ads: total,
      active_ads: active,
      inactive_ads: total - active,
      avg_score: avgScore,
      top_score: topScore,
      spend_min_total: spendMin,
      spend_max_total: spendMax,
      formats,
      countries,
      platforms,
    },
    top_ads: ads.slice(0, 5),
  })
}
