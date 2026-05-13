import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Home, Disc, Users, Settings, LogOut, Search } from 'lucide-react'
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
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-slate-900 text-white flex-shrink-0">
        <div className="p-4 py-6">
          <h1 className="text-2xl font-bold tracking-tight">Marcos CRM</h1>
        </div>
        <nav className="flex flex-col gap-2 p-4">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Home className="h-5 w-5" />
            Dashboard
          </Link>
          <Link href="/dashboard/artists" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="h-5 w-5" />
            Artists
          </Link>
          <Link href="/dashboard/releases" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Disc className="h-5 w-5" />
            Releases
          </Link>
          <Link href="/dashboard/targets" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Users className="h-5 w-5" />
            Targets
          </Link>
          <Link href="/dashboard/spotify" className="flex items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
            <Search className="h-5 w-5" />
            Spotify Finder
          </Link>
        </nav>
        <div className="mt-auto p-4 border-t border-slate-800 absolute bottom-0 w-full md:w-64">
          <form action={logout}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors text-left">
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-slate-50 relative pb-16 md:pb-0">
        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6">
          <h2 className="text-lg font-medium text-slate-800">Welcome, {user.user_metadata?.name || user.email}</h2>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
