'use client'

import type { TikTokAd } from '@/lib/tiktok-ads/types'

interface CreativeFunnelProps {
  ads: TikTokAd[]
}

export function CreativeFunnel({ ads }: CreativeFunnelProps) {
  // Sum across all ads
  const impressions = ads.reduce((s, a) => s + a.impressions, 0)
  const view2s = ads.reduce((s, a) => s + a.view2s, 0)
  const view6s = ads.reduce((s, a) => s + a.view6s, 0)
  const completions = ads.reduce((s, a) => s + a.completions, 0)
  const profileVisits = ads.reduce((s, a) => s + a.profileVisits, 0)
  const followers = ads.reduce((s, a) => s + a.followers, 0)

  const steps = [
    { label: 'Impressie', value: impressions, color: '#3071D8' },
    { label: '2s bekeken', value: view2s, color: '#5b91e0' },
    { label: '6s bekeken', value: view6s, color: '#E0B533' },
    { label: 'Video voltooid', value: completions, color: '#f0c844' },
    { label: 'Profiel bezocht', value: profileVisits, color: '#10b981' },
    { label: 'Gevolgd', value: followers, color: '#059669' },
  ]

  const maxValue = steps[0].value

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
      <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide mb-4">
        Creative funnel
      </h3>
      <div className="space-y-3">
        {steps.map((step, i) => {
          const pctOfMax = maxValue > 0 ? (step.value / maxValue) * 100 : 0
          const pctOfPrev =
            i > 0 && steps[i - 1].value > 0
              ? (step.value / steps[i - 1].value) * 100
              : 100
          const dropOff = 100 - pctOfPrev

          return (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: step.color }}
                  />
                  <span className="text-sm font-medium text-slate-700">{step.label}</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-bold text-slate-700">{step.value.toLocaleString('nl-NL')}</span>
                  {i > 0 && (
                    <span className={`font-medium ${dropOff > 20 ? 'text-red-500' : 'text-slate-400'}`}>
                      -{dropOff.toFixed(1)}%
                    </span>
                  )}
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pctOfMax}%`,
                    backgroundColor: step.color,
                  }}
                />
              </div>
              {i > 0 && (
                <div className="flex justify-end mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {pctOfPrev.toFixed(1)}% van vorige stap
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-3 gap-3">
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">2s Hook rate</p>
          <p className="text-lg font-bold text-slate-800">
            {impressions > 0 ? ((view2s / impressions) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Voltooiing</p>
          <p className="text-lg font-bold text-slate-800">
            {impressions > 0 ? ((completions / impressions) * 100).toFixed(1) : 0}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] text-slate-400 uppercase tracking-wide font-medium">Profiel → Volger</p>
          <p className="text-lg font-bold text-slate-800">
            {profileVisits > 0 ? ((followers / profileVisits) * 100).toFixed(1) : 0}%
          </p>
        </div>
      </div>
    </div>
  )
}
