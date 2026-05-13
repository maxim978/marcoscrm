'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createTikTokSound(name: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('tiktok_sounds')
    .insert([{ name, user_id: user.id }])
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true, sound: data }
}

export async function addTikTokVideoToSound(soundId: string, videoUrl: string) {
  const supabase = await createClient()
  
  // Basic URL cleanup
  const cleanUrl = videoUrl.split('?')[0]

  try {
    // 1. Fetch TikTok page to extract data
    // Note: TikTok blocks simple fetch often. In a production app, we'd use a proxy or scraper service.
    // For now, we'll try to extract what we can or use a fallback.
    const response = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })
    
    const html = await response.text()
    
    // 2. Simple regex extraction (TikTok stores data in JSON in the HTML)
    // This is fragile but works for a MVP without a paid scraper.
    const accountMatch = html.match(/"uniqueId":"([^"]+)"/)
    const likesMatch = html.match(/"diggCount":(\d+)/)
    const viewsMatch = html.match(/"playCount":(\d+)/)
    const followersMatch = html.match(/"followerCount":(\d+)/)

    const videoData = {
      sound_id: soundId,
      url: cleanUrl,
      account_name: accountMatch ? accountMatch[1] : 'Unknown',
      likes: likesMatch ? parseInt(likesMatch[1]) : 0,
      views: viewsMatch ? parseInt(viewsMatch[1]) : 0,
      followers: followersMatch ? parseInt(followersMatch[1]) : 0
    }

    const { error } = await supabase
      .from('tiktok_videos')
      .insert([videoData])

    if (error) return { error: error.message }
    
    revalidatePath('/dashboard/tiktok')
    return { success: true }
  } catch (error: any) {
    return { error: 'Kon data niet ophalen: ' + error.message }
  }
}

export async function getTikTokSounds() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('tiktok_sounds')
    .select('*, tiktok_videos(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}
