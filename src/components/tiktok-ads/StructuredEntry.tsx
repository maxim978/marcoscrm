'use client'

import { useState } from 'react'
import { Plus, Settings, ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdSetSetup } from './AdSetSetup'
import { AdSetDayGrid } from './AdSetDayGrid'
import type { AdSet, AdSetEntry } from '@/app/actions/tiktok-ads-structure'

interface Props {
  adsets: AdSet[]
  entriesByDate: Record<string, AdSetEntry[]>
}

function today() {
  return new Date().toISOString().split('T')[0]
}

export function StructuredEntry({ adsets: initialAdsets, entriesByDate: initialEntries }: Props) {
  const [adsets] = useState(initialAdsets)
  const [entriesByDate, setEntriesByDate] = useState(initialEntries)
  const [showSetup, setShowSetup] = useState(false)
  const [newDate, setNewDate] = useState(today())
  const [dates, setDates] = useState<string[]>(() =>
    Object.keys(initialEntries).sort((a, b) => b.localeCompare(a))
  )
  const [openDate, setOpenDate] = useState<string | null>(null)

  if (adsets.length === 0 || showSetup) {
    return (
      <div className="space-y-3">
        {showSetup && (
          <button
            onClick={() => setShowSetup(false)}
            className="text-sm text-slate-400 hover:text-slate-600 flex items-center gap-1"
          >
            ← Terug
          </button>
        )}
        <AdSetSetup
          initial={adsets.length > 0 ? { campaign_name: adsets[0].campaign_name, names: adsets.map(a => a.name) } : undefined}
          onDone={() => window.location.reload()}
        />
      </div>
    )
  }

  function addDate() {
    if (dates.includes(newDate)) {
      setOpenDate(newDate)
      return
    }
    setDates(prev => [newDate, ...prev].sort((a, b) => b.localeCompare(a)))
    setOpenDate(newDate)
  }

  function removeDate(datum: string) {
    setDates(prev => prev.filter(d => d !== datum))
    setEntriesByDate(prev => { const n = { ...prev }; delete n[datum]; return n })
  }

  const campaignName = adsets[0].campaign_name

  // Totals per ad set over all dates
  const adsetTotals = adsets.map(a => {
    const spend = Object.values(entriesByDate).flat().filter(e => e.adset_id === a.id).reduce((s, e) => s + (e.spend ?? 0), 0)
    const followers = Object.values(entriesByDate).flat().filter(e => e.adset_id === a.id).reduce((s, e) => s + (e.followers ?? 0), 0)
    return { ...a, spend, followers }
  })

  return (
    <div className="space-y-5">
      {/* Campagne header */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Campagne</p>
            <p className="text-lg font-bold text-slate-900">{campaignName}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {adsets.map(a => (
                <span key={a.id} className="text-xs bg-[#3071d8]/8 text-[#3071d8] font-medium px-2.5 py-1 rounded-full border border-[#3071d8]/15">
                  {a.name}
                </span>
              ))}
            </div>
          </div>
          <button
            onClick={() => setShowSetup(true)}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-700 border border-slate-200 rounded-lg px-3 py-2 transition-colors shrink-0"
          >
            <Settings className="h-3.5 w-3.5" /> Structuur aanpassen
          </button>
        </div>

        {/* Totalen per ad set */}
        {dates.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {adsetTotals.map(a => (
              <div key={a.id} className="text-center">
                <p className="text-xs text-slate-400 font-medium mb-0.5">{a.name}</p>
                <p className="text-sm font-bold text-slate-700">€{a.spend.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</p>
                <p className="text-xs text-green-600">+{a.followers.toLocaleString('nl-NL')} volgers</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dag toevoegen */}
      <div className="bg-white border border-slate-100 rounded-xl p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Datum toevoegen</label>
          <input
            type="date"
            value={newDate}
            onChange={e => setNewDate(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:border-[#3071d8]/40"
          />
        </div>
        <Button onClick={addDate} className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2 self-end">
          <Plus className="h-4 w-4" /> Dag toevoegen
        </Button>
      </div>

      {/* Lijst per dag */}
      {dates.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-xl py-14 text-center">
          <p className="text-slate-400 font-medium">Nog geen data — voeg hierboven een dag toe</p>
        </div>
      ) : (
        <div className="space-y-2">
          {dates.map(datum => {
            const isOpen = openDate === datum
            const entries = entriesByDate[datum] ?? []
            const totalSpend = entries.reduce((s, e) => s + (e.spend ?? 0), 0)
            const totalFollowers = entries.reduce((s, e) => s + (e.followers ?? 0), 0)
            const hasData = entries.length > 0

            return (
              <div key={datum} className="bg-white border border-slate-100 rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenDate(isOpen ? null : datum)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-bold text-slate-800">
                      {new Date(datum + 'T12:00:00').toLocaleDateString('nl-NL', {
                        weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </span>
                    {hasData ? (
                      <>
                        <span className="text-sm text-slate-400">
                          €{totalSpend.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-sm text-green-600">+{totalFollowers.toLocaleString('nl-NL')} volgers</span>
                      </>
                    ) : (
                      <span className="text-xs bg-amber-50 text-amber-500 font-semibold px-2 py-0.5 rounded-full border border-amber-200">
                        Nog niet ingevuld
                      </span>
                    )}
                  </div>
                  {isOpen
                    ? <ChevronUp className="h-4 w-4 text-slate-300 shrink-0" />
                    : <ChevronDown className="h-4 w-4 text-slate-300 shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-slate-100 px-5 py-5">
                    <AdSetDayGrid
                      datum={datum}
                      adsets={adsets}
                      initialEntries={entries}
                      onDelete={removeDate}
                    />
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
