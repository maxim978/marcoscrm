'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function updateTargetContactInfo(formData: FormData) {
  const supabase = await createClient()
  const id = formData.get('id') as string
  const spotifyUrl = formData.get('spotify_url') as string

  const updateData: any = {
    contact_name: formData.get('contact_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    facebook_url: formData.get('facebook_url'),
    instagram_url: formData.get('instagram_url'),
    tiktok_url: formData.get('tiktok_url'),
  }

  // Update social_links for spotify if provided
  if (spotifyUrl !== null) {
    // We need to fetch current links first or just overwrite if we only care about spotify here
    // For simplicity in this CRM, we'll set it
    updateData.social_links = { spotify: spotifyUrl }
  }

  const { error } = await supabase
    .from('targets')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('Error updating target contact info:', error)
    return { error: error.message }
  }

  // NEW: Synchronize contact info across all targets with the same contact_name
  if (updateData.contact_name) {
    const { error: syncError } = await supabase
      .from('targets')
      .update({
        email: updateData.email,
        phone: updateData.phone,
        facebook_url: updateData.facebook_url,
        instagram_url: updateData.instagram_url,
        tiktok_url: updateData.tiktok_url,
      })
      .eq('contact_name', updateData.contact_name)
      .neq('id', id) // update others, not the one we just did

    if (syncError) {
      console.error('Error synchronizing contact info:', syncError)
    }
  }

  revalidatePath('/dashboard/targets')
  revalidatePath(`/dashboard/targets/${id}`)
  return { success: true }
}
