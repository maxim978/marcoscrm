import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Plus, FolderOpen, ArrowRight, Users, BarChart2, Mail } from 'lucide-react'
import { ButtonLink } from '@/components/ui/button-link'

export default async function SalesmachineDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: projects } = await supabase
    .from('sm_projects')
    .select('id, name, description, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const { count: totalLeads } = await supabase
    .from('sm_leads')
    .select('id', { count: 'exact', head: true })
    .in('project_id', (projects ?? []).map((p) => p.id))

  const { count: totalContacts } = await supabase
    .from('sm_contacts')
    .select('id', { count: 'exact', head: true })
    .in('project_id', (projects ?? []).map((p) => p.id))

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[var(--font-syne)] font-extrabold text-3xl text-white mb-1">
            Welkom bij Salesmachine
          </h1>
          <p className="text-white/40 text-sm">
            AI-gedreven B2B lead generation voor jouw business
          </p>
        </div>
        <ButtonLink href="/salesmachine/projects/new" variant="default" className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
          <Plus className="w-4 h-4" />
          Nieuw project
        </ButtonLink>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="Projecten" value={projects?.length ?? 0} icon={FolderOpen} />
        <StatCard label="Leads totaal" value={totalLeads ?? 0} icon={BarChart2} />
        <StatCard label="Contacten" value={totalContacts ?? 0} icon={Users} />
      </div>

      {/* Projects */}
      {!projects?.length ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ElementType }) {
  return (
    <div className="bg-white/3 border border-white/8 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
          <Icon className="w-4 h-4 text-violet-400" />
        </div>
        <span className="text-white/40 text-sm">{label}</span>
      </div>
      <p className="font-[var(--font-syne)] font-bold text-2xl text-white">{value.toLocaleString('nl-NL')}</p>
    </div>
  )
}

function ProjectCard({ project }: { project: { id: string; name: string; description: string | null; created_at: string } }) {
  return (
    <Link
      href={`/salesmachine/projects/${project.id}/leads`}
      className="group bg-white/3 border border-white/8 rounded-xl p-5 hover:border-violet-500/40 hover:bg-white/5 transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
          <FolderOpen className="w-4 h-4 text-violet-400" />
        </div>
        <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-violet-400 transition-colors" />
      </div>
      <h3 className="font-[var(--font-syne)] font-bold text-white mb-1.5 truncate">{project.name}</h3>
      {project.description && (
        <p className="text-white/40 text-xs line-clamp-2">{project.description}</p>
      )}
      <p className="text-white/20 text-xs mt-3">
        {new Date(project.created_at).toLocaleDateString('nl-NL')}
      </p>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 rounded-2xl bg-violet-600/10 border border-violet-500/20 flex items-center justify-center mb-5">
        <Zap className="w-7 h-7 text-violet-400" />
      </div>
      <h2 className="font-[var(--font-syne)] font-bold text-xl text-white mb-2">
        Start je eerste project
      </h2>
      <p className="text-white/40 text-sm max-w-xs mb-6">
        Beschrijf je business in gewone taal en AI doet de rest — van leadgeneratie tot gepersonaliseerde cold emails.
      </p>
      <ButtonLink href="/salesmachine/projects/new" className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
        <Plus className="w-4 h-4" />
        Maak je eerste project
      </ButtonLink>
    </div>
  )
}
