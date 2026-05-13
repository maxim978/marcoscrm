import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getInfluencers() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('influencers')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data || []
}

export async function createInfluencer(data: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const { error } = await supabase
    .from('influencers')
    .insert([{ ...data, user_id: user.id }])

  if (error) return { error: error.message }
  revalidatePath('/dashboard/influencers')
  return { success: true }
}
