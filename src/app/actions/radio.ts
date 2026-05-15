'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getRadioStations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('radio_stations')
    .select('*, radio_contacts(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  return data || []
}

export async function importRadioData(text: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0)
  
  let currentStationId: string | null = null
  let currentStationName: string | null = null

  try {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Check if line starts with a number like "1. Radio 538"
      const stationMatch = line.match(/^\d+\.\s+(.+)$/)
      if (stationMatch) {
        currentStationName = stationMatch[1]
        
        // Insert station
        const { data: station, error: sError } = await supabase
          .from('radio_stations')
          .insert([{ name: currentStationName, user_id: user.id }])
          .select()
          .single()
        
        if (sError) throw sError
        currentStationId = station.id
        continue
      }

      // Skip "Bekende DJ’s / shows:" line
      if (line.toLowerCase().includes('bekende dj') || line.toLowerCase().includes('shows:')) {
        continue
      }

      // If we have a station ID and it's not a station header or skip line, it's a contact
      if (currentStationId) {
        const { error: cError } = await supabase
          .from('radio_contacts')
          .insert([{ 
            station_id: currentStationId, 
            name: line 
          }])
        
        if (cError) throw cError
      }
    }

    revalidatePath('/dashboard/radio')
    return { success: true }
  } catch (err: any) {
    console.error('Import error:', err)
    return { error: err.message }
  }
}

export async function updateRadioContact(id: string, data: any) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('radio_contacts')
    .update(data)
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/radio')
  return { success: true }
}

export async function deleteRadioStation(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('radio_stations')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/radio')
  return { success: true }
}

export async function deleteRadioContact(id: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('radio_contacts')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/radio')
  return { success: true }
}

export async function deleteAllRadioData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('radio_stations')
    .delete()
    .eq('user_id', user.id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/radio')
  return { success: true }
}
