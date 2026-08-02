'use client'

import { useState } from 'react'
import { RefreshCw, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { syncAccount } from '@/app/actions/tiktok-ads'
import { SyncStatus } from './SyncStatus'
import type { TikTokAdAccount, DateRangeOption, CompareOption, SyncLog } from '@/lib/tiktok-ads/types'
import Papa from 'papaparse'
import type { DailyMetric } from '@/lib/tiktok-ads/types'

const DATE_RANGE_OPTIONS: { value: DateRangeOption; label: string }[] = [
  { value: 'today', label: 'Vandaag' },
  { value: 'yesterday', label: 'Gisteren' },
  { value: 'last7', label: 'Laatste 7 dagen' },
  { value: 'last14', label: 'Laatste 14 dagen' },
  { value: 'last30', label: 'Laatste 30 dagen' },
  { value: 'thisMonth', label: 'Deze maand' },
  { value: 'lastMonth', label: 'Vorige maand' },
]

const COMPARE_OPTIONS: { value: CompareOption; label: string }[] = [
  { value: 'none', label: 'Geen vergelijking' },
  { value: 'previousPeriod', label: 'Vorige periode' },
  { value: 'previousWeek', label: 'Vorige week' },
  { value: 'previousMonth', label: 'Vorige maand' },
]

interface DashboardHeaderProps {
  accounts: TikTokAdAccount[]
  selectedAccount: string
  onAccountChange: (id: string) => void
  dateRange: DateRangeOption
  onDateRangeChange: (range: DateRangeOption) => void
  compareWith: CompareOption
  onCompareChange: (compare: CompareOption) => void
  syncLog: SyncLog
  onSyncComplete: (log: SyncLog) => void
  dailyMetrics: DailyMetric[]
  isMockMode: boolean
}

export function DashboardHeader({
  accounts,
  selectedAccount,
  onAccountChange,
  dateRange,
  onDateRangeChange,
  compareWith,
  onCompareChange,
  syncLog,
  onSyncComplete,
  dailyMetrics,
  isMockMode,
}: DashboardHeaderProps) {
  const [syncing, setSyncing] = useState(false)

  async function handleSync() {
    setSyncing(true)
    try {
      const result = await syncAccount(selectedAccount)
      onSyncComplete(result)
    } finally {
      setSyncing(false)
    }
  }

  function handleExport() {
    const csv = Papa.unparse(dailyMetrics)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `tiktok-ads-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">TikTok Ads Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Performance overzicht en analyse van TikTok advertentiecampagnes
          </p>
          <div className="mt-2">
            <SyncStatus syncLog={syncLog} />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={handleSync}
            disabled={syncing}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            {syncing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span className="hidden sm:inline">Synchroniseer</span>
          </Button>
          <Button onClick={handleExport} variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">CSV export</span>
          </Button>
        </div>
      </div>

      {/* Filters row */}
      <div className="flex flex-wrap gap-2">
        {accounts.length > 1 && (
          <select
            value={selectedAccount}
            onChange={(e) => onAccountChange(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3071d8]/50 bg-white"
          >
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>
        )}

        <select
          value={dateRange}
          onChange={(e) => onDateRangeChange(e.target.value as DateRangeOption)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3071d8]/50 bg-white"
        >
          {DATE_RANGE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          value={compareWith}
          onChange={(e) => onCompareChange(e.target.value as CompareOption)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#3071d8]/50 bg-white"
        >
          {COMPARE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
