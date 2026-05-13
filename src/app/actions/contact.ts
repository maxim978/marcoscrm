'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTargetContactInfo(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string

  const updateData = {
    contact_name: formData.get('contact_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    facebook_url: formData.get('facebook_url'),
    instagram_url: formData.get('instagram_url'),
    tiktok_url: formData.get('tiktok_url'),
  }

  const { error } = await supabase
    .from('targets')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating target contact info:', error)
    return { error: error.message }
  }

  revalidatePath('/dashboard/targets')
  revalidatePath(`/dashboard/targets/${id}`)
  return { success: true }
}
