'use client'

import { useState } from 'react'
import { Menu, X, Home, Disc, Users, Search, Video, LogOut } from 'lucide-react'
import Link from 'next/link'
import { logout } from '@/app/actions/auth'

export function MobileNav({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)

  const toggle = () => setIsOpen(!isOpen)

  return (
    <>
      <button onClick={toggle} className="p-2 text-white">
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-slate-900 border-t border-slate-800 z-50 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-4 gap-2">
            <Link href="/dashboard" onClick={toggle} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-slate-800 active:bg-slate-700">
              <Home className="h-5 w-5" /> Dashboard
            </Link>
            <Link href="/dashboard/artists" onClick={toggle} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-slate-800 active:bg-slate-700">
              <Users className="h-5 w-5" /> Artists
            </Link>
            <Link href="/dashboard/releases" onClick={toggle} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-slate-800 active:bg-slate-700">
              <Disc className="h-5 w-5" /> Releases
            </Link>
            <Link href="/dashboard/targets" onClick={toggle} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-slate-800 active:bg-slate-700">
              <Users className="h-5 w-5" /> Targets
            </Link>
            <Link href="/dashboard/spotify" onClick={toggle} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-slate-800 active:bg-slate-700">
              <Search className="h-5 w-5" /> Spotify Finder
            </Link>
            <Link href="/dashboard/tiktok" onClick={toggle} className="flex items-center gap-3 rounded-lg px-3 py-3 text-slate-300 hover:bg-slate-800 active:bg-slate-700">
              <Video className="h-5 w-5" /> TikTok Hunter
            </Link>
            
            <div className="mt-4 pt-4 border-t border-slate-800">
              <p className="px-3 mb-4 text-xs text-slate-500 uppercase">Logged in as {user.email}</p>
              <form action={logout}>
                <button type="submit" className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-red-400 hover:bg-slate-800 active:bg-slate-700">
                  <LogOut className="h-5 w-5" /> Sign Out
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
