import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Disc, Users, Settings, LogOut, Search, Video, Menu, X } from 'lucide-react'
import { logout } from '../actions/auth'
import { useState } from 'react'

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
      <div className="md:hidden bg-slate-900 text-white p-4 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-xl font-bold tracking-tight">Marcos CRM</h1>
        <MobileNav user={user} />
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col flex-shrink-0 sticky top-0 h-screen">
        <div className="p-6">
          <h1 className="text-2xl font-bold tracking-tight">Marcos CRM</h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
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
      <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <Home className="h-5 w-5" /> Dashboard
      </Link>
      <Link href="/dashboard/artists" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <Users className="h-5 w-5" /> Artists
      </Link>
      <Link href="/dashboard/releases" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <Disc className="h-5 w-5" /> Releases
      </Link>
      <Link href="/dashboard/targets" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <Users className="h-5 w-5" /> Targets
      </Link>
      <Link href="/dashboard/spotify" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <Search className="h-5 w-5" /> Spotify Finder
      </Link>
      <Link href="/dashboard/tiktok" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
        <Video className="h-5 w-5" /> TikTok Hunter
      </Link>
    </>
  )
}

function SignOutButton() {
  return (
    <form action={logout}>
      <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left">
        <LogOut className="h-5 w-5" /> Sign Out
      </button>
    </form>
  )
}

import { MobileNav } from '@/components/layout/MobileNav'
