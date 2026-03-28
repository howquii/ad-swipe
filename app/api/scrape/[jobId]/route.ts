import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET(
  _req: NextRequest,
  { params }: { params: { jobId: string } }
) {
  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('scrape_jobs')
    .select('*')
    .eq('id', params.jobId)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
