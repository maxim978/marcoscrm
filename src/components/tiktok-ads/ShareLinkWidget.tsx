'use client'

import { useState } from 'react'
import { Link2, Copy, Check, Trash2, Loader2, Eye } from 'lucide-react'
import { createShareLink, revokeShareLink } from '@/app/actions/share-link'

interface Props {
  initialToken: string | null
}

export function ShareLinkWidget({ initialToken }: Props) {
  const [token, setToken]     = useState(initialToken)
  const [copied, setCopied]   = useState(false)
  const [creating, setCreating] = useState(false)
  const [revoking, setRevoking] = useState(false)
  const [confirm, setConfirm]   = useState(false)

  const shareUrl = token
    ? `${typeof window !== 'undefined' ? window.location.origin : 'https://marcoscrm.vercel.app'}/share/${token}`
    : null

  async function handleCreate() {
    setCreating(true)
    const result = await createShareLink()
    if (result.token) setToken(result.token)
    setCreating(false)
  }

  async function handleRevoke() {
    setRevoking(true)
    await revokeShareLink()
    setToken(null)
    setConfirm(false)
    setRevoking(false)
  }

  async function handleCopy() {
    if (!shareUrl) return
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!token) {
    return (
      <button
        onClick={handleCreate}
        disabled={creating}
        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors shrink-0"
      >
        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
        Maak view link
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl px-4 py-2.5 text-sm font-medium text-white transition-colors"
      >
        {copied ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
        {copied ? 'Gekopieerd!' : 'Kopieer view link'}
      </button>

      {/* Revoke */}
      {confirm ? (
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-xs">Zeker verwijderen?</span>
          <button
            onClick={handleRevoke}
            disabled={revoking}
            className="bg-red-500/80 hover:bg-red-500 rounded-lg px-3 py-2 text-xs font-semibold text-white transition-colors"
          >
            {revoking ? <Loader2 className="h-3 w-3 animate-spin" /> : 'Ja'}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="text-white/40 hover:text-white/70 text-xs transition-colors"
          >
            Annuleer
          </button>
        </div>
      ) : (
        <button
          onClick={() => setConfirm(true)}
          className="text-white/30 hover:text-white/60 transition-colors p-2"
          title="View link verwijderen"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
