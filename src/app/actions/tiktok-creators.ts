'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getTikTokCreators(soundId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('tiktok_creators')
    .select('*')
    .eq('sound_id', soundId)
    .order('created_at', { ascending: true })
  return data ?? []
}

export async function importCreators(
  soundId: string,
  creators: { username: string; status: string; video_url: string | null; reminded: boolean }[]
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const rows = creators.map((c) => ({
    sound_id: soundId,
    user_id: user.id,
    username: c.username,
    status: c.status,
    video_url: c.video_url,
    reminded: c.reminded,
  }))

  const { error } = await supabase.from('tiktok_creators').insert(rows)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/tiktok')
  return { success: true, count: rows.length }
}

export async function addCreator(soundId: string, username: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase.from('tiktok_creators').insert({
    sound_id: soundId,
    user_id: user.id,
    username: username.replace('@', '').trim(),
    status: 'wachten',
    reminded: false,
  })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function updateCreatorStatus(id: string, status: 'wachten' | 'gedaan') {
  const supabase = await createClient()
  const update = status === 'gedaan'
    ? { status, reminded: false }
    : { status }
  const { error } = await supabase
    .from('tiktok_creators')
    .update(update)
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function updateCreatorReminded(id: string, reminded: boolean) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_creators')
    .update({ reminded })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function updateCreatorUrl(id: string, video_url: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_creators')
    .update({ video_url: video_url || null })
    .eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function deleteCreator(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('tiktok_creators').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}

export async function deleteAllCreators(soundId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('tiktok_creators')
    .delete()
    .eq('sound_id', soundId)
  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok')
  return { success: true }
}
