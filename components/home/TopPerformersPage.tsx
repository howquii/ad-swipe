'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { Ad, SearchFilters } from '@/types/ad'
import AdCard from '@/components/ads/AdCard'
import AdDetail from '@/components/ads/AdDetail'
import SaveModal from '@/components/collections/SaveModal'
import FilterBar from '@/components/home/FilterBar'
import { Loader2, Zap } from 'lucide-react'

const PAGE_SIZE = 60

// Filters WITHOUT page — page is tracked separately to avoid double-fetch
type Filters = Omit<SearchFilters, 'page'>

export default function TopPerformersPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [saveAd, setSaveAd] = useState<Ad | null>(null)
  const [filters, setFilters] = useState<Filters>({ sort: 'score', min_score: 0 })
  const pageRef = useRef(0)

  const fetchAds = useCallback(async (f: Filters, pg: number, append = false) => {
    if (!append) setLoading(true)
    else setLoadingMore(true)

    const params = new URLSearchParams()
    if (f.country)    params.set('country', f.country)
    if (f.industry)   params.set('industry', f.industry)
    if (f.media_type) params.set('media_type', f.media_type)
    if (f.min_score)  params.set('min_score', String(f.min_score))
    if (f.sort)       params.set('sort', f.sort)
    params.set('page', String(pg))

    try {
      const res = await fetch(`/api/top-ads?${params}`)
      const json = await res.json()
      setTotal(json.total ?? 0)
      setAds(prev => append ? [...prev, ...(json.ads ?? [])] : (json.ads ?? []))
    } catch {
      // ignore
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  // When filters change: reset page and fetch from 0
  useEffect(() => {
    pageRef.current = 0
    fetchAds(filters, 0)
  }, [filters, fetchAds])

  function handleFilterChange(partial: Partial<Filters>) {
    setFilters(prev => ({ ...prev, ...partial }))
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const res = await fetch('/api/seed', { method: 'POST' })
      const json = await res.json()
      if (json.ok) fetchAds(filters, 0)
    } catch { /* ignore */ }
    setSeeding(false)
  }

  function loadMore() {
    const next = pageRef.current + 1
    pageRef.current = next
    fetchAds(filters, next, true)
  }

  const hasMore = ads.length < total && !loading && !loadingMore

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-notion-border">
        <h1 className="text-lg font-semibold text-notion-text">Top Performing Ads</h1>
        <p className="text-xs text-notion-muted mt-0.5">
          Ads ordered by performance score — scraped from Meta Ad Library
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        filters={filters as SearchFilters}
        total={total}
        onChange={handleFilterChange}
      />

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={24} className="animate-spin text-notion-muted" />
          </div>
        ) : ads.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 gap-4">
            <Zap size={40} className="text-notion-border" />
            <div className="text-center">
              <p className="font-medium text-notion-text">No hay ads</p>
              <p className="text-sm text-notion-muted mt-1">
                Haz seed para cargar los top performers
              </p>
            </div>
            <button
              onClick={handleSeed}
              disabled={seeding}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-full hover:opacity-90 disabled:opacity-50"
            >
              {seeding ? (
                <><Loader2 size={14} className="animate-spin" /> Cargando…</>
              ) : (
                <><Zap size={14} /> Seed Top Performers</>
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
              {ads.map((ad, i) => (
                <AdCard
                  key={ad.id}
                  ad={ad}
                  rank={i + 1}
                  onSave={setSaveAd}
                  onDetail={setSelectedAd}
                />
              ))}
            </div>

            {hasMore && (
              <div className="flex justify-center mt-6 mb-4">
                <button
                  onClick={loadMore}
                  className="px-5 py-2 text-sm border border-notion-border rounded-full hover:bg-notion-hover transition-colors"
                >
                  Cargar más ({total - ads.length} restantes)
                </button>
              </div>
            )}

            {loadingMore && (
              <div className="flex justify-center mt-4">
                <Loader2 size={18} className="animate-spin text-notion-muted" />
              </div>
            )}
          </>
        )}
      </div>

      {selectedAd && (
        <AdDetail
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onSave={setSaveAd}
        />
      )}
      {saveAd && (
        <SaveModal ad={saveAd} onClose={() => setSaveAd(null)} />
      )}
    </div>
  )
}
