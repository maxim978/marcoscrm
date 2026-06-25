'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  Search, Globe, MapPin, Tag, TrendingUp, Loader2,
  Sparkles, Mail, Users, Filter, ChevronLeft, ChevronRight,
  ExternalLink, Zap, BarChart2, X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SM_PHASES, PROVINCES, type SmLead, type SmProject, type SmPhase } from '@/lib/salesmachine/types'
import { KeywordSuggestions } from './KeywordSuggestions'

interface Props {
  project: SmProject
  leads: SmLead[]
  total: number
  page: number
  perPage: number
  categories: string[]
  currentPhase?: string
  currentCategory?: string
  currentQuery?: string
  currentSort?: string
}

const PHASE_COLORS: Record<string, string> = {
  'Nieuw': 'bg-slate-500/20 text-slate-300',
  'Onderzoeken': 'bg-blue-500/20 text-blue-300',
  'Verrijkt': 'bg-cyan-500/20 text-cyan-300',
  'Gekwalificeerd': 'bg-indigo-500/20 text-indigo-300',
  'Mail klaar': 'bg-violet-500/20 text-violet-300',
  'Mail verzonden': 'bg-purple-500/20 text-purple-300',
  'Follow-up': 'bg-amber-500/20 text-amber-300',
  'Reactie': 'bg-orange-500/20 text-orange-300',
  'Afspraak': 'bg-yellow-500/20 text-yellow-300',
  'Offerte': 'bg-lime-500/20 text-lime-300',
  'Gewonnen': 'bg-green-500/20 text-green-300',
  'Verloren': 'bg-red-500/20 text-red-300',
}

