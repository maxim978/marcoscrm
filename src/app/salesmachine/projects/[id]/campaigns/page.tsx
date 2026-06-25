import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { CampaignsClient } from '@/components/salesmachine/CampaignsClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function CampaignsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('sm_projects')
    .select('id')
    .eq('id', id)
    .single()

  if (!project) redirect('/salesmachine')

  const { data: campaigns } = await supabase
    .from('sm_campaigns')
    .select('*')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  return <CampaignsClient projectId={id} campaigns={campaigns ?? []} />
}
