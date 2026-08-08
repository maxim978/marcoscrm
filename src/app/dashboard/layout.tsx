import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Disc, Users, Settings, LogOut, Search, Video, Menu, X, Globe, Music, Radio, BarChart2, UserCog } from 'lucide-react'
import { logout } from '../actions/auth'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('products')
    .eq('id', user.id)
    .single()

  const products = (profile?.products ?? {}) as { salesmachine?: boolean }
  const hasSalesmachine = products.salesmachine === true

  return (
    <div className="flex flex-col md:flex-row bg-slate-50 min-h-screen md:h-screen md:overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#3071d8] border-b border-white/10 px-5 flex items-center sticky top-0 z-40 h-16 flex-shrink-0">
        <img src="/images/Logo-Marco-Kraats-2024-omlijnd (1).png" alt="Marco Kraats Logo" className="h-10 w-auto" />
      </div>
      <MobileNav user={user} hasSalesmachine={hasSalesmachine} />

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#3071d8] text-white flex-col flex-shrink-0 overflow-y-auto shadow-xl">
        <div className="p-6 flex justify-center bg-white border-b border-slate-100 mb-2 flex-shrink-0">
          <img src="/images/Logo-Marco-Kraats-2024-omlijnd (1).png" alt="Marco Kraats Logo" className="h-10 w-auto" />
        </div>
        <nav className="flex flex-col gap-1 p-4 flex-1">
          <NavLinks />
        </nav>
        <div className="p-4 border-t border-white/20 flex-shrink-0">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:overflow-y-auto relative flex flex-col">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-between px-6 flex-shrink-0 z-40">
          <h2 className="text-lg font-medium text-slate-800">Welcome, {user.user_metadata?.name || user.email}</h2>
        </header>

        <div className="p-4 md:p-8 pb-24 md:pb-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
    </div>
  )
}

// Client Components for interactivity
function NavLinks() {
  return (
    <>
      <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Home className="h-5 w-5" /> Dashboard
      </Link>
      <Link href="/dashboard/artists" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Users className="h-5 w-5" /> Artists
      </Link>
      <Link href="/dashboard/releases" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Disc className="h-5 w-5" /> Releases
      </Link>
      <Link href="/dashboard/targets" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Search className="h-5 w-5" /> Spotify Lijsten
      </Link>
      <Link href="/dashboard/influencers" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Users className="h-5 w-5" /> Influencers
      </Link>
      <Link href="/dashboard/contacts" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Users className="h-5 w-5" /> Algemene Contacten
      </Link>
      <Link href="/dashboard/channels" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Globe className="h-5 w-5" /> Grote Kanalen
      </Link>
      <Link href="/dashboard/djs" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Music className="h-5 w-5" /> DJ's
      </Link>
      <Link href="/dashboard/radio" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Radio className="h-5 w-5" /> Radiostations
      </Link>
      <Link href="/dashboard/spotify" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Search className="h-5 w-5" /> Spotify Finder
      </Link>
      <Link href="/dashboard/tiktok" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Video className="h-5 w-5" /> TikTok Sound Tracker
      </Link>
      <Link href="/dashboard/tiktok-ads" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <BarChart2 className="h-5 w-5" /> TikTok Ads
      </Link>
      <div className="my-1 border-t border-white/10" />
      <Link href="/dashboard/team" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <UserCog className="h-5 w-5" /> Teamtoegang
      </Link>
    </>
  )
}

function SignOutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-blue-100 hover:bg-white/10 hover:text-white transition-all text-left font-medium">
        <LogOut className="h-5 w-5" /> Uitloggen
      </button>
    </form>
  )
}

import { MobileNav } from '@/components/layout/MobileNav'
