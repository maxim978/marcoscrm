'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PenLine, TrendingUp, Calendar, ChevronDown, ChevronUp, Music2 } from 'lucide-react'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import type { AdSetEntryRaw, CampaignRaw, CampaignDailyRaw } from '@/app/dashboard/tiktok-ads/page'

// ─── helpers ──────────────────────────────────────────────────────────────────

function todayStr() { return new Date().toISOString().split('T')[0] }

function fmtEur(n: number) {
  return '€' + n.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}
function fmtNum(n: number) { return n.toLocaleString('nl-NL') }
function fmtPct(n: number) { return n.toLocaleString('nl-NL', { maximumFractionDigits: 2 }) + '%' }
function shortDate(d: string) {
  return new Date(d + 'T12:00:00').toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })
}

type QuickRange = '1d' | '3d' | '7d' | '14d' | '30d' | 'ytd' | 'all' | 'custom'

const QUICK: { key: QuickRange; label: string }[] = [
  { key: '1d',     label: 'Vandaag'   },
  { key: '3d',     label: '3 dagen'   },
  { key: '7d',     label: '7 dagen'   },
  { key: '14d',    label: '14 dagen'  },
  { key: '30d',    label: '30 dagen'  },
  { key: 'ytd',    label: 'Dit jaar'  },
  { key: 'all',    label: 'Alles'     },
  { key: 'custom', label: 'Aangepast' },
]

function quickBounds(q: QuickRange): { from: string | null; to: string | null } {
  const today = todayStr()
  if (q === 'all' || q === 'custom') return { from: null, to: null }
  const d = new Date()
  if (q === '1d')  return { from: today, to: today }
  if (q === '3d')  { d.setDate(d.getDate() - 3);  return { from: d.toISOString().split('T')[0], to: today } }
  if (q === '7d')  { d.setDate(d.getDate() - 7);  return { from: d.toISOString().split('T')[0], to: today } }
  if (q === '14d') { d.setDate(d.getDate() - 14); return { from: d.toISOString().split('T')[0], to: today } }
  if (q === '30d') { d.setDate(d.getDate() - 30); return { from: d.toISOString().split('T')[0], to: today } }
  if (q === 'ytd') return { from: `${d.getFullYear()}-01-01`, to: today }
  return { from: null, to: null }
}

