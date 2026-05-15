'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getDjs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('djs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createDj(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('djs')
    .insert([{ ...data, user_id: user.id }])

  if (error) return { error: error.message }
  revalidatePath('/dashboard/djs')
  return { success: true }
}

export async function updateDj(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('djs')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/djs')
  return { success: true }
}

export async function deleteDj(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('djs')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/djs')
  return { success: true }
}

export async function importDjsFromCsv(data: any[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const rowsToInsert = data.map(row => ({
    user_id: user.id,
    name: row.name || 'Onbekend',
    email: row.email || null,
    website: row.website || null,
    phone: row.phone || null,
  }))

  const { error } = await supabase.from('djs').insert(rowsToInsert)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/djs')
  return { success: true }
}
