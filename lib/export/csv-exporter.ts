import Papa from 'papaparse'
import { Ad } from '@/types/ad'

export function exportToCsv(ads: Ad[], filename = 'ads-export.csv') {
  const rows = ads.map(ad => ({
    ad_id: ad.id,
    page_name: ad.advertiser_name,
    media_type: ad.media_type,
    score: ad.performance_score,
    score_label: ad.score_label,
    spend_min: ad.estimated_spend_min,
    spend_max: ad.estimated_spend_max,
    country: ad.country_code,
    industry: ad.industry,
    is_active: ad.status,
    start_date: ad.start_date,
    end_date: ad.end_date,
    platforms: (ad.publisher_platforms ?? []).join(', '),
    body: ad.primary_text,
    snapshot_url: ad.ad_snapshot_url,
  }))

  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