const ADSET_COLORS = ['#3071d8', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

// ─── KPI card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-xl font-bold text-slate-800 leading-none">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

// ─── Release campaign card ─────────────────────────────────────────────────────

interface ReleaseCampaignCardProps {
  campaign: CampaignRaw
  adsetEntries: AdSetEntryRaw[]
  campaignDaily: CampaignDailyRaw[]
  from: string | null
  to: string | null
}

function ReleaseCampaignCard({ campaign, adsetEntries, campaignDaily, from, to }: ReleaseCampaignCardProps) {
  const [open, setOpen] = useState(false)

  function inRange(datum: string) {
    if (from && datum < from) return false
    if (to   && datum > to)   return false
    return true
  }

  const filteredEntries = useMemo(() => adsetEntries.filter(e => inRange(e.datum)), [adsetEntries, from, to])
  const filteredDaily   = useMemo(() => campaignDaily.filter(d => inRange(d.datum)), [campaignDaily, from, to])

  // Summary stats
  const totalSpend     = filteredEntries.reduce((s, e) => s + (e.spend     ?? 0), 0)
  const totalFollowers = filteredEntries.reduce((s, e) => s + (e.followers ?? 0), 0)
  const totalStreams    = filteredDaily.reduce((s, d) => s + (d.streams        ?? 0), 0)
  const totalPlaylists = filteredDaily.reduce((s, d) => s + (d.playlist_saves ?? 0), 0)

  // Per-adset volgers per dag chart
  const adsetNames = useMemo(() => {
    const seen = new Map<string, string>()
    for (const e of adsetEntries) {
      if (e.adset && !seen.has(e.adset_id)) seen.set(e.adset_id, e.adset.name)
    }
    return seen
  }, [adsetEntries])

  const adsetChartData = useMemo(() => {
    const byDate: Record<string, Record<string, number>> = {}
    for (const e of filteredEntries) {
      if (!byDate[e.datum]) byDate[e.datum] = {}
      const name = adsetNames.get(e.adset_id) ?? e.adset_id
      byDate[e.datum][name] = (byDate[e.datum][name] ?? 0) + (e.followers ?? 0)
    }
    return Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b))
      .map(([d, v]) => ({ datum: shortDate(d), ...v }))
  }, [filteredEntries, adsetNames])

  const adsetList = useMemo(() => Array.from(adsetNames.values()), [adsetNames])

  // Streams + playlist saves per dag chart
  const releaseChartData = useMemo(() => {
    const byDate: Record<string, { streams: number; playlist_saves: number }> = {}
    for (const d of filteredDaily) {
      byDate[d.datum] = { streams: d.streams ?? 0, playlist_saves: d.playlist_saves ?? 0 }
    }
    return Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b))
      .map(([d, v]) => ({ datum: shortDate(d), ...v }))
  }, [filteredDaily])

  const hasAdData      = filteredEntries.length > 0
  const hasReleaseData = filteredDaily.length > 0
  const hasAny         = hasAdData || hasReleaseData

  return (
    <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
      {/* Card header */}
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50/60 transition-colors text-left"
      >
        <div className="w-9 h-9 rounded-xl bg-[#3071d8]/10 flex items-center justify-center shrink-0">
          <Music2 className="h-4.5 w-4.5 text-[#3071d8]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-slate-800 truncate">{campaign.name}</p>
          {hasAny ? (
            <div className="flex flex-wrap gap-3 mt-1">
              <span className="text-xs text-slate-400">€{totalSpend.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              <span className="text-xs text-green-600">+{fmtNum(totalFollowers)} volgers</span>
              {totalStreams > 0    && <span className="text-xs text-amber-500">{fmtNum(totalStreams)} streams</span>}
              {totalPlaylists > 0 && <span className="text-xs text-purple-500">{fmtNum(totalPlaylists)} playlist saves</span>}
            </div>
          ) : (
            <p className="text-xs text-slate-300 mt-0.5">Geen data voor deze periode</p>
          )}
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-slate-300 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-300 shrink-0" />}
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-slate-100 px-5 py-5 space-y-6">
          {/* Per ad set: volgers per dag */}
          {adsetChartData.length > 0 && adsetList.length > 0 ? (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Volgers per ad set per dag</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={adsetChartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="datum" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => fmtNum(v)} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(val: unknown, name: unknown) => [fmtNum(Number(val)), String(name)]}
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
                  {adsetList.map((name, i) => (
                    <Line
                      key={name}
                      type="monotone"
                      dataKey={name}
                      stroke={ADSET_COLORS[i % ADSET_COLORS.length]}
                      strokeWidth={2}
                      dot={false}
                      connectNulls
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : hasAdData ? (
            <p className="text-xs text-slate-400">Geen ad set data beschikbaar voor deze periode.</p>
          ) : null}

          {/* Streams + playlist saves per dag */}
          {releaseChartData.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Streams &amp; playlist saves per dag</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={releaseChartData} margin={{ top: 4, right: 40, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`gPlaylist-${campaign.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#8b5cf6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="datum" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => fmtNum(v)} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                    formatter={(val: unknown, name: unknown) =>
                      name === 'streams'
                        ? [fmtNum(Number(val)), 'Streams']
                        : [fmtNum(Number(val)), 'Playlist saves']
                    }
                  />
                  <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }}
                    formatter={(n: unknown) => n === 'streams' ? 'Streams' : 'Playlist saves'}
                  />
                  <Bar         yAxisId="left"  dataKey="streams"       fill="#f59e0b" radius={[3,3,0,0]} />
                  <Line        yAxisId="right" type="monotone" dataKey="playlist_saves" stroke="#8b5cf6" strokeWidth={2} dot={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {!hasAny && (
            <div className="py-8 text-center">
              <p className="text-slate-400 text-sm">Geen data voor deze periode. Voer cijfers in via <Link href="/dashboard/tiktok-ads/invoer" className="text-[#3071d8] underline">dagelijkse invoer</Link>.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface Props {
  adsetEntries: AdSetEntryRaw[]
  campaigns: CampaignRaw[]
  campaignDaily: CampaignDailyRaw[]
  isMockMode: boolean
}

export function TikTokAdsDashboard({ adsetEntries, campaigns, campaignDaily, isMockMode }: Props) {
  const [quick, setQuick]           = useState<QuickRange>('30d')
  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().split('T')[0]
  })
  const [customTo, setCustomTo]     = useState(todayStr)

  const bounds = useMemo(() => {
    if (quick === 'custom') return { from: customFrom || null, to: customTo || null }
    return quickBounds(quick)
  }, [quick, customFrom, customTo])

  function inRange(datum: string) {
    if (bounds.from && datum < bounds.from) return false
    if (bounds.to   && datum > bounds.to)   return false
    return true
  }

  const filteredEntries = useMemo(() => adsetEntries.filter(e => inRange(e.datum)), [adsetEntries, bounds])

  // ── Ads KPIs (all campaigns combined) ──
  const kpi = useMemo(() => {
    const totalSpend     = filteredEntries.reduce((s, e) => s + (e.spend     ?? 0), 0)
    const totalImpr      = filteredEntries.reduce((s, e) => s + (e.impressions ?? 0), 0)
    const totalFollowers = filteredEntries.reduce((s, e) => s + (e.followers  ?? 0), 0)
    const rates          = filteredEntries.map(e => e.result_rate ?? 0).filter(r => r > 0)
    return {
      totalSpend, totalImpr, totalFollowers,
      avgCpm:         totalImpr      > 0 ? (totalSpend / totalImpr) * 1000        : 0,
      avgCostPerFoll: totalFollowers > 0 ? totalSpend / totalFollowers             : 0,
      avgResultRate:  rates.length   > 0 ? rates.reduce((a, b) => a + b) / rates.length : 0,
    }
  }, [filteredEntries])

  // ── Overall performance chart (spend + volgers per dag, all campaigns) ──
  const performanceData = useMemo(() => {
    const byDate: Record<string, { spend: number; followers: number }> = {}
    for (const e of filteredEntries) {
      if (!byDate[e.datum]) byDate[e.datum] = { spend: 0, followers: 0 }
      byDate[e.datum].spend     += e.spend     ?? 0
      byDate[e.datum].followers += e.followers ?? 0
    }
    return Object.entries(byDate).sort(([a],[b]) => a.localeCompare(b))
      .map(([d, v]) => ({ datum: shortDate(d), ...v }))
  }, [filteredEntries])

  // ── Per-campaign lookups ──
  const entriesByCampaign = useMemo(() => {
    const map: Record<string, AdSetEntryRaw[]> = {}
    for (const e of adsetEntries) {
      const cid = e.adset?.campaign_id
      if (!cid) continue
      if (!map[cid]) map[cid] = []
      map[cid].push(e)
    }
    return map
  }, [adsetEntries])

  const dailyByCampaign = useMemo(() => {
    const map: Record<string, CampaignDailyRaw[]> = {}
    for (const d of campaignDaily) {
      if (!map[d.campaign_id]) map[d.campaign_id] = []
      map[d.campaign_id].push(d)
    }
    return map
  }, [campaignDaily])

  const hasData = filteredEntries.length > 0

  // ── Render ──
  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#010101] via-[#1a1a2e] to-[#16213e] px-6 py-6 text-white shadow-lg">
        <div className="absolute right-0 top-0 h-full w-32 opacity-20">
          <div className="absolute right-8 top-0 h-full w-1 bg-[#fe2c55]" />
          <div className="absolute right-12 top-0 h-full w-1 bg-[#25f4ee]" />
        </div>
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center shrink-0 border border-white/20">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.2 8.2 0 0 0 4.79 1.52V6.75a4.85 4.85 0 0 1-1.02-.06z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">TikTok Ads Dashboard</h1>
              <p className="text-white/60 text-sm mt-0.5">Performance overzicht per release</p>
            </div>
          </div>
          <Link
            href="/dashboard/tiktok-ads/invoer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors shrink-0"
          >
            <PenLine className="h-4 w-4" /> Cijfers invoeren
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

      {/* ── Date filter ── */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Periode</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setQuick(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                quick === key
                  ? 'bg-[#3071d8] text-white'
                  : 'bg-slate-50 border border-slate-200 text-slate-600 hover:border-[#3071d8]/40 hover:text-[#3071d8]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        {quick === 'custom' && (
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">Van</label>
              <input
                type="date"
                value={customFrom}
                onChange={e => setCustomFrom(e.target.value)}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#3071d8]/50"
              />
            </div>
            <span className="text-slate-300">→</span>
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-400">T/m</label>
              <input
                type="date"
                value={customTo}
                onChange={e => setCustomTo(e.target.value)}
                max={todayStr()}
                className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-[#3071d8]/50"
              />
            </div>
            {bounds.from && bounds.to && (
              <span className="text-xs text-slate-400">{shortDate(bounds.from)} — {shortDate(bounds.to)}</span>
            )}
          </div>
        )}
      </div>

      {/* ── 6 TikTok KPI cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <KpiCard label="Spend"         value={fmtEur(kpi.totalSpend)} />
        <KpiCard label="CPM"           value={kpi.avgCpm > 0 ? fmtEur(kpi.avgCpm) : '—'} sub="gewogen gem." />
        <KpiCard label="Impressies"    value={fmtNum(kpi.totalImpr)} />
        <KpiCard label="Volgers"       value={fmtNum(kpi.totalFollowers)} />
        <KpiCard label="Kosten/volger" value={kpi.avgCostPerFoll > 0 ? fmtEur(kpi.avgCostPerFoll) : '—'} sub="gewogen gem." />
        <KpiCard label="Resultaat %"   value={kpi.avgResultRate > 0 ? fmtPct(kpi.avgResultRate) : '—'} sub="gemiddelde" />
      </div>

      {/* ── Overall performance chart ── */}
      {hasData && performanceData.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5">
          <h2 className="text-sm font-bold text-slate-700 mb-4">Spend &amp; Volgers per dag — alle campagnes</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={performanceData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3071d8" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3071d8" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gFoll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="datum" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <YAxis yAxisId="left"  tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} tickFormatter={v => '€'+v} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 12 }}
                formatter={(val: unknown, name: unknown) =>
                  name === 'spend'
                    ? ['€' + Number(val).toLocaleString('nl-NL', { minimumFractionDigits: 2 }), 'Spend']
                    : [Number(val).toLocaleString('nl-NL'), 'Volgers']
                }
              />
              <Legend formatter={(n: unknown) => n === 'spend' ? 'Spend' : 'Volgers'} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              <Area yAxisId="left"  type="monotone" dataKey="spend"     stroke="#3071d8" strokeWidth={2} fill="url(#gSpend)" dot={false} />
              <Area yAxisId="right" type="monotone" dataKey="followers" stroke="#10b981" strokeWidth={2} fill="url(#gFoll)"  dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Release cards ── */}
      {campaigns.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-slate-700">Releases</h2>
          {campaigns.map(campaign => (
            <ReleaseCampaignCard
              key={campaign.id}
              campaign={campaign}
              adsetEntries={entriesByCampaign[campaign.id] ?? []}
              campaignDaily={dailyByCampaign[campaign.id] ?? []}
              from={bounds.from}
              to={bounds.to}
            />
          ))}
        </div>
      )}

      {!hasData && campaigns.length === 0 && (
        <div className="bg-white border border-dashed border-slate-200 rounded-2xl py-20 text-center">
          <TrendingUp className="h-8 w-8 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Geen data voor deze periode</p>
          <p className="text-slate-300 text-sm mt-1">Maak eerst een campagne aan via de invoerpagina</p>
        </div>
      )}
    </div>
  )
}
