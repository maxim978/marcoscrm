import { createClient } from '@/lib/supabase/server'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'

export default async function ReleasesPage() {
  const supabase = await createClient()

  const { data: releases } = await supabase
    .from('releases')
    .select(`
      *,
      artists (
        name
      )
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Releases</h3>
          <p className="text-slate-500 text-sm">Manage your track releases and campaigns.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link href="/dashboard/releases/new">
              <Plus className="mr-2 h-4 w-4" />
              New Release
            </Link>
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Artist</TableHead>
              <TableHead>Release Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {releases && releases.length > 0 ? (
              releases.map((release) => (
                <TableRow key={release.id}>
                  <TableCell className="font-medium">{release.title}</TableCell>
                  <TableCell>{release.artists?.name}</TableCell>
                  <TableCell>{release.release_date ? new Date(release.release_date).toLocaleDateString() : 'TBA'}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{release.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/releases/${release.id}`}>Manage Hitlist</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No releases found. Create your first release.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
