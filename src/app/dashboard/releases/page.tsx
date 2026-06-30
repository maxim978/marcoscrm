import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Disc, ChevronRight } from 'lucide-react'
import Link from 'next/link'

export default async function ReleasesPage() {
  const supabase = await createClient()

  const { data: releases } = await supabase
    .from('releases')
    .select(`*, artists ( name )`)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Releases</h3>
          <p className="text-slate-500 text-sm">Manage your track releases and campaigns.</p>
        </div>
        <Button asChild className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white">
          <Link href="/dashboard/releases/new">
            <Plus className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">New Release</span>
            <span className="sm:hidden">Nieuw</span>
          </Link>
        </Button>
      </div>

      {releases && releases.length > 0 ? (
        <div className="space-y-3">
          {releases.map((release) => (
            <Link
              key={release.id}
              href={`/dashboard/releases/${release.id}`}
              className="flex items-center gap-4 bg-white rounded-xl border border-slate-100 px-4 py-4 hover:border-[#3071d8]/30 hover:shadow-sm transition-all active:scale-[0.99]"
            >
              <div className="w-10 h-10 rounded-xl bg-[#3071d8]/10 flex items-center justify-center shrink-0">
                <Disc className="h-5 w-5 text-[#3071d8]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 truncate">{release.title}</p>
                <p className="text-sm text-slate-500 truncate">
                  {release.artists?.name}
                  {release.release_date && (
                    <span className="text-slate-300 mx-1.5">·</span>
                  )}
                  {release.release_date && new Date(release.release_date).toLocaleDateString('nl-NL')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={release.status === 'live' ? 'default' : 'outline'} className="hidden sm:flex">
                  {release.status}
                </Badge>
                <ChevronRight className="h-4 w-4 text-slate-300" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-dashed border-slate-200 py-16 text-center">
          <Disc className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">Nog geen releases</p>
          <p className="text-slate-300 text-sm mt-1">Maak je eerste release aan</p>
        </div>
      )}
    </div>
  )
}
