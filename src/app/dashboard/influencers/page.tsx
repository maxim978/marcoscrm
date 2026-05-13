import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Filter } from 'lucide-react'
import Link from 'next/link'
import { InfluencerSort } from '@/components/influencers/InfluencerSort'
import { InfluencerList } from '@/components/influencers/InfluencerList'

export default async function InfluencersPage(props: { searchParams: Promise<{ sort?: string }> }) {
  const searchParams = await props.searchParams
  const sort = searchParams.sort || 'newest'
  
  const supabase = await createClient()

  let query = supabase.from('influencers').select('*', { count: 'exact' }).limit(50)
  
  if (sort === 'alphabetical') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'followers') {
    query = query.order('followers', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: influencers, count } = await query

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Influencers</h1>
          <p className="text-slate-500 font-medium">Beheer je influencers en creators ({count || 0} totaal).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Button asChild className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white shadow-lg shadow-blue-500/20 px-6 font-bold flex-1 md:flex-none h-11">
            <Link href="/dashboard/influencers/new">
              <Plus className="mr-2 h-5 w-5" /> Influencer Toevoegen
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters & Sorting */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-slate-400" />
          <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">Sorteren op</span>
        </div>
        
        <div className="w-full md:w-64">
          <InfluencerSort currentSort={sort} />
        </div>
      </div>

      {/* Content Section */}
      <InfluencerList initialInfluencers={influencers || []} />
    </div>
  )
}
