import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Zap, Music, Shield, ArrowRight } from 'lucide-react'
import { logout } from './actions/auth'

export const dynamic = 'force-dynamic'

export default async function ProductSelector() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('name, products, is_admin')
    .eq('id', user.id)
    .single()

  const products = (profile?.products ?? {}) as { salesmachine?: boolean; marcos_crm?: boolean }
  const hasSalesmachine = products.salesmachine === true
  const hasMarcoscrm = products.marcos_crm === true
  const isAdmin = profile?.is_admin === true

  // Als maar 1 product beschikbaar: direct doorsturen
  if (hasSalesmachine && !hasMarcoscrm) redirect('/salesmachine')
  if (hasMarcoscrm && !hasSalesmachine) redirect('/dashboard')

  const displayName = profile?.name ?? user.email

  return (
    <div className="min-h-screen bg-[#08080f] flex flex-col items-center justify-center p-6">
      {/* Achtergrond glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/8 rounded-full blur-[120px]" />
      </div>

      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-white/30 text-sm mb-2">Welkom terug, {displayName}</p>
          <h1 className="text-white text-3xl font-bold tracking-tight">Kies een product</h1>
        </div>

        {/* Product kaarten */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <ProductCard
            href="/salesmachine"
            icon={Zap}
            title="Salesmachine"
            description="AI-gedreven B2B lead generation. Vind automatisch honderden potentiële klanten, verrijk ze en schrijf gepersonaliseerde cold emails."
            iconBg="bg-violet-600/20"
            iconColor="text-violet-400"
            borderHover="hover:border-violet-500/40"
            disabled={!hasSalesmachine}
            label="Lead generation & Sales CRM"
          />
          <ProductCard
            href="/dashboard"
            icon={Music}
            title="Marcos CRM"
            description="Artist release management. Beheer artiesten, releases, targets, playlists, influencers en je volledige music industry network."
            iconBg="bg-blue-600/20"
            iconColor="text-blue-400"
            borderHover="hover:border-blue-500/40"
            disabled={!hasMarcoscrm}
            label="Music industry CRM"
          />
        </div>

        {/* Admin link */}
        {isAdmin && (
          <div className="text-center">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-white/25 hover:text-white/50 text-xs transition-colors"
            >
              <Shield className="w-3 h-3" />
              Gebruikersbeheer
            </Link>
          </div>
        )}

        {/* Uitloggen */}
        <div className="text-center mt-4">
          <form action={logout}>
            <button type="submit" className="text-white/20 hover:text-white/40 text-xs transition-colors">
              Uitloggen
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

function ProductCard({
  href, icon: Icon, title, description, iconBg, iconColor,
  borderHover, disabled, label,
}: {
  href: string
  icon: React.ElementType
  title: string
  description: string
  iconBg: string
  iconColor: string
  borderHover: string
  disabled: boolean
  label: string
}) {
  if (disabled) {
    return (
      <div className="bg-white/2 border border-white/5 rounded-2xl p-6 opacity-40 cursor-not-allowed select-none">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-white/30 text-xs uppercase tracking-widest font-medium block mb-1">{label}</span>
        <h2 className="text-white font-bold text-lg mb-2">{title}</h2>
        <p className="text-white/30 text-sm leading-relaxed">{description}</p>
        <p className="text-white/20 text-xs mt-4">Geen toegang</p>
      </div>
    )
  }

  return (
    <Link
      href={href}
      className={`group bg-white/3 border border-white/8 rounded-2xl p-6 transition-all ${borderHover} hover:bg-white/5`}
    >
      <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center mb-4`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <span className="text-white/30 text-xs uppercase tracking-widest font-medium block mb-1">{label}</span>
      <h2 className="text-white font-bold text-lg mb-2">{title}</h2>
      <p className="text-white/40 text-sm leading-relaxed mb-4">{description}</p>
      <div className="flex items-center gap-1.5 text-white/30 group-hover:text-white/60 text-sm transition-colors">
        Openen <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  )
}
