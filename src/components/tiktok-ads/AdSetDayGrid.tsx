'use client'

import { useState } from 'react'
import { Loader2, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertAdSetEntry, deleteAdSetEntriesByDate } from '@/app/actions/tiktok-ads-structure'
import type { AdSet, AdSetEntry } from '@/app/actions/tiktok-ads-structure'

type InputKey = keyof Omit<AdSetEntry, 'id' | 'adset_id' | 'datum'>

const FIELDS: { key: InputKey; label: string; prefix?: string; suffix?: string }[] = [
  { key: 'spend',             label: 'Spend',             prefix: '€' },
  { key: 'cpm',               label: 'CPM',               prefix: '€' },
  { key: 'impressions',       label: 'Impressies'                      },
  { key: 'followers',         label: 'Volgers'                         },
  { key: 'cost_per_follower', label: 'Kosten per volger', prefix: '€' },
  { key: 'result_rate',       label: 'Resultaat %',       suffix: '%' },
]

function parse(raw: string): number {
  const n = parseFloat(raw.replace(',', '.'))
  return isNaN(n) ? 0 : n
}

function empty(adset_id: string, datum: string): AdSetEntry {
  return { adset_id, datum, spend: 0, cpm: 0, impressions: 0, followers: 0, cost_per_follower: 0, result_rate: 0 }
}

function entryToRaw(e: AdSetEntry): Record<InputKey, string> {
  return {
    spend:             e.spend             > 0 ? String(e.spend)             : '',
    cpm:               e.cpm               > 0 ? String(e.cpm)               : '',
    impressions:       e.impressions        > 0 ? String(e.impressions)       : '',
    followers:         e.followers          > 0 ? String(e.followers)         : '',
    cost_per_follower: e.cost_per_follower  > 0 ? String(e.cost_per_follower) : '',
    result_rate:       e.result_rate        > 0 ? String(e.result_rate)       : '',
  }
}

function fmt(key: InputKey, val: number): string {
  if (key === 'spend' || key === 'cpm' || key === 'cost_per_follower')
    return '€' + val.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  if (key === 'result_rate')
    return val.toLocaleString('nl-NL', { maximumFractionDigits: 2 }) + '%'
  return val.toLocaleString('nl-NL')
}

function totalFor(key: InputKey, adsets: AdSet[], values: Record<string, AdSetEntry>): string {
  const sum = (k: InputKey) => adsets.reduce((s, a) => s + ((values[a.id]?.[k] as number) ?? 0), 0)
  if (key === 'cpm') {
    const v = sum('impressions') > 0 ? (sum('spend') / sum('impressions')) * 1000 : 0
    return '€' + v.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (key === 'cost_per_follower') {
    const v = sum('followers') > 0 ? sum('spend') / sum('followers') : 0
    return '€' + v.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }
  if (key === 'result_rate') {
    const avg = adsets.length > 0 ? sum('result_rate') / adsets.length : 0
    return avg.toLocaleString('nl-NL', { maximumFractionDigits: 2 }) + '%'
  }
  return fmt(key, sum(key))
}

// --- DecimalInput ---
// Stores raw string while typing; only parses on blur or Enter
function DecimalInput({
  value, onChange, prefix, suffix, placeholder = '0',
}: {
  value: number
  onChange: (val: number) => void
  prefix?: string
  suffix?: string
  placeholder?: string
}) {
  const [raw, setRaw] = useState(value > 0 ? String(value) : '')
  const [focused, setFocused] = useState(false)

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setRaw(e.target.value)
    const n = parseFloat(e.target.value.replace(',', '.'))
    if (!isNaN(n)) onChange(n)
    else if (e.target.value === '') onChange(0)
  }

  function handleBlur() {
    setFocused(false)
    const n = parse(raw)
    onChange(n)
    setRaw(n > 0 ? String(n) : '')
  }

  function handleFocus() {
    setFocused(true)
    if (!focused && value > 0) setRaw(String(value))
  }

  // When parent value changes externally (e.g. clear), sync unless focused
  const display = focused ? raw : (value > 0 ? String(value) : '')

  return (
    <div className="relative">
      {prefix && (
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
          {prefix}
        </span>
      )}
      {suffix && (
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs pointer-events-none">
          {suffix}
        </span>
      )}
      <input
        type="text"
        inputMode="decimal"
        value={display}
        placeholder={placeholder}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={`w-full border border-slate-200 rounded-lg text-xs py-1.5 text-right focus:outline-none focus:border-[#3071d8]/50 bg-white ${prefix ? 'pl-6 pr-2' : suffix ? 'pl-2 pr-7' : 'px-2'}`}
      />
    </div>
  )
}

// --- Main grid ---

interface Props {
  datum: string
  adsets: AdSet[]
  initialEntries: AdSetEntry[]
  onDelete: (datum: string) => void
}

export function AdSetDayGrid({ datum, adsets, initialEntries, onDelete }: Props) {
  const init = adsets.reduce<Record<string, AdSetEntry>>((acc, a) => {
    acc[a.id] = initialEntries.find(e => e.adset_id === a.id) ?? empty(a.id, datum)
    return acc
  }, {})

  const [values, setValues] = useState(init)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [saved, setSaved]       = useState(initialEntries.length > 0)
  const [dirty, setDirty]       = useState(false)

  function set(adset_id: string, key: InputKey, val: number) {
    setValues(prev => ({ ...prev, [adset_id]: { ...prev[adset_id], [key]: val } }))
    setDirty(true)
    setSaved(false)
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

  const colCount = adsets.length
  const minWidth = colCount * 150 + 180

  return (
    <div>
      <div className="overflow-x-auto -mx-4 px-4">
        <table className="w-full text-sm border-collapse" style={{ minWidth }}>
          <thead>
            <tr className="border-b border-slate-100">
              <th className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide" style={{ width: 160 }}>
                Metric
              </th>
              {adsets.map(a => (
                <th key={a.id} className="py-2 px-2 text-center text-xs font-semibold text-slate-700">
                  {a.name}
                </th>
              ))}
              {colCount > 1 && (
                <th className="py-2 px-3 text-right text-xs font-semibold text-slate-400 uppercase tracking-wide" style={{ width: 110 }}>
                  Totaal
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {FIELDS.map(({ key, label, prefix, suffix }) => (
              <tr key={key} className="border-b border-slate-50 hover:bg-slate-50/40">
                <td className="py-1.5 px-3 text-xs text-slate-500 font-medium whitespace-nowrap">{label}</td>
                {adsets.map(a => (
                  <td key={a.id} className="py-1 px-2">
                    <DecimalInput
                      value={(values[a.id]?.[key] as number) ?? 0}
                      onChange={val => set(a.id, key, val)}
                      prefix={prefix}
                      suffix={suffix}
                    />
                  </td>
                ))}
                {colCount > 1 && (
                  <td className="py-1.5 px-3 text-right text-xs font-bold text-slate-700 whitespace-nowrap">
                    {totalFor(key, adsets, values)}
                  </td>
                )}
              </tr>
            ))}
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
