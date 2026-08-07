import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, LayoutGrid } from 'lucide-react'
import { StructuredEntry } from '@/components/tiktok-ads/StructuredEntry'
import type { Campaign, AdSet, AdSetEntry, CampaignDailyEntry } from '@/app/actions/tiktok-ads-structure'

export default async function TikTokAdsInvoerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: campaigns }, { data: adsets }, { data: entries }, { data: campaignDaily }] = await Promise.all([
    supabase.from('tiktok_manual_campaigns').select('*').eq('user_id', user.id).order('created_at'),
    supabase.from('tiktok_adsets').select('*').eq('user_id', user.id).order('order_num'),
    supabase.from('tiktok_adset_entries').select('*').eq('user_id', user.id).order('datum', { ascending: false }),
    supabase.from('tiktok_campaign_daily').select('*').eq('user_id', user.id).order('datum', { ascending: false }),
  ])

  // Group adsets by campaign_id
  const adsetsByCampaign: Record<string, AdSet[]> = {}
  for (const adset of (adsets ?? [])) {
    if (!adset.campaign_id) continue
    if (!adsetsByCampaign[adset.campaign_id]) adsetsByCampaign[adset.campaign_id] = []
    adsetsByCampaign[adset.campaign_id].push(adset as AdSet)
  }

  // Group entries by adset_id
  const entriesByAdSet: Record<string, AdSetEntry[]> = {}
  for (const entry of (entries ?? [])) {
    if (!entriesByAdSet[entry.adset_id]) entriesByAdSet[entry.adset_id] = []
    entriesByAdSet[entry.adset_id].push(entry as AdSetEntry)
  }

  // Group campaign daily by campaign_id → datum
  const campaignDailyByCampaign: Record<string, Record<string, CampaignDailyEntry>> = {}
  for (const daily of (campaignDaily ?? [])) {
    if (!campaignDailyByCampaign[daily.campaign_id]) campaignDailyByCampaign[daily.campaign_id] = {}
    campaignDailyByCampaign[daily.campaign_id][daily.datum] = daily as CampaignDailyEntry
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/tiktok-ads"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Terug naar dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3071d8]/10 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-[#3071d8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dagelijkse invoer</h1>
            <p className="text-slate-500 text-sm">
              Vul per campagne (liedje) dagelijks de advertentiecijfers, streams en playlist toevoegingen in.
            </p>
          </div>
        </div>
      </div>

      <StructuredEntry
        campaigns={(campaigns ?? []) as Campaign[]}
        adsetsByCampaign={adsetsByCampaign}
        entriesByAdSet={entriesByAdSet}
        campaignDailyByCampaign={campaignDailyByCampaign}
      />
    </div>
  )
}
