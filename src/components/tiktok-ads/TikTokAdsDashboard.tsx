'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PenLine, TrendingUp } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { AdSetEntryRaw, StreamWeekRaw, PlaylistSaveRaw } from '@/app/dashboard/tiktok-ads/page'

// --- Types & helpers ---

type DateRange = '7d' | '14d' | '30d' | 'ytd' | 'all'

const DATE_RANGES: { key: DateRange; label: string }[] = [
  { key: '7d',  label: '7 dagen'  },
  { key: '14d', label: '14 dagen' },
  { key: '30d', label: '30 dagen' },
  { key: 'ytd', label: 'Dit jaar' },
  { key: 'all', label: 'Alles'    },
]

function filterStart(range: DateRange): string | null {
  if (range === 'all') return null
  const d = new Date()
  if (range === '7d')  d.setDate(d.getDate() - 7)
  if (range === '14d') d.setDate(d.getDate() - 14)
  if (range === '30d') d.setDate(d.getDate() - 30)
  if (range === 'ytd') return `${d.getFullYear()}-01-01`
  return d.toISOString().split('T')[0]
}

function fmtEur(n: number) {
  return '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtNum(n: number) { return n.toLocaleString('nl-NL') }
function fmtPct(n: number) { return n.toLocaleString('nl-NL', { maximumFractionDigits: 2 }) + '%' }
function shortDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

// --- KPI Card ---
function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// --- Main component ---
interface Props {
  adsetEntries: AdSetEntryRaw[]
  streamWeeks: StreamWeekRaw[]
  playlistSaves: PlaylistSaveRaw[]
  isMockMode: boolean
}

export function TikTokAdsDashboard({ adsetEntries, streamWeeks, playlistSaves, isMockMode }: Props) {
  const [range, setRange] = useState<DateRange>('30d')

  // Filter entries by date range
  const start = filterStart(range)
  const filteredEntries = useMemo(
    () => start ? adsetEntries.filter(e => e.datum >= start) : adsetEntries,
    [adsetEntries, start]
  )
  const filteredSaves = useMemo(
    () => start ? playlistSaves.filter(s => s.datum >= start) : playlistSaves,
    [playlistSaves, start]
  )

  // --- KPI totals ---
  const kpi = useMemo(() => {
    const totalSpend      = filteredEntries.reduce((s, e) => s + (e.spend ?? 0), 0)
    const totalImpr       = filteredEntries.reduce((s, e) => s + (e.impressions ?? 0), 0)
    const totalFollowers  = filteredEntries.reduce((s, e) => s + (e.followers ?? 0), 0)
    const rates           = filteredEntries.map(e => e.result_rate ?? 0).filter(r => r > 0)
    const avgResultRate   = rates.length > 0 ? rates.reduce((a, b) => a + b) / rates.length : 0
    const avgCpm          = totalImpr > 0 ? (totalSpend / totalImpr) * 1000 : 0
    const avgCostPerFoll  = totalFollowers > 0 ? totalSpend / totalFollowers : 0
    return { totalSpend, totalImpr, totalFollowers, avgResultRate, avgCpm, avgCostPerFoll }
  }, [filteredEntries])

  // --- Performance chart (per day) ---
  const performanceData = useMemo(() => {
    const byDate: Record<string, { spend: number; impressions: number; followers: number }> = {}
    for (const e of filteredEntries) {
      if (!byDate[e.datum]) byDate[e.datum] = { spend: 0, impressions: 0, followers: 0 }
      byDate[e.datum].spend       += e.spend ?? 0
      byDate[e.datum].impressions += e.impressions ?? 0
      byDate[e.datum].followers   += e.followers ?? 0
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([datum, v]) => ({ datum: shortDate(datum), ...v }))
  }, [filteredEntries])

  // --- Campaign breakdown ---
  const campaignRows = useMemo(() => {
    const camps: Record<string, { name: string; spend: number; impressions: number; followers: number; rates: number[] }> = {}
    for (const e of filteredEntries) {
      const name = (e.adset as any)?.campaign?.name ?? (e.adset as any)?.campaign_name ?? 'Overig'
      if (!camps[name]) camps[name] = { name, spend: 0, impressions: 0, followers: 0, rates: [] }
      camps[name].spend       += e.spend ?? 0
      camps[name].impressions += e.impressions ?? 0
      camps[name].followers   += e.followers ?? 0
      if (e.result_rate > 0) camps[name].rates.push(e.result_rate)
    }
    return Object.values(camps).map(c => ({
      ...c,
      cpm:             c.impressions > 0 ? (c.spend / c.impressions) * 1000 : 0,
      costPerFollower: c.followers   > 0 ? c.spend / c.followers : 0,
      avgResultRate:   c.rates.length   > 0 ? c.rates.reduce((a, b) => a + b) / c.rates.length : 0,
    })).sort((a, b) => b.spend - a.spend)
  }, [filteredEntries])

  // --- Streams chart (per week, all time) ---
  const streamData = useMemo(() => {
    const DAYS = ['maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag', 'zondag'] as const
    const byWeek: Record<number, number> = {}
    for (const w of streamWeeks) {
      const tot = DAYS.reduce((s, d) => s + (w[d] ?? 0), 0)
      byWeek[w.week_number] = (byWeek[w.week_number] ?? 0) + tot
    }
    return Object.entries(byWeek)
      .sort(([a], [b]) => Number(a) - Number(b))
      .map(([week, streams]) => ({ week: `Wk ${week}`, streams }))
  }, [streamWeeks])

  // --- Playlist saves chart (filtered) ---
  const playlistData = useMemo(() => {
    const byDate: Record<string, number> = {}
    for (const s of filteredSaves) {
      byDate[s.datum] = (byDate[s.datum] ?? 0) + s.aantal
    }
    return Object.entries(byDate)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([datum, saves]) => ({ datum: shortDate(datum), saves }))
  }, [filteredSaves])

  const hasData = filteredEntries.length > 0

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#010101] via-[#1a1a2e] to-[#16213e] px-6 py-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-full w-32 opacity-20">
          <div className="absolute right-8  top-0 h-full w-1 bg-[#fe2c55]" />
          <div className="absolute right-12 top-0 h-full w-1 bg-[#25f4ee]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center flex-shrink-0 border border-white/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">TikTok Ads Dashboard</h1>
              <p className="text-white/60 text-sm mt-0.5">Performance overzicht van je advertentiecampagnes</p>
            </div>
          </div>
          <Link
            href="/dashboard/tiktok-ads/invoer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors shrink-0"
          >
            <PenLine className="h-4 w-4" />
            Cijfers invoeren
          </Link>
        </div>
      </div>

      {isMockMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-600">
          <span className="font-semibold">Demo modus actief</span> — zet{' '}
          <code className="bg-amber-100 px-1 rounded font-mono text-xs">TIKTOK_ADS_MOCK_MODE=false</code>{' '}
          in Vercel om echte data te laden.
        </div>
      )}

      {/* Date filter */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1">Periode</span>
        {DATE_RANGES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              range === key
                ? 'bg-[#3071d8] text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-[#3071d8]/40'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {!hasData ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-20 text-center">
          <TrendingUp className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Geen data voor deze periode</p>
          <p className="text-slate-300 text-sm mt-1">Voer cijfers in via de knop rechtsboven</p>
        </div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard label="Spend"           value={fmtEur(kpi.totalSpend)} />
            <KpiCard label="CPM"             value={fmtEur(kpi.avgCpm)}          sub="gewogen gem." />
            <KpiCard label="Impressies"      value={fmtNum(kpi.totalImpr)} />
            <KpiCard label="Volgers"         value={fmtNum(kpi.totalFollowers)} />
            <KpiCard label="Kosten/volger"   value={kpi.avgCostPerFoll > 0 ? fmtEur(kpi.avgCostPerFoll) : '—'} sub="gewogen gem." />
            <KpiCard label="Resultaat %"     value={kpi.avgResultRate > 0 ? fmtPct(kpi.avgResultRate) : '—'}  sub="gemiddelde" />
          </div>

          {/* Performance chart */}
          {performanceData.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Spend &amp; Volgers per dag</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={performanceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#3071d8" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3071d8" stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="gFoll" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="datum" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => '€' + v} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(val: unknown, name: unknown) =>
                      name === 'spend' ? ['€' + Number(val).toLocaleString('nl-NL', { minimumFractionDigits: 2 }), 'Spend']
                                       : [Number(val).toLocaleString('nl-NL'), 'Volgers']
                    }
                  />
                  <Legend formatter={n => n === 'spend' ? 'Spend' : 'Volgers'} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  <Area yAxisId="left"  type="monotone" dataKey="spend"     stroke="#3071d8" strokeWidth={2} fill="url(#gSpend)"  dot={false} />
                  <Area yAxisId="right" type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={2} fill="url(#gFoll)"   dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Campaign breakdown */}
          {campaignRows.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5">
              <h2 className="text-sm font-bold text-slate-700 mb-4">Per campagne</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {['Campagne','Spend','CPM','Impressies','Volgers','Kosten/volger','Resultaat%'].map(h => (
                        <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {campaignRows.map(c => (
                      <tr key={c.name} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-semibold text-slate-800">{c.name}</td>
                        <td className="py-2.5 px-3 text-slate-600">{fmtEur(c.spend)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.cpm > 0 ? fmtEur(c.cpm) : '—'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{fmtNum(c.impressions)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{fmtNum(c.followers)}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.costPerFollower > 0 ? fmtEur(c.costPerFollower) : '—'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{c.avgResultRate > 0 ? fmtPct(c.avgResultRate) : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Streams sectie (altijd zichtbaar, niet gefilterd op datum) */}
      {streamData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-1">Streams per week</h2>
          <p className="text-xs text-slate-400 mb-4">Totaal across alle releases</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={streamData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => v.toLocaleString('nl-NL')} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(val: unknown) => [Number(val).toLocaleString('nl-NL'), 'Streams']}
              />
              <Bar dataKey="streams" fill="#3071d8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Playlist saves sectie (gefilterd) */}
      {playlistData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-1">Playlist toevoegingen</h2>
          <p className="text-xs text-slate-400 mb-4">Totaal across alle releases · gefilterd op geselecteerde periode</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={playlistData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gPlaylist" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}   />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="datum" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(val: unknown) => [Number(val).toLocaleString('nl-NL'), 'Toevoegingen']}
              />
              <Area type="monotone" dataKey="saves" stroke="#8b5cf6" strokeWidth={2} fill="url(#gPlaylist)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
