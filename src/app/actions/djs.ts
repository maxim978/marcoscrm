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

  // Helper function to find a value based on multiple possible header names
  const getValue = (row: any, aliases: string[]) => {
    const keys = Object.keys(row)
    for (const alias of aliases) {
      const key = keys.find(k => k.toLowerCase().trim() === alias.toLowerCase())
      if (key && row[key]) return row[key].toString().trim()
    }
    return null
  }

  const rowsToInsert = data
    .map(row => {
      const name = getValue(row, ['name', 'naam', 'dj', 'alias', 'dj name', 'contact'])
      const email = getValue(row, ['email', 'e-mail', 'mail', 'emailadres'])
      const website = getValue(row, ['website', 'url', 'site', 'web'])
      const phone = getValue(row, ['phone', 'tel', 'telefoon', 'mobiel', 'phone number'])

      // Only insert if at least a name or email is present
      if (!name && !email) return null

      return {
        user_id: user.id,
        name: name || 'Onbekend',
        email: email || null,
        website: website || null,
        phone: phone || null,
      }
    })
    .filter(row => row !== null)

  if (rowsToInsert.length === 0) {
    return { error: 'Geen geldige data gevonden in het bestand. Controleer de kolomnamen.' }
  }

  const { error } = await supabase.from('djs').insert(rowsToInsert)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/djs')
  return { success: true }
}

export async function deleteAllDjs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('djs')
    .delete()
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/djs')
  return { success: true }
}
