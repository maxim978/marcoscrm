'use client'

import { useState } from 'react'
import Link from 'next/link'
import { PenLine } from 'lucide-react'
import { KpiCard } from './KpiCard'
import { PerformanceChart } from './PerformanceChart'
import { CampaignsTable } from './CampaignsTable'
import { AdsSection } from './AdsSection'
import { AudienceSection } from './AudienceSection'
import { CreativeFunnel } from './CreativeFunnel'
import { AiInsights } from './AiInsights'
import { AlertsPanel } from './AlertsPanel'
import { GoalsPanel } from './GoalsPanel'
import { DashboardHeader } from './DashboardHeader'
import type {
  DashboardData,
  MetricKey,
  DateRangeOption,
  CompareOption,
  SyncLog,
} from '@/lib/tiktok-ads/types'

const KPI_METRICS: MetricKey[] = [
  'spend', 'impressions', 'videoViews', 'followers',
  'ctr', 'cpm', 'profileVisits', 'likes',
]

interface TikTokAdsDashboardProps {
  initialData: DashboardData
  isMockMode: boolean
}

export function TikTokAdsDashboard({ initialData, isMockMode }: TikTokAdsDashboardProps) {
  const [data] = useState<DashboardData>(initialData)
  const [selectedAccount, setSelectedAccount] = useState<string>(
    initialData.accounts[0]?.id ?? ''
  )
  const [dateRange, setDateRange] = useState<DateRangeOption>('last30')
  const [compareWith, setCompareWith] = useState<CompareOption>('none')
  const [syncLog, setSyncLog] = useState<SyncLog>(initialData.syncLog)
  const [goals, setGoals] = useState(initialData.goals)

  // Summary KPI totals
  const totals = data.dailyMetrics.reduce(
    (acc, d) => ({
      spend: acc.spend + d.spend,
      impressions: acc.impressions + d.impressions,
      reach: acc.reach + d.reach,
      videoViews: acc.videoViews + d.videoViews,
      clicks: acc.clicks + d.clicks,
      ctr: 0,
      cpm: 0,
      cpc: 0,
      profileVisits: acc.profileVisits + d.profileVisits,
      followers: acc.followers + d.followers,
      likes: acc.likes + d.likes,
      comments: acc.comments + d.comments,
      shares: acc.shares + d.shares,
    }),
    {
      spend: 0, impressions: 0, reach: 0, videoViews: 0, clicks: 0,
      ctr: 0, cpm: 0, cpc: 0, profileVisits: 0, followers: 0,
      likes: 0, comments: 0, shares: 0,
    }
  )
  totals.ctr = totals.impressions > 0 ? (totals.clicks / totals.impressions) * 100 : 0
  totals.cpm = totals.impressions > 0 ? (totals.spend / totals.impressions) * 1000 : 0
  totals.cpc = totals.clicks > 0 ? totals.spend / totals.clicks : 0

  function handleSyncComplete(log: SyncLog) {
    setSyncLog(log)
  }

  return (
    <div className="space-y-6">
      {/* Page hero */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#010101] via-[#1a1a2e] to-[#16213e] px-6 py-6 text-white shadow-lg">
        {/* TikTok colored stripes */}
        <div className="absolute right-0 top-0 h-full w-32 opacity-20">
          <div className="absolute right-8 top-0 h-full w-1 bg-[#fe2c55]" />
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
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 flex items-center gap-3">
          <span className="text-amber-600 text-sm font-medium">
            Demo modus actief
          </span>
          <span className="text-amber-500 text-xs">
            Er wordt gebruik gemaakt van voorbeelddata. Voeg{' '}
            <code className="bg-amber-100 px-1 rounded font-mono">TIKTOK_ADS_MOCK_MODE=false</code> toe
            aan .env.local om live data te laden.
          </span>
        </div>
      )}

      <DashboardHeader
        accounts={data.accounts}
        selectedAccount={selectedAccount}
        onAccountChange={setSelectedAccount}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        compareWith={compareWith}
        onCompareChange={setCompareWith}
        syncLog={syncLog}
        onSyncComplete={handleSyncComplete}
        dailyMetrics={data.dailyMetrics}
        isMockMode={isMockMode}
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {KPI_METRICS.map((key) => (
          <KpiCard
            key={key}
            metricKey={key}
            value={totals[key] as number}
            dailyData={data.dailyMetrics}
            goals={goals}
          />
        ))}
      </div>

      {/* Performance Chart */}
      <PerformanceChart dailyMetrics={data.dailyMetrics} />

      {/* Two-col: AI Insights + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <AiInsights initialInsights={data.insights} />
        <AlertsPanel initialAlerts={data.alerts} />
      </div>

      {/* Campaigns */}
      <div>
        <h2 className="text-base font-bold text-slate-700 mb-3">Campagnes</h2>
        <CampaignsTable campaigns={data.campaigns} />
      </div>

      {/* Ads */}
      <AdsSection ads={data.ads} />

      {/* Two-col: Creative Funnel + Audience */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CreativeFunnel ads={data.ads} />
        <div className="space-y-4">
          <AudienceSection audience={data.audience} />
        </div>
      </div>

      {/* Goals */}
      <GoalsPanel initialGoals={goals} />
    </div>
  )
}
