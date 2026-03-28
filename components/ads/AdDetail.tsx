'use client'
import { useState, useEffect } from 'react'
import { Ad, hydrateAd } from '@/types/ad'
import { getScoreEmoji } from '@/lib/enrichment/performance-scorer'
import { formatSpend } from '@/lib/enrichment/spend-estimator'
import {
  X, ExternalLink, Copy, Download, Bookmark, BookmarkCheck,
  Play, Globe, Calendar, Tag, Monitor, Film, Image as ImgIcon,
  LayoutGrid, Clock, DollarSign, TrendingUp, Building2, BarChart3,
  Loader2, ArrowUpRight,
} from 'lucide-react'

const FLAGS: Record<string, string> = {
  PE: '🇵🇪', MX: '🇲🇽', CO: '🇨🇴', AR: '🇦🇷',
  US: '🇺🇸', ES: '🇪🇸', BR: '🇧🇷', CL: '🇨🇱', ALL: '🌍',
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

function fmtSpend(min: number, max: number) {
  const f = (n: number) => n >= 1000 ? `$${(n / 1000).toFixed(1)}k` : `$${n}`
  return `${f(min)}–${f(max)}/día`
}

interface BrandStats {
  brand: { name: string; page_id?: string; meta_library_url?: string | null }
  stats: {
    total_ads: number; active_ads: number; inactive_ads: number
    avg_score: number; top_score: number
    spend_min_total: number; spend_max_total: number
    formats: Record<string, number>
    countries: string[]
    platforms: string[]
  }
}

interface Props {
  ad: Ad | null
  onClose: () => void
  onSave?: (ad: Ad) => void
}

export default function AdDetail({ ad: rawAd, onClose, onSave }: Props) {
  const [tab, setTab] = useState<'creative' | 'brand'>('creative')
  const [copied, setCopied] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [videoPlaying, setVideoPlaying] = useState(false)
  const [brand, setBrand] = useState<BrandStats | null>(null)
  const [brandLoading, setBrandLoading] = useState(false)

  const ad = rawAd ? hydrateAd(rawAd) : null

  // Load brand stats when switching to brand tab
  useEffect(() => {
    if (tab !== 'brand' || !ad || brand) return
    setBrandLoading(true)
    const params = new URLSearchParams()
    if (ad.advertiser_page_id) params.set('page_id', ad.advertiser_page_id)
    else if (ad.advertiser_name) params.set('name', ad.advertiser_name)
    fetch(`/api/brand?${params}`)
      .then(r => r.json())
      .then(setBrand)
      .finally(() => setBrandLoading(false))
  }, [tab, ad, brand])

  // Reset state when ad changes
  useEffect(() => {
    setBrand(null)
    setVideoPlaying(false)
    setTab('creative')
    setSaved(false)
  }, [rawAd?.id])

  if (!ad) return null

  const score   = ad.performance_score ?? 0
  const label   = ad.score_label ?? 'Cold'
  const emoji   = getScoreEmoji(score)
  const spend   = formatSpend(ad.estimated_spend_min ?? 0, ad.estimated_spend_max ?? 0)
  const days    = daysActive(ad.start_date, ad.end_date)
  const isActive = ad.status === 'ACTIVE'
  const isVideo  = ad.media_type === 'video'
  const scoreBg  = SCORE_BG[label] ?? 'bg-gray-400'
  const flag     = FLAGS[ad.country_code ?? ''] ?? ''
  const creatives = ad.creatives_count ?? 1

  // Meta Ad Library URL for this specific brand
  const brandLibraryUrl = ad.advertiser_page_id
    ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&search_type=page&view_all_page_id=${ad.advertiser_page_id}&sort_data[direction]=desc&sort_data[mode]=total_impressions`
    : ad.advertiser_name
      ? `https://www.facebook.com/ads/library/?active_status=active&ad_type=all&country=ALL&search_terms=${encodeURIComponent(ad.advertiser_name ?? '')}`
      : null

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
      <div className="flex-1 bg-black/30 backdrop-blur-[2px] cursor-pointer" onClick={onClose} />

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
            {brandLibraryUrl && (
              <a
                href={brandLibraryUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="Ver todos los anuncios de esta marca en Meta"
                className="shrink-0 text-blue-500 hover:text-blue-700"
              >
                <ArrowUpRight size={14} />
              </a>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-notion-hover rounded-md shrink-0">
            <X size={16} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-notion-border px-5 gap-1">
          {(['creative', 'brand'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 text-[12px] font-medium px-3 py-2.5 border-b-2 -mb-px transition-colors ${
                tab === t
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-notion-muted hover:text-notion-text'
              }`}
            >
              {t === 'creative' ? <><Film size={12} /> Creativo</> : <><Building2 size={12} /> Marca</>}
            </button>
          ))}
        </div>

        {/* ── Media ── */}
        <div className="relative bg-gray-950">
          {isVideo && ad.video_url ? (
            <div className="relative" style={{ aspectRatio: '9/16', maxHeight: '55vh' }}>
              {!videoPlaying ? (
                <div className="relative w-full h-full">
                  {ad.image_url && <img src={ad.image_url} alt="" className="w-full h-full object-cover" />}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 gap-3">
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center shadow-xl hover:scale-105 transition-transform"
                    >
                      <Play size={24} className="text-gray-900 ml-1 fill-gray-900" />
                    </button>
                    <span className="text-white/80 text-xs bg-black/30 px-2 py-1 rounded-full">Click para reproducir</span>
                  </div>
                </div>
              ) : (
                <video src={ad.video_url} controls autoPlay className="w-full h-full object-contain" style={{ maxHeight: '55vh' }} />
              )}
            </div>
          ) : ad.image_url ? (
            <div style={{ aspectRatio: '9/16', maxHeight: '55vh' }}>
              <img src={ad.image_url} alt={ad.advertiser_name} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className="h-24 flex items-center justify-center gap-2 text-gray-600">
              {isVideo ? <Film size={20} /> : <ImgIcon size={20} />}
              <span className="text-sm">Sin preview</span>
            </div>
          )}
        </div>

        {/* ── TAB: CREATIVO ── */}
        {tab === 'creative' && (
          <div className="flex-1 divide-y divide-notion-border">
            {/* Actions */}
            <div className="px-5 py-3 flex items-center gap-2 flex-wrap">
              <button
                onClick={handleSave}
                className={`flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full border transition-all ${
                  saved ? 'bg-emerald-50 border-emerald-300 text-emerald-700' : 'bg-gray-900 border-gray-900 text-white hover:opacity-90'
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
              {(ad.image_url || ad.video_url) && (
                <a
                  href={ad.video_url ?? ad.image_url}
                  download target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-notion-border hover:bg-notion-hover transition-colors"
                >
                  <Download size={12} />Descargar
                </a>
              )}
              {ad.ad_snapshot_url && (
                <a
                  href={ad.ad_snapshot_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-full border border-notion-border hover:bg-notion-hover transition-colors ml-auto"
                >
                  <ExternalLink size={12} />Ver en Meta
                </a>
              )}
            </div>

            {/* Performance */}
            <div className="px-5 py-4">
              <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">Performance</p>
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
                    <p className="text-sm text-notion-muted bg-gray-50 rounded-lg p-3 border border-notion-border">{ad.description}</p>
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
                {ad.end_date && <Detail icon={<Calendar size={13} />} label="Fin" value={fmt(ad.end_date)} />}
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
                <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">Enlaces</p>
                <div className="space-y-2">
                  {brandLibraryUrl && <LinkRow label="Meta · Todos los ads" href={brandLibraryUrl} />}
                  {ad.ad_snapshot_url && <LinkRow label="Este anuncio en Meta" href={ad.ad_snapshot_url} />}
                  {ad.video_url && <LinkRow label="Video URL" href={ad.video_url} />}
                  {ad.image_url && <LinkRow label="Imagen creativa" href={ad.image_url} />}
                </div>
              </div>
            )}

            <div className="px-5 py-3">
              <p className="text-[10px] text-notion-muted">ID: <span className="font-mono">{ad.id}</span></p>
              {ad.advertiser_page_id && (
                <p className="text-[10px] text-notion-muted">Page ID: <span className="font-mono">{ad.advertiser_page_id}</span></p>
              )}
            </div>
          </div>
        )}

        {/* ── TAB: MARCA ── */}
        {tab === 'brand' && (
          <div className="flex-1 divide-y divide-notion-border">
            {brandLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-notion-muted" />
              </div>
            ) : brand ? (
              <>
                {/* Brand header */}
                <div className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-notion-text text-lg">{brand.brand.name}</p>
                      {brand.brand.page_id && (
                        <p className="text-[11px] text-notion-muted font-mono mt-0.5">
                          Page ID: {brand.brand.page_id}
                        </p>
                      )}
                    </div>
                    {brand.brand.meta_library_url && (
                      <a
                        href={brand.brand.meta_library_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors shrink-0"
                      >
                        <ExternalLink size={12} />
                        Ver en Meta
                      </a>
                    )}
                  </div>
                </div>

                {/* Ads running stats */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
                    Anuncios activos
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <StatBox
                      value={brand.stats.total_ads}
                      label="Total en BD"
                      color="gray"
                    />
                    <StatBox
                      value={brand.stats.active_ads}
                      label="Activos"
                      color="emerald"
                      badge="LIVE"
                    />
                    <StatBox
                      value={brand.stats.inactive_ads}
                      label="Inactivos"
                      color="gray"
                    />
                  </div>
                </div>

                {/* Performance */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
                    Performance de la marca
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <Metric icon={<BarChart3 size={14} />} label="Score promedio" value={`${brand.stats.avg_score}/100`} />
                    <Metric icon={<TrendingUp size={14} />} label="Score top" value={`${brand.stats.top_score}/100`} />
                    <Metric
                      icon={<DollarSign size={14} />}
                      label="Invest. total est."
                      value={fmtSpend(brand.stats.spend_min_total, brand.stats.spend_max_total)}
                    />
                    <Metric
                      icon={<DollarSign size={14} />}
                      label="Invest. por ad est."
                      value={brand.stats.total_ads > 0
                        ? fmtSpend(
                            Math.round(brand.stats.spend_min_total / brand.stats.total_ads),
                            Math.round(brand.stats.spend_max_total / brand.stats.total_ads)
                          )
                        : '—'}
                    />
                  </div>
                </div>

                {/* Formats */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
                    Formatos
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {Object.entries(brand.stats.formats).map(([fmt, count]) => (
                      <span key={fmt} className="flex items-center gap-1 text-[12px] px-3 py-1.5 bg-gray-100 rounded-full capitalize">
                        {fmt === 'video' ? <Film size={11} /> : fmt === 'carousel' ? <LayoutGrid size={11} /> : <ImgIcon size={11} />}
                        {fmt} <span className="font-bold ml-0.5">{count}</span>
                      </span>
                    ))}
                    {Object.keys(brand.stats.formats).length === 0 && (
                      <p className="text-sm text-notion-muted">Sin datos</p>
                    )}
                  </div>
                </div>

                {/* Countries */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
                    Países donde pauta
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {brand.stats.countries.map(cc => (
                      <span key={cc} className="text-sm px-3 py-1.5 bg-gray-100 rounded-full">
                        {FLAGS[cc] ?? '🌍'} {cc}
                      </span>
                    ))}
                    {brand.stats.countries.length === 0 && (
                      <p className="text-sm text-notion-muted">Sin datos</p>
                    )}
                  </div>
                </div>

                {/* Platforms */}
                <div className="px-5 py-4">
                  <p className="text-[10px] font-semibold text-notion-muted uppercase tracking-wider mb-3">
                    Plataformas
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {brand.stats.platforms.map(p => (
                      <span key={p} className="text-[12px] px-3 py-1.5 bg-gray-100 rounded-full capitalize">{p}</span>
                    ))}
                    {brand.stats.platforms.length === 0 && (
                      <p className="text-sm text-notion-muted">Sin datos</p>
                    )}
                  </div>
                </div>

                {/* Meta CTA */}
                {brand.brand.meta_library_url && (
                  <div className="px-5 py-4">
                    <a
                      href={brand.brand.meta_library_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center gap-2 py-3 bg-[#1877F2] text-white rounded-xl font-semibold text-sm hover:opacity-90 transition-opacity"
                    >
                      <ExternalLink size={15} />
                      Ver todos los anuncios de {brand.brand.name} en Meta Ad Library
                    </a>
                  </div>
                )}
              </>
            ) : (
              <div className="px-5 py-12 text-center text-sm text-notion-muted">
                No se pudieron cargar los datos de la marca
              </div>
            )}
          </div>
        )}
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

function StatBox({ value, label, color, badge }: {
  value: number; label: string; color: string; badge?: string
}) {
  const colorMap: Record<string, string> = {
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    gray: 'text-gray-700 bg-gray-50 border-gray-200',
  }
  return (
    <div className={`rounded-lg p-3 border text-center ${colorMap[color] ?? colorMap.gray}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-[10px] font-medium mt-0.5">{label}</p>
      {badge && (
        <span className="text-[9px] font-bold bg-emerald-500 text-white px-1.5 py-[1px] rounded-full">
          {badge}
        </span>
      )}
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
        href={href} target="_blank" rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline truncate flex items-center gap-1 text-[12px]"
      >
        <ExternalLink size={10} />
        {href.slice(0, 45)}{href.length > 45 ? '…' : ''}
      </a>
    </div>
  )
}
