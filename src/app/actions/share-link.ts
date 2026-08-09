'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { randomBytes } from 'crypto'

export async function getShareLink(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase
    .from('share_links')
    .select('token')
    .eq('owner_id', user.id)
    .single()

  return data?.token ?? null
}

export async function createShareLink(): Promise<{ token?: string; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const token = randomBytes(24).toString('hex') // 48 chars, 192 bits entropy

  const { error } = await supabase
    .from('share_links')
    .insert({ owner_id: user.id, token })

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads')
  return { token }
}

export async function revokeShareLink(): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { error } = await supabase
    .from('share_links')
    .delete()
    .eq('owner_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/tiktok-ads')
  return {}
}
