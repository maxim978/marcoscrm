'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface ManualDayEntry {
  id?: string
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
  // berekend
  ctr?: number
  cpm?: number
  cpc?: number
}

export async function getManualEntries(): Promise<ManualDayEntry[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('tiktok_manual_entries')
    .select('*')
    .order('datum', { ascending: false })

  if (error) return []
  return data ?? []
}

export async function upsertManualEntry(entry: ManualDayEntry): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const ctr = entry.impressions > 0 ? (entry.clicks / entry.impressions) * 100 : 0
  const cpm = entry.impressions > 0 ? (entry.spend / entry.impressions) * 1000 : 0
  const cpc = entry.clicks > 0 ? entry.spend / entry.clicks : 0

  const { error } = await supabase
    .from('tiktok_manual_entries')
    .upsert(
      {
        user_id: user.id,
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
        ctr,
        cpm,
        cpc,
      },
      { onConflict: 'user_id,datum' }
    )

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads')
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return {}
}

export async function deleteManualEntry(datum: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('tiktok_manual_entries')
    .delete()
    .eq('user_id', user.id)
    .eq('datum', datum)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads')
  revalidatePath('/dashboard/tiktok-ads/invoer')
  return {}
}
