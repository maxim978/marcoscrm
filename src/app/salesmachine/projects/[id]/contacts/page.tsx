import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Mail, User, Building2 } from 'lucide-react'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ContactsPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: project } = await supabase
    .from('sm_projects')
    .select('id')
    .eq('id', id)
    .single()

  if (!project) redirect('/salesmachine')

  const { data: contacts } = await supabase
    .from('sm_contacts')
    .select('*, sm_leads(name, city, website)')
    .eq('project_id', id)
    .order('created_at', { ascending: false })

  const withEmail = contacts?.filter((c) => c.email) ?? []
  const withoutEmail = contacts?.filter((c) => !c.email) ?? []

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-[var(--font-syne)] font-bold text-white text-lg">Contacten</h2>
          <p className="text-white/30 text-sm mt-0.5">
            {contacts?.length ?? 0} contacten · {withEmail.length} met e-mailadres
          </p>
        </div>
      </div>

      {!contacts?.length ? (
        <div className="bg-[#0d0d15] border border-white/8 rounded-xl p-12 text-center">
          <User className="w-8 h-8 text-white/15 mx-auto mb-3" />
          <p className="text-white/30 text-sm">Nog geen contacten — gebruik "Contacten zoeken" op de leads pagina</p>
        </div>
      ) : (
        <div className="bg-[#0d0d15] border border-white/8 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">Naam</th>
                <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden md:table-cell">Functie</th>
                <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider">E-mail</th>
                <th className="text-left px-4 py-3 text-white/30 text-xs font-medium uppercase tracking-wider hidden lg:table-cell">Bedrijf</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/3">
              {contacts.map((contact) => (
                <tr key={contact.id} className="hover:bg-white/2 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-violet-600/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-violet-400" />
                      </div>
                      <span className="text-white font-medium truncate max-w-[140px]">
                        {contact.name ?? '—'}
                      </span>
                      {contact.is_primary && (
                        <span className="px-1.5 py-0.5 bg-violet-600/20 text-violet-400 text-xs rounded">Primair</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-white/40 text-xs">{contact.title ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3">
                    {contact.email ? (
                      <a
                        href={`mailto:${contact.email}`}
                        className="flex items-center gap-1.5 text-violet-400 hover:text-violet-300 text-xs transition-colors"
                      >
                        <Mail className="w-3 h-3" />
                        {contact.email}
                      </a>
                    ) : (
                      <span className="text-white/20 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {contact.sm_leads && (
                      <div className="flex items-center gap-1.5 text-white/40 text-xs">
                        <Building2 className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[140px]">{(contact.sm_leads as { name: string }).name}</span>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
