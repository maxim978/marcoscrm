import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { LeadsClient } from '@/components/salesmachine/LeadsClient'

interface Props {
  params: Promise<{ id: string }>
  searchParams: Promise<{
    page?: string
    phase?: string
    category?: string
    q?: string
    sort?: string
    per?: string
  }>
}

export default async function LeadsPage({ params, searchParams }: Props) {
  const { id } = await params
  const sp = await searchParams
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('sm_projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) redirect('/salesmachine')

  const page = parseInt(sp.page ?? '1')
  const perPage = parseInt(sp.per ?? '50')
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = supabase
    .from('sm_leads')
    .select('*', { count: 'exact' })
    .eq('project_id', id)

  if (sp.phase) query = query.eq('phase', sp.phase)
  if (sp.category) query = query.eq('category', sp.category)
  if (sp.q) query = query.or(`name.ilike.%${sp.q}%,city.ilike.%${sp.q}%`)

  const sortField = sp.sort ?? 'created_at'
  const sortAsc = sortField === 'name'
  query = query.order(sortField, { ascending: sortAsc })
  query = query.range(from, to)

  const { data: leads, count } = await query

  const { data: categories } = await supabase
    .from('sm_leads')
    .select('category')
    .eq('project_id', id)
    .not('category', 'is', null)

  const uniqueCategories = [...new Set((categories ?? []).map((c) => c.category).filter(Boolean))] as string[]

  return (
    <LeadsClient
      project={project}
      leads={leads ?? []}
      total={count ?? 0}
      page={page}
      perPage={perPage}
      categories={uniqueCategories}
      currentPhase={sp.phase}
      currentCategory={sp.category}
      currentQuery={sp.q}
      currentSort={sortField}
    />
  )
}
