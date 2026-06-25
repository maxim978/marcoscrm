import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProjectSettingsClient } from '@/components/salesmachine/ProjectSettingsClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function SettingsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('sm_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) redirect('/salesmachine')

  const { count: leadCount } = await supabase
    .from('sm_leads')
    .select('id', { count: 'exact', head: true })
    .eq('project_id', id)

  return <ProjectSettingsClient project={project} leadCount={leadCount ?? 0} />
}
