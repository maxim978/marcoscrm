'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { SmPhase } from '@/lib/salesmachine/types'

export async function updateLeadPhase(leadId: string, phase: SmPhase, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sm_leads')
    .update({ phase })
    .eq('id', leadId)

  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}/board`)
  return { success: true }
}

export async function updateLeadScore(leadId: string, score: number, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sm_leads')
    .update({ score })
    .eq('id', leadId)

  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}/leads`)
  return { success: true }
}

export async function updateLeadNotes(leadId: string, notes: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('sm_leads')
    .update({ notes })
    .eq('id', leadId)

  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}/leads`)
  return { success: true }
}

export async function deleteLead(leadId: string, projectId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('sm_leads').delete().eq('id', leadId)
  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}/leads`)
  return { success: true }
}

export async function createCampaign(formData: FormData) {
  const supabase = await createClient()
  const projectId = formData.get('projectId') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string

  const { error } = await supabase
    .from('sm_campaigns')
    .insert({ project_id: projectId, name, description })

  if (error) return { error: error.message }
  revalidatePath(`/salesmachine/projects/${projectId}/campaigns`)
  return { success: true }
}
