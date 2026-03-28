'use client'
import { useState, useEffect } from 'react'
import { Ad, Collection } from '@/types/ad'
import { X, Plus, Check, Loader2 } from 'lucide-react'

interface Props {
  ad: Ad | null
  onClose: () => void
}

export default function SaveModal({ ad, onClose }: Props) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [newName, setNewName] = useState('')
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!ad) return
    fetch('/api/collections')
      .then(r => r.json())
      .then(d => setCollections(d.collections ?? []))
      .finally(() => setLoading(false))
  }, [ad])

  async function saveToCollection(collectionId: string) {
    if (!ad) return
    setSaving(collectionId)
    const res = await fetch('/api/collections/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection_id: collectionId, ad_id: ad.id }),
    })
    if (res.ok) {
      setSaved(prev => new Set([...prev, collectionId]))
    }
    setSaving(null)
  }

  async function createAndSave() {
    if (!newName.trim() || !ad) return
    setSaving('new')
    const res = await fetch('/api/collections/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ collection_name: newName.trim(), ad_id: ad.id }),
    })
    const json = await res.json()
    if (json.ok) {
      // Refresh collections list
      const r = await fetch('/api/collections')
      const d = await r.json()
      setCollections(d.collections ?? [])
      setSaved(prev => new Set([...prev, json.collection_id]))
    }
    setNewName('')
    setSaving(null)
  }

  if (!ad) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative bg-white rounded-xl border border-notion-border shadow-2xl w-80 max-h-[70vh] flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-notion-border">
          <p className="font-semibold text-sm">Guardar en colección</p>
          <button onClick={onClose} className="p-0.5 hover:bg-notion-hover rounded">
            <X size={14} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-3 space-y-1">
          {loading && (
            <div className="flex justify-center py-4">
              <Loader2 size={18} className="animate-spin text-notion-muted" />
            </div>
          )}
          {!loading && collections.length === 0 && (
            <p className="text-xs text-notion-muted text-center py-4">
              No tienes colecciones. Crea una abajo.
            </p>
          )}
          {collections.map(col => (
            <button
              key={col.id}
              onClick={() => saveToCollection(col.id)}
              disabled={saving === col.id || saved.has(col.id)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-notion-hover text-sm transition-colors"
            >
              <span className="truncate text-left">{col.name}</span>
              {saved.has(col.id) ? (
                <Check size={14} className="text-emerald-500 shrink-0" />
              ) : saving === col.id ? (
                <Loader2 size={13} className="animate-spin text-notion-muted shrink-0" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-notion-border flex gap-2">
          <input
            type="text"
            placeholder="Nueva colección…"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && createAndSave()}
            className="flex-1 text-sm px-2.5 py-1.5 border border-notion-border rounded-lg outline-none focus:border-notion-accent"
          />
          <button
            onClick={createAndSave}
            disabled={!newName.trim() || saving === 'new'}
            className="p-1.5 rounded-lg bg-gray-900 text-white disabled:opacity-40 hover:opacity-90"
          >
            {saving === 'new' ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}
