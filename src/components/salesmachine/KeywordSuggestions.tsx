'use client'

import { useState, useEffect } from 'react'
import { X, Loader2, Check, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateProjectKeywords } from '@/app/actions/salesmachine/projects'
import type { SmProject } from '@/lib/salesmachine/types'

interface Category {
  name: string
  keywords: string[]
}

interface Props {
  project: SmProject
  onClose: () => void
}

export function KeywordSuggestions({ project, onClose }: Props) {
  const [categories, setCategories] = useState<Category[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetch('/api/salesmachine/generate-keywords', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: project.profile,
        existingKeywords: project.keywords,
      }),
    })
      .then((r) => r.json())
      .then((data) => setCategories(data.categories ?? []))
      .finally(() => setLoading(false))
  }, [])

  function toggle(kw: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      next.has(kw) ? next.delete(kw) : next.add(kw)
      return next
    })
  }

  async function handleSave() {
    setSaving(true)
    const merged = [...new Set([...(project.keywords ?? []), ...Array.from(selected)])]
    await updateProjectKeywords(project.id, merged)
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0d0d15] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <div>
            <h2 className="font-[var(--font-syne)] font-bold text-white">AI Zoekwoorden suggesties</h2>
            <p className="text-white/30 text-xs mt-0.5">Selecteer welke je wilt toevoegen aan het project</p>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {loading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-white/30">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>AI genereert zoekwoorden...</span>
            </div>
          ) : (
            <div className="space-y-5">
              {categories.map((cat) => (
                <div key={cat.name}>
                  <h3 className="text-white/50 text-xs uppercase tracking-wider mb-2 font-medium">{cat.name}</h3>
                  <div className="flex flex-wrap gap-2">
                    {cat.keywords.map((kw) => {
                      const isExisting = project.keywords?.includes(kw)
                      const isSelected = selected.has(kw)
                      return (
                        <button
                          key={kw}
                          onClick={() => !isExisting && toggle(kw)}
                          disabled={isExisting}
                          className={`
                            px-3 py-1.5 rounded-full text-sm transition-all flex items-center gap-1.5
                            ${isExisting ? 'bg-green-500/10 text-green-400/50 cursor-default' : ''}
                            ${isSelected && !isExisting ? 'bg-violet-600 text-white' : ''}
                            ${!isSelected && !isExisting ? 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white' : ''}
                          `}
                        >
                          {isExisting ? <Check className="w-3 h-3" /> : isSelected ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                          {kw}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-5 border-t border-white/5 flex items-center justify-between">
          <span className="text-white/30 text-sm">{selected.size} geselecteerd</span>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="border-white/10 text-white/50">Annuleren</Button>
            <Button
              onClick={handleSave}
              disabled={selected.size === 0 || saving}
              className="bg-violet-600 hover:bg-violet-500 text-white"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : `${selected.size} toevoegen`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
