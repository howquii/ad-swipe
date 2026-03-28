'use client'
import { useState } from 'react'
import { Ad, ScrapeJob } from '@/types/ad'
import Sidebar from '@/components/layout/Sidebar'
import AdCard from '@/components/ads/AdCard'
import AdDetail from '@/components/ads/AdDetail'
import SaveModal from '@/components/collections/SaveModal'
import { Search, Loader2, AlertCircle } from 'lucide-react'

const COUNTRIES = [
  { value: 'ALL', label: 'All Countries' },
  { value: 'PE',  label: '🇵🇪 Perú' },
  { value: 'MX',  label: '🇲🇽 México' },
  { value: 'CO',  label: '🇨🇴 Colombia' },
  { value: 'AR',  label: '🇦🇷 Argentina' },
  { value: 'US',  label: '🇺🇸 USA' },
  { value: 'ES',  label: '🇪🇸 España' },
]

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [country, setCountry] = useState('ALL')
  const [ads, setAds] = useState<Ad[]>([])
  const [job, setJob] = useState<ScrapeJob | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const [saveAd, setSaveAd] = useState<Ad | null>(null)

  async function handleSearch() {
    if (!query.trim()) return
    setLoading(true)
    setAds([])
    setJob(null)

    try {
      // First check DB for existing results
      const res = await fetch(
        `/api/search?query=${encodeURIComponent(query)}&country=${country}`
      )
      const json = await res.json()

      if (json.ads?.length > 0) {
        setAds(json.ads)
        setLoading(false)
        return
      }

      // Start scrape job
      const scrapeRes = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, country }),
      })
      const scrapeJson = await scrapeRes.json()
      const jobId = scrapeJson.jobId

      if (!jobId) {
        setLoading(false)
        return
      }

      // Poll until done
      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        try {
          const statusRes = await fetch(`/api/scrape/${jobId}`)
          const status = await statusRes.json()
          setJob(status)

          if (status.status === 'done' || status.status === 'error' || attempts > 60) {
            clearInterval(poll)
            setLoading(false)
            if (status.status === 'done') {
              // Refetch ads
              const r2 = await fetch(
                `/api/search?query=${encodeURIComponent(query)}&country=${country}`
              )
              const j2 = await r2.json()
              setAds(j2.ads ?? [])
            }
          }
        } catch {
          clearInterval(poll)
          setLoading(false)
        }
      }, 3000)
    } catch {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen bg-notion-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header + Search */}
        <div className="px-6 py-4 border-b border-notion-border bg-white">
          <h1 className="text-lg font-semibold text-notion-text mb-3">Search Ads</h1>
          <div className="flex gap-2">
            <select
              value={country}
              onChange={e => setCountry(e.target.value)}
              className="text-sm border border-notion-border rounded-md px-2.5 py-2 bg-white outline-none focus:border-notion-accent"
            >
              {COUNTRIES.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
              placeholder="Search brand, keyword…"
              className="flex-1 text-sm border border-notion-border rounded-md px-3 py-2 outline-none focus:border-notion-accent"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-notion-accent text-white text-sm rounded-md hover:opacity-90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Search size={14} />
              )}
              Search
            </button>
          </div>

          {/* Job status */}
          {job && (
            <div className="mt-2 flex items-center gap-2">
              {job.status === 'error' ? (
                <div className="flex items-center gap-1.5 text-red-500 text-xs">
                  <AlertCircle size={13} />
                  {job.error ?? 'No se pudieron cargar ads. Verifica tu conexión.'}
                </div>
              ) : (
                <p className="text-xs text-notion-muted">
                  {job.status === 'running' && 'Scraping Meta Ad Library…'}
                  {job.status === 'done' && `Found ${job.ads_found} ads`}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && ads.length === 0 && (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Loader2 size={24} className="animate-spin text-notion-muted" />
              <p className="text-sm text-notion-muted">
                {job?.status === 'running'
                  ? 'Scraping Meta Ad Library…'
                  : 'Searching…'}
              </p>
            </div>
          )}

          {!loading && ads.length === 0 && query && (
            <div className="flex items-center justify-center h-64">
              <p className="text-notion-muted text-sm">No ads found for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {ads.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
          )}
        </div>

        {selectedAd && (
          <AdDetail ad={selectedAd} onClose={() => setSelectedAd(null)} />
        )}
        {saveAd && (
          <SaveModal ad={saveAd} onClose={() => setSaveAd(null)} />
        )}
      </main>
    </div>
  )
}
