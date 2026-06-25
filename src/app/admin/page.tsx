import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { redirect } from 'next/navigation'
import { AdminUsersClient } from '@/components/admin/AdminUsersClient'

export const dynamic = 'force-dynamic'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!myProfile?.is_admin) redirect('/')

  // Haal alle users op via service client (bypass RLS)
  const service = createServiceClient()
  const { data: profiles } = await service
    .from('profiles')
    .select('id, email, name, products, is_admin, created_at')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#08080f] p-6 md:p-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-white/30 text-xs uppercase tracking-widest mb-1">Admin</p>
            <h1 className="text-white text-2xl font-bold">Gebruikersbeheer</h1>
          </div>
          <a href="/" className="text-white/30 hover:text-white/60 text-sm transition-colors">
            ← Terug naar producten
          </a>
        </div>
        <AdminUsersClient currentUserId={user.id} profiles={profiles ?? []} />
      </div>
    </div>
  )
}
