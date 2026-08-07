'use client'

import { useState } from 'react'
import {
  Plus, ChevronDown, ChevronUp, Pencil, Trash2, Check, X, Loader2, Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { AdSetSetup } from './AdSetSetup'
import { AdSetDayGrid } from './AdSetDayGrid'
import {
  createCampaign, renameCampaign, deleteCampaign,
} from '@/app/actions/tiktok-ads-structure'
import type { Campaign, AdSet, AdSetEntry, CampaignDailyEntry } from '@/app/actions/tiktok-ads-structure'

interface Props {
  campaigns: Campaign[]
  adsetsByCampaign: Record<string, AdSet[]>
  entriesByAdSet: Record<string, AdSetEntry[]>
  campaignDailyByCampaign: Record<string, Record<string, CampaignDailyEntry>>
}

function today() {
  return new Date().toISOString().split('T')[0]
}

function CampaignBlock({
  campaign,
  adsets: initialAdsets,
  allEntries,
  campaignDailyByDate: initialDailyByDate,
  onDeleted,
}: {
  campaign: Campaign
  adsets: AdSet[]
  allEntries: Record<string, AdSetEntry[]>
  campaignDailyByDate: Record<string, CampaignDailyEntry>
  onDeleted: (id: string) => void
}) {
  const [adsets, setAdsets] = useState(initialAdsets)
  const [entriesByDate, setEntriesByDate] = useState<Record<string, AdSetEntry[]>>(() => {
    const byDate: Record<string, AdSetEntry[]> = {}
    for (const adset of initialAdsets) {
      for (const entry of (allEntries[adset.id] ?? [])) {
        if (!byDate[entry.datum]) byDate[entry.datum] = []
        byDate[entry.datum].push(entry)
      }
    }
    return byDate
  })

  // Collect all known dates (from adset entries OR campaign daily entries)
  const [dates, setDates] = useState<string[]>(() => {
    const known: Record<string, boolean> = {}
    for (const adset of initialAdsets) {
      for (const entry of (allEntries[adset.id] ?? [])) {
        known[entry.datum] = true
      }
    }
    for (const datum of Object.keys(initialDailyByDate)) {
      known[datum] = true
    }
    return Object.keys(known).sort((a, b) => b.localeCompare(a))
  })

  const [openDate, setOpenDate]       = useState<string | null>(null)
  const [newDate, setNewDate]         = useState(today())
  const [expanded, setExpanded]       = useState(true)
  const [editingName, setEditingName] = useState(false)
  const [nameVal, setNameVal]         = useState(campaign.name)
  const [renamingSaving, setRenamingSaving] = useState(false)
  const [showSetup, setShowSetup]     = useState(adsets.length === 0)
  const [deletingCampaign, setDeletingCampaign] = useState(false)
  const [confirmDelete, setConfirmDelete]       = useState(false)

  // Track campaign daily by date (mutable when user adds days)
  const [campaignDailyByDate, setCampaignDailyByDate] = useState(initialDailyByDate)

  async function handleRename() {
    setRenamingSaving(true)
    await renameCampaign(campaign.id, nameVal)
    setRenamingSaving(false)
    setEditingName(false)
  }

  async function handleDeleteCampaign() {
    setDeletingCampaign(true)
    await deleteCampaign(campaign.id)
    onDeleted(campaign.id)
  }

  function addDate() {
    if (dates.includes(newDate)) { setOpenDate(newDate); return }
    setDates(prev => [newDate, ...prev].sort((a, b) => b.localeCompare(a)))
    setOpenDate(newDate)
  }

  function removeDate(datum: string) {
    setDates(prev => prev.filter(d => d !== datum))
    setEntriesByDate(prev => { const n = { ...prev }; delete n[datum]; return n })
    setCampaignDailyByDate(prev => { const n = { ...prev }; delete n[datum]; return n })
  }

  const totalSpend     = Object.values(entriesByDate).flat().reduce((s, e) => s + (e.spend ?? 0), 0)
  const totalFollowers = Object.values(entriesByDate).flat().reduce((s, e) => s + (e.followers ?? 0), 0)
  const totalStreams    = Object.values(campaignDailyByDate).reduce((s, d) => s + (d.streams ?? 0), 0)

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      {/* Campaign header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
        <button
          onClick={() => setExpanded(v => !v)}
          className="text-slate-300 hover:text-slate-500 transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        {/* Editable name */}
        {editingName ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              value={nameVal}
              onChange={e => setNameVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleRename(); if (e.key === 'Escape') setEditingName(false) }}
              autoFocus
              className="font-bold text-slate-800 border-b border-[#3071d8] outline-none bg-transparent flex-1 text-sm"
            />
            <button onClick={handleRename} disabled={renamingSaving} className="text-emerald-500 hover:text-emerald-700">
              {renamingSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </button>
            <button onClick={() => { setEditingName(false); setNameVal(campaign.name) }} className="text-slate-300 hover:text-slate-500">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <span className="font-bold text-slate-800 truncate">{nameVal}</span>
            <button onClick={() => setEditingName(true)} className="text-slate-300 hover:text-slate-500 transition-colors shrink-0">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Summary */}
        {dates.length > 0 && !editingName && (
          <div className="hidden sm:flex items-center gap-3 text-xs shrink-0">
            <span className="text-slate-400">€{totalSpend.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
            <span className="text-green-600">+{totalFollowers.toLocaleString('nl-NL')} volgers</span>
            {totalStreams > 0 && <span className="text-amber-500">{totalStreams.toLocaleString('nl-NL')} streams</span>}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setShowSetup(v => !v)}
            title="Ad sets aanpassen"
            className="text-slate-300 hover:text-[#3071d8] transition-colors p-1"
          >
            <Settings2 className="h-4 w-4" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <span className="text-xs text-red-500 font-medium">Zeker?</span>
              <button onClick={handleDeleteCampaign} disabled={deletingCampaign} className="text-red-500 hover:text-red-700 p-1">
                {deletingCampaign ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => setConfirmDelete(false)} className="text-slate-300 hover:text-slate-500 p-1">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button onClick={() => setConfirmDelete(true)} className="text-slate-300 hover:text-red-400 transition-colors p-1">
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="p-5 space-y-4">
          {/* Ad set setup */}
          {showSetup ? (
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ad sets instellen</p>
              <AdSetSetup
                campaignId={campaign.id}
                initialNames={adsets.map(a => a.name)}
                onDone={() => { setShowSetup(false); window.location.reload() }}
                onCancel={adsets.length > 0 ? () => setShowSetup(false) : undefined}
              />
            </div>
          ) : (
            <>
              {/* Ad set chips */}
              <div className="flex flex-wrap gap-1.5">
                {adsets.map(a => (
                  <span key={a.id} className="text-xs bg-[#3071d8]/8 text-[#3071d8] font-medium px-2.5 py-1 rounded-full border border-[#3071d8]/15">
                    {a.name}
                  </span>
                ))}
              </div>

              {/* Add date */}
              <div className="flex flex-wrap gap-2 items-end">
                <div className="flex-1 min-w-[160px]">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Datum</label>
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

              {/* Day entries */}
              {dates.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl py-8 text-center">
                  <p className="text-slate-400 text-sm">Voeg hierboven een dag toe om te beginnen</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {dates.map(datum => {
                    const isOpen  = openDate === datum
                    const entries = entriesByDate[datum] ?? []
                    const daily   = campaignDailyByDate[datum]
                    const daySpend     = entries.reduce((s, e) => s + (e.spend     ?? 0), 0)
                    const dayFollowers = entries.reduce((s, e) => s + (e.followers ?? 0), 0)
                    const dayStreams    = daily?.streams ?? 0

                    return (
                      <div key={datum} className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          onClick={() => setOpenDate(isOpen ? null : datum)}
                          className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50/60 transition-colors"
                        >
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className="font-semibold text-slate-800 text-sm">
                              {new Date(datum + 'T12:00:00').toLocaleDateString('nl-NL', {
                                weekday: 'short', day: 'numeric', month: 'long', year: 'numeric',
                              })}
                            </span>
                            {(entries.length > 0 || daily) ? (
                              <>
                                <span className="text-xs text-slate-400">€{daySpend.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                                <span className="text-xs text-green-600">+{dayFollowers} volgers</span>
                                {dayStreams > 0 && <span className="text-xs text-amber-500">{dayStreams.toLocaleString('nl-NL')} streams</span>}
                              </>
                            ) : (
                              <span className="text-xs bg-amber-50 text-amber-500 font-semibold px-2 py-0.5 rounded-full border border-amber-200">Niet ingevuld</span>
                            )}
                          </div>
                          {isOpen ? <ChevronUp className="h-4 w-4 text-slate-300 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-300 shrink-0" />}
                        </button>

                        {isOpen && (
                          <div className="border-t border-slate-100 px-4 py-4">
                            <AdSetDayGrid
                              datum={datum}
                              adsets={adsets}
                              initialEntries={entries}
                              campaignId={campaign.id}
                              initialCampaignDaily={daily}
                              onDelete={removeDate}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function StructuredEntry({ campaigns: initialCampaigns, adsetsByCampaign, entriesByAdSet, campaignDailyByCampaign }: Props) {
  const [campaigns, setCampaigns] = useState(initialCampaigns)
  const [creating, setCreating]   = useState(false)
  const [newName, setNewName]     = useState('')
  const [saving, setSaving]       = useState(false)

  async function handleCreate() {
    if (!newName.trim()) return
    setSaving(true)
    const result = await createCampaign(newName.trim())
    if (!result.error && result.id) {
      setCampaigns(prev => [...prev, { id: result.id!, name: newName.trim(), created_at: new Date().toISOString() }])
      setNewName('')
      setCreating(false)
    }
    setSaving(false)
  }

  function removeCampaign(id: string) {
    setCampaigns(prev => prev.filter(c => c.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">{campaigns.length} campagne{campaigns.length !== 1 ? 's' : ''}</p>
        {!creating && (
          <Button
            onClick={() => setCreating(true)}
            className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2"
          >
            <Plus className="h-4 w-4" /> Nieuwe campagne
          </Button>
        )}
      </div>

      {/* Create new campaign */}
      {creating && (
        <div className="bg-white border border-[#3071d8]/30 rounded-2xl p-5 space-y-3">
          <p className="text-sm font-bold text-slate-800">Nieuwe campagne</p>
          <div className="flex gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate(); if (e.key === 'Escape') setCreating(false) }}
              placeholder="Naam van het liedje / campagne"
              autoFocus
              className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3071d8]/40"
            />
            <Button onClick={handleCreate} disabled={saving || !newName.trim()} className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2">
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              Aanmaken
            </Button>
            <Button variant="outline" onClick={() => setCreating(false)} disabled={saving}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-slate-400">Gebruik de naam van het liedje. Na het aanmaken stel je de ad sets in.</p>
        </div>
      )}

      {/* Campaign list */}
      {campaigns.length === 0 && !creating ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-16 text-center">
          <p className="text-slate-400 font-medium">Nog geen campagnes — klik op "Nieuwe campagne" om te beginnen</p>
        </div>
      ) : (
        <div className="space-y-3">
          {campaigns.map(campaign => (
            <CampaignBlock
              key={campaign.id}
              campaign={campaign}
              adsets={adsetsByCampaign[campaign.id] ?? []}
              allEntries={entriesByAdSet}
              campaignDailyByDate={campaignDailyByCampaign[campaign.id] ?? {}}
              onDeleted={removeCampaign}
            />
          ))}
        </div>
      )}
    </div>
  )
}
