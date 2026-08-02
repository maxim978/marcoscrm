'use client'

import { useState } from 'react'
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
