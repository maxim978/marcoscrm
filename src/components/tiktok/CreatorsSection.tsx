'use client'

import { useState, useRef } from 'react'
import Papa from 'papaparse'
import {
  Upload, Plus, Trash2, ExternalLink, Check, X,
  Bell, BellOff, Loader2, Download, Search,
  ChevronLeft, ChevronRight, Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  importCreators, addCreator, updateCreatorStatus,
  updateCreatorReminded, updateCreatorUrl, deleteCreator, deleteAllCreators,
} from '@/app/actions/tiktok-creators'

interface Creator {
  id: string
  username: string
  status: 'wachten' | 'gedaan'
  video_url: string | null
  reminded: boolean
  created_at: string
}

interface Props {
  soundId: string
  soundName: string
  initialCreators: Creator[]
}

function extractUrl(text: string): string | null {
  const match = text?.match(/(https?:\/\/[^\s]+)/)
  return match ? match[1] : null
}

function parseReminded(val: string): boolean {
  if (!val) return false
  const v = val.toString().toLowerCase().trim()
  return v === 'true' || v === '1' || v === 'ja' || v === 'yes' || v === 'waar'
}

const PAGE_SIZE = 25

type SortValue = 'newest' | 'oldest' | 'az' | 'za' | 'gedaan' | 'wachten'

