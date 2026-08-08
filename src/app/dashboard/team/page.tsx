import { getTeamMembers } from '@/app/actions/team'
import { TeamManager } from '@/components/team/TeamManager'
import { Users } from 'lucide-react'

export default async function TeamPage() {
  const members = await getTeamMembers()

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#3071d8]/10 flex items-center justify-center">
          <Users className="h-5 w-5 text-[#3071d8]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Teamtoegang</h1>
          <p className="text-slate-500 text-sm">Geef andere gebruikers leestoegang tot jouw data.</p>
        </div>
      </div>

      <TeamManager initialMembers={members} />
    </div>
  )
}
