'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import {
  Zap, FolderOpen, Plus, LayoutDashboard, Users,
  Mail, BarChart2, Settings, LogOut, ChevronDown, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { logout } from '@/app/actions/auth'
import type { User } from '@supabase/supabase-js'

interface Props {
  user: User
  projects: { id: string; name: string }[]
}

export function SmSidebar({ user, projects }: Props) {
  const pathname = usePathname()
  const [expanded, setExpanded] = useState(true)

  const activeProjectId = pathname.match(/\/salesmachine\/projects\/([^/]+)/)?.[1]

  return (
    <aside className="w-64 bg-[#0d0d15] border-r border-white/5 flex flex-col h-screen sticky top-0 shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/5">
        <Link href="/salesmachine" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-[var(--font-syne)] font-800 text-white text-lg tracking-tight">
            Salesmachine
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        <NavItem href="/salesmachine" icon={LayoutDashboard} label="Dashboard" pathname={pathname} exact />

        {/* Projects */}
        <div className="pt-3 pb-1">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 w-full px-2 py-1 text-xs font-semibold text-white/30 uppercase tracking-widest hover:text-white/50 transition-colors"
          >
            {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            Projecten
          </button>
        </div>

        {expanded && (
          <div className="space-y-0.5">
            {projects.map((p) => (
              <Link
                key={p.id}
                href={`/salesmachine/projects/${p.id}/leads`}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all truncate',
                  activeProjectId === p.id
                    ? 'bg-violet-600/20 text-violet-300 font-medium'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                <span className="truncate">{p.name}</span>
              </Link>
            ))}
            <Link
              href="/salesmachine/projects/new"
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-violet-400 hover:text-violet-300 hover:bg-violet-600/10 transition-all"
            >
              <Plus className="w-4 h-4 shrink-0" />
              Nieuw project
            </Link>
          </div>
        )}

        {activeProjectId && (
          <>
            <div className="pt-3 pb-1">
              <span className="px-2 py-1 text-xs font-semibold text-white/30 uppercase tracking-widest block">
                Huidig project
              </span>
            </div>
            <NavItem href={`/salesmachine/projects/${activeProjectId}/leads`} icon={BarChart2} label="Leads" pathname={pathname} />
            <NavItem href={`/salesmachine/projects/${activeProjectId}/board`} icon={LayoutDashboard} label="Kanban Board" pathname={pathname} />
            <NavItem href={`/salesmachine/projects/${activeProjectId}/contacts`} icon={Users} label="Contacten" pathname={pathname} />
            <NavItem href={`/salesmachine/projects/${activeProjectId}/campaigns`} icon={Mail} label="Campagnes" pathname={pathname} />
            <NavItem href={`/salesmachine/projects/${activeProjectId}/settings`} icon={Settings} label="Instellingen" pathname={pathname} />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/5">
        <div className="px-3 py-2 mb-1">
          <p className="text-xs text-white/30 truncate">{user.email}</p>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
          >
            <LogOut className="w-4 h-4" />
            Uitloggen
          </button>
        </form>
      </div>
    </aside>
  )
}

function NavItem({
  href, icon: Icon, label, pathname, exact,
}: {
  href: string
  icon: React.ElementType
  label: string
  pathname: string
  exact?: boolean
}) {
  const active = exact ? pathname === href : pathname.startsWith(href)
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all',
        active
          ? 'bg-violet-600/20 text-violet-300 font-medium'
          : 'text-white/50 hover:text-white hover:bg-white/5'
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  )
}
