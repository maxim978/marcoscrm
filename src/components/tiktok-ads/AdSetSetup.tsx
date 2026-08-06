'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveAdSetsForCampaign } from '@/app/actions/tiktok-ads-structure'

interface Props {
  campaignId: string
  initialNames?: string[]
  onDone: () => void
  onCancel?: () => void
}

export function AdSetSetup({ campaignId, initialNames, onDone, onCancel }: Props) {
  const [names, setNames] = useState<string[]>(initialNames ?? ['Ad set 1', 'Ad set 2', 'Ad set 3'])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addAdSet() {
    setNames(prev => [...prev, `Ad set ${prev.length + 1}`])
  }

  function removeAdSet(i: number) {
    setNames(prev => prev.filter((_, j) => j !== i))
  }

  async function handleSave() {
    if (names.some(n => !n.trim())) {
      setError('Vul alle namen in.')
      return
    }
    setSaving(true)
    const result = await saveAdSetsForCampaign(campaignId, names)
    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      onDone()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
          Ad sets
        </label>
        {names.map((name, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300 w-5 text-right">{i + 1}</span>
            <input
              value={name}
              onChange={e => setNames(prev => prev.map((n, j) => j === i ? e.target.value : n))}
              placeholder={`Ad set ${i + 1}`}
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3071d8]/40"
            />
            {names.length > 1 && (
              <button onClick={() => removeAdSet(i)} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addAdSet}
          className="text-xs text-[#3071d8] hover:underline flex items-center gap-1 mt-1"
        >
          <Plus className="h-3.5 w-3.5" /> Ad set toevoegen
        </button>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        {onCancel && (
          <Button variant="outline" onClick={onCancel} disabled={saving} className="text-sm">
            Annuleren
          </Button>
        )}
        <Button onClick={handleSave} disabled={saving} className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2">
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          Opslaan
        </Button>
      </div>
    </div>
  )
}
