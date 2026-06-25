'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// ── Streams ──────────────────────────────────────────────

export async function getStreamWeeks(releaseId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('release_stream_weeks')
    .select('*')
    .eq('release_id', releaseId)
    .order('week_number', { ascending: true })
  return data ?? []
}

export async function upsertStreamWeek(
  releaseId: string,
  weekNumber: number,
  days: {
    maandag: number; dinsdag: number; woensdag: number; donderdag: number
    vrijdag: number; zaterdag: number; zondag: number
  }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('release_stream_weeks')
    .upsert(
      { release_id: releaseId, week_number: weekNumber, ...days },
      { onConflict: 'release_id,week_number' }
    )
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/releases/${releaseId}`)
  return { success: true }
}

export async function deleteStreamWeek(id: string, releaseId: string) {
  const supabase = await createClient()
  await supabase.from('release_stream_weeks').delete().eq('id', id)
  revalidatePath(`/dashboard/releases/${releaseId}`)
  return { success: true }
}

// ── Playlist saves ────────────────────────────────────────

export async function getPlaylistSaves(releaseId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('release_playlist_saves')
    .select('*')
    .eq('release_id', releaseId)
    .order('datum', { ascending: true })
  return data ?? []
}

export async function upsertPlaylistSave(releaseId: string, datum: string, aantal: number) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('release_playlist_saves')
    .upsert(
      { release_id: releaseId, datum, aantal },
      { onConflict: 'release_id,datum' }
    )
  if (error) return { error: error.message }
  revalidatePath(`/dashboard/releases/${releaseId}`)
  return { success: true }
}

export async function deletePlaylistSave(id: string, releaseId: string) {
  const supabase = await createClient()
  await supabase.from('release_playlist_saves').delete().eq('id', id)
  revalidatePath(`/dashboard/releases/${releaseId}`)
  return { success: true }
}
