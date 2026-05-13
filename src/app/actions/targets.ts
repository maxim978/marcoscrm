'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function importTargetsFromCsv(data: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Map CSV rows to database schema
  const rowsToInsert = data.map(row => ({
    user_id: user.id,
    name: row.name || 'Unknown',
    type: row.type || 'overig',
    platform: row.platform || null,
    contact_name: row.contact_name || null,
    email: row.email || null,
    country: row.country || null,
    followers: parseInt(row.followers) || 0,
    score: parseInt(row.score) || 50,
    relationship_status: row.relationship_status || 'koud',
    notes: row.notes || null,
  }))

  const { error } = await supabase.from('targets').insert(rowsToInsert)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/targets')
  return { success: true }
}

export async function importTargetFromScreenshot(
  playlistName: string, 
  curatorName: string, 
  followers: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  let inheritedData: any = {}

  // 1. Look for existing contact details for this curator
  if (curatorName) {
    const { data: existingCurator } = await supabase
      .from('targets')
      .select('email, phone, facebook_url, instagram_url, tiktok_url, social_links')
      .eq('contact_name', curatorName)
      .not('email', 'is', null)
      .limit(1)
      .maybeSingle()

    if (existingCurator) {
      inheritedData = {
        email: existingCurator.email,
        phone: existingCurator.phone,
        facebook_url: existingCurator.facebook_url,
        instagram_url: existingCurator.instagram_url,
        tiktok_url: existingCurator.tiktok_url,
        social_links: existingCurator.social_links
      }
    }
  }

  // 2. NEW: Automatically search for the Spotify Playlist Link if not inherited
  if (!inheritedData.social_links?.spotify && playlistName) {
    const searchResult = await searchSpotifyPlaylists(playlistName)
    if (searchResult.playlists && searchResult.playlists.length > 0) {
      const bestMatch = searchResult.playlists[0]
      inheritedData.social_links = { 
        ...(inheritedData.social_links || {}),
        spotify: bestMatch.external_urls?.spotify 
      }
    }
  }

  const targetData = {
    user_id: user.id,
    name: playlistName || 'Unknown Playlist',
    type: 'playlist',
    platform: 'Spotify',
    contact_name: curatorName || null,
    followers: followers || 0,
    relationship_status: 'koud',
    score: 50,
    notes: `Imported via AI Screenshot Scanner on ${new Date().toLocaleDateString()}`,
    ...inheritedData
  }

  const { error } = await supabase
    .from('targets')
    .insert([targetData])

  if (error) {
    return { error: 'Failed to create target: ' + error.message }
  }

  revalidatePath('/dashboard/targets')
  
  return { success: true }
}

export async function checkTargetDuplicate(playlistName: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const { data: targets } = await supabase
    .from('targets')
    .select('id, name, followers')
    .eq('user_id', user.id)

  if (!targets || targets.length === 0) return { status: 'none' }

  const searchName = playlistName.toLowerCase().trim()

  // 1. Exact Match Check
  const exactMatch = targets.find(t => t.name.toLowerCase().trim() === searchName)
  if (exactMatch) {
    return { status: 'exact', id: exactMatch.id, currentFollowers: exactMatch.followers }
  }

  // 2. Fuzzy Match Check (Simple word inclusion logic)
  const searchWords = searchName.split(' ').filter(w => w.length > 3)
  for (const target of targets) {
    const targetNameLower = target.name.toLowerCase().trim()
    
    // If one contains the other entirely, it's a fuzzy match
    if (targetNameLower.includes(searchName) || searchName.includes(targetNameLower)) {
      return { status: 'fuzzy', id: target.id, existingName: target.name, currentFollowers: target.followers }
    }

    // If they share a long distinguishing word
    if (searchWords.length > 0 && searchWords.some(w => targetNameLower.includes(w))) {
      // E.g. "Hollandsche Meezingers 2026" vs "Hollandsche Meezingers"
      return { status: 'fuzzy', id: target.id, existingName: target.name, currentFollowers: target.followers }
    }
  }

  return { status: 'none' }
}

export async function updateTargetFollowers(targetId: string, newFollowers: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  // Only update if new followers is greater than 0
  if (newFollowers > 0) {
    const { error } = await supabase
      .from('targets')
      .update({ followers: newFollowers })
      .eq('id', targetId)
      .eq('user_id', user.id)

    if (error) {
      return { error: 'Failed to update target: ' + error.message }
    }
  }

  revalidatePath('/dashboard/targets')
  return { success: true }
}

