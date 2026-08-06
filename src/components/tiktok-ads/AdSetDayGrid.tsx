'use client'

import { useState } from 'react'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertAdSetEntry, deleteAdSetEntriesByDate } from '@/app/actions/tiktok-ads-structure'

import type { AdSet, AdSetEntry } from '@/app/actions/tiktok-ads-structure'

type MetricKey = keyof Omit<AdSetEntry, 'id' | 'adset_id' | 'datum'>

const INPUT_METRICS: { key: MetricKey; label: string; prefix?: string; integer?: boolean }[] = [
  { key: 'spend',          label: 'Besteed',         prefix: '€' },
  { key: 'impressions',    label: 'Impressies',       integer: true },
  { key: 'reach',          label: 'Bereik',           integer: true },
  { key: 'video_views',    label: 'Videoweergaven',   integer: true },
  { key: 'clicks',         label: 'Klikken',          integer: true },
  { key: 'profile_visits', label: 'Profielbezoeken',  integer: true },
  { key: 'followers',      label: 'Nieuwe volgers',   integer: true },
  { key: 'likes',          label: 'Likes',            integer: true },
  { key: 'comments',       label: 'Comments',         integer: true },
  { key: 'shares',         label: 'Shares',           integer: true },
]

function emptyEntry(adset_id: string, datum: string): AdSetEntry {
  return {
    adset_id, datum,
    spend: 0, impressions: 0, reach: 0, video_views: 0, clicks: 0,
    profile_visits: 0, followers: 0, likes: 0, comments: 0, shares: 0,
  }
}

function calcDerived(spend: number, impressions: number, clicks: number, followers: number) {
  return {
    ctr: impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) + '%' : '—',
    cpm: impressions > 0 ? '€' + ((spend / impressions) * 1000).toFixed(2) : '—',
    cpc: clicks > 0      ? '€' + (spend / clicks).toFixed(2) : '—',
    cpf: followers > 0   ? '€' + (spend / followers).toFixed(2) : '—',
  }
}

interface Props {
  datum: string
  adsets: AdSet[]
  initialEntries: AdSetEntry[]
  onDelete: (datum: string) => void
}

