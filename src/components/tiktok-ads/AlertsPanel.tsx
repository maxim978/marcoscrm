'use client'

import { useState } from 'react'
import { AlertTriangle, Info, XCircle, Check } from 'lucide-react'
import { markAlertRead } from '@/app/actions/tiktok-ads'
import type { TikTokAlert } from '@/lib/tiktok-ads/types'

const SEVERITY_STYLES: Record<string, { bg: string; border: string; icon: React.ReactNode; label: string }> = {
  critical: {
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: <XCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />,
    label: 'Kritiek',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />,
    label: 'Waarschuwing',
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />,
    label: 'Info',
  },
}

const SEVERITY_ORDER: Record<string, number> = { critical: 0, warning: 1, info: 2 }

interface AlertsPanelProps {
  initialAlerts: TikTokAlert[]
}

export function AlertsPanel({ initialAlerts }: AlertsPanelProps) {
  const [alerts, setAlerts] = useState<TikTokAlert[]>(initialAlerts)
  const [showRead, setShowRead] = useState(false)

  const sorted = [...alerts].sort(
    (a, b) =>
      (SEVERITY_ORDER[a.severity] ?? 9) - (SEVERITY_ORDER[b.severity] ?? 9)
  )
  const visible = sorted.filter((a) => showRead || !a.isRead)
  const unreadCount = alerts.filter((a) => !a.isRead).length

  async function toggleRead(id: string, current: boolean) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, isRead: !current } : a))
    )
    await markAlertRead(id, !current)
  }

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Meldingen</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => setShowRead((v) => !v)}
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {showRead ? 'Verberg gelezen' : 'Toon gelezen'}
        </button>
      </div>

      <div className="divide-y divide-slate-50">
        {visible.map((alert) => {
          const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.info
          return (
            <div
              key={alert.id}
              className={`p-4 ${alert.isRead ? 'opacity-60' : ''}`}
            >
              <div className={`rounded-lg p-3 border ${style.bg} ${style.border}`}>
                <div className="flex items-start gap-2.5">
                  {style.icon}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs font-bold text-slate-700">{alert.title}</span>
                      <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                        alert.severity === 'critical'
                          ? 'bg-red-200 text-red-700'
                          : alert.severity === 'warning'
                          ? 'bg-amber-200 text-amber-700'
                          : 'bg-blue-200 text-blue-700'
                      }`}>
                        {style.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{alert.description}</p>
                    {alert.suggestedAction && (
                      <p className="text-xs text-[#3071d8] mt-1 italic">
                        Tip: {alert.suggestedAction}
                      </p>
                    )}
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] text-slate-400">
                        {new Date(alert.detectedAt).toLocaleString('nl-NL', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      <button
                        onClick={() => toggleRead(alert.id, alert.isRead)}
                        className="flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        <Check className="h-3 w-3" />
                        {alert.isRead ? 'Markeer ongelezen' : 'Markeer gelezen'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        {visible.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            Geen {showRead ? '' : 'ongelezen '}meldingen
          </div>
        )}
      </div>
    </div>
  )
}
