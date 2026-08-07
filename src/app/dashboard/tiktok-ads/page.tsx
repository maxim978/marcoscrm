import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TikTokAdsDashboard } from '@/components/tiktok-ads/TikTokAdsDashboard'

export interface AdSetEntryRaw {
  id: string
  datum: string
  adset_id: string
  spend: number
  cpm: number
  impressions: number
  followers: number
  cost_per_follower: number
  result_rate: number
  adset: {
    id: string
    name: string
    campaign_id: string
    campaign_name: string
    campaign: { id: string; name: string } | null
  } | null
}

export interface CampaignRaw {
  id: string
  name: string
  created_at: string
}

export interface CampaignDailyRaw {
  id: string
  campaign_id: string
  datum: string
  streams: number
  playlist_saves: number
}

export default async function TikTokAdsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isMockMode = process.env.TIKTOK_ADS_MOCK_MODE !== 'false'

  const [{ data: rawAdsetEntries }, { data: campaigns }, { data: campaignDaily }] = await Promise.all([
    supabase
      .from('tiktok_adset_entries')
      .select(`
        id, datum, adset_id, spend, cpm, impressions, followers, cost_per_follower, result_rate,
        adset:tiktok_adsets ( id, name, campaign_id, campaign_name, campaign:tiktok_manual_campaigns ( id, name ) )
      `)
      .eq('user_id', user.id)
      .order('datum', { ascending: true }),
    supabase
      .from('tiktok_manual_campaigns')
      .select('id, name, created_at')
      .eq('user_id', user.id)
      .order('created_at'),
    supabase
      .from('tiktok_campaign_daily')
      .select('id, campaign_id, datum, streams, playlist_saves')
      .eq('user_id', user.id)
      .order('datum', { ascending: true }),
  ])

  return (
    <TikTokAdsDashboard
      adsetEntries={(rawAdsetEntries ?? []) as unknown as AdSetEntryRaw[]}
      campaigns={(campaigns ?? []) as CampaignRaw[]}
      campaignDaily={(campaignDaily ?? []) as CampaignDailyRaw[]}
      isMockMode={isMockMode}
    />
  )
}
