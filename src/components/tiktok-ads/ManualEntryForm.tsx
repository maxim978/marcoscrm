'use client'

import { useState } from 'react'
import { Loader2, Save, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertManualEntry, deleteManualEntry, type ManualDayEntry } from '@/app/actions/tiktok-ads-manual'

const FIELDS: { key: keyof ManualDayEntry; label: string; prefix?: string; suffix?: string; hint?: string }[] = [
  { key: 'spend',         label: 'Besteed',          prefix: '€', hint: 'Totaal uitgegeven budget' },
  { key: 'impressions',   label: 'Impressies',        hint: 'Aantal keer getoond' },
  { key: 'reach',         label: 'Bereik',            hint: 'Unieke personen bereikt' },
  { key: 'video_views',   label: 'Videoweergaven',    hint: 'Totaal aantal videoweergaven' },
  { key: 'clicks',        label: 'Klikken',           hint: 'Klikken op de advertentie' },
  { key: 'profile_visits',label: 'Profielbezoeken',   hint: 'Bezoeken aan je TikTok profiel' },
  { key: 'followers',     label: 'Nieuwe volgers',    hint: 'Via advertentie gewonnen volgers' },
  { key: 'likes',         label: 'Likes',             hint: 'Likes op advertentievideo\'s' },
  { key: 'comments',      label: 'Comments',          hint: 'Reacties op advertentievideo\'s' },
  { key: 'shares',        label: 'Shares',            hint: 'Gedeelde advertentievideo\'s' },
]

interface Props {
  initialEntries: ManualDayEntry[]
}

function emptyEntry(datum: string): ManualDayEntry {
  return {
    datum,
    spend: 0, impressions: 0, reach: 0, video_views: 0, clicks: 0,
    profile_visits: 0, followers: 0, likes: 0, comments: 0, shares: 0,
  }
}

