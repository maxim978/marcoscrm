'use client'

import { useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { METRIC_CONFIG, CHART_COLORS } from '@/lib/tiktok-ads/metrics'
import type { MetricKey, DailyMetric } from '@/lib/tiktok-ads/types'

const ALL_METRICS: MetricKey[] = [
  'spend', 'impressions', 'videoViews', 'clicks', 'ctr',
  'cpm', 'cpc', 'followers', 'likes', 'reach',
]

interface PerformanceChartProps {
  dailyMetrics: DailyMetric[]
}

type Granularity = 'day' | 'week' | 'month'

function groupByWeek(data: DailyMetric[]): DailyMetric[] {
  const map = new Map<string, DailyMetric>()
  for (const d of data) {
    const date = new Date(d.date)
    const monday = new Date(date)
    monday.setDate(date.getDate() - ((date.getDay() + 6) % 7))
    const key = monday.toISOString().split('T')[0]
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { ...d, date: key })
    } else {
      map.set(key, {
        date: key,
        spend: existing.spend + d.spend,
        impressions: existing.impressions + d.impressions,
        reach: existing.reach + d.reach,
        videoViews: existing.videoViews + d.videoViews,
        clicks: existing.clicks + d.clicks,
        ctr: 0,
        cpm: 0,
        cpc: 0,
        profileVisits: existing.profileVisits + d.profileVisits,
        followers: existing.followers + d.followers,
        likes: existing.likes + d.likes,
        comments: existing.comments + d.comments,
        shares: existing.shares + d.shares,
      })
    }
  }
  return Array.from(map.values()).map((d) => ({
    ...d,
    ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
    cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
    cpc: d.clicks > 0 ? d.spend / d.clicks : 0,
  }))
}

function groupByMonth(data: DailyMetric[]): DailyMetric[] {
  const map = new Map<string, DailyMetric>()
  for (const d of data) {
    const key = d.date.slice(0, 7)
    const existing = map.get(key)
    if (!existing) {
      map.set(key, { ...d, date: key })
    } else {
      map.set(key, {
        date: key,
        spend: existing.spend + d.spend,
        impressions: existing.impressions + d.impressions,
        reach: existing.reach + d.reach,
        videoViews: existing.videoViews + d.videoViews,
        clicks: existing.clicks + d.clicks,
        ctr: 0,
        cpm: 0,
        cpc: 0,
        profileVisits: existing.profileVisits + d.profileVisits,
        followers: existing.followers + d.followers,
        likes: existing.likes + d.likes,
        comments: existing.comments + d.comments,
        shares: existing.shares + d.shares,
      })
    }
  }
  return Array.from(map.values()).map((d) => ({
    ...d,
    ctr: d.impressions > 0 ? (d.clicks / d.impressions) * 100 : 0,
    cpm: d.impressions > 0 ? (d.spend / d.impressions) * 1000 : 0,
    cpc: d.clicks > 0 ? d.spend / d.clicks : 0,
  }))
}

function formatDateLabel(date: string, granularity: Granularity): string {
  if (granularity === 'month') {
    const [y, m] = date.split('-')
    const months = ['Jan', 'Feb', 'Mrt', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec']
    return `${months[parseInt(m) - 1]} ${y}`
  }
  const d = new Date(date)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function PerformanceChart({ dailyMetrics }: PerformanceChartProps) {
  const [selectedMetrics, setSelectedMetrics] = useState<MetricKey[]>(['spend', 'followers', 'impressions'])
  const [granularity, setGranularity] = useState<Granularity>('day')

  function toggleMetric(key: MetricKey) {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key)
      }
      if (prev.length >= 3) {
        return [...prev.slice(1), key]
      }
      return [...prev, key]
    })
  }

  const grouped =
    granularity === 'week'
      ? groupByWeek(dailyMetrics)
      : granularity === 'month'
      ? groupByMonth(dailyMetrics)
      : dailyMetrics

  const chartData = grouped.map((d) => ({
    date: formatDateLabel(d.date, granularity),
    ...Object.fromEntries(selectedMetrics.map((k) => [k, d[k]])),
  }))

  if (dailyMetrics.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 ring-1 ring-slate-200 flex items-center justify-center h-64 text-slate-400">
        Geen data beschikbaar
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl p-4 ring-1 ring-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
          Performance over tijd
        </h3>

        <div className="flex items-center gap-2">
          {/* Granularity toggle */}
          <div className="flex rounded-lg overflow-hidden border border-slate-200 text-xs">
            {(['day', 'week', 'month'] as Granularity[]).map((g) => (
              <button
                key={g}
                onClick={() => setGranularity(g)}
                className={`px-2.5 py-1 font-medium transition-colors ${
                  granularity === g
                    ? 'bg-[#3071d8] text-white'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {g === 'day' ? 'Dag' : g === 'week' ? 'Week' : 'Maand'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metric pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {ALL_METRICS.map((key, i) => {
          const idx = selectedMetrics.indexOf(key)
          const isSelected = idx !== -1
          const color = isSelected ? CHART_COLORS[idx] : undefined
          return (
            <button
              key={key}
              onClick={() => toggleMetric(key)}
              className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all border ${
                isSelected
                  ? 'text-white border-transparent'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
              style={isSelected ? { backgroundColor: color, borderColor: color } : {}}
            >
              {METRIC_CONFIG[key].label}
            </button>
          )
        })}
        <span className="text-xs text-slate-400 self-center">Max 3</span>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            interval="preserveStartEnd"
          />
          {selectedMetrics.map((key, i) => (
            <YAxis
              key={key}
              yAxisId={i}
              orientation={i === 0 ? 'left' : 'right'}
              tick={{ fontSize: 10, fill: '#94a3b8' }}
              tickFormatter={(v) => {
                if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
                if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
                if (typeof v === 'number' && v < 10) return v.toFixed(2)
                return v
              }}
              hide={i > 0}
            />
          ))}
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: 12 }}
            formatter={(value, name) => {
              const key = name as MetricKey
              const cfg = METRIC_CONFIG[key]
              const numVal = value as number
              return [cfg ? cfg.format(numVal) : numVal, cfg ? cfg.label : name]
            }}
          />
          <Legend
            formatter={(value) => {
              const cfg = METRIC_CONFIG[value as MetricKey]
              return cfg ? cfg.label : value
            }}
          />
          {selectedMetrics.map((key, i) => (
            <Line
              key={key}
              yAxisId={i}
              type="monotone"
              dataKey={key}
              stroke={CHART_COLORS[i]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
