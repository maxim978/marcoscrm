import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { BarChart2, LayoutDashboard, Users, Mail, Settings } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface Props {
  children: React.ReactNode
  params: Promise<{ id: string }>
}

export default async function ProjectLayout({ children, params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('sm_projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!project) redirect('/salesmachine')

  const tabs = [
    { href: `/salesmachine/projects/${id}/leads`, label: 'Leads', icon: BarChart2 },
    { href: `/salesmachine/projects/${id}/board`, label: 'Board', icon: LayoutDashboard },
    { href: `/salesmachine/projects/${id}/contacts`, label: 'Contacten', icon: Users },
    { href: `/salesmachine/projects/${id}/campaigns`, label: 'Campagnes', icon: Mail },
    { href: `/salesmachine/projects/${id}/settings`, label: 'Instellingen', icon: Settings },
  ]

  return (
    <div>
      <div className="border-b border-white/5 bg-[#0d0d15] sticky top-0 z-30">
        <div className="px-6 pt-5 pb-0">
          <p className="text-white/30 text-xs mb-1 uppercase tracking-widest">Project</p>
          <h1 className="font-[var(--font-syne)] font-extrabold text-xl text-white mb-4">{project.name}</h1>
          <div className="flex gap-1">
            {tabs.map((t) => (
              <ProjectTab key={t.href} href={t.href} label={t.label} icon={t.icon} />
            ))}
          </div>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function ProjectTab({ href, label, icon: Icon }: { href: string; label: string; icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-1.5 px-4 py-2 text-sm text-white/40 hover:text-white border-b-2 border-transparent hover:border-violet-500/50 transition-all"
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </Link>
  )
}
