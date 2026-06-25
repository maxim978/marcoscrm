'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { SmProjectProfile } from '@/lib/salesmachine/types'

export async function createProject(formData: FormData): Promise<void> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const profileJson = formData.get('profile') as string
  const keywordsJson = formData.get('keywords') as string

  if (!name?.trim()) return

  let profile: SmProjectProfile | null = null
  let keywords: string[] = []

  try {
    if (profileJson) profile = JSON.parse(profileJson)
    if (keywordsJson) keywords = JSON.parse(keywordsJson)
  } catch {}

  const { data, error } = await supabase
    .from('sm_projects')
    .insert({ user_id: user.id, name, description, profile, keywords })
    .select('id')
    .single()

  if (error || !data) return

  revalidatePath('/salesmachine')
  redirect(`/salesmachine/projects/${data.id}/leads`)
}

export async function updateProjectKeywords(projectId: string, keywords: string[]) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sm_projects')
    .update({ keywords, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}`)
  return { success: true }
}

export async function updateProjectProfile(projectId: string, profile: SmProjectProfile) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sm_projects')
    .update({ profile, updated_at: new Date().toISOString() })
    .eq('id', projectId)

  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}`)
  return { success: true }
}

export async function deleteProject(projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sm_projects').delete().eq('id', projectId)
  if (error) return { error: error.message }
  revalidatePath('/salesmachine')
  redirect('/salesmachine')
}
