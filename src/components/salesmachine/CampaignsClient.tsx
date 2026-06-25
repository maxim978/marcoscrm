'use client'

import { useState } from 'react'
import { Mail, Plus, Loader2, CheckCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createCampaign } from '@/app/actions/salesmachine/leads'
import type { SmCampaign } from '@/lib/salesmachine/types'

interface Props {
  projectId: string
  campaigns: SmCampaign[]
}

export function CampaignsClient({ projectId, campaigns: initial }: Props) {
  const [campaigns, setCampaigns] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setLoading(true)
    const fd = new FormData()
    fd.set('projectId', projectId)
    fd.set('name', name)
    fd.set('description', desc)
    await createCampaign(fd)
    setLoading(false)
    setShowForm(false)
    setName('')
    setDesc('')
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[var(--font-syne)] font-bold text-white text-lg">Campagnes</h2>
          <p className="text-white/30 text-sm mt-0.5">{campaigns.length} campagnes</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-violet-600 hover:bg-violet-500 text-white gap-2">
          <Plus className="w-4 h-4" />Nieuwe campagne
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="bg-[#0d0d15] border border-white/8 rounded-xl p-5 space-y-4">
          <h3 className="text-white font-medium text-sm">Nieuwe campagne</h3>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Campagnenaam"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50"
          />
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Beschrijving (optioneel)"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-violet-500/50 resize-none"
          />
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => setShowForm(false)} className="border-white/10 text-white/50">Annuleren</Button>
            <Button type="submit" disabled={loading} className="bg-violet-600 hover:bg-violet-500 text-white">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Aanmaken'}
            </Button>
          </div>
        </form>
      )}

      {!campaigns.length ? (
        <div className="bg-[#0d0d15] border border-white/8 rounded-xl p-12 text-center">
          <Mail className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Nog geen campagnes — maak er een aan om te beginnen</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-[#0d0d15] border border-white/8 rounded-xl p-4 flex items-start gap-4">
              <div className="w-9 h-9 rounded-lg bg-violet-600/20 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-medium text-sm">{c.name}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    c.status === 'actief'
                      ? 'bg-green-500/20 text-green-300'
                      : 'bg-white/5 text-white/30'
                  }`}>
                    {c.status}
                  </span>
                </div>
                {c.description && <p className="text-white/40 text-xs">{c.description}</p>}
                <p className="text-white/20 text-xs mt-1">
                  {new Date(c.created_at).toLocaleDateString('nl-NL')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
