'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'

async function assertAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) return null
  return user
}

export async function inviteUser(formData: FormData) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Geen toegang' }

  const email = formData.get('email') as string
  const salesmachine = formData.get('salesmachine') === 'true'
  const marcos_crm = formData.get('marcos_crm') === 'true'

  if (!email?.trim()) return { error: 'E-mailadres is verplicht' }

  const service = createServiceClient()

  // Maak de user aan met tijdelijk wachtwoord (of gebruik invite)
  const { data, error } = await service.auth.admin.createUser({
    email,
    password: Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2).toUpperCase() + '!1',
    email_confirm: true,
    user_metadata: {},
  })

  if (error) return { error: error.message }

  // Stel producttoegang in
  await service
    .from('profiles')
    .update({ products: { salesmachine, marcos_crm } })
    .eq('id', data.user.id)

  revalidatePath('/admin')
  return { success: true, userId: data.user.id }
}

export async function updateUserProducts(
  userId: string,
  products: { salesmachine: boolean; marcos_crm: boolean }
) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Geen toegang' }

  const service = createServiceClient()
  const { error } = await service
    .from('profiles')
    .update({ products })
    .eq('id', userId)

  if (error) return { error: error.message }
  revalidatePath('/admin')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Geen toegang' }

  const service = createServiceClient()
  const { error } = await service.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function sendPasswordReset(email: string) {
  const admin = await assertAdmin()
  if (!admin) return { error: 'Geen toegang' }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email)
  if (error) return { error: error.message }
  return { success: true }
}
