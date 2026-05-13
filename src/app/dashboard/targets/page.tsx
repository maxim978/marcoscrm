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
import { Plus, ArrowUpDown, Globe, Users, Filter, ExternalLink, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { CsvImport } from '@/components/targets/CsvImport'
import { ScreenshotImport } from '@/components/targets/ScreenshotImport'
import { ContactCard } from '@/components/targets/ContactCard'
import { BulkSearchButton } from '@/components/targets/BulkSearchButton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export default async function TargetsPage(props: { searchParams: Promise<{ sort?: string }> }) {
  const searchParams = await props.searchParams
  const sort = searchParams.sort || 'newest'
  
  const supabase = await createClient()

  let query = supabase.from('targets').select('*', { count: 'exact' }).limit(50)
  
  if (sort === 'alphabetical') {
    query = query.order('name', { ascending: true })
  } else if (sort === 'followers') {
    query = query.order('followers', { ascending: false })
  } else {
    query = query.order('created_at', { ascending: false })
  }

  const { data: targets, count } = await query

  return (
    <div className="space-y-8 pb-12">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Targets & Contacten</h1>
          <p className="text-slate-500 font-medium">Beheer je volledige promotie-netwerk ({count || 0} totaal).</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <BulkSearchButton />
          <ScreenshotImport />
          <CsvImport />
          <Button asChild className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white shadow-lg shadow-blue-500/20 px-6 font-bold flex-1 md:flex-none h-11">
            <Link href="/dashboard/targets/new">
              <Plus className="mr-2 h-5 w-5" /> Target Toevoegen
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
          <Select defaultValue={sort}>
            <SelectTrigger className="w-full h-11 bg-white border-slate-200 font-bold">
              <SelectValue placeholder="Kies sortering" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">
                <Link href="/dashboard/targets?sort=newest" className="w-full h-full block">Nieuwste eerst</Link>
              </SelectItem>
              <SelectItem value="alphabetical">
                <Link href="/dashboard/targets?sort=alphabetical" className="w-full h-full block">Alfabet (A-Z)</Link>
              </SelectItem>
              <SelectItem value="followers">
                <Link href="/dashboard/targets?sort=followers" className="w-full h-full block">Meeste Volgers</Link>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content Section */}
      <div className="space-y-4">
        {/* Mobile View: Card List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
          {targets && targets.length > 0 ? (
            targets.map((target) => (
              <div key={target.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-[#3071d8]/10 p-3 rounded-xl text-[#3071d8]">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-900 text-lg leading-tight">{target.name}</h3>
                      <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 border-none font-bold">
                        {target.type}
                      </Badge>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-50">
                    <Link href={`/dashboard/targets/${target.id}`}>
                      <MoreVertical className="h-5 w-5 text-slate-400" />
                    </Link>
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
                  <div className="bg-slate-50/50 p-3 rounded-xl">
                    <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Platform</div>
                    <div className="font-bold text-slate-700">{target.platform}</div>
                  </div>
                  <div className="bg-slate-50/50 p-3 rounded-xl">
                    <div className="text-[10px] uppercase font-black text-[#dfb433] tracking-widest mb-1">Volgers</div>
                    <div className="font-black text-slate-900">{target.followers?.toLocaleString() || '0'}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-black text-slate-400">Beheer:</span>
                    <ContactCard target={target} />
                  </div>
                  {target.social_links?.spotify && (
                    <a href={target.social_links.spotify} target="_blank" rel="noreferrer" className="bg-green-50 p-2 rounded-lg text-green-600">
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-200 text-center col-span-full">
              <p className="text-slate-400 font-bold italic">Geen targets gevonden. Voeg er een toe!</p>
            </div>
          )}
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow className="hover:bg-transparent border-slate-100">
                <TableHead className="pl-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Target & Beheer</TableHead>
                <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Type</TableHead>
                <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Platform</TableHead>
                <TableHead className="text-center font-black uppercase text-[11px] tracking-widest text-[#dfb433] h-14">Volgers</TableHead>
                <TableHead className="text-right pr-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Acties</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {targets && targets.length > 0 ? (
                targets.map((target) => (
                  <TableRow key={target.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                    <TableCell className="pl-6 py-4">
                      <div className="font-black text-slate-900 text-lg">{target.name}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-black text-slate-400">Beheer:</span>
                        <ContactCard target={target} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-[#3071d8]/10 text-[#3071d8] border-none font-bold px-3 py-1">
                        {target.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-bold text-slate-600">{target.platform}</div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full text-slate-900 font-black">
                        {target.followers?.toLocaleString() || '0'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex items-center justify-end gap-2">
                        {target.social_links?.spotify && (
                          <Button asChild variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl hover:bg-green-50 text-green-600">
                            <a href={target.social_links.spotify} target="_blank" rel="noreferrer">
                              <Globe className="h-5 w-5" />
                            </a>
                          </Button>
                        )}
                        <Button asChild variant="ghost" size="sm" className="h-10 px-4 rounded-xl hover:bg-[#3071d8]/10 text-[#3071d8] font-bold">
                          <Link href={`/dashboard/targets/${target.id}`}>Bekijken</Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-slate-400 font-bold italic">
                    Geen targets gevonden. Voeg er een toe of importeer een CSV.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}

