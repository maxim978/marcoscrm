'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addManualPlacement(
  releaseId: string, 
  playlistName: string, 
  curatorName: string, 
  playlistLink: string, 
  followers: number, 
  dateAdded: string
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // 1. Create a Target for this playlist
  const targetData = {
    user_id: user.id,
    name: playlistName,
    type: 'playlist',
    platform: playlistLink.includes('spotify.com') ? 'Spotify' : 'Other',
    contact_name: curatorName || null,
    social_links: playlistLink ? { link: playlistLink } : null,
    followers: followers || 0,
    relationship_status: 'warm',
    score: 80,
    notes: `Manually added via Placement tracker on ${new Date().toLocaleDateString()}`
  }

  const { data: target, error: targetError } = await supabase
    .from('targets')
    .insert([targetData])
    .select('id')
    .single()

  if (targetError) {
    return { error: 'Failed to create target: ' + targetError.message }
  }

  // 2. Create Support Event (Placement) linking the target to the release
  const eventData = {
    user_id: user.id,
    target_id: target.id,
    release_id: releaseId,
    date: dateAdded,
    type: 'playlist_placement',
    notes: `Added to ${playlistName} (${followers} followers)`
  }

  const { error: eventError } = await supabase
    .from('support_events')
    .insert([eventData])

  if (eventError) {
    return { error: 'Failed to create placement: ' + eventError.message }
  }

  revalidatePath(`/dashboard/releases/${releaseId}`)
  revalidatePath('/dashboard/targets')
  
  return { success: true }
}
