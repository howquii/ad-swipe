import { Ad } from '@/types/ad'
import { scoreAd, getScoreLabel } from '@/lib/enrichment/performance-scorer'
import { estimateSpend } from '@/lib/enrichment/spend-estimator'

interface RawGraphQLAd {
  adArchiveID?: string
  collationCount?: number
  startDate?: number
  endDate?: number
  pageName?: string
  pageID?: string
  snapshot?: {
    body?: { text?: string }
    title?: string
    caption?: string
    description?: string
    cards?: unknown[]
    videos?: Array<{ video_hd_url?: string; video_sd_url?: string }>
    images?: Array<{ original_image_url?: string }>
  }
  publisherPlatform?: string[]
  isActive?: boolean
}

function extractAdsFromJson(obj: unknown, found: RawGraphQLAd[] = []): RawGraphQLAd[] {
  if (!obj || typeof obj !== 'object') return found
  if (Array.isArray(obj)) {
    for (const item of obj) extractAdsFromJson(item, found)
    return found
  }
  const o = obj as Record<string, unknown>
  if (o.adArchiveID && typeof o.adArchiveID === 'string') {
    found.push(o as unknown as RawGraphQLAd)
    return found
  }
  for (const val of Object.values(o)) {
    extractAdsFromJson(val, found)
  }
  return found
}

// Parse a Meta Ad Library URL and extract params
export function parseMetaAdLibraryUrl(rawUrl: string): {
  pageId?: string
  query?: string
  country?: string
  searchType?: string
} {
  try {
    const url = new URL(rawUrl)
    const pageId   = url.searchParams.get('view_all_page_id') ?? undefined
    const query    = url.searchParams.get('search_terms') ?? url.searchParams.get('q') ?? undefined
    const country  = url.searchParams.get('country') ?? undefined
    const searchType = url.searchParams.get('search_type') ?? undefined
    return { pageId, query, country, searchType }
  } catch {
    return {}
  }
}

export async function scrapeAdLibrary(
  query: string,
  country = 'ALL',
  pageId?: string,   // Meta page ID for brand-specific scraping
): Promise<Ad[]> {
  const { chromium } = await import('playwright')

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
    locale: 'en-US',
  })
  const page = await context.newPage()

  const rawAds: RawGraphQLAd[] = []

  page.on('response', async (response) => {
    const url = response.url()
    if (
      url.includes('/api/graphql') ||
      url.includes('ads_archive') ||
      url.includes('AdsArchive')
    ) {
      try {
        const text = await response.text()
        if (!text.includes('adArchiveID')) return
        try {
          const json = JSON.parse(text)
          extractAdsFromJson(json, rawAds)
          return
        } catch { /* not pure JSON */ }
        for (const line of text.split('\n')) {
          if (!line.trim().startsWith('{')) continue
          try {
            const json = JSON.parse(line)
            extractAdsFromJson(json, rawAds)
          } catch { /* skip */ }
        }
      } catch { /* ignore */ }
    }
  })

  const countryParam = country === 'ALL' ? 'US' : country

  // Build URL: by page_id (brand-specific) or keyword search
  const url = pageId
    ? `https://www.facebook.com/ads/library/` +
      `?active_status=active` +
      `&ad_type=all` +
      `&country=${countryParam}` +
      `&media_type=all` +
      `&search_type=page` +
      `&view_all_page_id=${pageId}` +
      `&sort_data[direction]=desc&sort_data[mode]=total_impressions`
    : `https://www.facebook.com/ads/library/` +
      `?q=${encodeURIComponent(query)}` +
      `&search_type=keyword_unordered` +
      `&country=${countryParam}` +
      `&active_status=all` +
      `&ad_type=all` +
      `&media_type=all`

  console.log(`[scraper] navigating to: ${url}`)

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 })

    for (let i = 0; i < 5; i++) {
      await page.evaluate(() => window.scrollBy(0, window.innerHeight * 3))
      await page.waitForTimeout(2500)
      if (rawAds.length >= 50) break
    }
    await page.waitForTimeout(3000)
  } catch (err) {
    console.error('[scraper] navigation error:', err)
  }

  await browser.close()

  console.log(`[scraper] raw ads captured: ${rawAds.length} for "${query}"`)

  const ads: Ad[] = rawAds
    .filter(node => node.adArchiveID)
    .map(node => {
      const snap = node.snapshot
      const mediaType = snap?.videos?.length
        ? 'video'
        : (snap?.cards?.length ?? 0) > 0 ? 'carousel' : 'image'
      const creatives = (snap?.cards?.length ?? 0) > 0
        ? snap!.cards!.length
        : node.collationCount ?? 1
      const isActive = node.isActive ?? !node.endDate

      const partial: Partial<Ad> = {
        advertiser_name: node.pageName ?? '',
        advertiser_page_id: node.pageID,
        primary_text: snap?.body?.text,
        headline: snap?.title,
        description: snap?.description,
        image_url: snap?.images?.[0]?.original_image_url,
        video_url: snap?.videos?.[0]?.video_hd_url ?? snap?.videos?.[0]?.video_sd_url,
        media_type: mediaType,
        start_date: node.startDate ? new Date(node.startDate * 1000).toISOString() : undefined,
        end_date: node.endDate ? new Date(node.endDate * 1000).toISOString() : undefined,
        publisher_platforms: node.publisherPlatform,
        status: isActive ? 'ACTIVE' : 'INACTIVE',
        country_code: country,
        creatives_count: creatives,
      }

      const score = scoreAd(partial)
      const spend = estimateSpend(score, 'default')
      const label = getScoreLabel(score)

      return {
        ...partial,
        id: String(node.adArchiveID),
        performance_score: score,
        score_label: label,
        estimated_spend_min: spend.min,
        estimated_spend_max: spend.max,
        raw_data: { country_code: country, creatives_count: creatives, score_label: label },
      } as Ad
    })

  return ads
}
