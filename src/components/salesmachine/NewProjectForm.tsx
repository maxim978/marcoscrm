'use client'

import { useState } from 'react'
import { Loader2, Sparkles, Check, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createProject } from '@/app/actions/salesmachine/projects'
import type { SmProjectProfile } from '@/lib/salesmachine/types'

type Step = 'describe' | 'review' | 'save'

export function NewProjectForm() {
  const [step, setStep] = useState<Step>('describe')
  const [description, setDescription] = useState('')
  const [name, setName] = useState('')
  const [profile, setProfile] = useState<SmProjectProfile | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleGenerate() {
    if (!description.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/salesmachine/generate-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setProfile(data.profile)
      setName(data.profile.businessType)
      setStep('review')
    } catch (e) {
      setError(String(e))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'describe') {
    return (
      <div className="space-y-5">
        <div className="bg-white/3 border border-white/8 rounded-xl p-6">
          <label className="block text-white font-medium mb-3 text-sm">
            Beschrijf je business en welke klanten je zoekt
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Bijv: Ik heb een DJ-bedrijf en ben op zoek naar trouwlocaties, kastelen en evenementencentra in Nederland die een vaste DJ-partner zoeken voor hun evenementen..."
            className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder:text-white/20 text-sm resize-none focus:outline-none focus:border-violet-500/50 focus:bg-white/7 transition-all"
            rows={6}
          />
          <p className="text-white/25 text-xs mt-2">
            Hoe meer detail, hoe beter het AI-profiel. Beschrijf je aanbod, doelgroep en salesstrategie.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button
          onClick={handleGenerate}
          disabled={!description.trim() || loading}
          className="w-full bg-violet-600 hover:bg-violet-500 text-white h-11 gap-2"
        >
          {loading ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> AI analyseert je business...</>
          ) : (
            <><Sparkles className="w-4 h-4" /> Genereer project profiel</>
          )}
        </Button>
      </div>
    )
  }

  if (step === 'review' && profile) {
    return (
      <form action={createProject} className="space-y-5">
        <input type="hidden" name="profile" value={JSON.stringify(profile)} />
        <input type="hidden" name="keywords" value={JSON.stringify(profile.keywords)} />
        <input type="hidden" name="description" value={description} />

        <div className="bg-white/3 border border-white/8 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <Check className="w-3 h-3 text-green-400" />
            </div>
            <span className="text-white/60 text-sm">AI profiel gegenereerd — controleer en pas aan</span>
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-1.5 uppercase tracking-wider">Projectnaam</label>
            <input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-violet-500/50 transition-all"
            />
          </div>

          <ProfileRow label="Business type" value={profile.businessType} />
          <ProfileRow label="Aanbod" value={profile.offer} />
          <ProfileRow label="Doelgroep" value={profile.targetAudience} />
          <ProfileRow label="Waardepropositie" value={profile.valueProposition} />

          <div>
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">Ideale bedrijfstypes</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.idealCompanyTypes.map((t) => (
                <span key={t} className="px-2.5 py-1 bg-violet-600/20 text-violet-300 rounded-full text-xs">{t}</span>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white/60 text-xs mb-2 uppercase tracking-wider">Zoekwoorden ({profile.keywords.length})</label>
            <div className="flex flex-wrap gap-1.5">
              {profile.keywords.map((k) => (
                <span key={k} className="px-2.5 py-1 bg-white/5 text-white/50 rounded-full text-xs">{k}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep('describe')}
            className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/5"
          >
            Terug
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-violet-600 hover:bg-violet-500 text-white gap-2"
          >
            Project aanmaken <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </form>
    )
  }

  return null
}

function ProfileRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <label className="block text-white/60 text-xs mb-1 uppercase tracking-wider">{label}</label>
      <p className="text-white text-sm">{value}</p>
    </div>
  )
}
