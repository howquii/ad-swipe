'use client'
import { useState } from 'react'
import { Ad, hydrateAd } from '@/types/ad'
import { getScoreEmoji } from '@/lib/enrichment/performance-scorer'
import { formatSpend } from '@/lib/enrichment/spend-estimator'
import {
  X, ExternalLink, Copy, Download, Bookmark, BookmarkCheck,
  Play, Globe, Calendar, Tag, Monitor, Film, Image as ImgIcon,
  LayoutGrid, Clock, DollarSign, TrendingUp,
} from 'lucide-react'

const FLAGS: Record<string, string> = {
  PE: '🇵🇪', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷',
  US: '🇺🇸', ES: '🇪🇸', BR: '🇧🇷', CL: '🇨🇱',
}

const SCORE_BG: Record<string, string> = {
  Fire: 'bg-red-500', Hot: 'bg-orange-400', Warm: 'bg-amber-400', Cold: 'bg-sky-400',
}

function daysActive(start?: string, end?: string): number {
  if (!start) return 0
  const s = new Date(start).getTime()
  const e = end ? new Date(end).getTime() : Date.now()
  return Math.max(0, Math.floor((e - s) / 86400000))
}

function fmt(date?: string) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' })
}

interface Props {
  ad: Ad | null
  onClose: () => void
  onSave?: (ad: Ad) => void
}

