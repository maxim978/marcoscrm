import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { KanbanBoard } from '@/components/salesmachine/KanbanBoard'

interface Props {
  params: Promise<{ id: string }>
}

export default async function BoardPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('sm_projects')
    .select('id, name')
    .eq('id', id)
    .single()

  if (!project) redirect('/salesmachine')

  const { data: leads } = await supabase
    .from('sm_leads')
    .select('id, name, city, category, score, phase, website')
    .eq('project_id', id)
    .order('score', { ascending: false })

  return (
    <div className="-m-6">
      <KanbanBoard projectId={id} initialLeads={leads ?? []} />
    </div>
  )
}
