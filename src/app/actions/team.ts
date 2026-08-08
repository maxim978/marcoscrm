'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export interface TeamMember {
  id: string
  member_id: string
  name: string | null
  email: string | null
  created_at: string
}

export async function getTeamMembers(): Promise<TeamMember[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('team_members')
    .select('id, member_id, created_at, member:profiles!member_id(name, email)')
    .eq('owner_id', user.id)
    .order('created_at')

  return (data ?? []).map((row: any) => ({
    id: row.id,
    member_id: row.member_id,
    name: row.member?.name ?? null,
    email: row.member?.email ?? null,
    created_at: row.created_at,
  }))
}

export async function addTeamMember(email: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Niet ingelogd' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .single()

  if (!profile) return { error: 'Geen gebruiker gevonden met dit e-mailadres' }
  if (profile.id === user.id) return { error: 'Je kunt jezelf niet toevoegen' }

  const { error } = await supabase
    .from('team_members')
    .insert({ owner_id: user.id, member_id: profile.id })

  if (error) {
    if (error.code === '23505') return { error: 'Deze gebruiker heeft al toegang' }
    return { error: error.message }
  }

  revalidatePath('/dashboard/team')
  return {}
}

export async function removeTeamMember(id: string): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id)

  if (error) return { error: error.message }
  revalidatePath('/dashboard/team')
  return {}
}