export default function AdDetail({ ad: rawAd, onClose, onSave }: Props) {
  const [copied, setCopied] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)

  if (!rawAd) return null
  const ad = hydrateAd(rawAd)

  const score = ad.performance_score ?? 0
  const label = ad.score_label ?? 'Cold'
  const emoji = getScoreEmoji(score)
  const spend = formatSpend(ad.estimated_spend_min ?? 0, ad.estimated_spend_max ?? 0)
  const days = daysActive(ad.start_date, ad.end_date)
  const isActive = ad.status === 'ACTIVE'
  const isVideo = ad.media_type === 'video'
  const scoreBg = SCORE_BG[label] ?? 'bg-gray-400'
  const flag = FLAGS[ad.country_code ?? ''] ?? ''
  const creatives = ad.creatives_count ?? 1

  function copyToClipboard(text: string, key: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  function handleSave() {
    setSaved(true)
    onSave?.(ad)
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div className="flex-1 bg-black/30 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />

      {/* Panel */}
      <aside className="w-full max-w-[560px] bg-white h-full overflow-y-auto shadow-2xl flex flex-col">

        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-white border-b border-notion-border px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`${scoreBg} text-white text-[10px] font-black px-2 py-[3px] rounded-full shrink-0`}>
              {emoji} {score}
            </span>
            <p className="font-semibold text-notion-text truncate">{ad.advertiser_name}</p>
            {isActive && (
              <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-[2px] rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> LIVE
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-notion-hover rounded-md shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ── Media ── */}
        <div className="relative bg-gray-950">
          {isVideo && ad.video_url ? (
            /* Real video player */
            <div className="relative" style={{ aspectRatio: '9/16', maxHeight: '60vh' }}>
              {!videoPlaying ? (
                <div className="relative w-full h-full">
                  {ad.image_url && (
                    <img src={ad.image_url} alt="" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 gap-3">
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    >
                      <Play size={24} className="text-gray-900 ml-1 fill-gray-900" />
                    </button>
                    <span className="text-white/80 text-xs font-medium bg-black/30 px-2 py-1 rounded-full">
                      Click para reproducir
                    </span>
                  </div>
                </div>
              ) : (
                <video
                  src={ad.video_url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                  style={{ maxHeight: '60vh' }}
                />
              )}
            </div>
          ) : ad.image_url ? (
            /* Image */
            <div className="relative" style={{ aspectRatio: '9/16', maxHeight: '60vh' }}>
              <img
                src={ad.image_url}
                alt={ad.advertiser_name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            /* No media */
            <div className="h-32 flex items-center justify-center gap-2 text-gray-500">
              {isVideo ? <Film size={24} /> : <ImgIcon size={24} />}
              <span className="text-sm">Sin preview disponible</span>
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="flex-1 divide-y divide-notion-border">

          {/* Actions row */}
          <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSave}
              className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                saved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-gray-900 border-gray-900 text-white hover:opacity-90'
              }`}
            >
              {saved ? <BookmarkCheck size={13} /> : <Bookmark size={13} />}
              {saved ? 'Guardado' : 'Guardar'}
            </button>

            {ad.primary_text && (
              <button
                onClick={() => copyToClipboard(ad.primary_text!, 'text')}
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-notion-border hover:bg-notion-hover transition-colors"
              >
                <Copy size={12} />
                {copied === 'text' ? '¡Copiado!' : 'Copiar texto'}
              </button>
            )}

            {ad.ad_snapshot_url && (
              <button
                onClick={() => copyToClipboard(ad.ad_snapshot_url!, 'link')}
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-notion-border hover:bg-notion-hover transition-colors"
              >
                <Copy size={12} />
                {copied === 'link' ? '¡Copiado!' : 'Copiar link'}
              </button>
            )}

            {(ad.image_url || ad.video_url) && (
              <a
                href={ad.video_url ?? ad.image_url}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-notion-border hover:bg-notion-hover transition-colors"
              >
                <Download size={12} />
                Descargar
              </a>
            )}

            {ad.ad_snapshot_url && (
              <a
                href={ad.ad_snapshot_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-notion-border hover:bg-notion-hover transition-colors ml-auto"
              >
                <ExternalLink size={12} />
                Ver en Meta
              </a>
            )}
          </div>

          {/* Performance */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
              Performance
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Metric icon={<TrendingUp size={14} />} label="Score" value={`${emoji} ${score}/100 · ${label}`} />
              <Metric icon={<DollarSign size={14} />} label="Spend est." value={spend} />
              <Metric icon={<Clock size={14} />} label="Días activo" value={`${days}d`} />
              <Metric icon={<LayoutGrid size={14} />} label="Creatividades" value={String(creatives)} />
            </div>
          </div>

          {/* Copy */}
          {(ad.primary_text || ad.headline || ad.description) && (
            <div className="px-5 py-4 space-y-3">
              <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider">Copy</p>

              {ad.primary_text && (
                <div>
                  <p className="text-[10px] text-notion-muted mb-1">Texto principal</p>
                  <p className="text-sm text-notion-text leading-relaxed whitespace-pre-wrap bg-gray-50 rounded-lg p-3 border border-notion-border">
                    {ad.primary_text}
                  </p>
                </div>
              )}

              {ad.headline && (
                <div>
                  <p className="text-[10px] text-notion-muted mb-1">Titular</p>
                  <p className="text-sm font-semibold text-notion-text bg-gray-50 rounded-lg p-3 border border-notion-border">
                    {ad.headline}
                  </p>
                </div>
              )}

              {ad.description && (
                <div>
                  <p className="text-[10px] text-notion-muted mb-1">Descripción</p>
                  <p className="text-sm text-notion-muted bg-gray-50 rounded-lg p-3 border border-notion-border">
                    {ad.description}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Details */}
          <div className="px-5 py-4">
            <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">Detalles</p>
            <div className="space-y-2.5">
              <Detail icon={<Globe size={13} />} label="País" value={`${flag} ${ad.country_code ?? '—'}`} />
              <Detail icon={<Tag size={13} />} label="Industria" value={ad.industry ?? '—'} capitalize />
              <Detail icon={isVideo ? <Film size={13} /> : <ImgIcon size={13} />} label="Formato" value={ad.media_type ?? '—'} capitalize />
              <Detail icon={<Monitor size={13} />} label="Plataformas" value={(ad.publisher_platforms ?? []).join(' · ') || '—'} />
              <Detail icon={<Calendar size={13} />} label="Inicio" value={fmt(ad.start_date)} />
              {ad.end_date && (
                <Detail icon={<Calendar size={13} />} label="Fin" value={fmt(ad.end_date)} />
              )}
              <Detail
                icon={<span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-400'}`} />}
                label="Estado"
                value={isActive ? 'Activo' : 'Inactivo'}
              />
            </div>
          </div>

          {/* Links */}
          {(ad.ad_snapshot_url || ad.video_url || ad.image_url) && (
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
                Enlaces
              </p>
              <div className="space-y-2">
                {ad.ad_snapshot_url && (
                  <LinkRow label="Meta Ad Library" href={ad.ad_snapshot_url} />
                )}
                {ad.video_url && (
                  <LinkRow label="Video URL" href={ad.video_url} />
                )}
                {ad.image_url && (
                  <LinkRow label="Imagen creativa" href={ad.image_url} />
                )}
              </div>
            </div>
          )}

          {/* ID */}
          <div className="px-5 py-3">
            <p className="text-[10px] text-notion-muted">
              ID: <span className="font-mono">{ad.id}</span>
            </p>
          </div>

        </div>
      </aside>
    </div>
  )
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 border border-notion-border">
      <div className="flex items-center gap-1.5 text-notion-muted mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-semibold text-notion-text">{value}</p>
    </div>
  )
}

function Detail({ icon, label, value, capitalize }: {
  icon: React.ReactNode; label: string; value: string; capitalize?: boolean
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-notion-muted shrink-0">{icon}</span>
      <span className="text-[11px] text-notion-muted w-20 shrink-0">{label}</span>
      <span className={`text-sm text-notion-text ${capitalize ? 'capitalize' : ''}`}>{value}</span>
    </div>
  )
}

function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-notion-muted text-[11px] w-28 shrink-0">{label}</span>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline truncate flex items-center gap-1 text-[12px]"
      >
        <ExternalLink size={10} />
        {href.slice(0, 45)}{href.length > 45 ? '…' : ''}
      </a>
    </div>
  )
}
