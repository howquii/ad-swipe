// Matches the actual Supabase `ads` table schema
export interface Ad {
  id: string                          // UUID primary key
  advertiser_name?: string            // brand / page name
  advertiser_page_id?: string
  platform?: string
  status?: string                     // 'ACTIVE' | 'INACTIVE' | etc.
  media_type?: string                 // 'video' | 'image' | 'carousel'
  primary_text?: string               // main ad copy body
  headline?: string
  description?: string
  cta_type?: string
  link_url?: string
  image_url?: string                  // thumbnail URL
  video_url?: string
  start_date?: string
  end_date?: string
  estimated_spend_min?: number
  estimated_spend_max?: number
  estimated_spend_mid?: number
  spend_confidence?: string
  performance_score?: number
  days_active?: number
  publisher_platforms?: string[]
  raw_data?: Record<string, unknown>  // stores: country_code, industry, creatives_count, score_label, snapshot_url
  scraped_at?: string
  created_at?: string

  // Convenience getters (populated from raw_data)
  country_code?: string
  industry?: string
  creatives_count?: number
  score_label?: string
  ad_snapshot_url?: string
}

export function hydrateAd(row: Ad): Ad {
  const raw = row.raw_data ?? {}
  return {
    ...row,
    country_code:    (raw.country_code as string)    ?? row.country_code,
    industry:        (raw.industry as string)         ?? row.industry,
    creatives_count: (raw.creatives_count as number)  ?? row.creatives_count ?? 1,
    score_label:     (raw.score_label as string)      ?? row.score_label,
    ad_snapshot_url: (raw.ad_snapshot_url as string)  ?? row.ad_snapshot_url,
  }
}

export interface SpendEstimate {
  min: number
  max: number
  currency: string
  formatted: string
}

export interface SearchFilters {
  country?: string
  industry?: string
  media_type?: string
  min_score?: number
  sort?: 'score' | 'spend' | 'days' | 'recent'
  page?: number
}

export interface ScrapeJob {
  id: string
  query: string
  country: string
  status: 'pending' | 'running' | 'done' | 'error'
  ads_found?: number
  error?: string
  created_at: string
  updated_at?: string
}

export interface Collection {
  id: string
  name: string
  description?: string
  user_id?: string
  created_at: string
}

export interface SavedAd {
  id: string
  collection_id: string
  ad_id: string
  ad?: Ad
  created_at: string
}
