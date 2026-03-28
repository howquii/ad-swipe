import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { searchAdLibrary } from '@/lib/meta-library/api-client'
import { scrapeAdLibrary, parseMetaAdLibraryUrl } from '@/lib/meta-library/playwright-scraper'

export async function POST(req: NextRequest) {
  const body = await req.json()
  let { query, country = 'ALL', url: metaUrl, page_id } = body

  // If a Meta Ad Library URL is pasted, extract params from it
  if (metaUrl) {
    const parsed = parseMetaAdLibraryUrl(metaUrl)
    if (parsed.pageId) page_id = parsed.pageId
    if (parsed.query && !query) query = parsed.query
    if (parsed.country && parsed.country !== 'ALL') country = parsed.country
  }

  if (!query && !page_id) {
    return NextResponse.json({ error: 'query, page_id, or url required' }, { status: 400 })
  }

  // Use page_id as the "query" label for the job if no keyword
  const jobLabel = query || `page:${page_id}`

  const supabase = createServiceClient()

  const { data: job } = await supabase
    .from('scrape_jobs')
    .insert({ query: jobLabel, country, status: 'running' })
    .select()
    .single()

  if (!job) return NextResponse.json({ error: 'Could not create job' }, { status: 500 })

  console.log(`[scrape] job ${job.id} started for "${jobLabel}" in ${country}`)

  // Run async (don't await in the request)
  runScrape(job.id, query ?? '', country, page_id).catch(console.error)

  return NextResponse.json({ jobId: job.id })
}

async function runScrape(jobId: string, query: string, country: string, pageId?: string) {
  const supabase = createServiceClient()

  try {
    let ads: import('@/types/ad').Ad[] = []

    if (pageId) {
      // Brand-specific scrape via Playwright (page_id search doesn't work via Meta API)
      console.log(`[scrape:${jobId}] scraping page_id=${pageId} via Playwright…`)
      ads = await scrapeAdLibrary('', country, pageId)
    } else {
      console.log(`[scrape:${jobId}] trying Meta API for "${query}"…`)
      const { ads: apiAds, tokenInvalid } = await searchAdLibrary(query, country)
      ads = apiAds
      if (tokenInvalid || ads.length === 0) {
        console.log(`[scrape:${jobId}] API unavailable, falling back to Playwright…`)
        ads = await scrapeAdLibrary(query, country)
      }
    }

    console.log(`[scrape:${jobId}] got ${ads.length} ads, upserting…`)

    // Batch upsert in chunks of 50
    const BATCH = 50
    for (let i = 0; i < ads.length; i += BATCH) {
      const chunk = ads.slice(i, i + BATCH).map(ad => ({
        ...ad,
        id: undefined, // let DB generate
        updated_at: new Date().toISOString(),
      }))
      const { error } = await supabase
        .from('ads')
        .upsert(chunk, { onConflict: 'ad_id' })
      if (error) console.error(`[scrape:${jobId}] upsert error:`, error.message)
    }

    await supabase
      .from('scrape_jobs')
      .update({ status: 'done', ads_found: ads.length, updated_at: new Date().toISOString() })
      .eq('id', jobId)

    console.log(`[scrape:${jobId}] done. ${ads.length} ads saved.`)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error(`[scrape:${jobId}] error:`, msg)
    await supabase
      .from('scrape_jobs')
      .update({ status: 'error', error: msg, updated_at: new Date().toISOString() })
      .eq('id', jobId)
  }
}
