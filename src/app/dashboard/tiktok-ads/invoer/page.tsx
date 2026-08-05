import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, PenLine } from 'lucide-react'
import { ManualEntryForm } from '@/components/tiktok-ads/ManualEntryForm'

export default async function TikTokAdsInvoerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: entries } = await supabase
    .from('tiktok_manual_entries')
    .select('*')
    .eq('user_id', user.id)
    .order('datum', { ascending: false })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <Link
          href="/dashboard/tiktok-ads"
          className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-600 transition-colors mb-3"
        >
          <ChevronLeft className="h-4 w-4" /> Terug naar dashboard
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#3071d8]/10 flex items-center justify-center">
            <PenLine className="h-5 w-5 text-[#3071d8]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Handmatige invoer</h1>
            <p className="text-slate-500 text-sm">Vul dagelijks je TikTok Ads cijfers in. CTR, CPM en CPC worden automatisch berekend.</p>
          </div>
        </div>
      </div>

      <ManualEntryForm initialEntries={entries ?? []} />
    </div>
  )
}
