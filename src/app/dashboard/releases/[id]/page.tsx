import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { generateHitlist } from '@/app/actions/hitlist'
import { getStreamWeeks, getPlaylistSaves } from '@/app/actions/release-stats'
import { HitlistRow } from '@/components/releases/HitlistRow'
import { PlaylistPlacementForm } from '@/components/releases/PlaylistPlacementForm'
import { GenerateHitlistButton } from '@/components/releases/GenerateHitlistButton'
import { StreamsChart } from '@/components/releases/StreamsChart'
import { PlaylistSavesChart } from '@/components/releases/PlaylistSavesChart'
import { Play, Disc, Calendar, Hash } from 'lucide-react'

export default async function ReleaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: release } = await supabase
    .from('releases')
    .select(`
      *,
      artists ( name )
    `)
    .eq('id', id)
    .single()

  if (!release) {
    return <div>Release not found</div>
  }

  const { data: hitlist } = await supabase
    .from('release_targets')
    .select(`
      id,
      priority_score,
      outreach_status,
      targets (
        id,
        name,
        type,
        platform,
        relationship_status
      )
    `)
    .eq('release_id', release.id)
    .order('priority_score', { ascending: false })

  const generateAction = generateHitlist.bind(null, release.id)

  const [streamWeeks, playlistSaves] = await Promise.all([
    getStreamWeeks(release.id).catch(() => []),
    getPlaylistSaves(release.id).catch(() => []),
  ])

  const { data: placements } = await supabase
    .from('support_events')
    .select(`
      id,
      date,
      targets!inner (
        name,
        contact_name,
        followers,
        social_links
      )
    `)
    .eq('release_id', release.id)
    .eq('type', 'playlist_placement')
    .order('date', { ascending: false })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold tracking-tight truncate">{release.title}</h2>
          <p className="text-slate-500 mt-0.5">{release.artists?.name}</p>
        </div>
        <Badge variant={release.status === 'live' ? 'default' : 'outline'} className="shrink-0 mt-1">
          {release.status}
        </Badge>
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="col-span-1">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Datum</p>
            <p className="font-bold text-sm">
              {release.release_date ? new Date(release.release_date).toLocaleDateString('nl-NL') : 'TBA'}
            </p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Genre</p>
            <p className="font-bold text-sm truncate">{release.genre || '-'}</p>
          </CardContent>
        </Card>
        <Card className="col-span-1">
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-slate-400 font-medium mb-1">Mood</p>
            <p className="font-bold text-sm truncate">{release.mood || '-'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Playlist Placements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Playlist Placements</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Track where this release has been added.</p>
          </div>
          <PlaylistPlacementForm releaseId={release.id} />
        </CardHeader>
        <CardContent className="p-0">
          {placements && placements.length > 0 ? (
            <div className="divide-y divide-slate-50">
              {placements.map((item: any) => (
                <div key={item.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">{item.targets.name}</p>
                    <p className="text-xs text-slate-400">
                      {item.targets.contact_name || '—'}
                      <span className="mx-1">·</span>
                      {item.targets.followers?.toLocaleString('nl-NL') || '0'} volgers
                      <span className="mx-1">·</span>
                      {new Date(item.date).toLocaleDateString('nl-NL')}
                    </p>
                  </div>
                  {(item.targets.social_links?.link || item.targets.social_links?.spotify) && (
                    <a
                      href={item.targets.social_links.link || item.targets.social_links.spotify}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[#3071d8] text-xs font-semibold shrink-0 hover:underline"
                    >
                      Open →
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="py-10 text-center text-slate-300 text-sm">
              Nog geen placements
            </div>
          )}
        </CardContent>
      </Card>

      {/* Streams */}
      <Card>
        <CardHeader>
          <CardTitle>Streams per week</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Voer per week het aantal streams per dag in.</p>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <StreamsChart releaseId={release.id} initialWeeks={streamWeeks} />
        </CardContent>
      </Card>

      {/* Playlist saves */}
      <Card>
        <CardHeader>
          <CardTitle>Playlist saves</CardTitle>
          <p className="text-sm text-slate-500 mt-1">Cumulatief per dag, stijging automatisch berekend.</p>
        </CardHeader>
        <CardContent>
          <PlaylistSavesChart releaseId={release.id} initialSaves={playlistSaves} />
        </CardContent>
      </Card>

      {/* Hitlist */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle>Promotional Hitlist</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Targets voor deze release.</p>
          </div>
          <GenerateHitlistButton
            releaseId={release.id}
            hasHitlist={!!(hitlist && hitlist.length > 0)}
          />
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Naam</TableHead>
                  <TableHead className="hidden sm:table-cell">Type</TableHead>
                  <TableHead className="hidden md:table-cell">Relatie</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actie</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {hitlist && hitlist.length > 0 ? (
                  hitlist.map((item) => (
                    <HitlistRow key={item.id} item={item} releaseId={release.id} />
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 text-center text-slate-400 text-sm">
                      Nog geen targets. Klik &quot;Maak Hitlist&quot; om automatisch te genereren.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
