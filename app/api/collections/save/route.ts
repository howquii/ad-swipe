import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { randomUUID } from 'crypto'

// POST /api/collections/save
// Body: { collection_id?, collection_name?, ad_id }
// If collection_name is provided, creates collection + saves ad
// If collection_id is provided, saves ad to that collection
export async function POST(req: NextRequest) {
  const { collection_id, collection_name, ad_id } = await req.json()
  if (!ad_id) return NextResponse.json({ error: 'ad_id required' }, { status: 400 })

  const supabase = createServiceClient()

  let colId = collection_id

  // Create collection if name provided
  if (!colId && collection_name) {
    const { data: col, error: colErr } = await supabase
      .from('collections')
      .insert({ id: randomUUID(), name: collection_name.trim() })
      .select()
      .single()
    if (colErr) return NextResponse.json({ error: colErr.message }, { status: 500 })
    colId = col.id
  }

  if (!colId) return NextResponse.json({ error: 'collection_id or collection_name required' }, { status: 400 })

  const { error } = await supabase
    .from('saved_ads')
    .upsert({ id: randomUUID(), collection_id: colId, ad_id })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true, collection_id: colId })
}
