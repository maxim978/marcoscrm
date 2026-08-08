'use client'

import { useState } from 'react'
import {
  Home, Disc, Video, Music, X, LogOut,
  Users, Search, Globe, Radio, Menu, Zap, Shield, BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logout } from '@/app/actions/auth'

const BOTTOM_TABS = [
  { href: '/dashboard', icon: Home, label: 'Home' },
  { href: '/dashboard/releases', icon: Disc, label: 'Releases' },
  { href: '/dashboard/tiktok', icon: Video, label: 'TikTok' },
  { href: '/dashboard/djs', icon: Music, label: "DJ's" },
]

const BASE_NAV = [
  { href: '/dashboard', icon: Home, label: 'Dashboard' },
  { href: '/dashboard/artists', icon: Users, label: 'Artists' },
  { href: '/dashboard/releases', icon: Disc, label: 'Releases' },
  { href: '/dashboard/targets', icon: Search, label: 'Spotify Lijsten' },
  { href: '/dashboard/influencers', icon: Users, label: 'Influencers' },
  { href: '/dashboard/contacts', icon: Users, label: 'Algemene Contacten' },
  { href: '/dashboard/channels', icon: Globe, label: 'Grote Kanalen' },
  { href: '/dashboard/djs', icon: Music, label: "DJ's" },
  { href: '/dashboard/radio', icon: Radio, label: 'Radiostations' },
  { href: '/dashboard/spotify', icon: Search, label: 'Spotify Finder' },
  { href: '/dashboard/tiktok', icon: Video, label: 'TikTok Sound Tracker' },
  { href: '/dashboard/tiktok-ads', icon: BarChart2, label: 'TikTok Ads' },
]

export function MobileNav({ user, hasSalesmachine }: { user: any; hasSalesmachine: boolean }) {
  const ALL_NAV = hasSalesmachine
    ? [...BASE_NAV, { href: '/salesmachine', icon: Zap, label: 'Salesmachine' }]
    : BASE_NAV
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <>
      {/* Bottom Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex safe-area-bottom">
        {BOTTOM_TABS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              isActive(href)
                ? 'text-[#3071d8]'
                : 'text-slate-400 active:text-slate-600'
            }`}
          >
            <Icon className={`h-5 w-5 ${isActive(href) ? 'stroke-[2.5]' : ''}`} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        ))}

        {/* Meer knop */}
        <button
          onClick={() => setMenuOpen(true)}
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
            menuOpen ? 'text-[#3071d8]' : 'text-slate-400'
          }`}
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Meer</span>
        </button>
      </nav>

      {/* Full-screen menu overlay */}
      {menuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm"
            onClick={() => setMenuOpen(false)}
          />
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-50 shadow-2xl max-h-[85vh] overflow-y-auto">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-slate-200 rounded-full" />
            </div>

            <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100">
              <span className="font-bold text-slate-800">Menu</span>
              <button onClick={() => setMenuOpen(false)} className="p-1.5 rounded-full bg-slate-100 text-slate-500">
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="p-4 grid grid-cols-2 gap-2">
              {ALL_NAV.map(({ href, icon: Icon, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3.5 rounded-xl font-semibold text-sm transition-colors ${
                    isActive(href)
                      ? 'bg-[#3071d8] text-white'
                      : 'bg-slate-50 text-slate-700 active:bg-slate-100'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              ))}
            </nav>

            <div className="px-4 pb-6 border-t border-slate-100 pt-3">
              <p className="text-xs text-slate-400 px-1 mb-3">{user.email}</p>
              <form action={logout}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 px-4 py-3.5 rounded-xl bg-red-50 text-red-600 font-semibold text-sm"
                >
                  <LogOut className="h-4 w-4" /> Uitloggen
                </button>
              </form>
            </div>

            {/* Safe area spacer */}
            <div className="h-safe-bottom" />
          </div>
        </>
      )}
    </>
  )
}