export function CreatorsSection({ soundId, soundName, initialCreators }: Props) {
  const [creators, setCreators] = useState<Creator[]>(initialCreators)
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [newUsername, setNewUsername] = useState('')
  const [addingNew, setAddingNew] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [editingUrl, setEditingUrl] = useState<string | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortValue>('newest')
  const [page, setPage] = useState(1)
  const fileRef = useRef<HTMLInputElement>(null)

  const done = creators.filter((c) => c.status === 'gedaan').length
  const reminded = creators.filter((c) => c.status !== 'gedaan' && c.reminded).length

  // Filter
  const filtered = creators
    .filter((c) => c.username.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sort === 'newest') return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      if (sort === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      if (sort === 'az') return a.username.localeCompare(b.username)
      if (sort === 'za') return b.username.localeCompare(a.username)
      if (sort === 'gedaan') return a.status === 'gedaan' ? -1 : 1
      if (sort === 'wachten') return a.status === 'wachten' ? -1 : 1
      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleSortChange(val: string) {
    setSort(val as SortValue)
    setPage(1)
  }

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportError(null)

    Papa.parse(file, {
      skipEmptyLines: true,
      complete: async (results) => {
        const rows = results.data as string[][]
        const startIndex = rows[0]?.[0]?.toLowerCase().includes('tiktok') ? 1 : 0
        const parsed = rows.slice(startIndex)
          .map((row) => {
            const username = (row[0] ?? '').replace('@', '').trim()
            if (!username) return null
            const statusRaw = (row[1] ?? '').trim().toLowerCase()
            const status: 'wachten' | 'gedaan' = statusRaw === 'gedaan' ? 'gedaan' : 'wachten'
            const urlRaw = row[2] ?? ''
            const video_url = extractUrl(urlRaw) ?? (urlRaw.startsWith('http') ? urlRaw : null)
            const reminded = parseReminded(row[3] ?? '')
            return { username, status, video_url, reminded }
          })
          .filter(Boolean) as { username: string; status: 'wachten' | 'gedaan'; video_url: string | null; reminded: boolean }[]

        if (!parsed.length) {
          setImportError('Geen geldige rijen gevonden in het CSV-bestand.')
          setImporting(false)
          return
        }

        const result = await importCreators(soundId, parsed)
        if (result.error) {
          setImportError(result.error)
        } else {
          window.location.reload()
        }
        setImporting(false)
      },
      error: () => {
        setImportError('Fout bij lezen van CSV bestand.')
        setImporting(false)
      },
    })
    e.target.value = ''
  }

  async function handleAddNew(e: React.FormEvent) {
    e.preventDefault()
    if (!newUsername.trim()) return
    setAddingNew(true)
    await addCreator(soundId, newUsername)
    setNewUsername('')
    setAddingNew(false)
    window.location.reload()
  }

  async function toggleStatus(id: string, current: 'wachten' | 'gedaan') {
    const next = current === 'gedaan' ? 'wachten' : 'gedaan'
    setLoadingId(id + 'status')
    setCreators((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: next, reminded: next === 'gedaan' ? false : c.reminded } : c
    ))
    await updateCreatorStatus(id, next)
    setLoadingId(null)
  }

  async function toggleReminded(id: string, current: boolean) {
    setLoadingId(id + 'reminded')
    setCreators((prev) => prev.map((c) => c.id === id ? { ...c, reminded: !current } : c))
    await updateCreatorReminded(id, !current)
    setLoadingId(null)
  }

  async function handleSaveUrl(id: string) {
    setLoadingId(id + 'url')
    setCreators((prev) => prev.map((c) => c.id === id ? { ...c, video_url: urlInput || null } : c))
    await updateCreatorUrl(id, urlInput)
    setEditingUrl(null)
    setUrlInput('')
    setLoadingId(null)
  }

  async function handleDelete(id: string) {
    setLoadingId(id + 'delete')
    setCreators((prev) => prev.filter((c) => c.id !== id))
    await deleteCreator(id)
    setLoadingId(null)
  }

  function exportCSV() {
    const rows = [
      ['TikTokkers die het doen', '', '', 'Herinnerd?'],
      ...creators.map((c) => [
        c.username,
        c.status === 'gedaan' ? 'Gedaan' : '',
        c.video_url ?? '',
        c.reminded ? 'TRUE' : 'FALSE',
      ]),
    ]
    const csv = Papa.unparse(rows)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${soundName.replace(/\s+/g, '_')}_makers.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="flex flex-col">
      <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />

      {/* Toolbar */}
      <div className="bg-slate-50/50 p-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
        {/* Badges */}
        <div className="flex gap-2 flex-wrap flex-1">
          <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">{done} gedaan</span>
          <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-full">{creators.length - done} wachten</span>
          {reminded > 0 && <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2.5 py-1 rounded-full">{reminded} herinnerd</span>}
        </div>

        {/* Import / Export */}
        <Button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          variant="outline"
          className="border-[#3071d8]/30 text-[#3071d8] hover:bg-[#3071d8]/5 gap-2 text-xs h-9"
        >
          {importing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
          CSV importeren
        </Button>
        <Button onClick={exportCSV} variant="outline" className="border-slate-200 text-slate-500 hover:bg-slate-50 gap-2 text-xs h-9">
          <Download className="h-3.5 w-3.5" />
          Exporteren
        </Button>
      </div>

      {/* Zoeken + sorteren + toevoegen */}
      <div className="bg-slate-50/50 px-4 py-3 border-b border-slate-100 flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-300" />
          <input
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Zoek op username..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#3071d8]/40"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400 shrink-0" />
          <Select onValueChange={handleSortChange} defaultValue="newest">
            <SelectTrigger className="w-[170px] h-9 bg-white border-slate-200 text-xs font-bold uppercase tracking-wider">
              <SelectValue placeholder="Sorteren" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Nieuwst eerst</SelectItem>
              <SelectItem value="oldest">Oudst eerst</SelectItem>
              <SelectItem value="az">Alfabet (A–Z)</SelectItem>
              <SelectItem value="za">Alfabet (Z–A)</SelectItem>
              <SelectItem value="gedaan">Gedaan eerst</SelectItem>
              <SelectItem value="wachten">Wachten eerst</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="text-[11px] font-bold text-slate-400 whitespace-nowrap">
          {page} / {totalPages}
        </div>
      </div>

      {importError && (
        <div className="mx-4 mt-3 bg-red-50 border border-red-200 rounded-lg p-3 text-red-600 text-xs">
          {importError}
        </div>
      )}

      {/* Tabel */}
      {creators.length === 0 ? (
        <div className="p-16 text-center text-slate-300 flex flex-col items-center gap-3">
          <Upload className="h-10 w-10 opacity-30" />
          <p className="italic font-bold">Nog geen makers — importeer een CSV of voeg handmatig toe</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center text-slate-300 text-sm">
          Geen resultaten voor &ldquo;{search}&rdquo;
        </div>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="text-left pl-6 pr-3 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Username</th>
              <th className="text-center px-3 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Gedaan</th>
              <th className="text-left px-4 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">TikTok URL</th>
              <th className="text-center px-3 py-3 text-[11px] font-black text-slate-400 uppercase tracking-widest">Herinnerd</th>
              <th className="pr-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paginated.map((creator) => (
              <tr
                key={creator.id}
                className={`hover:bg-slate-50/80 transition-colors group ${creator.status === 'gedaan' ? 'bg-green-50/40' : ''}`}
              >
                <td className="pl-6 pr-3 py-3">
                  <span className={`font-black text-base ${creator.status === 'gedaan' ? 'text-green-700' : 'text-[#3071d8]'}`}>
                    @{creator.username}
                  </span>
                </td>

                <td className="px-3 py-3 text-center">
                  <button
                    onClick={() => toggleStatus(creator.id, creator.status)}
                    disabled={loadingId === creator.id + 'status'}
                    className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-all ${
                      creator.status === 'gedaan'
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {loadingId === creator.id + 'status'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Check className="h-4 w-4" />}
                  </button>
                </td>

                <td className="px-4 py-3 hidden md:table-cell">
                  {editingUrl === creator.id ? (
                    <div className="flex gap-1.5 items-center">
                      <input
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://vm.tiktok.com/..."
                        autoFocus
                        className="flex-1 border border-slate-200 rounded px-2 py-1 text-xs focus:outline-none focus:border-[#3071d8]/50"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleSaveUrl(creator.id)
                          if (e.key === 'Escape') { setEditingUrl(null); setUrlInput('') }
                        }}
                      />
                      <button onClick={() => handleSaveUrl(creator.id)} className="text-green-600 hover:text-green-700">
                        {loadingId === creator.id + 'url' ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      </button>
                      <button onClick={() => { setEditingUrl(null); setUrlInput('') }} className="text-slate-400 hover:text-slate-600">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : creator.video_url ? (
                    <div className="flex items-center gap-2">
                      <a
                        href={creator.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#3071d8] hover:underline text-xs flex items-center gap-1 truncate max-w-[200px]"
                      >
                        <ExternalLink className="h-3 w-3 shrink-0" />
                        {creator.video_url.replace('https://', '').split('/')[0]}
                      </a>
                      <button
                        onClick={() => { setEditingUrl(creator.id); setUrlInput(creator.video_url ?? '') }}
                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-slate-500 text-xs transition-opacity"
                      >
                        bewerken
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setEditingUrl(creator.id); setUrlInput('') }}
                      className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-[#3071d8] text-xs transition-opacity"
                    >
                      + URL toevoegen
                    </button>
                  )}
                </td>

                <td className="px-3 py-3 text-center">
                  {creator.status !== 'gedaan' && (
                    <button
                      onClick={() => toggleReminded(creator.id, creator.reminded)}
                      disabled={loadingId === creator.id + 'reminded'}
                      title={creator.reminded ? 'Herinnerd' : 'Nog niet herinnerd'}
                      className={`w-9 h-9 rounded-full flex items-center justify-center mx-auto transition-all ${
                        creator.reminded
                          ? 'bg-amber-400 text-white hover:bg-amber-500'
                          : 'bg-slate-100 text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {loadingId === creator.id + 'reminded'
                        ? <Loader2 className="h-4 w-4 animate-spin" />
                        : creator.reminded
                          ? <Bell className="h-4 w-4" />
                          : <BellOff className="h-4 w-4" />}
                    </button>
                  )}
                </td>

                <td className="pr-4 py-3">
                  <button
                    onClick={() => handleDelete(creator.id)}
                    disabled={loadingId === creator.id + 'delete'}
                    className="opacity-0 group-hover:opacity-100 text-slate-200 hover:text-red-400 transition-all"
                  >
                    {loadingId === creator.id + 'delete'
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <Trash2 className="h-4 w-4" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Paginering */}
      {totalPages > 1 && (
        <div className="p-4 bg-white border-t border-slate-50 flex justify-center items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="rounded-xl font-bold border-slate-200"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Vorige
          </Button>
          <div className="text-sm font-black text-slate-500">{page} / {totalPages}</div>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="rounded-xl font-bold border-slate-200"
          >
            Volgende <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Toevoegen + progress + wissen */}
      <div className="border-t border-slate-100 px-4 py-3 space-y-3">
        <form onSubmit={handleAddNew} className="flex gap-2">
          <input
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            placeholder="@tiktokusername handmatig toevoegen"
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#3071d8]/40"
          />
          <Button
            type="submit"
            disabled={addingNew || !newUsername.trim()}
            className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white h-9 gap-1.5 text-xs"
          >
            {addingNew ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Toevoegen
          </Button>
        </form>

        {creators.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-slate-400">
              <span>{done} van {creators.length} gedaan</span>
              <div className="flex gap-4">
                <span>{Math.round((done / creators.length) * 100)}%</span>
                <button
                  onClick={async () => {
                    if (!confirm('Alle makers verwijderen voor dit liedje?')) return
                    await deleteAllCreators(soundId)
                    setCreators([])
                  }}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  Alles wissen
                </button>
              </div>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${(done / creators.length) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
