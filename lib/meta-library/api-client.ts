import { Ad } from '@/types/ad'
import { scoreAd, getScoreLabel } from '@/lib/enrichment/performance-scorer'
import { estimateSpend } from '@/lib/enrichment/spend-estimator'

const META_API_BASE = 'https://graph.facebook.com/v19.0'
const TOKEN = process.env.META_ACCESS_TOKEN

export async function validateToken(): Promise<boolean> {
  if (!TOKEN) return false
  try {
    const res = await fetch(`${META_API_BASE}/me?access_token=${TOKEN}`)
    return res.ok
  } catch {
    return false
  }
}

export async function searchAdLibrary(
  query: string,
  country = 'ALL',
  limit = 50
): Promise<{ ads: Ad[]; tokenInvalid?: boolean }> {
  if (!TOKEN) return { ads: [], tokenInvalid: true }

  const valid = await validateToken()
  if (!valid) return { ads: [], tokenInvalid: true }

  const fields = [
    'id', 'page_name', 'page_id',
    'ad_creative_bodies', 'ad_creative_link_captions',
    'ad_creative_link_descriptions', 'ad_creative_link_titles',
    'ad_snapshot_url', 'ad_delivery_start_time', 'ad_delivery_stop_time',
    'publisher_platforms',
  ].join(',')

  const params = new URLSearchParams({
    access_token: TOKEN,
    ad_type: 'ALL',
    ad_reached_countries: country === 'ALL' ? 'US' : country,
    search_terms: query,
    fields,
    limit: String(limit),
  })

  try {
    const res = await fetch(`${META_API_BASE}/ads_archive?${params}`)
    const json = await res.json()

    if (json.error?.code === 190) return { ads: [], tokenInvalid: true }
    if (!json.data) return { ads: [] }

    const ads: Ad[] = json.data.map((raw: Record<string, unknown>) => {
      const bodies = raw.ad_creative_bodies as string[] | undefined
      const titles = raw.ad_creative_link_titles as string[] | undefined
      const descs = raw.ad_creative_link_descriptions as string[] | undefined
      const platforms = raw.publisher_platforms as string[] | undefined

      const partial: Partial<Ad> = {
        advertiser_name: String(raw.page_name ?? ''),
        advertiser_page_id: raw.page_id ? String(raw.page_id) : undefined,
        primary_text: bodies?.[0],
        headline: titles?.[0],
        description: descs?.[0],
        ad_snapshot_url: raw.ad_snapshot_url as string | undefined,
        start_date: raw.ad_delivery_start_time as string | undefined,
        end_date: raw.ad_delivery_stop_time as string | undefined,
        publisher_platforms: platforms,
        status: raw.ad_delivery_stop_time ? 'INACTIVE' : 'ACTIVE',
        creatives_count: bodies?.length ?? 1,
        country_code: country,
        raw_data: { country_code: country, creatives_count: bodies?.length ?? 1 },
      }

      const score = scoreAd(partial)
      const spend = estimateSpend(score, 'default')
      const label = getScoreLabel(score)

      return {
        ...partial,
        id: String(raw.id),
        performance_score: score,
        score_label: label,
        estimated_spend_min: spend.min,
        estimated_spend_max: spend.max,
        raw_data: { country_code: country, creatives_count: bodies?.length ?? 1, score_label: label },
      } as Ad
    })

    return { ads }
  } catch (err) {
    console.error('[api-client] fetch error:', err)
    return { ads: [] }
  }
}
