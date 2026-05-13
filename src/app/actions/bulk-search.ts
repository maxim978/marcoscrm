'use server'

import { createClient } from '@/lib/supabase/server'
import { searchSpotifyPlaylists } from '@/app/actions/spotify'
import { searchSocialsForCurator } from '@/app/actions/social-search'
import { revalidatePath } from 'next/cache'

export async function bulkAutoSearchLinks() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  // 1. Fetch targets missing information
  const { data: targets, error } = await supabase
    .from('targets')
    .select('id, name, contact_name, social_links, instagram_url, facebook_url, tiktok_url')
    .eq('user_id', user.id)
    .or('social_links.is.null,instagram_url.is.null,facebook_url.is.null,tiktok_url.is.null')

  if (error) return { error: error.message }
  if (!targets || targets.length === 0) return { success: true, message: 'Geen targets gevonden die updates nodig hebben.' }

  let updateCount = 0

  // 2. Process each target (sequentially to avoid rate limits)
  for (const target of targets) {
    let updateData: any = {}
    let hasChanges = false

    // A. Search for Spotify Link if missing
    if (!target.social_links?.spotify) {
      const spotifyRes = await searchSpotifyPlaylists(target.name)
      if (spotifyRes.playlists && spotifyRes.playlists.length > 0) {
        updateData.social_links = { 
          ...(target.social_links || {}), 
          spotify: spotifyRes.playlists[0].external_urls?.spotify 
        }
        hasChanges = true
      }
    }

    // B. Search for Socials if missing
    if (target.contact_name && (!target.instagram_url || !target.facebook_url || !target.tiktok_url)) {
      const socialRes = await searchSocialsForCurator(target.contact_name, target.name)
      if (socialRes && !socialRes.error) {
        if (!target.instagram_url && socialRes.instagram) updateData.instagram_url = socialRes.instagram
        if (!target.facebook_url && socialRes.facebook) updateData.facebook_url = socialRes.facebook
        if (!target.tiktok_url && socialRes.tiktok) updateData.tiktok_url = socialRes.tiktok
        hasChanges = true
      }
    }

    if (hasChanges) {
      const { error: updateError } = await supabase
        .from('targets')
        .update(updateData)
        .eq('id', target.id)
      
      if (!updateError) updateCount++
    }

    // Small delay to respect API limits
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  revalidatePath('/dashboard/targets')
  return { success: true, updated: updateCount }
}
