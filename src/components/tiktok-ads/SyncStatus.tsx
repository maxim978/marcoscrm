'use client'

import { CheckCircle, XCircle, Loader2, Clock, AlertCircle } from 'lucide-react'
import type { SyncLog } from '@/lib/tiktok-ads/types'

const STATUS_CONFIG = {
  idle: { icon: <Clock className="h-4 w-4 text-slate-400" />, label: 'Inactief', color: 'text-slate-500' },
  running: { icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />, label: 'Bezig...', color: 'text-blue-600' },
  success: { icon: <CheckCircle className="h-4 w-4 text-emerald-500" />, label: 'Succesvol', color: 'text-emerald-600' },
  partial: { icon: <AlertCircle className="h-4 w-4 text-amber-500" />, label: 'Gedeeltelijk', color: 'text-amber-600' },
  failed: { icon: <XCircle className="h-4 w-4 text-red-500" />, label: 'Mislukt', color: 'text-red-600' },
}

interface SyncStatusProps {
  syncLog: SyncLog
}

export function SyncStatus({ syncLog }: SyncStatusProps) {
  const cfg = STATUS_CONFIG[syncLog.status] ?? STATUS_CONFIG.idle

  return (
    <div className="flex items-center gap-2 text-xs">
      {cfg.icon}
      <span className={`font-medium ${cfg.color}`}>{cfg.label}</span>
      {syncLog.completedAt && (
        <span className="text-slate-400">
          · Laatste sync{' '}
          {new Date(syncLog.completedAt).toLocaleString('nl-NL', {
            day: 'numeric',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      )}
      {syncLog.recordsProcessed !== undefined && syncLog.status === 'success' && (
        <span className="text-slate-400">· {syncLog.recordsProcessed} records</span>
      )}
      {syncLog.errorMessage && (
        <span className="text-red-500 truncate max-w-[200px]" title={syncLog.errorMessage}>
          · {syncLog.errorMessage}
        </span>
      )}
    </div>
  )
}
