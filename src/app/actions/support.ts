'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addSupportEvent(formData: FormData) {
  const supabase = await createClient()

  const rawData = {
    target_id: formData.get('target_id'),
    release_id: formData.get('release_id') || null,
    support_type: formData.get('support_type'),
    date: formData.get('date'),
    proof_link: formData.get('proof_link'),
    estimated_impact: formData.get('estimated_impact'),
    notes: formData.get('notes'),
  }

  const { error } = await supabase.from('support_events').insert([rawData])

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/targets/${rawData.target_id}`)
  return { success: true }
}
