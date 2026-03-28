/**
 * Seed script — run with: npx ts-node --project tsconfig.json scripts/seed-ads.ts
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, META_ACCESS_TOKEN in .env.local
 */
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const TOKEN = process.env.META_ACCESS_TOKEN

const BRANDS = [
  { query: 'Airbnb',       industry: 'travel',    country: 'PE' },
  { query: 'Nike',         industry: 'fitness',   country: 'US' },
  { query: 'Shein',        industry: 'ecommerce', country: 'MX' },
  { query: 'Duolingo',     industry: 'education', country: 'CO' },
  { query: 'Nubank',       industry: 'fintech',   country: 'MX' },
  { query: 'Canva',        industry: 'tech',      country: 'PE' },
  { query: 'Booking',      industry: 'travel',    country: 'AR' },
  { query: 'Rappi',        industry: 'fintech',   country: 'CO' },
  { query: 'Mercado Pago', industry: 'fintech',   country: 'AR' },
  { query: 'Temu',         industry: 'ecommerce', country: 'US' },
  { query: 'Adidas',       industry: 'fitness',   country: 'US' },
  { query: 'Platzi',       industry: 'education', country: 'CO' },
]

async function fetchMetaAds(query: string, country: string) {
  if (!TOKEN) return []

  const fields = [
    'id', 'page_name', 'page_id',
    'ad_creative_bodies', 'ad_creative_link_titles',
    'ad_snapshot_url', 'ad_delivery_start_time', 'ad_delivery_stop_time',
    'publisher_platforms',
  ].join(',')

  const params = new URLSearchParams({
    access_token: TOKEN,
    ad_type: 'ALL',
    ad_reached_countries: country,
    search_terms: query,
    fields,
    limit: '50',
  })

  const res = await fetch(`https://graph.facebook.com/v19.0/ads_archive?${params}`)
  const json = await res.json()
  if (json.error) {
    console.warn(`API error for ${query}:`, json.error.message)
    return []
  }
  return json.data ?? []
}

function score(ad: Record<string, unknown>): number {
  let s = 30
  if (!ad.ad_delivery_stop_time) s += 15 // active
  if (ad.ad_snapshot_url) s += 10
  const bodies = ad.ad_creative_bodies as string[] | undefined
  if (bodies?.length && bodies[0].length > 50) s += 5
  const platforms = ad.publisher_platforms as string[] | undefined
  if ((platforms?.length ?? 0) >= 2) s += 5
  if (ad.ad_delivery_start_time) {
    const days = Math.floor(
      (Date.now() - new Date(ad.ad_delivery_start_time as string).getTime()) / 86400000
    )
    if (days >= 7) s += 5
    if (days >= 14) s += 5
    if (days >= 30) s += 10
  }
  return Math.min(s, 100)
}

function getLabel(s: number) {
  if (s >= 85) return 'Fire'
  if (s >= 65) return 'Hot'
  if (s >= 40) return 'Warm'
  return 'Cold'
}

async function main() {
  let totalSaved = 0

  for (const brand of BRANDS) {
    process.stdout.write(`Seeding ${brand.query} (${brand.country})… `)

    const raw = await fetchMetaAds(brand.query, brand.country)
    const rows = raw
      .map((r: Record<string, unknown>) => {
        const bodies = r.ad_creative_bodies as string[] | undefined
        const titles = r.ad_creative_link_titles as string[] | undefined
        const s = score(r)
        const spend = s >= 85
          ? { min: 500, max: 2000 }
          : s >= 65
          ? { min: 100, max: 500 }
          : { min: 20, max: 100 }
        return {
          ad_id: String(r.id),
          page_name: r.page_name as string,
          page_id: r.page_id as string | undefined,
          ad_creative_body: bodies?.[0],
          ad_creative_link_title: titles?.[0],
          ad_snapshot_url: r.ad_snapshot_url as string | undefined,
          delivery_start_time: r.ad_delivery_start_time as string | undefined,
          delivery_stop_time: r.ad_delivery_stop_time as string | undefined,
          publisher_platforms: r.publisher_platforms as string[] | undefined,
          country_iso_code: brand.country,
          country_code: brand.country,
          industry: brand.industry,
          is_active: !r.ad_delivery_stop_time,
          performance_score: s,
          score_label: getLabel(s),
          estimated_spend_min: spend.min,
          estimated_spend_max: spend.max,
          creatives_count: (bodies?.length ?? 1),
          updated_at: new Date().toISOString(),
        }
      })
      .filter((r: { performance_score: number }) => r.performance_score >= 60)

    if (rows.length === 0) {
      console.log('0 top performers')
      continue
    }

    const { error } = await supabase.from('ads').upsert(rows, { onConflict: 'ad_id' })
    if (error) {
      console.log(`ERROR: ${error.message}`)
    } else {
      totalSaved += rows.length
      console.log(`${rows.length} ads saved`)
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500))
  }

  console.log(`\nTotal seeded: ${totalSaved} ads`)
}

main().catch(console.error)
