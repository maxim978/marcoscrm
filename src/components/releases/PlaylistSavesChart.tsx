'use client'

import { useState } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertPlaylistSave, deletePlaylistSave } from '@/app/actions/release-stats'

interface SaveRow {
  id: string
  datum: string
  aantal: number
}

interface Props {
  releaseId: string
  initialSaves: SaveRow[]
}

function formatDatum(d: string) {
  return new Date(d).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

export function PlaylistSavesChart({ releaseId, initialSaves }: Props) {
  const [saves, setSaves] = useState<SaveRow[]>(initialSaves)
  const [newDatum, setNewDatum] = useState('')
  const [newAantal, setNewAantal] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAantal, setEditAantal] = useState('')

  // Bereken stijging per dag
  const savesWithStijging = saves.map((s, i) => ({
    ...s,
    stijging: i === 0 ? s.aantal : s.aantal - saves[i - 1].aantal,
  }))

  // Chart data
  const chartData = savesWithStijging.map((s) => ({
    datum: formatDatum(s.datum),
    Aantal: s.aantal,
    Stijging: s.stijging,
  }))

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newDatum || !newAantal) return
    setSaving(true)
    const result = await upsertPlaylistSave(releaseId, newDatum, parseInt(newAantal))
    if (!result.error) {
      setSaves((prev) => {
        const filtered = prev.filter((s) => s.datum !== newDatum)
        const newRow = { id: `new-${newDatum}`, datum: newDatum, aantal: parseInt(newAantal) }
        return [...filtered, newRow].sort((a, b) => a.datum.localeCompare(b.datum))
      })
      setNewDatum('')
      setNewAantal('')
    }
    setSaving(false)
  }

  async function handleEdit(row: SaveRow) {
    const val = parseInt(editAantal)
    if (isNaN(val)) return
    setSaving(true)
    await upsertPlaylistSave(releaseId, row.datum, val)
    setSaves((prev) => prev.map((s) => s.datum === row.datum ? { ...s, aantal: val } : s))
    setEditingId(null)
    setEditAantal('')
    setSaving(false)
  }

  async function handleDelete(row: SaveRow) {
    setDeletingId(row.id)
    await deletePlaylistSave(row.id, releaseId)
    setSaves((prev) => prev.filter((s) => s.id !== row.id))
    setDeletingId(null)
  }

  const latest = saves[saves.length - 1]
  const totalStijging = saves.length > 1 ? saves[saves.length - 1].aantal - saves[0].aantal : 0
  const gemStijging = saves.length > 1
    ? Math.round(totalStijging / (saves.length - 1))
    : 0

  return (
    <div className="space-y-6">
      {/* Stats */}
      {saves.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <StatBox label="Huidig totaal" value={latest?.aantal.toLocaleString('nl-NL') ?? '—'} color="blue" />
          <StatBox label="Totale groei" value={`+${totalStijging.toLocaleString('nl-NL')}`} color="green" />
          <StatBox label="Gem. per dag" value={`+${gemStijging.toLocaleString('nl-NL')}`} color="amber" />
        </div>
      )}

      {/* Grafiek */}
      {saves.length > 1 && (
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Cumulatieve playlist saves
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAantal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="datum"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                interval="preserveStartEnd"
              />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickFormatter={(v) => v.toLocaleString('nl-NL')} />
              <Tooltip
                formatter={(value) => [(value as number).toLocaleString('nl-NL'), '']}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Area
                type="monotone"
                dataKey="Aantal"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fill="url(#colorAantal)"
                dot={{ r: 3, fill: '#3b82f6' }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Invoertabel */}
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Datum</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Aantal</th>
              <th className="text-right px-4 py-2.5 text-xs font-bold text-green-500 uppercase tracking-wider">Stijging</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {savesWithStijging.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-300 text-sm">
                  Nog geen data — voeg hieronder een datum toe
                </td>
              </tr>
            ) : (
              savesWithStijging.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/60 group">
                  <td className="px-4 py-2.5 text-slate-600">
                    {new Date(row.datum).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    {editingId === row.id ? (
                      <input
                        type="number"
                        value={editAantal}
                        onChange={(e) => setEditAantal(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleEdit(row)
                          if (e.key === 'Escape') { setEditingId(null); setEditAantal('') }
                        }}
                        autoFocus
                        className="w-24 text-right border border-[#3071d8]/40 rounded px-2 py-1 text-sm focus:outline-none bg-blue-50/30"
                      />
                    ) : (
                      <button
                        onClick={() => { setEditingId(row.id); setEditAantal(String(row.aantal)) }}
                        className="font-bold text-slate-800 hover:text-[#3071d8] transition-colors"
                      >
                        {row.aantal.toLocaleString('nl-NL')}
                      </button>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <span className={`text-sm font-semibold ${row.stijging > 0 ? 'text-green-600' : 'text-slate-400'}`}>
                      {row.stijging > 0 ? '+' : ''}{row.stijging.toLocaleString('nl-NL')}
                    </span>
                  </td>
                  <td className="px-2 py-2.5">
                    <button
                      onClick={() => handleDelete(row)}
                      disabled={deletingId === row.id}
                      className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-400 transition-all ml-auto block"
                    >
                      {deletingId === row.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Invoer nieuwe rij */}
        <form onSubmit={handleAdd} className="border-t border-slate-100 bg-slate-50/50 px-4 py-3 flex gap-3 items-center">
          <input
            type="date"
            value={newDatum}
            onChange={(e) => setNewDatum(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3071d8]/50"
          />
          <input
            type="number"
            value={newAantal}
            onChange={(e) => setNewAantal(e.target.value)}
            placeholder="Totaal aantal saves"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3071d8]/50"
          />
          <Button
            type="submit"
            disabled={saving || !newDatum || !newAantal}
            className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2 h-9"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Toevoegen
          </Button>
        </form>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: 'blue' | 'green' | 'amber' }) {
  const styles = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <div className={`rounded-xl p-4 ${styles[color]}`}>
      <p className="text-xs font-semibold uppercase tracking-wider opacity-70 mb-1">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}
