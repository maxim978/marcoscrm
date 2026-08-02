'use client'

import { METRIC_CONFIG } from '@/lib/tiktok-ads/metrics'
import type { TikTokAd } from '@/lib/tiktok-ads/types'

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actief',
  PAUSED: 'Gepauzeerd',
}
const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
}

interface AdsSectionProps {
  ads: TikTokAd[]
}

export function AdsSection({ ads }: AdsSectionProps) {
  const sorted = [...ads].sort((a, b) => b.spend - a.spend).slice(0, 8)

  return (
    <div className="bg-white rounded-xl ring-1 ring-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Top Advertenties
        </h3>
        <p className="text-xs text-slate-400 mt-0.5">Gesorteerd op uitgegeven budget</p>
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {[
                'Advertentie', 'Status', 'Uitgegeven', 'Impressies', 'Video views',
                'CTR', '2s Hook', 'Voltooiing', 'Volgers', 'CPF',
              ].map((h) => (
                <th key={h} className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wide whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sorted.map((ad) => (
              <tr key={ad.id} className="hover:bg-slate-50/50">
                <td className="px-3 py-3">
                  <span className="font-semibold text-slate-800 max-w-[180px] truncate block">
                    {ad.name}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[ad.status] ?? 'bg-slate-100 text-slate-600'}`}>
                    {STATUS_LABELS[ad.status] ?? ad.status}
                  </span>
                </td>
                <td className="px-3 py-3 text-slate-700">{METRIC_CONFIG.spend.format(ad.spend)}</td>
                <td className="px-3 py-3 text-slate-700">{METRIC_CONFIG.impressions.format(ad.impressions)}</td>
                <td className="px-3 py-3 text-slate-700">{METRIC_CONFIG.videoViews.format(ad.videoViews)}</td>
                <td className="px-3 py-3 text-slate-700">{METRIC_CONFIG.ctr.format(ad.ctr)}</td>
                <td className="px-3 py-3 text-slate-700">{ad.hookRate2s.toFixed(1)}%</td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#3071d8] rounded-full"
                        style={{ width: `${Math.min(100, ad.completionRate)}%` }}
                      />
                    </div>
                    <span className="text-slate-700 text-xs">{ad.completionRate.toFixed(0)}%</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-slate-700">{METRIC_CONFIG.followers.format(ad.followers)}</td>
                <td className="px-3 py-3 text-slate-700">{METRIC_CONFIG.spend.format(ad.costPerFollower)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-slate-100">
        {sorted.map((ad) => (
          <div key={ad.id} className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-slate-800 text-sm">{ad.name}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[ad.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {STATUS_LABELS[ad.status] ?? ad.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Uitgegeven', value: METRIC_CONFIG.spend.format(ad.spend) },
                { label: 'Video views', value: METRIC_CONFIG.videoViews.format(ad.videoViews) },
                { label: 'CTR', value: METRIC_CONFIG.ctr.format(ad.ctr) },
                { label: 'Volgers', value: METRIC_CONFIG.followers.format(ad.followers) },
                { label: '2s Hook', value: `${ad.hookRate2s.toFixed(1)}%` },
                { label: 'Voltooiing', value: `${ad.completionRate.toFixed(0)}%` },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">{item.label}</p>
                  <p className="text-sm font-bold text-slate-700">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
