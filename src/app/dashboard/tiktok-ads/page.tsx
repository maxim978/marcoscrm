import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { TikTokAdsDashboard } from '@/components/tiktok-ads/TikTokAdsDashboard'
import { getMockDashboardData } from '@/lib/tiktok-ads/mock'
import { createClient } from '@/lib/supabase/server'
import type { DashboardData, DailyMetric } from '@/lib/tiktok-ads/types'

async function getManualDashboardData(): Promise<DashboardData> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('tiktok_manual_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('datum', { ascending: true })

  const dailyMetrics: DailyMetric[] = (entries ?? []).map((e) => ({
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

  return {
    accounts: [{ id: 'manual', name: 'Handmatige invoer', currency: 'EUR', timezone: 'Europe/Amsterdam' }],
    campaigns: [],
    ads: [],
    dailyMetrics,
    audience: {
      byAge: [], byGender: [], byCountry: [], byDevice: [],
      byHour: [], byDayOfWeek: [],
    },
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
    : await getManualDashboardData()

  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">Laden...</div>}>
      <TikTokAdsDashboard initialData={data} isMockMode={isMockMode} />
    </Suspense>
  )
}
