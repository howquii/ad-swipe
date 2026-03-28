'use client'
import { SearchFilters } from '@/types/ad'

const COUNTRIES = [
  { value: '', label: 'Todos' },
  { value: 'PE', label: '🇵🇪 PE' },
  { value: 'MX', label: '🇲🇽 MX' },
  { value: 'CO', label: '🇨🇴 CO' },
  { value: 'AR', label: '🇦🇷 AR' },
  { value: 'US', label: '🇺🇸 US' },
  { value: 'ES', label: '🇪🇸 ES' },
]

const INDUSTRIES = [
  { value: '', label: 'Todo' },
  { value: 'crypto', label: '₿ Crypto' },
  { value: 'banking', label: '🏦 Banca' },
  { value: 'payments', label: '💳 Pagos' },
  { value: 'investing', label: '📈 Inversión' },
]

const SCORES = [
  { value: 0, label: 'Todos' },
  { value: 65, label: '♨️ Hot' },
  { value: 85, label: '🔥 Fire' },
]

const MEDIA_TYPES = [
  { value: '', label: 'Todo' },
  { value: 'video', label: '▶ Video' },
  { value: 'image', label: '🖼 Imagen' },
  { value: 'carousel', label: '◻ Carousel' },
]

const SORTS = [
  { value: 'score', label: 'Score' },
  { value: 'spend', label: 'Spend' },
  { value: 'days', label: 'Días' },
  { value: 'recent', label: 'Reciente' },
]

interface Props {
  filters: SearchFilters
  total: number
  onChange: (f: Partial<SearchFilters>) => void
}

export default function FilterBar({ filters, total, onChange }: Props) {
  return (
    <div className="px-4 py-2.5 border-b border-notion-border bg-white space-y-2">
      {/* Row 1: country + industry */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <ChipGroup
          label="País"
          options={COUNTRIES}
          active={String(filters.country ?? '')}
          onSelect={v => onChange({ country: v || undefined, page: 0 })}
        />
        <ChipGroup
          label="Industria"
          options={INDUSTRIES}
          active={filters.industry ?? ''}
          onSelect={v => onChange({ industry: v || undefined, page: 0 })}
        />
      </div>

      {/* Row 2: score + media + sort + count */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <ChipGroup
          label="Score"
          options={SCORES.map(s => ({ value: String(s.value), label: s.label }))}
          active={String(filters.min_score ?? 0)}
          onSelect={v => onChange({ min_score: Number(v), page: 0 })}
        />
        <ChipGroup
          label="Media"
          options={MEDIA_TYPES}
          active={filters.media_type ?? ''}
          onSelect={v => onChange({ media_type: v || undefined, page: 0 })}
        />
        <ChipGroup
          label="Orden"
          options={SORTS}
          active={filters.sort ?? 'score'}
          onSelect={v => onChange({ sort: v as SearchFilters['sort'], page: 0 })}
        />
        <span className="ml-auto text-[11px] text-notion-muted shrink-0">{total} ads</span>
      </div>
    </div>
  )
}

function ChipGroup({
  label,
  options,
  active,
  onSelect,
}: {
  label: string
  options: { value: string; label: string }[]
  active: string
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-semibold text-notion-muted uppercase tracking-wide shrink-0">{label}</span>
      {options.map(o => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={`text-[11px] px-2.5 py-[3px] rounded-full border transition-all shrink-0 ${
            active === o.value
              ? 'bg-gray-900 text-white border-gray-900 font-semibold'
              : 'bg-white text-notion-text border-notion-border hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