function calcDerived(e: ManualDayEntry) {
  const ctr  = e.impressions > 0 ? ((e.clicks / e.impressions) * 100).toFixed(2) : '0.00'
  const cpm  = e.impressions > 0 ? ((e.spend  / e.impressions) * 1000).toFixed(2) : '0.00'
  const cpc  = e.clicks > 0      ? (e.spend   / e.clicks).toFixed(2) : '0.00'
  const cpf  = e.followers > 0   ? (e.spend   / e.followers).toFixed(2) : '0.00'
  return { ctr, cpm, cpc, cpf }
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export function ManualEntryForm({ initialEntries }: Props) {
  const [entries, setEntries] = useState<ManualDayEntry[]>(initialEntries)
  const [newDate, setNewDate]   = useState(today())
  const [openId, setOpenId]     = useState<string | null>(null)
  const [saving, setSaving]     = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [values, setValues]     = useState<Record<string, ManualDayEntry>>({})

  function getVal(datum: string): ManualDayEntry {
    return values[datum] ?? entries.find(e => e.datum === datum) ?? emptyEntry(datum)
  }

  function setField(datum: string, key: keyof ManualDayEntry, val: string) {
    setValues(prev => ({
      ...prev,
      [datum]: { ...getVal(datum), [key]: parseFloat(val) || 0 },
    }))
  }

  function addDate() {
    const exists = entries.some(e => e.datum === newDate)
    if (exists) { setOpenId(newDate); return }
    const fresh = emptyEntry(newDate)
    setEntries(prev => [fresh, ...prev].sort((a, b) => b.datum.localeCompare(a.datum)))
    setOpenId(newDate)
  }

  async function handleSave(datum: string) {
    setSaving(datum)
    const entry = getVal(datum)
    const result = await upsertManualEntry({ ...entry, datum })
    if (!result.error) {
      setEntries(prev => {
        const filtered = prev.filter(e => e.datum !== datum)
        return [...filtered, { ...entry, datum }].sort((a, b) => b.datum.localeCompare(a.datum))
      })
      setValues(prev => { const n = { ...prev }; delete n[datum]; return n })
    }
    setSaving(null)
  }

  async function handleDelete(datum: string) {
    setDeleting(datum)
    await deleteManualEntry(datum)
    setEntries(prev => prev.filter(e => e.datum !== datum))
    setDeleting(null)
    if (openId === datum) setOpenId(null)
  }

  const totalSpend     = entries.reduce((s, e) => s + (e.spend || 0), 0)
  const totalFollowers = entries.reduce((s, e) => s + (e.followers || 0), 0)
  const totalImpr      = entries.reduce((s, e) => s + (e.impressions || 0), 0)

  return (
    <div className="space-y-5">
      {/* Totalen */}
      {entries.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wider mb-1">Totaal besteed</p>
            <p className="text-2xl font-bold text-blue-700">€{totalSpend.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-400 uppercase tracking-wider mb-1">Totaal volgers</p>
            <p className="text-2xl font-bold text-amber-700">{totalFollowers.toLocaleString('nl-NL')}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Totaal impressies</p>
            <p className="text-2xl font-bold text-slate-700">{totalImpr.toLocaleString('nl-NL')}</p>
          </div>
        </div>
      )}

      {/* Nieuwe dag toevoegen */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Datum</label>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-[#3071d8]/40"
          />
        </div>
        <Button
          onClick={addDate}
          className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2 self-end"
        >
          <Plus className="h-4 w-4" />
          Dag toevoegen
        </Button>
      </div>

      {/* Lijst per dag */}
      {entries.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-14 text-center">
          <p className="text-slate-400 font-medium">Nog geen data — voeg hierboven een dag toe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map((entry) => {
            const datum   = entry.datum
            const isOpen  = openId === datum
            const val     = getVal(datum)
            const derived = calcDerived(val)
            const hasEdit = !!values[datum]
            const isSaving  = saving  === datum
            const isDeleting = deleting === datum

            return (
              <div key={datum} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                {/* Rij-header */}
                <button
                  onClick={() => setOpenId(isOpen ? null : datum)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800">
                      {new Date(datum + 'T12:00:00').toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="text-sm text-slate-400">€{(entry.spend || 0).toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                    <span className="text-sm text-slate-400">{(entry.impressions || 0).toLocaleString('nl-NL')} impressies</span>
                    <span className="text-sm text-green-600">+{entry.followers || 0} volgers</span>
                    {hasEdit && <span className="text-xs bg-amber-100 text-amber-600 font-bold px-2 py-0.5 rounded-full">Niet opgeslagen</span>}
                  </div>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-300" />}
                </button>

                {/* Invoerformulier */}
                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-5 space-y-5">
                    {/* Invoervelden */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                      {FIELDS.map(({ key, label, prefix, hint }) => (
                        <div key={key}>
                          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1" title={hint}>
                            {label}
                          </label>
                          <div className="relative">
                            {prefix && (
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">{prefix}</span>
                            )}
                            <input
                              type="number"
                              step="any"
                              min="0"
                              value={val[key] as number || ''}
                              onChange={e => setField(datum, key, e.target.value)}
                              placeholder="0"
                              className={`w-full border border-slate-200 rounded-lg py-2 text-sm focus:outline-none focus:border-[#3071d8]/40 ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Berekende metrics */}
                    <div className="grid grid-cols-4 gap-3 bg-slate-50 rounded-xl p-4">
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">CTR</p>
                        <p className="font-bold text-slate-700">{derived.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">CPM</p>
                        <p className="font-bold text-slate-700">€{derived.cpm}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">CPC</p>
                        <p className="font-bold text-slate-700">€{derived.cpc}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Kosten/volger</p>
                        <p className="font-bold text-slate-700">€{derived.cpf}</p>
                      </div>
                    </div>

                    {/* Acties */}
                    <div className="flex gap-2 justify-between">
                      <button
                        onClick={() => handleDelete(datum)}
                        disabled={isDeleting}
                        className="text-xs text-slate-300 hover:text-red-400 transition-colors flex items-center gap-1"
                      >
                        {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Dag verwijderen
                      </button>
                      <Button
                        onClick={() => handleSave(datum)}
                        disabled={isSaving}
                        className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2"
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Opslaan
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