export function LeadsClient({
  project, leads, total, page, perPage, categories,
  currentPhase, currentCategory, currentQuery, currentSort,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [searchInput, setSearchInput] = useState(currentQuery ?? '')

  const [searchLoading, setSearchLoading] = useState(false)
  const [searchResult, setSearchResult] = useState<string | null>(null)
  const [categorizeLoading, setCategorizeLoading] = useState(false)
  const [contactsLoading, setContactsLoading] = useState(false)
  const [activeLeadAction, setActiveLeadAction] = useState<string | null>(null)
  const [showKeywords, setShowKeywords] = useState(false)
  const [searchScope, setSearchScope] = useState<'heel-nederland' | 'provincie'>('heel-nederland')
  const [selectedProvince, setSelectedProvince] = useState('Noord-Holland')
  const [showSearchPanel, setShowSearchPanel] = useState(false)

  const totalPages = Math.ceil(total / perPage)

  function updateParam(key: string, value: string | undefined) {
    const params = new URLSearchParams(window.location.search)
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    startTransition(() => router.push(`${pathname}?${params.toString()}`))
  }

  const debouncedSearch = useCallback(
    (() => {
      let t: ReturnType<typeof setTimeout>
      return (val: string) => {
        clearTimeout(t)
        t = setTimeout(() => updateParam('q', val || undefined), 400)
      }
    })(),
    []
  )

  async function handleSearchLeads() {
    setSearchLoading(true)
    setSearchResult(null)
    try {
      const res = await fetch('/api/salesmachine/search-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          profile: project.profile,
          scope: searchScope,
          singleProvince: searchScope === 'provincie' ? selectedProvince : undefined,
          customKeywords: project.keywords?.slice(0, 8),
        }),
      })
      const data = await res.json()
      setSearchResult(`✓ ${data.saved} nieuwe leads gevonden (${data.skipped} duplicaten overgeslagen)`)
      router.refresh()
    } catch {
      setSearchResult('Fout bij zoeken — controleer je Google Places API key')
    } finally {
      setSearchLoading(false)
    }
  }

  async function handleCategorize() {
    setCategorizeLoading(true)
    try {
      const res = await fetch('/api/salesmachine/categorize-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id }),
      })
      const data = await res.json()
      setSearchResult(`✓ ${data.categorized} leads gecategoriseerd`)
      router.refresh()
    } catch {
      setSearchResult('Fout bij categoriseren')
    } finally {
      setCategorizeLoading(false)
    }
  }

  async function handleFindContacts() {
    setContactsLoading(true)
    try {
      const res = await fetch('/api/salesmachine/find-contacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId: project.id, profile: project.profile }),
      })
      const data = await res.json()
      setSearchResult(`✓ ${data.found} contacten gevonden voor ${data.processed} leads`)
      router.refresh()
    } catch {
      setSearchResult('Fout bij contacten zoeken')
    } finally {
      setContactsLoading(false)
    }
  }

  async function handleEnrich(leadId: string) {
    setActiveLeadAction(leadId + '-enrich')
    try {
      await fetch('/api/salesmachine/enrich-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, projectId: project.id }),
      })
      router.refresh()
    } finally {
      setActiveLeadAction(null)
    }
  }

  async function handleWriteEmail(leadId: string) {
    setActiveLeadAction(leadId + '-email')
    try {
      await fetch('/api/salesmachine/write-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, projectId: project.id }),
      })
      router.refresh()
    } finally {
      setActiveLeadAction(null)
    }
  }

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search */}
        <div className="flex-1 min-w-48 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            value={searchInput}
            onChange={(e) => { setSearchInput(e.target.value); debouncedSearch(e.target.value) }}
            placeholder="Zoek op naam of stad..."
            className="w-full bg-white/5 border border-white/8 rounded-lg pl-9 pr-3 py-2 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/40"
          />
        </div>

        {/* Phase filter */}
        <select
          value={currentPhase ?? ''}
          onChange={(e) => updateParam('phase', e.target.value || undefined)}
          className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/60 text-sm focus:outline-none focus:border-violet-500/40"
        >
          <option value="">Alle fases</option>
          {SM_PHASES.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={currentCategory ?? ''}
            onChange={(e) => updateParam('category', e.target.value || undefined)}
            className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/60 text-sm focus:outline-none focus:border-violet-500/40"
          >
            <option value="">Alle categorieën</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Sort */}
        <select
          value={currentSort ?? 'created_at'}
          onChange={(e) => updateParam('sort', e.target.value)}
          className="bg-white/5 border border-white/8 rounded-lg px-3 py-2 text-white/60 text-sm focus:outline-none focus:border-violet-500/40"
        >
          <option value="created_at">Nieuwste eerst</option>
          <option value="score">Score</option>
          <option value="name">Naam A-Z</option>
        </select>

        <Button
          onClick={() => setShowSearchPanel(!showSearchPanel)}
          variant="outline"
          className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10 gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          Leads zoeken
        </Button>
      </div>

      {/* Search Panel */}
      {showSearchPanel && (
        <div className="bg-[#0d0d15] border border-white/8 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-[var(--font-syne)] font-bold text-white text-sm">Leads zoeken via Google Places</h3>
            <button onClick={() => setShowSearchPanel(false)}>
              <X className="w-4 h-4 text-white/30 hover:text-white/60" />
            </button>
          </div>

          <div className="flex gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={searchScope === 'heel-nederland'}
                onChange={() => setSearchScope('heel-nederland')}
                className="accent-violet-500"
              />
              <span className="text-white/70 text-sm">Heel Nederland (~1400+ leads)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                checked={searchScope === 'provincie'}
                onChange={() => setSearchScope('provincie')}
                className="accent-violet-500"
              />
              <span className="text-white/70 text-sm">Één provincie</span>
            </label>
          </div>

          {searchScope === 'provincie' && (
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none w-full"
            >
              {PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          )}

          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSearchLeads}
              disabled={searchLoading}
              className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
            >
              {searchLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Zoekt...</> : <><Zap className="w-3.5 h-3.5" />Start zoekopdracht</>}
            </Button>
            <Button
              onClick={handleCategorize}
              disabled={categorizeLoading}
              variant="outline"
              className="border-white/10 text-white/60 hover:text-white gap-2"
            >
              {categorizeLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Categoriseert...</> : <><Tag className="w-3.5 h-3.5" />Bulk categoriseren (Haiku)</>}
            </Button>
            <Button
              onClick={handleFindContacts}
              disabled={contactsLoading}
              variant="outline"
              className="border-white/10 text-white/60 hover:text-white gap-2"
            >
              {contactsLoading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" />Zoekt contacten...</> : <><Users className="w-3.5 h-3.5" />Contacten zoeken (Haiku)</>}
            </Button>
            <Button
              onClick={() => setShowKeywords(true)}
              variant="outline"
              className="border-white/10 text-white/60 hover:text-white gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />AI zoekwoorden
            </Button>
          </div>

          {searchResult && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-300 text-sm">
              {searchResult}
            </div>
          )}
        </div>
      )}

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm text-white/40">
        <span>{total.toLocaleString('nl-NL')} leads</span>
        {(currentPhase || currentCategory || currentQuery) && (
          <button
            onClick={() => startTransition(() => router.push(pathname))}
            className="text-violet-400 hover:text-violet-300 flex items-center gap-1"
          >
            <Filter className="w-3 h-3" /> filters wissen
          </button>
        )}
        {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin text-violet-400" />}
      </div>

      {/* Leads table */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5">
              <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Bedrijf</th>
              <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Locatie</th>
              <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Categorie</th>
              <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Fase</th>
              <th className="text-right px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Score</th>
              <th className="text-right px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/3">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-white/25 text-sm">
                  {total === 0 ? 'Nog geen leads — klik op "Leads zoeken" om te beginnen' : 'Geen leads gevonden met deze filters'}
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-white/2 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div>
                        <p className="text-white font-medium truncate max-w-[180px]">{lead.name}</p>
                        {lead.website && (
                          <a
                            href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-violet-400/60 hover:text-violet-400 text-xs flex items-center gap-0.5 mt-0.5"
                          >
                            <Globe className="w-2.5 h-2.5" />
                            <span className="truncate max-w-[120px]">{lead.website.replace(/^https?:\/\//, '').split('/')[0]}</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {lead.city && (
                      <span className="flex items-center gap-1 text-white/40 text-xs">
                        <MapPin className="w-3 h-3" />{lead.city}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {lead.category && (
                      <span className="px-2 py-0.5 bg-white/5 text-white/40 rounded text-xs truncate max-w-[120px] block">
                        {lead.category}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PHASE_COLORS[lead.phase] ?? 'bg-white/5 text-white/40'}`}>
                      {lead.phase}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {lead.score > 0 && (
                      <span className="text-white/50 text-xs font-mono">{lead.score}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEnrich(lead.id)}
                        disabled={activeLeadAction === lead.id + '-enrich'}
                        title="Verrijken"
                        className="p-1.5 rounded hover:bg-white/8 text-white/30 hover:text-cyan-400 transition-colors"
                      >
                        {activeLeadAction === lead.id + '-enrich'
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <TrendingUp className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => handleWriteEmail(lead.id)}
                        disabled={activeLeadAction === lead.id + '-email'}
                        title="Email schrijven"
                        className="p-1.5 rounded hover:bg-white/8 text-white/30 hover:text-violet-400 transition-colors"
                      >
                        {activeLeadAction === lead.id + '-email'
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Mail className="w-3.5 h-3.5" />}
                      </button>
                      {lead.website && (
                        <a
                          href={lead.website.startsWith('http') ? lead.website : `https://${lead.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-white/8 text-white/30 hover:text-white/60 transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-white/30">
            Pagina {page} van {totalPages} · {total.toLocaleString('nl-NL')} leads
          </span>
          <div className="flex gap-1">
            <Button
              onClick={() => updateParam('page', String(page - 1))}
              disabled={page <= 1}
              variant="outline"
              size="sm"
              className="border-white/10 text-white/50 hover:text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              onClick={() => updateParam('page', String(page + 1))}
              disabled={page >= totalPages}
              variant="outline"
              size="sm"
              className="border-white/10 text-white/50 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {showKeywords && (
        <KeywordSuggestions
          project={project}
          onClose={() => setShowKeywords(false)}
        />
      )}
    </div>
  )
}
