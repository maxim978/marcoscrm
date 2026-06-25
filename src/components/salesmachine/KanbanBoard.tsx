'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { MapPin, Globe, TrendingUp } from 'lucide-react'
import { SM_PHASES, type SmPhase } from '@/lib/salesmachine/types'
import { updateLeadPhase } from '@/app/actions/salesmachine/leads'

interface Lead {
  id: string
  name: string
  city: string | null
  category: string | null
  score: number
  phase: SmPhase
  website: string | null
}

interface Props {
  projectId: string
  initialLeads: Lead[]
}

const PHASE_COLORS: Record<SmPhase, { bg: string; header: string; dot: string }> = {
  'Nieuw':        { bg: 'bg-slate-900/40', header: 'bg-slate-800/60', dot: 'bg-slate-400' },
  'Onderzoeken':  { bg: 'bg-blue-950/30', header: 'bg-blue-900/40', dot: 'bg-blue-400' },
  'Verrijkt':     { bg: 'bg-cyan-950/30', header: 'bg-cyan-900/40', dot: 'bg-cyan-400' },
  'Gekwalificeerd': { bg: 'bg-indigo-950/30', header: 'bg-indigo-900/40', dot: 'bg-indigo-400' },
  'Mail klaar':   { bg: 'bg-violet-950/30', header: 'bg-violet-900/40', dot: 'bg-violet-400' },
  'Mail verzonden': { bg: 'bg-purple-950/30', header: 'bg-purple-900/40', dot: 'bg-purple-400' },
  'Follow-up':    { bg: 'bg-amber-950/30', header: 'bg-amber-900/40', dot: 'bg-amber-400' },
  'Reactie':      { bg: 'bg-orange-950/30', header: 'bg-orange-900/40', dot: 'bg-orange-400' },
  'Afspraak':     { bg: 'bg-yellow-950/30', header: 'bg-yellow-900/40', dot: 'bg-yellow-400' },
  'Offerte':      { bg: 'bg-lime-950/30', header: 'bg-lime-900/40', dot: 'bg-lime-400' },
  'Gewonnen':     { bg: 'bg-green-950/30', header: 'bg-green-900/40', dot: 'bg-green-400' },
  'Verloren':     { bg: 'bg-red-950/30', header: 'bg-red-900/40', dot: 'bg-red-400' },
}

export function KanbanBoard({ projectId, initialLeads }: Props) {
  const [leads, setLeads] = useState(initialLeads)

  const byPhase = SM_PHASES.reduce<Record<SmPhase, Lead[]>>((acc, phase) => {
    acc[phase] = leads.filter((l) => l.phase === phase)
    return acc
  }, {} as Record<SmPhase, Lead[]>)

  async function onDragEnd(result: DropResult) {
    if (!result.destination) return
    const leadId = result.draggableId
    const newPhase = result.destination.droppableId as SmPhase

    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, phase: newPhase } : l))
    )
    await updateLeadPhase(leadId, newPhase, projectId)
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto p-6 min-h-screen" style={{ minWidth: 'max-content' }}>
        {SM_PHASES.map((phase) => {
          const colors = PHASE_COLORS[phase]
          const phaseLeads = byPhase[phase]
          return (
            <div key={phase} className={`${colors.bg} border border-white/5 rounded-xl flex flex-col w-56 shrink-0`}>
              {/* Column header */}
              <div className={`${colors.header} rounded-t-xl px-3 py-2.5 flex items-center gap-2`}>
                <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                <span className="text-white/80 text-xs font-medium truncate">{phase}</span>
                <span className="ml-auto text-white/30 text-xs">{phaseLeads.length}</span>
              </div>

              {/* Cards */}
              <Droppable droppableId={phase}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-2 space-y-2 min-h-[120px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/3' : ''
                    }`}
                  >
                    {phaseLeads.map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-[#0d0d15] border border-white/8 rounded-lg p-3 cursor-grab select-none transition-shadow ${
                              snapshot.isDragging ? 'shadow-xl shadow-black/40 border-violet-500/30 rotate-1' : ''
                            }`}
                          >
                            <p className="text-white text-xs font-medium leading-snug mb-2 line-clamp-2">{lead.name}</p>
                            <div className="space-y-1">
                              {lead.city && (
                                <span className="flex items-center gap-1 text-white/30 text-xs">
                                  <MapPin className="w-2.5 h-2.5" />{lead.city}
                                </span>
                              )}
                              {lead.category && (
                                <span className="flex items-center gap-1 text-white/25 text-xs">
                                  <span className="truncate">{lead.category}</span>
                                </span>
                              )}
                              {lead.score > 0 && (
                                <span className="flex items-center gap-1 text-white/30 text-xs">
                                  <TrendingUp className="w-2.5 h-2.5" />{lead.score}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          )
        })}
      </div>
    </DragDropContext>
  )
}
