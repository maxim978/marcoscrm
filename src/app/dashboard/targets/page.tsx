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
import { Plus, ArrowUpDown } from 'lucide-react'
import Link from 'next/link'
import { CsvImport } from '@/components/targets/CsvImport'
import { ScreenshotImport } from '@/components/targets/ScreenshotImport'
import { ContactCard } from '@/components/targets/ContactCard'

export default async function TargetsPage(props: { searchParams: Promise<{ sort?: string }> }) {
  const searchParams = await props.searchParams
  const sort = searchParams.sort || 'newest'
  
  const supabase = await createClient()

  let query = supabase.from('targets').select('*')
  
  if (sort === 'alphabetical') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'followers') {
    query = query.order('followers', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: targets } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Targets</h3>
          <p className="text-slate-500 text-sm">Manage your promotional contacts and database.</p>
        </div>
        <div className="flex items-center gap-2">
          <ScreenshotImport />
          <CsvImport />
          <Button asChild>
            <Link href="/dashboard/targets/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Target
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-slate-500">Sort by:</span>
        <Button asChild variant={sort === 'newest' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/dashboard/targets?sort=newest">Newest</Link>
        </Button>
        <Button asChild variant={sort === 'alphabetical' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/dashboard/targets?sort=alphabetical">A-Z</Link>
        </Button>
        <Button asChild variant={sort === 'followers' ? 'secondary' : 'ghost'} size="sm">
          <Link href="/dashboard/targets?sort=followers">Followers <ArrowUpDown className="ml-2 h-3 w-3" /></Link>
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Platform</TableHead>
              <TableHead>Relationship</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {targets && targets.length > 0 ? (
              targets.map((target) => (
                <TableRow key={target.id}>
                  <TableCell>
                    <div className="font-medium">{target.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      Beheerd door: <ContactCard target={target} />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{target.type}</Badge>
                  </TableCell>
                  <TableCell>{target.platform}</TableCell>
                  <TableCell>
                    <Badge variant={target.relationship_status === 'warm' ? 'default' : 'outline'}>
                      {target.relationship_status}
                    </Badge>
                  </TableCell>
                  <TableCell>{target.followers?.toLocaleString() || '0'}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/dashboard/targets/${target.id}`}>View</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No targets found. Add one or import from CSV.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

