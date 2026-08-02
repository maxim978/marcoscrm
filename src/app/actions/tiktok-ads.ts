'use server'

import { getMockDashboardData, MOCK_INSIGHTS } from '@/lib/tiktok-ads/mock'
import type {
  DashboardData,
  DashboardGoals,
  TikTokAlert,
  AiInsight,
  SyncLog,
} from '@/lib/tiktok-ads/types'

const IS_MOCK = process.env.TIKTOK_ADS_MOCK_MODE !== 'false'

export async function getDashboardData(): Promise<DashboardData> {
  if (IS_MOCK) {
    return getMockDashboardData()
  }
  throw new Error('Real TikTok Ads API not yet connected. Set TIKTOK_ADS_MOCK_MODE=true.')
}

export async function getMetrics(dateRange: string = 'last30') {
  const data = await getDashboardData()
  return { dailyMetrics: data.dailyMetrics, dateRange }
}

export async function getCampaigns() {
  const data = await getDashboardData()
  return data.campaigns
}

export async function getAds(campaignId?: string) {
  const data = await getDashboardData()
  if (campaignId) {
    return data.ads.filter((ad) => ad.campaignId === campaignId)
  }
  return data.ads
}

export async function getAudience() {
  const data = await getDashboardData()
  return data.audience
}

export async function getInsights(): Promise<AiInsight[]> {
  if (IS_MOCK) {
    // Simulate a brief delay to show loading state
    await new Promise((resolve) => setTimeout(resolve, 800))
    return MOCK_INSIGHTS
  }
  throw new Error('Real insights generation not yet implemented.')
}

export async function getAlerts(): Promise<TikTokAlert[]> {
  const data = await getDashboardData()
  return data.alerts
}

export async function getGoals(): Promise<DashboardGoals> {
  const data = await getDashboardData()
  return data.goals
}

export async function upsertGoals(_goals: DashboardGoals): Promise<{ success: boolean }> {
  if (IS_MOCK) {
    // In mock mode, just return success (goals stored client-side)
    return { success: true }
  }
  // TODO: upsert to tiktok_dashboard_goals table
  throw new Error('Real goal persistence not yet implemented.')
}

export async function syncAccount(_accountId: string): Promise<SyncLog> {
  if (IS_MOCK) {
    await new Promise((resolve) => setTimeout(resolve, 1500))
    return {
      id: 'mock-sync',
      status: 'success',
      startedAt: new Date().toISOString(),
      completedAt: new Date(Date.now() + 1500).toISOString(),
      recordsProcessed: 847,
      periodStart: '2026-07-03',
      periodEnd: new Date().toISOString().split('T')[0],
    }
  }
  throw new Error('Real sync not yet implemented. Connect TikTok Ads API first.')
}

export async function markAlertRead(
  _alertId: string,
  _isRead: boolean
): Promise<{ success: boolean }> {
  if (IS_MOCK) {
    return { success: true }
  }
  // TODO: update tiktok_alerts table
  return { success: true }
}
