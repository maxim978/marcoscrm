import { createClient } from '@supabase/supabase-js'
import { notFound } from 'next/navigation'
import { TikTokAdsDashboard } from '@/components/tiktok-ads/TikTokAdsDashboard'
import type { AdSetEntryRaw, CampaignRaw, CampaignDailyRaw } from '@/app/dashboard/tiktok-ads/page'

export const dynamic = 'force-dynamic'

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export default async function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params
  const supabase = serviceClient()

  // Validate token and get owner
  const { data: shareLink } = await supabase
    .from('share_links')
    .select('owner_id')
    .eq('token', token)
    .single()

  if (!shareLink) notFound()

  const ownerId = shareLink.owner_id

  // Load owner's TikTok Ads data
  const [{ data: rawAdsetEntries }, { data: campaigns }, { data: campaignDaily }] = await Promise.all([
    supabase
      .from('tiktok_adset_entries')
      .select(`
        id, datum, adset_id, spend, cpm, impressions, followers, cost_per_follower, result_rate,
        adset:tiktok_adsets ( id, name, campaign_id, campaign_name, campaign:tiktok_manual_campaigns ( id, name ) )
      `)
      .eq('user_id', ownerId)
      .order('datum', { ascending: true }),
    supabase
      .from('tiktok_manual_campaigns')
      .select('id, name, created_at')
      .eq('user_id', ownerId)
      .order('created_at'),
    supabase
      .from('tiktok_campaign_daily')
      .select('id, campaign_id, datum, streams, playlist_saves')
      .eq('user_id', ownerId)
      .order('datum', { ascending: true }),
  ])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="p-4 md:p-8 max-w-7xl mx-auto">
        <TikTokAdsDashboard
          adsetEntries={(rawAdsetEntries ?? []) as unknown as AdSetEntryRaw[]}
          campaigns={(campaigns ?? []) as CampaignRaw[]}
          campaignDaily={(campaignDaily ?? []) as CampaignDailyRaw[]}
          isMockMode={false}
          shareView
        />
      </div>
    </div>
  )
}
