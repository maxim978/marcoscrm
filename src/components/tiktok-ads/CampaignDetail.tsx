'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { METRIC_CONFIG } from '@/lib/tiktok-ads/metrics'
import { AdsSection } from './AdsSection'
import type { TikTokCampaign, TikTokAd } from '@/lib/tiktok-ads/types'

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-700',
  PAUSED: 'bg-amber-100 text-amber-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  DRAFT: 'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Actief',
  PAUSED: 'Gepauzeerd',
  COMPLETED: 'Voltooid',
  DRAFT: 'Concept',
  REJECTED: 'Afgewezen',
}

interface CampaignDetailProps {
  campaign: TikTokCampaign
  ads: TikTokAd[]
}

export function CampaignDetail({ campaign, ads }: CampaignDetailProps) {
  const metrics: { key: keyof TikTokCampaign; label: string; format: (v: number) => string }[] = [
    { key: 'spend', label: 'Uitgegeven', format: METRIC_CONFIG.spend.format },
    { key: 'impressions', label: 'Impressies', format: METRIC_CONFIG.impressions.format },
    { key: 'reach', label: 'Bereik', format: METRIC_CONFIG.reach.format },
    { key: 'videoViews', label: 'Video views', format: METRIC_CONFIG.videoViews.format },
    { key: 'clicks', label: 'Clicks', format: METRIC_CONFIG.clicks.format },
    { key: 'ctr', label: 'CTR', format: METRIC_CONFIG.ctr.format },
    { key: 'cpm', label: 'CPM', format: METRIC_CONFIG.cpm.format },
    { key: 'cpc', label: 'CPC', format: METRIC_CONFIG.cpc.format },
    { key: 'profileVisits', label: 'Profielbezoeken', format: METRIC_CONFIG.profileVisits.format },
    { key: 'followers', label: 'Nieuwe volgers', format: METRIC_CONFIG.followers.format },
    { key: 'likes', label: 'Likes', format: METRIC_CONFIG.likes.format },
    { key: 'comments', label: 'Reacties', format: METRIC_CONFIG.comments.format },
    { key: 'shares', label: 'Delingen', format: METRIC_CONFIG.shares.format },
    { key: 'costPerFollower', label: 'Cost per volger', format: METRIC_CONFIG.spend.format },
    { key: 'engagementRate', label: 'Engagement rate', format: (v) => `${v.toFixed(2)}%` },
  ]

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/tiktok-ads"
        className="inline-flex items-center gap-1.5 text-sm text-[#3071d8] hover:underline font-medium"
      >
        <ArrowLeft className="h-4 w-4" />
        Terug naar dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl ring-1 ring-slate-200 p-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-800">{campaign.name}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_STYLES[campaign.status] ?? 'bg-slate-100 text-slate-600'}`}>
                {STATUS_LABELS[campaign.status] ?? campaign.status}
              </span>
            </div>
            <p className="text-sm text-slate-500">
              Doel: <span className="font-medium text-slate-700">{campaign.objective}</span>
              {' · '}
              Budget: <span className="font-medium text-slate-700">€{campaign.budget}/{campaign.budgetMode === 'DAILY' ? 'dag' : 'periode'}</span>
              {' · '}
              Start: <span className="font-medium text-slate-700">{campaign.startDate}</span>
              {campaign.endDate && (
                <>
                  {' · '}Einde: <span className="font-medium text-slate-700">{campaign.endDate}</span>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => {
          const val = campaign[m.key] as number
          return (
            <div key={m.key} className="bg-white rounded-xl ring-1 ring-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1">
                {m.label}
              </p>
              <p className="text-xl font-bold text-slate-800">{m.format(val)}</p>
            </div>
          )
        })}
      </div>

      {/* Ads */}
      {ads.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-slate-700 mb-3">
            Advertenties ({ads.length})
          </h2>
          <AdsSection ads={ads} />
        </div>
      )}
    </div>
  )
}
