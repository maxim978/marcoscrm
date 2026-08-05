import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, LayoutGrid } from 'lucide-react'
import { StructuredEntry } from '@/components/tiktok-ads/StructuredEntry'
import type { AdSet, AdSetEntry } from '@/app/actions/tiktok-ads-structure'

export default async function TikTokAdsInvoerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: adsets }, { data: entries }] = await Promise.all([
    supabase
      .from('tiktok_adsets')
      .select('*')
      .eq('user_id', user.id)
      .order('order_num'),
    supabase
      .from('tiktok_adset_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('datum', { ascending: false }),
  ])

  const entriesByDate: Record<string, AdSetEntry[]> = {}
  for (const entry of (entries ?? [])) {
    if (!entriesByDate[entry.datum]) entriesByDate[entry.datum] = []
    entriesByDate[entry.datum].push(entry as AdSetEntry)
  }

  return (
    <div className="space-y-5">
      <div>
        <Link
          href="/dashboard/tiktok-ads"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Terug naar dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3071d8]/10 flex items-center justify-center">
            <LayoutGrid className="h-5 w-5 text-[#3071d8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Dagelijkse invoer</h1>
            <p className="text-slate-500 text-sm">
              Vul per dag de cijfers in per ad set. Totalen worden automatisch berekend.
            </p>
          </div>
        </div>
      </div>

      <StructuredEntry
        adsets={(adsets ?? []) as AdSet[]}
        entriesByDate={entriesByDate}
      />
    </div>
  )
}
