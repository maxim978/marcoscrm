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

  console.log('Processing TikTok URL:', cleanUrl)

  try {
    // 1. Handle mobile redirects (vm.tiktok.com)
    let finalUrl = cleanUrl
    if (cleanUrl.includes('vm.tiktok.com') || cleanUrl.includes('vt.tiktok.com')) {
      const res = await fetch(cleanUrl, { method: 'HEAD', redirect: 'follow' })
      finalUrl = res.url.split('?')[0]
      console.log('Redirected to final URL:', finalUrl)
    }

    // 2. Try oEmbed for basic info
    const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(finalUrl)}`
    const oembedRes = await fetch(oembedUrl, { next: { revalidate: 0 } })
    let oembedData: any = {}
    
    if (oembedRes.ok) {
      oembedData = await oembedRes.json()
      console.log('oEmbed data received:', oembedData.author_name)
    } else {
      console.warn('oEmbed failed with status:', oembedRes.status)
    }

    // 3. Fetch page for deep stats
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000)

    let videoData = {
      sound_id: soundId,
      url: finalUrl,
      account_name: oembedData.author_name || 'Unknown',
      likes: 0,
      views: 0,
      followers: 0
    }

    try {
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
        },
        signal: controller.signal
      })
      
      const html = await response.text()
      clearTimeout(timeoutId)
      
      const accountMatch = html.match(/"uniqueId":"([^"]+)"/)
      const likesMatch = html.match(/"diggCount":(\d+)/)
      const viewsMatch = html.match(/"playCount":(\d+)/)
      const followersMatch = html.match(/"followerCount":(\d+)/)

      if (accountMatch) videoData.account_name = accountMatch[1]
      if (likesMatch) videoData.likes = parseInt(likesMatch[1])
      if (viewsMatch) videoData.views = parseInt(viewsMatch[1])
      if (followersMatch) videoData.followers = parseInt(followersMatch[1])
      
      console.log('Extracted stats:', videoData.account_name, videoData.views)
    } catch (e: any) {
      console.error('Fetch error:', e.message)
    }

    const { error: dbError } = await supabase
      .from('tiktok_videos')
      .insert([videoData])

    revalidatePath('/dashboard/tiktok')
    return { success: true }
  } catch (error: any) {
    console.error('Total failure:', error)
    return { error: 'Fout bij verwerken link: ' + error.message }
  }
}

export async function addTikTokVideoManually(data: {
  sound_id: string,
  url: string,
  account_name: string,
  views: number,
  likes: number,
  followers: number
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_videos')
    .insert([data])

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function updateTikTokVideo(id: string, data: {
  account_name?: string,
  views?: number,
  likes?: number,
  followers?: number,
  url?: string
}) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_videos')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function deleteTikTokVideo(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_videos')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  
  revalidatePath('/dashboard/tiktok')
  return { success: true }
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
