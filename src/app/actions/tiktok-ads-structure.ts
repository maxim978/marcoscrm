'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface Campaign {
  id: string
  name: string
  created_at: string
}

export interface AdSet {
  id: string
  campaign_id: string
  campaign_name: string
  name: string
  order_num: number
}

export interface AdSetEntry {
  id?: string
  adset_id: string
  datum: string
  spend: number
  cpm: number
  impressions: number
  followers: number
  cost_per_follower: number
  result_rate: number
}

// --- Campaigns ---

export async function getCampaigns(): Promise<Campaign[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tiktok_manual_campaigns')
    .select('*')
    .order('created_at')
  return data ?? []
}

export async function createCampaign(name: string): Promise<{ id?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { data, error } = await supabase
    .from('tiktok_manual_campaigns')
    .insert({ user_id: user.id, name })
    .select('id')
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return { id: data.id }
}

export async function renameCampaign(id: string, name: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_manual_campaigns')
    .update({ name })
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return {}
}

export async function deleteCampaign(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_manual_campaigns')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return {}
}

// --- Ad Sets ---

export async function saveAdSetsForCampaign(
  campaign_id: string,
  names: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  // Keep campaign name in sync for legacy compatibility
  const { data: campaign } = await supabase
    .from('tiktok_manual_campaigns')
    .select('name')
    .eq('id', campaign_id)
    .single()

  await supabase.from('tiktok_adsets').delete().eq('campaign_id', campaign_id)

  const { error } = await supabase.from('tiktok_adsets').insert(
    names.map((name, i) => ({
      user_id: user.id,
      campaign_id,
      campaign_name: campaign?.name ?? '',
      name,
      order_num: i,
    }))
  )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return {}
}

// Legacy: get all adsets (for dashboard aggregation)
export async function getAllAdSets(): Promise<AdSet[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tiktok_adsets')
    .select('*')
    .order('order_num')
  return data ?? []
}

// --- Ad Set Entries ---

export async function upsertAdSetEntry(entry: AdSetEntry): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('tiktok_adset_entries')
    .upsert(
      {
        user_id: user.id,
        adset_id: entry.adset_id,
        datum: entry.datum,
        spend: entry.spend,
        cpm: entry.cpm,
        impressions: entry.impressions,
        followers: entry.followers,
        cost_per_follower: entry.cost_per_follower,
        result_rate: entry.result_rate,
      },
      { onConflict: 'adset_id,datum' }
    )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}

export async function deleteAdSetEntriesByDate(datum: string, adset_ids: string[]): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('tiktok_adset_entries')
    .delete()
    .eq('user_id', user.id)
    .eq('datum', datum)
    .in('adset_id', adset_ids)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}

// --- Campaign daily (streams + playlist saves per campaign per day) ---

export interface CampaignDailyEntry {
  id?: string
  campaign_id: string
  datum: string
  streams: number
  playlist_saves: number
}

export async function upsertCampaignDaily(entry: CampaignDailyEntry): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('tiktok_campaign_daily')
    .upsert(
      {
        user_id: user.id,
        campaign_id: entry.campaign_id,
        datum: entry.datum,
        streams: entry.streams,
        playlist_saves: entry.playlist_saves,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'campaign_id,datum' }
    )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}

export async function deleteCampaignDailyByDate(campaign_id: string, datum: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('tiktok_campaign_daily')
    .delete()
    .eq('user_id', user.id)
    .eq('campaign_id', campaign_id)
    .eq('datum', datum)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}
