import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { TikTokAdsDashboard } from '@/components/tiktok-ads/TikTokAdsDashboard'
import { getMockDashboardData } from '@/lib/tiktok-ads/mock'
import { createClient } from '@/lib/supabase/server'
import type { DashboardData, DailyMetric } from '@/lib/tiktok-ads/types'

async function getRealDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Load structured adset entries (primary source)
  const { data: adsetEntries } = await supabase
    .from('tiktok_adset_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('datum', { ascending: true })

  // Load old-style manual entries (fallback for dates not in adset entries)
  const { data: manualEntries } = await supabase
    .from('tiktok_manual_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('datum', { ascending: true })

  // Aggregate adset entries by date
  const byDate: Record<string, DailyMetric> = {}
  for (const e of (adsetEntries ?? [])) {
    if (!byDate[e.datum]) {
      byDate[e.datum] = {
        date: e.datum, spend: 0, impressions: 0, reach: 0, videoViews: 0,
        clicks: 0, ctr: 0, cpm: 0, cpc: 0, profileVisits: 0,
        followers: 0, likes: 0, comments: 0, shares: 0,
      }
    }
    const d = byDate[e.datum]
    d.spend       += e.spend        ?? 0
    d.impressions += e.impressions  ?? 0
    d.reach       += e.reach        ?? 0
    d.videoViews  += e.video_views  ?? 0
    d.clicks      += e.clicks       ?? 0
    d.profileVisits += e.profile_visits ?? 0
    d.followers   += e.followers    ?? 0
    d.likes       += e.likes        ?? 0
    d.comments    += e.comments     ?? 0
    d.shares      += e.shares       ?? 0
  }

  // Compute derived metrics for adset entries
  const adsetMetrics: DailyMetric[] = Object.values(byDate).map(d => ({
    ...d,
    ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
    cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
    cpc: d.clicks > 0 ? d.spend / d.clicks : 0,
  })).sort((a, b) => a.date.localeCompare(b.date))

  // Map old manual entries for dates not already covered
  const adsetDates = new Set(adsetMetrics.map(m => m.date))
  const manualMetrics: DailyMetric[] = (manualEntries ?? [])
    .filter(e => !adsetDates.has(e.datum))
    .map(e => ({
      date: e.datum,
      spend: e.spend ?? 0,
      impressions: e.impressions ?? 0,
      reach: e.reach ?? 0,
      videoViews: e.video_views ?? 0,
      clicks: e.clicks ?? 0,
      ctr: e.ctr ?? 0,
      cpm: e.cpm ?? 0,
      cpc: e.cpc ?? 0,
      profileVisits: e.profile_visits ?? 0,
      followers: e.followers ?? 0,
      likes: e.likes ?? 0,
      comments: e.comments ?? 0,
      shares: e.shares ?? 0,
    }))

  const dailyMetrics = [...adsetMetrics, ...manualMetrics]
    .sort((a, b) => a.date.localeCompare(b.date))

  return {
    accounts: [{ id: 'manual', name: 'Handmatige invoer', currency: 'EUR', timezone: 'Europe/Amsterdam' }],
    campaigns: [],
    ads: [],
    dailyMetrics,
    audience: { byAge: [], byGender: [], byCountry: [], byDevice: [], byHour: [], byDayOfWeek: [] },
    insights: [],
    alerts: [],
    goals: {},
    syncLog: {
      id: 'manual',
      status: 'success',
      completedAt: new Date().toISOString(),
      recordsProcessed: dailyMetrics.length,
    },
  }
}

export default async function TikTokAdsPage() {
  const isMockMode = process.env.TIKTOK_ADS_MOCK_MODE !== 'false'
  const data = isMockMode
    ? getMockDashboardData()
    : await getRealDashboardData()

  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">Laden...</div>}>
      <TikTokAdsDashboard initialData={data} isMockMode={isMockMode} />
    </Suspense>
  )
}
