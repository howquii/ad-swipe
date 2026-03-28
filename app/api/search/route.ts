import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { hydrateAd } from '@/types/ad'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query = searchParams.get('query') ?? ''

  if (!query) return NextResponse.json({ ads: [] })

  const supabase = createServiceClient()

  const { data } = await supabase
    .from('ads')
    .select('*')
    .or(`advertiser_name.ilike.%${query}%,primary_text.ilike.%${query}%,headline.ilike.%${query}%`)
    .order('performance_score', { ascending: false })
    .limit(100)

  const ads = (data ?? []).map(hydrateAd)
  return NextResponse.json({ ads })
}
