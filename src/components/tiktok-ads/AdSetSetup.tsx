'use client'

import { useState } from 'react'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveAdSets } from '@/app/actions/tiktok-ads-structure'

interface Props {
  initial?: { campaign_name: string; names: string[] }
  onDone: () => void
}

export function AdSetSetup({ initial, onDone }: Props) {
  const [campaignName, setCampaignName] = useState(initial?.campaign_name ?? 'Campagne 1')
  const [names, setNames] = useState<string[]>(initial?.names ?? ['Ad set 1', 'Ad set 2', 'Ad set 3'])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function addAdSet() {
    setNames(prev => [...prev, `Ad set ${prev.length + 1}`])
  }

  function removeAdSet(i: number) {
    setNames(prev => prev.filter((_, j) => j !== i))
  }

  async function handleSave() {
    if (!campaignName.trim() || names.some(n => !n.trim())) {
      setError('Vul alle velden in.')
      return
    }
    setSaving(true)
    const result = await saveAdSets(names.map(name => ({ campaign_name: campaignName, name })))
    if (result.error) {
      setError(result.error)
      setSaving(false)
    } else {
      onDone()
    }
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 space-y-5 max-w-lg">
      <div>
        <h2 className="text-base font-bold text-slate-800">Campagnestructuur instellen</h2>
        <p className="text-sm text-slate-500 mt-1">
          Vul de naam van je campagne en je ad sets in. Je hoeft dit maar één keer te doen.
        </p>
      </div>

      <div>
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
          Campagnenaam
        </label>
        <input
          value={campaignName}
          onChange={e => setCampaignName(e.target.value)}
          className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3071d8]/40"
        />
      </div>

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
              <button
                onClick={() => removeAdSet(i)}
                className="text-slate-300 hover:text-red-400 transition-colors"
              >
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

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2"
      >
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Opslaan & beginnen
      </Button>
    </div>
  )
}
