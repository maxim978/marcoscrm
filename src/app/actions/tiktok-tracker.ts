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
  
  const cleanUrl = videoUrl.split('?')[0]

  try {
    // 1. Try oEmbed first (Official and less likely to be blocked for basic info)
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(cleanUrl)}`
    const oembedRes = await fetch(oembedUrl, { next: { revalidate: 0 } })
    let oembedData: any = {}
    
    if (oembedRes.ok) {
      oembedData = await oembedRes.json()
    }

    // 2. Try to fetch the page for deep stats with a timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    let videoData = {
      sound_id: soundId,
      url: cleanUrl,
      account_name: oembedData.author_name || 'Unknown',
      likes: 0,
      views: 0,
      followers: 0
    }

    try {
      const response = await fetch(cleanUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        },
        signal: controller.signal
      })
      
      const html = await response.text()
      clearTimeout(timeoutId)
      
      // Extraction regexes
      const accountMatch = html.match(/"uniqueId":"([^"]+)"/)
      const likesMatch = html.match(/"diggCount":(\d+)/)
      const viewsMatch = html.match(/"playCount":(\d+)/)
      const followersMatch = html.match(/"followerCount":(\d+)/)

      if (accountMatch) videoData.account_name = accountMatch[1]
      if (likesMatch) videoData.likes = parseInt(likesMatch[1])
      if (viewsMatch) videoData.views = parseInt(viewsMatch[1])
      if (followersMatch) videoData.followers = parseInt(followersMatch[1])
    } catch (e) {
      console.warn('Deep stats fetch failed, falling back to oEmbed info only', e)
    }

    const { error } = await supabase
      .from('tiktok_videos')
      .insert([videoData])

    if (error) return { error: error.message }
    
    revalidatePath('/dashboard/tiktok')
    return { success: true }
  } catch (error: any) {
    return { error: 'Kon data niet ophalen. Is de link correct? ' + error.message }
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
