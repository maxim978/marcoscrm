'use client'

import { useState } from 'react'
import { Loader2, Trash2, UserPlus, Mail, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addTeamMember, removeTeamMember } from '@/app/actions/team'
import type { TeamMember } from '@/app/actions/team'

export function TeamManager({ initialMembers }: { initialMembers: TeamMember[] }) {
  const [members, setMembers] = useState(initialMembers)
  const [email, setEmail]     = useState('')
  const [adding, setAdding]   = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [removing, setRemoving] = useState<string | null>(null)

  async function handleAdd() {
    if (!email.trim()) return
    setAdding(true)
    setError(null)
    setSuccess(false)

    const result = await addTeamMember(email.trim())
    if (result.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setEmail('')
      // Refresh by reloading — simplest since server action revalidates
      window.location.reload()
    }
    setAdding(false)
  }

  async function handleRemove(id: string) {
    setRemoving(id)
    await removeTeamMember(id)
    setMembers(prev => prev.filter(m => m.id !== id))
    setRemoving(null)
  }

  return (
    <div className="space-y-5">
      {/* Add member */}
      <div className="bg-white border border-slate-100 rounded-2xl p-5 space-y-4">
        <p className="text-sm font-bold text-slate-800">Gebruiker toevoegen</p>
        <p className="text-xs text-slate-500">
          Voer het e-mailadres in van een bestaand account. Die gebruiker kan daarna jouw TikTok Ads data bekijken.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(null); setSuccess(false) }}
              onKeyDown={e => { if (e.key === 'Enter') handleAdd() }}
              placeholder="e-mailadres"
              className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-[#3071d8]/50"
            />
          </div>
          <Button
            onClick={handleAdd}
            disabled={adding || !email.trim()}
            className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white gap-2 shrink-0"
          >
            {adding
              ? <Loader2 className="h-4 w-4 animate-spin" />
              : success
              ? <Check className="h-4 w-4" />
              : <UserPlus className="h-4 w-4" />
            }
            Toevoegen
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}
      </div>

      {/* Member list */}
      <div className="bg-white border border-slate-100 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <p className="text-sm font-bold text-slate-800">Huidige toegang</p>
        </div>
        {members.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-slate-400 text-sm">Nog niemand toegevoegd</p>
          </div>
        ) : (
          <ul className="divide-y divide-slate-50">
            {members.map(m => (
              <li key={m.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{m.name ?? m.email}</p>
                  {m.name && <p className="text-xs text-slate-400">{m.email}</p>}
                </div>
                <button
                  onClick={() => handleRemove(m.id)}
                  disabled={removing === m.id}
                  className="text-slate-300 hover:text-red-400 transition-colors p-1.5"
                >
                  {removing === m.id
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <Trash2 className="h-4 w-4" />
                  }
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
