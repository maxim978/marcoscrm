'use client'

import { useState } from 'react'
import { Save, Loader2, Target } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { upsertGoals } from '@/app/actions/tiktok-ads'
import type { DashboardGoals } from '@/lib/tiktok-ads/types'

interface GoalsPanelProps {
  initialGoals: DashboardGoals
}

interface GoalField {
  key: keyof DashboardGoals
  label: string
  placeholder: string
  prefix?: string
  suffix?: string
  step?: string
}

const GOAL_FIELDS: GoalField[] = [
  { key: 'maxCpm', label: 'Max CPM', placeholder: '1.50', prefix: '€', step: '0.01' },
  { key: 'maxCpc', label: 'Max CPC', placeholder: '0.20', prefix: '€', step: '0.01' },
  { key: 'maxCostPerFollower', label: 'Max cost per volger', placeholder: '5.00', prefix: '€', step: '0.01' },
  { key: 'minCtr', label: 'Min CTR', placeholder: '1.00', suffix: '%', step: '0.01' },
  { key: 'minEngagementRate', label: 'Min engagement rate', placeholder: '4.00', suffix: '%', step: '0.01' },
  { key: 'minCompletionRate', label: 'Min voltooiingsratio', placeholder: '25.00', suffix: '%', step: '0.01' },
  { key: 'weekBudget', label: 'Weekbudget', placeholder: '1400', prefix: '€', step: '10' },
  { key: 'monthBudget', label: 'Maandbudget', placeholder: '5600', prefix: '€', step: '10' },
  { key: 'targetFollowers', label: 'Streefaantal volgers', placeholder: '1000', step: '1' },
]

export function GoalsPanel({ initialGoals }: GoalsPanelProps) {
  const [goals, setGoals] = useState<DashboardGoals>(initialGoals)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleChange(key: keyof DashboardGoals, val: string) {
    setGoals((prev) => ({
      ...prev,
      [key]: val === '' ? undefined : parseFloat(val),
    }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    try {
      await upsertGoals(goals)
      setSaved(true)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-[#3071d8]" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Doelstellingen</h3>
        </div>
        <Button
          onClick={handleSave}
          disabled={saving}
          size="sm"
          className="gap-1.5 bg-[#3071d8] text-white hover:bg-[#2560c0]"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : saved ? (
            '✓ Opgeslagen'
          ) : (
            <>
              <Save className="h-3.5 w-3.5" /> Opslaan
            </>
          )}
        </Button>
      </div>

      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {GOAL_FIELDS.map((field) => (
          <div key={field.key}>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              {field.label}
            </label>
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:border-[#3071d8]/50">
              {field.prefix && (
                <span className="px-2.5 py-2 bg-slate-50 text-slate-400 text-sm border-r border-slate-200">
                  {field.prefix}
                </span>
              )}
              <input
                type="number"
                value={goals[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
                placeholder={field.placeholder}
                step={field.step ?? '1'}
                min={0}
                className="flex-1 px-2.5 py-2 text-sm bg-white focus:outline-none text-slate-700"
              />
              {field.suffix && (
                <span className="px-2.5 py-2 bg-slate-50 text-slate-400 text-sm border-l border-slate-200">
                  {field.suffix}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 pb-4">
        <p className="text-xs text-slate-400">
          Doelstellingen worden gebruikt voor KPI-indicatoren en automatische meldingen.
        </p>
      </div>
    </div>
  )
}
