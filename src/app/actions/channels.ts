'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getChannels() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('channels')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createChannel(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('channels')
    .insert([{ ...data, user_id: user.id }])

  if (error) return { error: error.message }
  revalidatePath('/dashboard/channels')
  return { success: true }
}

export async function updateChannel(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('channels')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/channels')
  return { success: true }
}

export async function deleteChannel(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('channels')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/channels')
  return { success: true }
}
