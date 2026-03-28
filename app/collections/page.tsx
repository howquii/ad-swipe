'use client'
import { useState, useEffect } from 'react'
import { Collection, Ad } from '@/types/ad'
import { createClient } from '@/lib/supabase/client'
import Sidebar from '@/components/layout/Sidebar'
import AdCard from '@/components/ads/AdCard'
import AdDetail from '@/components/ads/AdDetail'
import { FolderOpen, ChevronDown, ChevronRight } from 'lucide-react'

export default function CollectionsPage() {
  const [collections, setCollections] = useState<Collection[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [adsByCollection, setAdsByCollection] = useState<Record<string, Ad[]>>({})
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null)
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('collections')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data }) => setCollections(data ?? []))
  }, [])

  async function loadAds(collectionId: string) {
    if (adsByCollection[collectionId]) {
      setExpanded(expanded === collectionId ? null : collectionId)
      return
    }
    const { data } = await supabase
      .from('saved_ads')
      .select('*, ad:ads(*)')
      .eq('collection_id', collectionId)
    const ads = (data ?? []).map((row: Record<string, unknown>) => row.ad as Ad).filter(Boolean)
    setAdsByCollection(prev => ({ ...prev, [collectionId]: ads }))
    setExpanded(collectionId)
  }

  return (
    <div className="flex h-screen bg-notion-bg overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 py-4 border-b border-notion-border">
          <h1 className="text-lg font-semibold text-notion-text">Collections</h1>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <FolderOpen size={40} className="text-notion-border" />
              <p className="text-notion-muted text-sm">No collections yet. Save ads to get started.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {collections.map(col => (
                <div key={col.id} className="border border-notion-border rounded-lg bg-white">
                  <button
                    onClick={() => loadAds(col.id)}
                    className="w-full flex items-center gap-2 px-4 py-3 hover:bg-notion-hover rounded-lg transition-colors"
                  >
                    {expanded === col.id ? (
                      <ChevronDown size={15} className="text-notion-muted" />
                    ) : (
                      <ChevronRight size={15} className="text-notion-muted" />
                    )}
                    <FolderOpen size={15} className="text-notion-muted" />
                    <span className="text-sm font-medium text-notion-text">{col.name}</span>
                    <span className="ml-auto text-xs text-notion-muted">
                      {adsByCollection[col.id]?.length ?? '—'} ads
                    </span>
                  </button>

                  {expanded === col.id && adsByCollection[col.id] && (
                    <div className="px-4 pb-4">
                      {adsByCollection[col.id].length === 0 ? (
                        <p className="text-xs text-notion-muted py-2">No ads saved</p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          {adsByCollection[col.id].map(ad => (
                            <AdCard
                              key={ad.id}
                              ad={ad}
                              onDetail={setSelectedAd}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedAd && (
          <AdDetail ad={selectedAd} onClose={() => setSelectedAd(null)} />
        )}
      </main>
    </div>
  )
}
