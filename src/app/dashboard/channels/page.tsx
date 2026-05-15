import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
import { ChannelList } from '@/components/channels/ChannelList'

export default async function ChannelsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data: channels, count } = await supabase
    .from('channels')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Grote Kanalen</h1>
          <p className="text-slate-500 font-medium">Beheer grote social media kanalen en media outlets ({count || 0} totaal).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Button asChild className="bg-[#dfb433] hover:bg-[#dfb433]/90 text-slate-900 shadow-lg shadow-yellow-500/20 px-6 font-bold flex-1 md:flex-none h-11 border-none">
            <Link href="/dashboard/channels/new">
              <Plus className="mr-2 h-5 w-5" /> Kanaal Toevoegen
            </Link>
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <ChannelList initialChannels={channels || []} />
    </div>
  )
}
