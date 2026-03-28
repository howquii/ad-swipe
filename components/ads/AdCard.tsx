'use client'
import { useState } from 'react'
import { Ad, hydrateAd } from '@/types/ad'
import { getScoreEmoji } from '@/lib/enrichment/performance-scorer'
import { formatSpend } from '@/lib/enrichment/spend-estimator'
import { Play, Bookmark, BookmarkCheck, ExternalLink, Film, Image as ImgIcon } from 'lucide-react'

const FLAGS: Record<string, string> = {
  PE: '🇵🇪', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷',
  US: '🇺🇸', ES: '🇪🇸', BR: '🇧🇷', CL: '🇨🇱',
}

const SCORE_BG: Record<string, string> = {
  Fire: 'bg-red-500',
  Hot:  'bg-orange-400',
  Warm: 'bg-amber-400',
  Cold: 'bg-sky-400',
}

function daysActive(start?: string, end?: string): number {
  if (!start) return 0
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : Date.now()
  return Math.max(0, Math.floor((e - s) / 86400000))
}

interface Props {
  ad: Ad
  rank?: number
  onSave?: (ad: Ad) => void
  onDetail?: (ad: Ad) => void
}

export default function AdCard({ ad: rawAd, rank, onSave, onDetail }: Props) {
  const ad = hydrateAd(rawAd)
  const [imgError, setImgError] = useState(false)
  const [saved, setSaved] = useState(false)

  const score  = ad.performance_score ?? 0
  const label  = ad.score_label ?? 'Cold'
  const emoji  = getScoreEmoji(score)
  const spend  = formatSpend(ad.estimated_spend_min ?? 0, ad.estimated_spend_max ?? 0)
  const days   = daysActive(ad.start_date, ad.end_date)
  const flag   = FLAGS[ad.country_code ?? ''] ?? ''
  const isVideo = ad.media_type === 'video'
  const isActive = ad.status === 'ACTIVE'
  const thumb  = imgError ? null : ad.image_url
  const scoreBg = SCORE_BG[label] ?? 'bg-gray-400'

  // Gradient placeholder: deterministic color from brand name
  const hue = (ad.advertiser_name ?? '').split('').reduce((a, c) => a + c.charCodeAt(0), 17) % 360
  const initials = (ad.advertiser_name ?? '?').slice(0, 2).toUpperCase()

  function handleSave(e: React.MouseEvent) {
    e.stopPropagation()
    setSaved(true)
    onSave?.(ad)
  }

  return (
    <div className="flex flex-col gap-1.5 select-none">
      {/* ── VISUAL CARD (portrait reel / flyer) ── */}
      <div
        className="relative rounded-xl overflow-hidden cursor-pointer group bg-gray-900"
        style={{ aspectRatio: '9/16' }}
        onClick={() => onDetail?.(ad)}
      >

        {/* ── Thumbnail ── */}
        {thumb ? (
          <img
            src={thumb}
            alt={ad.advertiser_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Gradient placeholder when no image — looks like a UGC card */
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{
              background: `linear-gradient(160deg, hsl(${hue},55%,28%) 0%, hsl(${(hue + 50) % 360},65%,18%) 100%)`,
            }}
          >
            <span className="text-5xl font-black tracking-tight"
                  style={{ color: `hsla(${hue},40%,90%,0.15)` }}>
              {initials}
            </span>
            {isVideo
              ? <Film size={26} style={{ color: `hsla(${hue},40%,90%,0.25)` }} />
              : <ImgIcon size={26} style={{ color: `hsla(${hue},40%,90%,0.25)` }} />}
          </div>
        )}

        {/* ── Gradients ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* top vignette */}
          <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/65 to-transparent" />
          {/* bottom vignette */}
          <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        {/* ── Score pill (top-left) ── */}
        <div className="absolute top-2.5 left-2.5 z-10">
          <span className={`${scoreBg} text-white text-[10px] font-black px-2 py-[3px] rounded-full flex items-center gap-0.5 shadow-lg`}>
            {emoji} {score}
          </span>
        </div>

        {/* ── Status + format (top-right) ── */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1">
          {isActive && (
            <span className="flex items-center gap-[3px] bg-green-500/80 backdrop-blur-sm text-white text-[9px] font-bold px-1.5 py-[3px] rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </span>
          )}
          {isVideo && (
            <span className="bg-black/50 backdrop-blur-sm text-white/90 text-[9px] font-bold px-1.5 py-[3px] rounded-full">
              REEL
            </span>
          )}
        </div>

        {/* ── Rank ── */}
        {rank && rank <= 10 && (
          <div className="absolute top-10 left-3 z-10">
            <span className="text-white/40 text-[10px] font-bold">#{rank}</span>
          </div>
        )}

        {/* ── Play button (videos) ── */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/25 flex items-center justify-center shadow-xl">
              <Play size={18} className="text-white fill-white ml-0.5" />
            </div>
          </div>
        )}

        {/* ── Bottom info overlay ── */}
        <div className="absolute bottom-0 inset-x-0 p-3 z-10">
          <div className="flex items-start justify-between gap-1 mb-1">
            <p className="text-white font-semibold text-[13px] leading-tight truncate max-w-[78%] drop-shadow">
              {ad.advertiser_name}
            </p>
            <span className="text-base leading-none mt-0.5 shrink-0">{flag}</span>
          </div>

          {ad.primary_text && (
            <p className="text-white/70 text-[11px] leading-snug line-clamp-2">
              {ad.primary_text}
            </p>
          )}

          <div className="flex items-center gap-1.5 mt-1.5">
            <span className="text-white/45 text-[10px]">
              {days > 0 ? `${days}d` : 'Nuevo'}
            </span>
            <span className="text-white/25">·</span>
            <span className="text-white/45 text-[10px]">{spend}</span>
            {ad.industry && (
              <>
                <span className="text-white/25">·</span>
                <span className="text-white/40 text-[10px] capitalize">{ad.industry}</span>
              </>
            )}
          </div>
        </div>

        {/* ── Hover action overlay ── */}
        <div className="absolute inset-0 z-20 flex items-end justify-center pb-5 gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-black/20">
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 bg-white text-black text-[11px] font-bold px-3.5 py-2 rounded-full shadow-xl hover:scale-105 transition-transform"
          >
            {saved
              ? <><BookmarkCheck size={12} className="text-emerald-600" /> Guardado</>
              : <><Bookmark size={12} /> Guardar</>
            }
          </button>
          {/* Link a todos los anuncios de la marca en Meta Ad Library */}
          {ad.advertiser_page_id ? (
            <a
              href={`https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&search_type=page&view_all_page_id=${ad.advertiser_page_id}&sort_data[direction]=desc&sort_data[mode]=total_impressions`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-white/15 border border-white/30 text-white text-[11px] font-medium px-3.5 py-2 rounded-full backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <ExternalLink size={11} /> Meta
            </a>
          ) : ad.ad_snapshot_url ? (
            <a
              href={ad.ad_snapshot_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={e => e.stopPropagation()}
              className="flex items-center gap-1.5 bg-white/15 border border-white/30 text-white text-[11px] font-medium px-3.5 py-2 rounded-full backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              <ExternalLink size={11} /> Meta
            </a>
          ) : (
            <button
              onClick={e => { e.stopPropagation(); onDetail?.(ad) }}
              className="flex items-center gap-1.5 bg-white/15 border border-white/30 text-white text-[11px] font-medium px-3.5 py-2 rounded-full backdrop-blur-sm hover:bg-white/25 transition-colors"
            >
              Info
            </button>
          )}
        </div>
      </div>

      {/* ── Below-card minimal info ── */}
      <div className="px-0.5 flex items-center justify-between">
        <p className="text-[11px] font-medium text-notion-text truncate leading-tight">
          {ad.advertiser_name}
        </p>
        <span className={`text-[10px] font-bold shrink-0 ml-1 ${
          label === 'Fire' ? 'text-red-500' :
          label === 'Hot'  ? 'text-orange-500' :
          label === 'Warm' ? 'text-amber-500' :
          'text-notion-muted'
        }`}>
          {score}/100
        </span>
      </div>
    </div>
  )
}
