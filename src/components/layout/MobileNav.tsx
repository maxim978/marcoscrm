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
        <div className="absolute top-20 left-0 w-full bg-[#3071d8] border-t border-white/10 shadow-2xl z-50 animate-in slide-in-from-top duration-300">
          <nav className="flex flex-col p-6 gap-3">
            <Link href="/dashboard" onClick={toggle} className="flex items-center gap-4 rounded-xl px-4 py-4 text-white hover:bg-white/10 active:bg-white/20 transition-colors font-bold">
              <Home className="h-6 w-6 text-[#dfb433]" /> Dashboard
            </Link>
            <Link href="/dashboard/artists" onClick={toggle} className="flex items-center gap-4 rounded-xl px-4 py-4 text-white hover:bg-white/10 active:bg-white/20 transition-colors font-bold">
              <Users className="h-6 w-6 text-[#dfb433]" /> Artists
            </Link>
            <Link href="/dashboard/releases" onClick={toggle} className="flex items-center gap-4 rounded-xl px-4 py-4 text-white hover:bg-white/10 active:bg-white/20 transition-colors font-bold">
              <Disc className="h-6 w-6 text-[#dfb433]" /> Releases
            </Link>
            <Link href="/dashboard/targets" onClick={toggle} className="flex items-center gap-4 rounded-xl px-4 py-4 text-white hover:bg-white/10 active:bg-white/20 transition-colors font-bold">
              <Users className="h-6 w-6 text-[#dfb433]" /> Targets
            </Link>
            <Link href="/dashboard/spotify" onClick={toggle} className="flex items-center gap-4 rounded-xl px-4 py-4 text-white hover:bg-white/10 active:bg-white/20 transition-colors font-bold">
              <Search className="h-6 w-6 text-[#dfb433]" /> Spotify Finder
            </Link>
            <Link href="/dashboard/tiktok" onClick={toggle} className="flex items-center gap-4 rounded-xl px-4 py-4 text-white hover:bg-white/10 active:bg-white/20 transition-colors font-bold">
              <Video className="h-6 w-6 text-[#dfb433]" /> TikTok Hunter
            </Link>
            
            <div className="mt-6 pt-6 border-t border-white/10">
              <p className="px-4 mb-4 text-xs text-white/60 uppercase font-black tracking-widest">Ingelogd als {user.email}</p>
              <form action={logout}>
                <button type="submit" className="flex w-full items-center gap-4 rounded-xl px-4 py-4 text-red-300 hover:bg-white/10 active:bg-white/20 font-bold">
                  <LogOut className="h-6 w-6" /> Uitloggen
                </button>
              </form>
            </div>
          </nav>
        </div>
      )}
    </>
  )
}
