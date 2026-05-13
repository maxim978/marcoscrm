import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Disc, Users, Settings, LogOut, Search, Video, Menu, X } from 'lucide-react'
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-slate-50">
      {/* Mobile Header */}
      <div className="md:hidden bg-[#3071d8] border-b border-white/10 p-4 flex justify-between items-center sticky top-0 z-50 h-20">
        <div className="flex items-center">
          <img src="/images/Logo-Marco-Kraats-2024-omlijnd (1).png" alt="Marco Kraats Logo" className="h-12 w-auto" />
        </div>
        <MobileNav user={user} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-[#3071d8] text-white flex-col flex-shrink-0 sticky top-0 h-screen shadow-xl">
        <div className="p-6 flex justify-center bg-white border-b border-slate-100 mb-2">
          <img src="/images/Logo-Marco-Kraats-2024-omlijnd (1).png" alt="Marco Kraats Logo" className="h-10 w-auto" />
        </div>
        <nav className="flex flex-col gap-1 p-4">
          <NavLinks />
        </nav>
        <div className="mt-auto p-4 border-t border-slate-800">
          <SignOutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 relative">
        {/* Desktop Topbar */}
        <header className="hidden md:flex bg-white border-b border-slate-200 h-16 items-center justify-between px-6 sticky top-0 z-40">
          <h2 className="text-lg font-medium text-slate-800">Welcome, {user.user_metadata?.name || user.email}</h2>
        </header>
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
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
        <Users className="h-5 w-5" /> Targets
      </Link>
      <Link href="/dashboard/spotify" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Search className="h-5 w-5" /> Spotify Finder
      </Link>
      <Link href="/dashboard/tiktok" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-blue-50 hover:bg-[#dfb433] hover:text-slate-900 transition-all font-medium">
        <Video className="h-5 w-5" /> TikTok Hunter
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
