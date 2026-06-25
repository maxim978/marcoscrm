'use client'

import { useState } from 'react'
import { Trash2, Loader2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteProject, updateProjectKeywords } from '@/app/actions/salesmachine/projects'
import type { SmProject } from '@/lib/salesmachine/types'

interface Props {
  project: SmProject
  leadCount: number
}

export function ProjectSettingsClient({ project, leadCount }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [keywords, setKeywords] = useState((project.keywords ?? []).join('\n'))
  const [savingKw, setSavingKw] = useState(false)
  const [kwSaved, setKwSaved] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    await deleteProject(project.id)
  }

  async function handleSaveKeywords() {
    setSavingKw(true)
    const kws = keywords.split('\n').map((k) => k.trim()).filter(Boolean)
    await updateProjectKeywords(project.id, kws)
    setSavingKw(false)
    setKwSaved(true)
    setTimeout(() => setKwSaved(false), 2000)
  }

  const profile = project.profile

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="font-[var(--font-syne)] font-bold text-white text-lg">Instellingen</h2>

      {/* Profile overview */}
      {profile && (
        <div className="bg-[#0d0d15] border border-white/8 rounded-xl p-5 space-y-4">
          <h3 className="text-white/70 text-sm font-medium">AI Projectprofiel</h3>
          <div className="grid grid-cols-2 gap-4">
            <ProfileItem label="Business type" value={profile.businessType} />
            <ProfileItem label="Doelgroep" value={profile.targetAudience} />
            <div className="col-span-2">
              <ProfileItem label="Aanbod" value={profile.offer} />
            </div>
            <div className="col-span-2">
              <ProfileItem label="Waardepropositie" value={profile.valueProposition} />
            </div>
          </div>
          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-2">Ideale bedrijfstypes</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.idealCompanyTypes?.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-violet-600/15 text-violet-300/80 rounded-full text-xs">{t}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Keywords */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-xl p-5 space-y-3">
        <h3 className="text-white/70 text-sm font-medium">Zoekwoorden</h3>
        <p className="text-white/30 text-xs">Één zoekwoord per regel. Deze worden gebruikt bij leadgeneratie.</p>
        <textarea
          value={keywords}
          onChange={(e) => setKeywords(e.target.value)}
          rows={8}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-3 text-white text-sm font-mono placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
        />
        <Button
          onClick={handleSaveKeywords}
          disabled={savingKw}
          className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
        >
          {savingKw ? <Loader2 className="w-4 h-4 animate-spin" /> : kwSaved ? '✓ Opgeslagen' : 'Zoekwoorden opslaan'}
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-[#0d0d15] border border-white/8 rounded-xl p-5">
        <h3 className="text-white/70 text-sm font-medium mb-3">Statistieken</h3>
        <div className="flex gap-6">
          <StatItem label="Leads" value={leadCount} />
          <StatItem label="Zoekwoorden" value={(project.keywords ?? []).length} />
          <StatItem label="Aangemaakt" value={new Date(project.created_at).toLocaleDateString('nl-NL')} />
        </div>
      </div>

      {/* Danger zone */}
      <div className="bg-red-950/20 border border-red-500/15 rounded-xl p-5 space-y-3">
        <h3 className="text-red-400/80 text-sm font-medium flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />Gevaarlijke zone
        </h3>
        {!confirmDelete ? (
          <Button
            onClick={() => setConfirmDelete(true)}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Project verwijderen
          </Button>
        ) : (
          <div className="space-y-2">
            <p className="text-red-400/80 text-sm">
              Dit verwijdert het project en alle {leadCount} leads permanent. Dit kan niet ongedaan worden gemaakt.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setConfirmDelete(false)} className="border-white/10 text-white/50">
                Annuleren
              </Button>
              <Button
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-500 text-white gap-2"
              >
                {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" />Ja, definitief verwijderen</>}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="text-white/40 text-xs uppercase tracking-wider block mb-0.5">{label}</label>
      <p className="text-white/80 text-sm">{value}</p>
    </div>
  )
}

function StatItem({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <label className="text-white/40 text-xs uppercase tracking-wider block mb-0.5">{label}</label>
      <p className="text-white font-bold text-lg font-[var(--font-syne)]">{typeof value === 'number' ? value.toLocaleString('nl-NL') : value}</p>
    </div>
  )
}
