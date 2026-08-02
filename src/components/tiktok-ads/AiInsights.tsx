'use client'

import { useState } from 'react'
import { Loader2, RefreshCw, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getInsights } from '@/app/actions/tiktok-ads'
import type { AiInsight } from '@/lib/tiktok-ads/types'

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-100 text-red-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-100 text-slate-600',
}

const PRIORITY_LABELS: Record<string, string> = {
  high: 'Hoog',
  medium: 'Medium',
  low: 'Laag',
}

interface AiInsightsProps {
  initialInsights: AiInsight[]
}

export function AiInsights({ initialInsights }: AiInsightsProps) {
  const [insights, setInsights] = useState<AiInsight[]>(initialInsights)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  async function handleRefresh() {
    setLoading(true)
    try {
      const fresh = await getInsights()
      setInsights(fresh)
      setLastRefresh(new Date())
    } catch {
      // silently keep existing insights
    } finally {
      setLoading(false)
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-[#E0B533]" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
            AI Insights
          </h3>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && (
            <span className="text-xs text-slate-400">
              Bijgewerkt {lastRefresh.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )}
          <Button
            onClick={handleRefresh}
            disabled={loading}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Analyse vernieuwen
          </Button>
        </div>
      </div>

      <div className="divide-y divide-slate-50">
        {insights.map((insight) => {
          const isOpen = expanded.has(insight.id)
          return (
            <button
              key={insight.id}
              onClick={() => toggleExpand(insight.id)}
              className="w-full text-left p-4 hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="flex flex-col gap-1.5 shrink-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${PRIORITY_STYLES[insight.priority]}`}>
                    {PRIORITY_LABELS[insight.priority]}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-600 whitespace-nowrap">
                    {insight.category}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">{insight.conclusion}</p>
                  {isOpen && (
                    <div className="mt-2 space-y-1.5">
                      <p className="text-xs text-slate-500 leading-relaxed">{insight.reasoning}</p>
                      <p className="text-xs text-[#3071d8] italic font-medium">
                        Actie: {insight.action}
                      </p>
                    </div>
                  )}
                  {!isOpen && (
                    <p className="text-xs text-slate-400 mt-0.5">Klik om details te zien</p>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
