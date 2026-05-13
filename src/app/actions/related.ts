'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRelatedPlaylists(contactName: string, currentTargetId: string) {
  if (!contactName) return []
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('targets')
    .select('id, name, social_links')
    .eq('contact_name', contactName)
    .neq('id', currentTargetId) // Don't include the current one
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching related playlists:', error)
    return []
  }

  return data || []
}
