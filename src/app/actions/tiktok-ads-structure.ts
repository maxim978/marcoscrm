'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface AdSet {
  id: string
  campaign_name: string
  name: string
  order_num: number
}

export interface AdSetEntry {
  id?: string
  adset_id: string
  datum: string
  spend: number
  impressions: number
  reach: number
  video_views: number
  clicks: number
  profile_visits: number
  followers: number
  likes: number
  comments: number
  shares: number
}

export async function getAdSets(): Promise<AdSet[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tiktok_adsets')
    .select('*')
    .order('order_num')
  return data ?? []
}

export async function saveAdSets(
  adsets: { campaign_name: string; name: string }[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  await supabase.from('tiktok_adsets').delete().eq('user_id', user.id)

  const { error } = await supabase.from('tiktok_adsets').insert(
    adsets.map((a, i) => ({
      user_id: user.id,
      campaign_name: a.campaign_name,
      name: a.name,
      order_num: i,
    }))
  )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return {}
}

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
        impressions: entry.impressions,
        reach: entry.reach,
        video_views: entry.video_views,
        clicks: entry.clicks,
        profile_visits: entry.profile_visits,
        followers: entry.followers,
        likes: entry.likes,
        comments: entry.comments,
        shares: entry.shares,
      },
      { onConflict: 'adset_id,datum' }
    )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}

export async function deleteAdSetEntriesByDate(datum: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('tiktok_adset_entries')
    .delete()
    .eq('user_id', user.id)
    .eq('datum', datum)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads/invoer')
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}
