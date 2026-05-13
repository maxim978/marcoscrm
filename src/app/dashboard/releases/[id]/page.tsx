import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { generateHitlist } from '@/app/actions/hitlist'
import { HitlistRow } from '@/components/releases/HitlistRow'
import { PlaylistPlacementForm } from '@/components/releases/PlaylistPlacementForm'
import { GenerateHitlistButton } from '@/components/releases/GenerateHitlistButton'
import { Play, Disc, Calendar, Hash } from 'lucide-react'

export default async function ReleaseDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: release } = await supabase
    .from('releases')
    .select(`
      *,
      artists ( name )
    `)
    .eq('id', params.id)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Disc className="h-6 w-6 text-slate-500" />
            {release.title}
          </h2>
          <p className="text-slate-500 text-lg mt-1">{release.artists?.name}</p>
        </div>
        <Badge variant={release.status === 'live' ? 'default' : 'outline'} className="text-sm px-4 py-1">
          {release.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Release Date</CardTitle>
            <Calendar className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">
              {release.release_date ? new Date(release.release_date).toLocaleDateString() : 'TBA'}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Genre</CardTitle>
            <Hash className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{release.genre || '-'}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-4 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm font-medium">Mood</CardTitle>
            <Hash className="h-4 w-4 text-slate-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{release.mood || '-'}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Playlist Placements</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Track where this release has been added.</p>
          </div>
          <PlaylistPlacementForm releaseId={release.id} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Playlist Name</TableHead>
                <TableHead>Curator</TableHead>
                <TableHead>Followers</TableHead>
                <TableHead>Date Added</TableHead>
                <TableHead className="text-right">Link</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {placements && placements.length > 0 ? (
                placements.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.targets.name}</TableCell>
                    <TableCell>{item.targets.contact_name || '-'}</TableCell>
                    <TableCell>{item.targets.followers?.toLocaleString() || '0'}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      {item.targets.social_links?.link || item.targets.social_links?.spotify ? (
                        <a 
                          href={item.targets.social_links.link || item.targets.social_links.spotify} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-blue-500 hover:underline"
                        >
                          View List
                        </a>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                    No placements logged yet. Click &quot;Add Placement&quot; to log your first playlist addition!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Promotional Hitlist</CardTitle>
            <p className="text-sm text-slate-500 mt-1">Targets selected for this release campaign.</p>
          </div>
          <GenerateHitlistButton 
            releaseId={release.id} 
            hasHitlist={!!(hitlist && hitlist.length > 0)} 
          />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Target Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Relationship</TableHead>
                <TableHead>Match Score</TableHead>
                <TableHead>Outreach Status</TableHead>
                <TableHead className="text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hitlist && hitlist.length > 0 ? (
                hitlist.map((item) => (
                  <HitlistRow key={item.id} item={item} releaseId={release.id} />
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No targets in hitlist. Click &quot;Maak Hitlist&quot; to generate your targets automatically based on genres, moods, and relationships.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
