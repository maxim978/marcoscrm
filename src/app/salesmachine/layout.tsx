import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Syne, Plus_Jakarta_Sans } from 'next/font/google'
import { SmSidebar } from '@/components/salesmachine/SmSidebar'

export const dynamic = 'force-dynamic'

const syne = Syne({
  subsets: ['latin'],
  weight: ['700', '800'],
  variable: '--font-syne',
})

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
})

export default async function SalesmachineLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('sm_projects')
    .select('id, name')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className={`${syne.variable} ${jakarta.variable} flex min-h-screen bg-[#0a0a0f] font-[var(--font-jakarta)]`}>
      <SmSidebar user={user} projects={projects ?? []} />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
