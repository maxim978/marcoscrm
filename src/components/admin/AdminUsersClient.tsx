'use client'

import { useState } from 'react'
import {
  Plus, Loader2, Trash2, Mail, Zap, Music,
  Check, X, Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  inviteUser, updateUserProducts, deleteUser, sendPasswordReset,
} from '@/app/actions/admin/users'

interface Profile {
  id: string
  email: string
  name: string | null
  products: { salesmachine?: boolean; marcos_crm?: boolean } | null
  is_admin: boolean | null
  created_at: string
}

interface Props {
  currentUserId: string
  profiles: Profile[]
}

export function AdminUsersClient({ currentUserId, profiles: initial }: Props) {
  const [profiles, setProfiles] = useState(initial)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteSm, setInviteSm] = useState(false)
  const [inviteCrm, setInviteCrm] = useState(false)
  const [inviteLoading, setInviteLoading] = useState(false)
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [inviteSuccess, setInviteSuccess] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState<string | null>(null)

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault()
    setInviteLoading(true)
    setInviteError(null)
    const fd = new FormData()
    fd.set('email', inviteEmail)
    fd.set('salesmachine', String(inviteSm))
    fd.set('marcos_crm', String(inviteCrm))
    const result = await inviteUser(fd)
    setInviteLoading(false)
    if (result?.error) { setInviteError(result.error); return }
    setInviteSuccess(true)
    setTimeout(() => {
      setInviteSuccess(false)
      setShowInvite(false)
      setInviteEmail('')
      setInviteSm(false)
      setInviteCrm(false)
      window.location.reload()
    }, 1200)
  }

  async function handleToggle(profileId: string, field: 'salesmachine' | 'marcos_crm', current: boolean) {
    const profile = profiles.find((p) => p.id === profileId)
    if (!profile) return
    const products = { salesmachine: false, marcos_crm: false, ...(profile.products ?? {}) }
    products[field] = !current

    setProfiles((prev) =>
      prev.map((p) => p.id === profileId ? { ...p, products } : p)
    )
    setActionLoading(profileId + field)
    await updateUserProducts(profileId, products)
    setActionLoading(null)
  }

  async function handleDelete(profileId: string) {
    setActionLoading(profileId + 'delete')
    await deleteUser(profileId)
    setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    setDeleteConfirm(null)
    setActionLoading(null)
  }

  async function handlePasswordReset(email: string) {
    setActionLoading(email + 'reset')
    const result = await sendPasswordReset(email)
    setActionLoading(null)
    if (!result?.error) setResetSuccess(email)
    setTimeout(() => setResetSuccess(null), 3000)
  }

  const regularUsers = profiles.filter((p) => !p.is_admin)
  const adminUsers = profiles.filter((p) => p.is_admin)

  return (
    <div className="space-y-5">
      {/* Info banner voor admins */}
      <div className="bg-amber-500/8 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
        <Shield className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
        <div>
          <p className="text-amber-300 text-sm font-medium">Jij bent admin</p>
          <p className="text-amber-400/60 text-xs mt-0.5">
            Als admin heb je automatisch toegang tot alle producten. Gebruik dit panel om andere gebruikers uit te nodigen en hun toegang in te stellen.
          </p>
        </div>
      </div>

      {/* Invite button */}
      <div className="flex justify-end">
        <Button
          onClick={() => setShowInvite(!showInvite)}
          className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
        >
          <Plus className="w-4 h-4" />Gebruiker uitnodigen
        </Button>
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className="bg-white/3 border border-violet-500/30 rounded-xl p-5 space-y-5">
          <h3 className="text-white font-semibold text-sm">Nieuwe gebruiker uitnodigen</h3>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-1.5">E-mailadres</label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="naam@domein.nl"
              required
              className="w-full bg-white/5 border border-white/15 rounded-lg px-3 py-2.5 text-white text-sm placeholder:text-white/25 focus:outline-none focus:border-violet-500/60 transition-colors"
            />
          </div>

          <div>
            <label className="text-white/40 text-xs uppercase tracking-wider block mb-3">
              Toegang geven tot — klik om te selecteren
            </label>
            <div className="flex gap-3">
              <ProductToggle
                icon={Zap}
                label="Salesmachine"
                checked={inviteSm}
                onChange={setInviteSm}
                color="violet"
              />
              <ProductToggle
                icon={Music}
                label="Marcos CRM"
                checked={inviteCrm}
                onChange={setInviteCrm}
                color="blue"
              />
            </div>
            {!inviteSm && !inviteCrm && (
              <p className="text-white/25 text-xs mt-2">Selecteer minimaal één product</p>
            )}
          </div>

          {inviteError && (
            <p className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 text-red-400 text-xs">{inviteError}</p>
          )}

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => { setShowInvite(false); setInviteError(null) }}
              className="border-white/10 text-white/50 hover:text-white"
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              disabled={inviteLoading || inviteSuccess || (!inviteSm && !inviteCrm)}
              className="bg-violet-600 hover:bg-violet-500 text-white gap-2"
            >
              {inviteLoading
                ? <><Loader2 className="w-4 h-4 animate-spin" />Aanmaken...</>
                : inviteSuccess
                  ? <><Check className="w-4 h-4" />Aangemaakt!</>
                  : 'Gebruiker aanmaken'}
            </Button>
          </div>
        </form>
      )}

      {resetSuccess && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-300 text-sm">
          ✓ Wachtwoordreset verstuurd naar {resetSuccess}
        </div>
      )}

      {/* Regular users */}
      {regularUsers.length > 0 && (
        <div className="bg-white/2 border border-white/6 rounded-xl overflow-hidden">
          <div className="px-5 py-3 border-b border-white/5">
            <h3 className="text-white/50 text-xs uppercase tracking-wider font-medium">Gebruikers ({regularUsers.length})</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 bg-white/1">
                <th className="text-left px-5 py-2.5 text-white/25 text-xs font-medium">Gebruiker</th>
                <th className="text-center px-4 py-2.5 text-white/25 text-xs font-medium">
                  <span className="flex items-center justify-center gap-1">
                    <Zap className="w-3 h-3 text-violet-400" />Salesmachine
                  </span>
                </th>
                <th className="text-center px-4 py-2.5 text-white/25 text-xs font-medium">
                  <span className="flex items-center justify-center gap-1">
                    <Music className="w-3 h-3 text-blue-400" />Marcos CRM
                  </span>
                </th>
                <th className="text-right px-5 py-2.5 text-white/25 text-xs font-medium">Acties</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {regularUsers.map((profile) => {
                const products = profile.products ?? {}
                const smOn = !!products.salesmachine
                const crmOn = !!products.marcos_crm

                return (
                  <tr key={profile.id} className="hover:bg-white/2 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-white/8 flex items-center justify-center text-white/50 text-xs font-bold shrink-0">
                          {(profile.name ?? profile.email)[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">{profile.name ?? profile.email}</p>
                          {profile.name && <p className="text-white/30 text-xs">{profile.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Toggle
                        on={smOn}
                        color="violet"
                        loading={actionLoading === profile.id + 'salesmachine'}
                        onChange={() => handleToggle(profile.id, 'salesmachine', smOn)}
                      />
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <Toggle
                        on={crmOn}
                        color="blue"
                        loading={actionLoading === profile.id + 'marcos_crm'}
                        onChange={() => handleToggle(profile.id, 'marcos_crm', crmOn)}
                      />
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => handlePasswordReset(profile.email)}
                          disabled={!!actionLoading}
                          title="Stuur wachtwoordreset e-mail"
                          className="p-1.5 rounded hover:bg-white/8 text-white/25 hover:text-white/60 transition-colors"
                        >
                          {actionLoading === profile.email + 'reset'
                            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            : <Mail className="w-3.5 h-3.5" />}
                        </button>
                        {deleteConfirm === profile.id ? (
                          <div className="flex items-center gap-1 bg-red-950/40 border border-red-500/20 rounded-lg px-2 py-1">
                            <span className="text-red-400 text-xs">Zeker?</span>
                            <button
                              onClick={() => handleDelete(profile.id)}
                              disabled={actionLoading === profile.id + 'delete'}
                              className="p-0.5 text-red-400 hover:text-red-300"
                            >
                              {actionLoading === profile.id + 'delete'
                                ? <Loader2 className="w-3 h-3 animate-spin" />
                                : <Check className="w-3 h-3" />}
                            </button>
                            <button onClick={() => setDeleteConfirm(null)} className="p-0.5 text-white/30 hover:text-white/60">
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirm(profile.id)}
                            title="Verwijder gebruiker"
                            className="p-1.5 rounded hover:bg-white/8 text-white/25 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {regularUsers.length === 0 && !showInvite && (
        <div className="bg-white/2 border border-white/6 rounded-xl p-10 text-center">
          <Plus className="w-6 h-6 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm mb-1">Nog geen andere gebruikers</p>
          <p className="text-white/20 text-xs">Klik op "Gebruiker uitnodigen" om iemand toe te voegen</p>
        </div>
      )}

      {/* Admin users (read-only) */}
      <div className="bg-white/1 border border-white/4 rounded-xl overflow-hidden">
        <div className="px-5 py-3 border-b border-white/4">
          <h3 className="text-white/30 text-xs uppercase tracking-wider font-medium flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-amber-400" />Admins — volledige toegang
          </h3>
        </div>
        {adminUsers.map((profile) => (
          <div key={profile.id} className="px-5 py-3.5 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-500/15 flex items-center justify-center text-amber-400/70 text-xs font-bold shrink-0">
              {(profile.name ?? profile.email)[0].toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="text-white/60 text-sm">{profile.name ?? profile.email}</p>
                {profile.id === currentUserId && <span className="text-white/20 text-xs">(jij)</span>}
              </div>
              {profile.name && <p className="text-white/25 text-xs">{profile.email}</p>}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 px-2 py-1 bg-violet-500/10 text-violet-400/60 rounded text-xs">
                <Check className="w-2.5 h-2.5" />Salesmachine
              </span>
              <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/10 text-blue-400/60 rounded text-xs">
                <Check className="w-2.5 h-2.5" />Marcos CRM
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function Toggle({
  on, color, loading, onChange,
}: {
  on: boolean
  color: 'violet' | 'blue'
  loading: boolean
  onChange: () => void
}) {
  return (
    <button
      onClick={onChange}
      disabled={loading}
      className={`w-11 h-6 rounded-full transition-all relative flex items-center ${
        on
          ? color === 'violet' ? 'bg-violet-600' : 'bg-blue-600'
          : 'bg-white/10 hover:bg-white/15'
      }`}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin text-white/50 mx-auto" />
      ) : (
        <span className={`absolute w-4 h-4 rounded-full bg-white shadow transition-all ${on ? 'left-6' : 'left-1'}`} />
      )}
    </button>
  )
}

function ProductToggle({
  icon: Icon, label, checked, onChange, color,
}: {
  icon: React.ElementType
  label: string
  checked: boolean
  onChange: (v: boolean) => void
  color: 'violet' | 'blue'
}) {
  const activeClass = color === 'violet'
    ? 'border-violet-500 bg-violet-600/20 text-violet-300'
    : 'border-blue-500 bg-blue-600/20 text-blue-300'

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all cursor-pointer select-none ${
        checked ? activeClass : 'border-white/10 bg-white/3 text-white/40 hover:border-white/25 hover:text-white/60'
      }`}
    >
      {checked
        ? <Check className="w-4 h-4" />
        : <Icon className="w-4 h-4" />}
      {label}
    </button>
  )
}
