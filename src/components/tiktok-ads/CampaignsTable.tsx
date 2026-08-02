'use client'

import { useState } from 'react'
import { ChevronUp, ChevronDown, Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { METRIC_CONFIG } from '@/lib/tiktok-ads/metrics'
import type { TikTokCampaign } from '@/lib/tiktok-ads/types'
import Link from 'next/link'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  DRAFT: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actief',
  PAUSED: 'Gepauzeerd',
  COMPLETED: 'Voltooid',
  DRAFT: 'Concept',
  REJECTED: 'Afgewezen',
}

type SortKey = 'name' | 'spend' | 'impressions' | 'videoViews' | 'clicks' | 'ctr' | 'cpm' | 'followers' | 'engagementRate'

const PAGE_SIZE = 10

interface CampaignsTableProps {
  campaigns: TikTokCampaign[]
}

export function CampaignsTable({ campaigns }: CampaignsTableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [sortKey, setSortKey] = useState<SortKey>('spend')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [page, setPage] = useState(1)
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set(['reach', 'comments', 'shares', 'cpc']))
  const [showColMenu, setShowColMenu] = useState(false)

  const allStatuses = Array.from(new Set(campaigns.map((c) => c.status)))

  const filtered = campaigns
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false
      if (statusFilter !== 'all' && c.status !== statusFilter) return false
      return true
    })
    .sort((a, b) => {
      const aVal = a[sortKey] as number | string
      const bVal = b[sortKey] as number | string
      if (typeof aVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal)
      }
      return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
    })

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
    setPage(1)
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ChevronDown className="h-3 w-3 text-slate-300" />
    return sortDir === 'asc' ? (
      <ChevronUp className="h-3 w-3 text-[#3071d8]" />
    ) : (
      <ChevronDown className="h-3 w-3 text-[#3071d8]" />
    )
  }

  const colDefs: { key: string; label: string; sortKey?: SortKey; format?: (c: TikTokCampaign) => string }[] = [
    { key: 'name', label: 'Campagne', sortKey: 'name' },
    { key: 'status', label: 'Status' },
    { key: 'objective', label: 'Doel' },
    { key: 'budget', label: 'Budget', format: (c) => `€${c.budget}/dag` },
    { key: 'spend', label: 'Uitgegeven', sortKey: 'spend', format: (c) => METRIC_CONFIG.spend.format(c.spend) },
    { key: 'impressions', label: 'Impressies', sortKey: 'impressions', format: (c) => METRIC_CONFIG.impressions.format(c.impressions) },
    { key: 'videoViews', label: 'Video views', sortKey: 'videoViews', format: (c) => METRIC_CONFIG.videoViews.format(c.videoViews) },
    { key: 'clicks', label: 'Clicks', sortKey: 'clicks', format: (c) => METRIC_CONFIG.clicks.format(c.clicks) },
    { key: 'ctr', label: 'CTR', sortKey: 'ctr', format: (c) => METRIC_CONFIG.ctr.format(c.ctr) },
    { key: 'cpm', label: 'CPM', sortKey: 'cpm', format: (c) => METRIC_CONFIG.cpm.format(c.cpm) },
    { key: 'followers', label: 'Volgers', sortKey: 'followers', format: (c) => METRIC_CONFIG.followers.format(c.followers) },
    { key: 'engagementRate', label: 'Engagement', sortKey: 'engagementRate', format: (c) => `${c.engagementRate.toFixed(2)}%` },
  ]

  const visibleCols = colDefs.filter((col) => !hiddenCols.has(col.key))

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Zoek campagnes..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#3071d8]/50"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3071d8]/50 bg-white"
          >
            <option value="all">Alle statussen</option>
            {allStatuses.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s] ?? s}</option>
            ))}
          </select>

          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowColMenu((v) => !v)}
              className="gap-1.5"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Kolommen</span>
            </Button>
            {showColMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowColMenu(false)} />
                <div className="absolute right-0 top-9 z-20 bg-white border border-slate-200 rounded-xl shadow-lg p-3 w-48 space-y-1.5">
                  {colDefs.slice(4).map((col) => (
                    <label key={col.key} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!hiddenCols.has(col.key)}
                        onChange={() => {
                          setHiddenCols((prev) => {
                            const next = new Set(prev)
                            if (next.has(col.key)) next.delete(col.key)
                            else next.add(col.key)
                            return next
                          })
                        }}
                        className="rounded"
                      />
                      {col.label}
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {visibleCols.map((col) => (
                <th
                  key={col.key}
                  className={`text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap ${col.sortKey ? 'cursor-pointer hover:text-slate-600' : ''}`}
                  onClick={() => col.sortKey && toggleSort(col.sortKey)}
                >
                  <span className="flex items-center gap-1">
                    {col.label}
                    {col.sortKey && <SortIcon col={col.sortKey} />}
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide text-right">
                Actie
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map((campaign) => (
              <tr key={campaign.id} className="hover:bg-slate-50/50 group">
                {visibleCols.map((col) => (
                  <td key={col.key} className="px-3 py-3 whitespace-nowrap">
                    {col.key === 'name' ? (
                      <span className="font-semibold text-slate-800 max-w-[200px] truncate block">{campaign.name}</span>
                    ) : col.key === 'status' ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[campaign.status] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STATUS_LABELS[campaign.status] ?? campaign.status}
                      </span>
                    ) : col.key === 'objective' ? (
                      <span className="text-slate-600 text-xs">{campaign.objective}</span>
                    ) : col.format ? (
                      <span className="text-slate-700">{col.format(campaign)}</span>
                    ) : null}
                  </td>
                ))}
                <td className="px-3 py-3 text-right">
                  <Link
                    href={`/dashboard/tiktok-ads/campaigns/${campaign.id}`}
                    className="text-xs text-[#3071d8] hover:underline font-medium"
                  >
                    Detail
                  </Link>
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={visibleCols.length + 1} className="px-3 py-12 text-center text-slate-400 text-sm">
                  Geen campagnes gevonden
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {paged.map((campaign) => (
          <div key={campaign.id} className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 text-sm">{campaign.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[campaign.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {STATUS_LABELS[campaign.status] ?? campaign.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Uitgegeven', value: METRIC_CONFIG.spend.format(campaign.spend) },
                { label: 'Impressies', value: METRIC_CONFIG.impressions.format(campaign.impressions) },
                { label: 'CTR', value: METRIC_CONFIG.ctr.format(campaign.ctr) },
                { label: 'Volgers', value: METRIC_CONFIG.followers.format(campaign.followers) },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
            <Link
              href={`/dashboard/tiktok-ads/campaigns/${campaign.id}`}
              className="text-xs text-[#3071d8] font-medium hover:underline"
            >
              Bekijk details
            </Link>
          </div>
        ))}
        {paged.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">Geen campagnes gevonden</div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
          <span className="text-xs text-slate-500">
            {filtered.length} campagnes · Pagina {page} van {totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
