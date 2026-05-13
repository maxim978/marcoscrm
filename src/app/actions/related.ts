'use server'

import { createClient } from '@/lib/supabase/server'

export async function getRelatedPlaylists(contactName: string, currentTargetId: string) {
  if (!contactName) return []
  
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('targets')
    .select('id, name, social_links')
    .eq('user_id', user.id)
    .ilike('contact_name', contactName.trim()) // Case-insensitive and trimmed
    .neq('id', currentTargetId)
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching related playlists:', error)
    return []
  }

  return data || []
}
