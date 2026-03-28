import { Ad } from '@/types/ad'

export function scoreAd(ad: Partial<Ad>): number {
  let score = 30 // base

  // Active status boost
  if (ad.status === 'ACTIVE' || ad.status === 'active') score += 15

  // Has media
  if (ad.image_url || ad.video_url) score += 10

  // Video is higher engagement
  if (ad.media_type === 'video') score += 10

  // Has body copy
  if (ad.primary_text && ad.primary_text.length > 50) score += 5

  // Multi-platform
  const platforms = ad.publisher_platforms ?? []
  if (platforms.length >= 2) score += 5
  if (platforms.length >= 3) score += 5

  // Days active (longevity = real ad spend)
  if (ad.start_date) {
    const start = new Date(ad.start_date).getTime()
    const end = ad.end_date ? new Date(ad.end_date).getTime() : Date.now()
    const days = Math.floor((end - start) / 86400000)
    if (days >= 7)  score += 5
    if (days >= 14) score += 5
    if (days >= 30) score += 10
  }

  // Creatives count
  const creatives = ad.creatives_count ?? 1
  if (creatives >= 3) score += 5
  if (creatives >= 6) score += 5

  return Math.min(score, 100)
}

export function getScoreLabel(score: number): string {
  if (score >= 85) return 'Fire'
  if (score >= 65) return 'Hot'
  if (score >= 40) return 'Warm'
  return 'Cold'
}

export function getScoreEmoji(score: number): string {
  if (score >= 85) return '🔥'
  if (score >= 65) return '♨️'
  if (score >= 40) return '🌡️'
  return '❄️'
}

export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-red-500 bg-red-50'
  if (score >= 65) return 'text-orange-500 bg-orange-50'
  if (score >= 40) return 'text-yellow-600 bg-yellow-50'
  return 'text-blue-400 bg-blue-50'
}
