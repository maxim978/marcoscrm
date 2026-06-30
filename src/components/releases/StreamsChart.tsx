'use client'

import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from 'recharts'
import { Plus, Trash2, Save, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertStreamWeek, deleteStreamWeek } from '@/app/actions/release-stats'

const DAYS = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'] as const
const DAY_LABELS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']

const WEEK_COLORS = [
  '#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
]

interface StreamWeek {
  id: string
  week_number: number
  maandag: number; dinsdag: number; woensdag: number; donderdag: number
  vrijdag: number; zaterdag: number; zondag: number
}

interface Props {
  releaseId: string
  initialWeeks: StreamWeek[]
}

function weekTotal(w: StreamWeek) {
  return DAYS.reduce((s, d) => s + (w[d] || 0), 0)
}

export function StreamsChart({ releaseId, initialWeeks }: Props) {
  const [weeks, setWeeks] = useState<StreamWeek[]>(initialWeeks)
  const [saving, setSaving] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Record<string, Record<string, string>>>({})

  function getEdit(weekId: string, day: string): string {
    return editValues[weekId]?.[day] ?? ''
  }

  function setEdit(weekId: string, day: string, val: string) {
    setEditValues((prev) => ({
      ...prev,
      [weekId]: { ...(prev[weekId] ?? {}), [day]: val },
    }))
  }

  function addWeek() {
    const nextNum = weeks.length > 0 ? Math.max(...weeks.map((w) => w.week_number)) + 1 : 1
    const newWeek: StreamWeek = {
      id: `new-${nextNum}`,
      week_number: nextNum,
      maandag: 0, dinsdag: 0, woensdag: 0, donderdag: 0,
      vrijdag: 0, zaterdag: 0, zondag: 0,
    }
    setWeeks((prev) => [...prev, newWeek])
  }

  async function handleSave(week: StreamWeek) {
    setSaving(week.week_number)
    const days = {
      maandag: parseInt(getEdit(week.id, 'maandag') || String(week.maandag)) || 0,
      dinsdag: parseInt(getEdit(week.id, 'dinsdag') || String(week.dinsdag)) || 0,
      woensdag: parseInt(getEdit(week.id, 'woensdag') || String(week.woensdag)) || 0,
      donderdag: parseInt(getEdit(week.id, 'donderdag') || String(week.donderdag)) || 0,
      vrijdag: parseInt(getEdit(week.id, 'vrijdag') || String(week.vrijdag)) || 0,
      zaterdag: parseInt(getEdit(week.id, 'zaterdag') || String(week.zaterdag)) || 0,
      zondag: parseInt(getEdit(week.id, 'zondag') || String(week.zondag)) || 0,
    }
    await upsertStreamWeek(releaseId, week.week_number, days)
    setWeeks((prev) => prev.map((w) => w.week_number === week.week_number ? { ...w, ...days } : w))
    setEditValues((prev) => { const next = { ...prev }; delete next[week.id]; return next })
    setSaving(null)
    window.location.reload()
  }

  async function handleDelete(week: StreamWeek) {
    if (week.id.startsWith('new-')) { setWeeks((prev) => prev.filter((w) => w.id !== week.id)); return }
    setDeleting(week.id)
    await deleteStreamWeek(week.id, releaseId)
    setWeeks((prev) => prev.filter((w) => w.id !== week.id))
    setDeleting(null)
  }

  // Build chart data: x = dag, y per week
  const chartData = DAYS.map((day, i) => {
    const point: Record<string, number | string> = { dag: DAY_LABELS[i] }
    weeks.forEach((w) => {
      point[`Week ${w.week_number}`] = w[day] || 0
    })
    return point
  })

  return (
    <div className="space-y-6">
      {/* Grafiek */}
      {weeks.length > 0 && (
        <div className="bg-white border border-slate-100 rounded-xl p-4">
          <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">
            Streams per dag van de week
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="dag" tick={{ fontSize: 12, fill: '#94a3b8' }} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => v.toLocaleString('nl-NL')} />
              <Tooltip
                formatter={(value) => (value as number).toLocaleString('nl-NL')}
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
              />
              <Legend />
              {weeks.map((w, i) => (
                <Line
                  key={w.week_number}
                  type="monotone"
                  dataKey={`Week ${w.week_number}`}
                  stroke={WEEK_COLORS[i % WEEK_COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  label={{ position: 'top', fontSize: 10, fill: WEEK_COLORS[i % WEEK_COLORS.length] }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Invoertabel */}
      <div className="overflow-x-auto -mx-6 px-6 sm:mx-0 sm:px-0">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              <th className="text-left px-3 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider w-16">Week</th>
              {DAY_LABELS.map((d) => (
                <th key={d} className="text-center px-2 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">{d}</th>
              ))}
              <th className="text-center px-3 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Totaal</th>
              <th className="w-20"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {weeks.map((week, wi) => {
              const hasEdits = !!editValues[week.id]
              return (
                <tr key={week.id} className="hover:bg-slate-50/50 group">
                  <td className="px-3 py-2">
                    <span
                      className="inline-block w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center"
                      style={{ backgroundColor: WEEK_COLORS[wi % WEEK_COLORS.length] }}
                    >
                      {week.week_number}
                    </span>
                  </td>
                  {DAYS.map((day) => (
                    <td key={day} className="px-1 py-2 text-center">
                      <input
                        type="number"
                        value={getEdit(week.id, day) !== '' ? getEdit(week.id, day) : (week[day] || '')}
                        onChange={(e) => setEdit(week.id, day, e.target.value)}
                        placeholder="0"
                        className="w-20 text-center border border-slate-200 rounded px-1 py-1 text-sm focus:outline-none focus:border-[#3071d8]/50 focus:bg-blue-50/30"
                      />
                    </td>
                  ))}
                  <td className="px-3 py-2 text-center">
                    <span className="font-bold text-slate-700">{weekTotal(week).toLocaleString('nl-NL')}</span>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex gap-1 justify-end">
                      <Button
                        onClick={() => handleSave(week)}
                        disabled={saving === week.week_number}
                        size="sm"
                        className={`h-7 px-2 text-xs gap-1 ${hasEdits ? 'bg-[#3071d8] text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                      >
                        {saving === week.week_number ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                      </Button>
                      <Button
                        onClick={() => handleDelete(week)}
                        disabled={deleting === week.id}
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-slate-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        {deleting === week.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <Button onClick={addWeek} variant="outline" className="border-dashed border-slate-300 text-slate-500 hover:border-[#3071d8] hover:text-[#3071d8] gap-2 w-full">
        <Plus className="h-4 w-4" /> Week toevoegen
      </Button>
    </div>
  )
}
