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
  adset: { name: string; campaign_name: string; campaign: { name: string } | null } | null
}

export interface ReleaseRaw {
  id: string
  title: string
  release_date: string | null
  created_at: string
}

export interface StreamWeekRaw {
  id: string
  release_id: string
  week_number: number
  maandag: number; dinsdag: number; woensdag: number; donderdag: number
  vrijdag: number; zaterdag: number; zondag: number
  release: { title: string } | null
}

export interface PlaylistSaveRaw {
  id: string
  release_id: string
  datum: string
  aantal: number
  release: { title: string } | null
}

export default async function TikTokAdsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const isMockMode = process.env.TIKTOK_ADS_MOCK_MODE !== 'false'

  // Load TikTok ad entries with adset + campaign names
  const { data: rawAdsetEntries } = await supabase
    .from('tiktok_adset_entries')
    .select(`
      id, datum, adset_id, spend, cpm, impressions, followers, cost_per_follower, result_rate,
      adset:tiktok_adsets ( name, campaign_name, campaign:tiktok_manual_campaigns ( name ) )
    `)
    .eq('user_id', user.id)
    .order('datum', { ascending: true })

  // Load releases with dates (RLS filters to this user)
  const { data: releases } = await supabase
    .from('releases')
    .select('id, title, release_date, created_at')

  const releaseIds = (releases ?? []).map((r: { id: string }) => r.id)

  // Load streams + playlist saves for those releases
  const [{ data: rawStreamWeeks }, { data: rawPlaylistSaves }] = await Promise.all([
    releaseIds.length > 0
      ? supabase.from('release_stream_weeks')
          .select('id, release_id, week_number, maandag, dinsdag, woensdag, donderdag, vrijdag, zaterdag, zondag, release:releases(title)')
          .in('release_id', releaseIds)
          .order('week_number')
      : Promise.resolve({ data: [] }),
    releaseIds.length > 0
      ? supabase.from('release_playlist_saves')
          .select('id, release_id, datum, aantal, release:releases(title)')
          .in('release_id', releaseIds)
          .order('datum', { ascending: true })
      : Promise.resolve({ data: [] }),
  ])

  return (
    <TikTokAdsDashboard
      adsetEntries={(rawAdsetEntries ?? []) as unknown as AdSetEntryRaw[]}
      streamWeeks={(rawStreamWeeks ?? []) as unknown as StreamWeekRaw[]}
      playlistSaves={(rawPlaylistSaves ?? []) as unknown as PlaylistSaveRaw[]}
      releases={(releases ?? []) as unknown as ReleaseRaw[]}
      isMockMode={isMockMode}
    />
  )
}
