import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { searchAdLibrary } from '@/lib/meta-library/api-client'
import { scrapeAdLibrary } from '@/lib/meta-library/playwright-scraper'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { query, country = 'ALL' } = body

  if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 })

  const supabase = createServiceClient()

  // Create job
  const { data: job } = await supabase
    .from('scrape_jobs')
    .insert({ query, country, status: 'running' })
    .select()
    .single()

  if (!job) return NextResponse.json({ error: 'Could not create job' }, { status: 500 })

  console.log(`[scrape] job ${job.id} started for "${query}" in ${country}`)

  // Run async (don't await in the request)
  runScrape(job.id, query, country).catch(console.error)

  return NextResponse.json({ jobId: job.id })
}

async function runScrape(jobId: string, query: string, country: string) {
  const supabase = createServiceClient()

  try {
    console.log(`[scrape:${jobId}] trying Meta API…`)
    let { ads, tokenInvalid } = await searchAdLibrary(query, country)

    if (tokenInvalid || ads.length === 0) {
      console.log(`[scrape:${jobId}] API unavailable, falling back to Playwright…`)
      ads = await scrapeAdLibrary(query, country)
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