export function AdSetDayGrid({ datum, adsets, initialEntries, onDelete }: Props) {
  const init = adsets.reduce<Record<string, AdSetEntry>>((acc, a) => {
    acc[a.id] = initialEntries.find(e => e.adset_id === a.id) ?? emptyEntry(a.id, datum)
    return acc
  }, {})

  const [values, setValues] = useState(init)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved] = useState(initialEntries.length > 0)
  const [dirty, setDirty] = useState(false)

  function set(adset_id: string, key: MetricKey, val: string) {
    const num = key === 'spend' ? parseFloat(val) || 0 : parseInt(val) || 0
    setValues(prev => ({ ...prev, [adset_id]: { ...prev[adset_id], [key]: num } }))
    setDirty(true)
    setSaved(false)
  }

  function total(key: MetricKey): number {
    return adsets.reduce((s, a) => s + ((values[a.id]?.[key] as number) ?? 0), 0)
  }

  async function handleSave() {
    setSaving(true)
    for (const adset of adsets) {
      await upsertAdSetEntry({ ...values[adset.id], datum })
    }
    setSaving(false)
    setSaved(true)
    setDirty(false)
  }

  async function handleDelete() {
    setDeleting(true)
    await deleteAdSetEntriesByDate(datum, adsets.map(a => a.id))
    onDelete(datum)
  }

  const tot = {
    spend: total('spend'),
    impressions: total('impressions'),
    clicks: total('clicks'),
    followers: total('followers'),
  }
  const totalDerived = calcDerived(tot.spend, tot.impressions, tot.clicks, tot.followers)

  return (
    <div>
      <div className="overflow-x-auto -mx-5 px-5">
        <table className="w-full text-sm border-collapse" style={{ minWidth: `${adsets.length * 160 + 200}px` }}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide w-36">Metric</th>
              {adsets.map(a => (
                <th key={a.id} className="py-2 px-2 text-center text-xs font-semibold text-slate-700">
                  {a.name}
                </th>
              ))}
              <th className="py-2 px-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide w-28">Totaal</th>
            </tr>
          </thead>
          <tbody>
            {INPUT_METRICS.map(({ key, label, prefix, integer }) => {
              const tot = total(key)
              return (
                <tr key={key} className="border-b border-slate-50 hover:bg-slate-50/40">
                  <td className="py-1.5 px-3 text-xs text-slate-500 font-medium whitespace-nowrap">{label}</td>
                  {adsets.map(a => (
                    <td key={a.id} className="py-1 px-2">
                      <div className="relative">
                        {prefix && (
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
                            {prefix}
                          </span>
                        )}
                        <input
                          type="number"
                          min="0"
                          step={integer ? '1' : '0.01'}
                          value={(values[a.id]?.[key] as number) || ''}
                          onChange={e => set(a.id, key, e.target.value)}
                          placeholder="0"
                          className={`w-full border border-slate-200 rounded-lg text-xs py-1.5 text-right focus:outline-none focus:border-[#3071d8]/50 bg-white ${prefix ? 'pl-6 pr-2' : 'px-2'}`}
                        />
                      </div>
                    </td>
                  ))}
                  <td className="py-1.5 px-3 text-right text-xs font-bold text-slate-700 whitespace-nowrap">
                    {prefix}
                    {key === 'spend'
                      ? tot.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                      : tot.toLocaleString('nl-NL')}
                  </td>
                </tr>
              )
            })}

            {/* Berekende rijen */}
            <tr className="border-t border-slate-200 bg-slate-50/60">
              <td className="py-1 px-3 text-xs text-slate-400 italic">CTR</td>
              {adsets.map(a => {
                const v = values[a.id]
                const d = calcDerived(v?.spend ?? 0, v?.impressions ?? 0, v?.clicks ?? 0, v?.followers ?? 0)
                return <td key={a.id} className="py-1 px-3 text-right text-xs text-slate-500">{d.ctr}</td>
              })}
              <td className="py-1 px-3 text-right text-xs font-semibold text-slate-600">{totalDerived.ctr}</td>
            </tr>
            <tr className="bg-slate-50/60">
              <td className="py-1 px-3 text-xs text-slate-400 italic">CPM</td>
              {adsets.map(a => {
                const v = values[a.id]
                const d = calcDerived(v?.spend ?? 0, v?.impressions ?? 0, v?.clicks ?? 0, v?.followers ?? 0)
                return <td key={a.id} className="py-1 px-3 text-right text-xs text-slate-500">{d.cpm}</td>
              })}
              <td className="py-1 px-3 text-right text-xs font-semibold text-slate-600">{totalDerived.cpm}</td>
            </tr>
            <tr className="bg-slate-50/60">
              <td className="py-1 px-3 text-xs text-slate-400 italic">CPC</td>
              {adsets.map(a => {
                const v = values[a.id]
                const d = calcDerived(v?.spend ?? 0, v?.impressions ?? 0, v?.clicks ?? 0, v?.followers ?? 0)
                return <td key={a.id} className="py-1 px-3 text-right text-xs text-slate-500">{d.cpc}</td>
              })}
              <td className="py-1 px-3 text-right text-xs font-semibold text-slate-600">{totalDerived.cpc}</td>
            </tr>
            <tr className="bg-slate-50/60">
              <td className="py-1 px-3 text-xs text-slate-400 italic">Kosten/volger</td>
              {adsets.map(a => {
                const v = values[a.id]
                const d = calcDerived(v?.spend ?? 0, v?.impressions ?? 0, v?.clicks ?? 0, v?.followers ?? 0)
                return <td key={a.id} className="py-1 px-3 text-right text-xs text-slate-500">{d.cpf}</td>
              })}
              <td className="py-1 px-3 text-right text-xs font-semibold text-slate-600">{totalDerived.cpf}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1"
        >
          {deleting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
          Dag verwijderen
        </button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className={`gap-2 text-sm ${saved && !dirty ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-[#3071d8] hover:bg-[#3071d8]/90'} text-white`}
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Opslaan...' : saved && !dirty ? 'Opgeslagen' : 'Opslaan'}
        </Button>
      </div>
    </div>
  )
}
