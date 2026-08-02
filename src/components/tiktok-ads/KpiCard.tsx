'use client'

import { LineChart, Line } from 'recharts'
import { TrendingUp, TrendingDown, Minus, Info } from 'lucide-react'
import { METRIC_CONFIG } from '@/lib/tiktok-ads/metrics'
import type { MetricKey, DailyMetric, DashboardGoals } from '@/lib/tiktok-ads/types'
import { useState } from 'react'

interface KpiCardProps {
  metricKey: MetricKey
  value: number
  previousValue?: number
  dailyData: DailyMetric[]
  goals?: DashboardGoals
  onClick?: () => void
  isSelected?: boolean
}

export function KpiCard({
  metricKey,
  value,
  previousValue,
  dailyData,
  goals,
  onClick,
  isSelected,
}: KpiCardProps) {
  const config = METRIC_CONFIG[metricKey]
  const [showInfo, setShowInfo] = useState(false)

  const pctChange =
    previousValue && previousValue > 0
      ? ((value - previousValue) / previousValue) * 100
      : null

  const isUp = pctChange !== null && pctChange > 0
  const isDown = pctChange !== null && pctChange < 0
  const isGood = pctChange !== null && (isUp ? config.isPositiveUp : !config.isPositiveUp)

  const sparkData = dailyData.map((d) => ({ value: d[metricKey] as number }))

  // Check goal
  let goalStatus: 'ok' | 'warn' | null = null
  if (metricKey === 'cpm' && goals?.maxCpm) {
    goalStatus = value <= goals.maxCpm ? 'ok' : 'warn'
  } else if (metricKey === 'cpc' && goals?.maxCpc) {
    goalStatus = value <= goals.maxCpc ? 'ok' : 'warn'
  } else if (metricKey === 'ctr' && goals?.minCtr) {
    goalStatus = value >= goals.minCtr ? 'ok' : 'warn'
  } else if (metricKey === 'followers' && goals?.targetFollowers) {
    goalStatus = value >= goals.targetFollowers ? 'ok' : 'warn'
  }

  return (
    <button
      onClick={onClick}
      className={`relative text-left bg-white rounded-xl p-4 ring-1 transition-all hover:shadow-md ${
        isSelected
          ? 'ring-[#3071d8] shadow-md shadow-[#3071d8]/10'
          : 'ring-slate-200 hover:ring-slate-300'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
          {config.label}
        </span>
        <div className="flex items-center gap-1">
          {goalStatus && (
            <span
              className={`w-2 h-2 rounded-full ${goalStatus === 'ok' ? 'bg-emerald-500' : 'bg-amber-500'}`}
              title={goalStatus === 'ok' ? 'Doel behaald' : 'Doel niet behaald'}
            />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowInfo((v) => !v)
            }}
            className="text-slate-300 hover:text-slate-500 transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {showInfo ? (
        <p className="text-xs text-slate-500 leading-relaxed min-h-[2.5rem]">
          {config.description}
        </p>
      ) : (
        <>
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-2xl font-bold text-slate-800 leading-none">
                {config.format(value)}
              </p>
              {pctChange !== null && (
                <div
                  className={`flex items-center gap-0.5 mt-1.5 text-xs font-semibold ${
                    isGood ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {isUp ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : isDown ? (
                    <TrendingDown className="h-3 w-3" />
                  ) : (
                    <Minus className="h-3 w-3" />
                  )}
                  <span>{Math.abs(pctChange).toFixed(1)}%</span>
                  <span className="text-slate-400 font-normal ml-1">vs vorige periode</span>
                </div>
              )}
            </div>

            {sparkData.length > 1 && (
              <div className="shrink-0">
                <LineChart width={80} height={32} data={sparkData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={isSelected ? '#3071D8' : '#94a3b8'}
                    strokeWidth={1.5}
                    dot={false}
                    isAnimationActive={false}
                  />
                </LineChart>
              </div>
            )}
          </div>
        </>
      )}
    </button>
  )
}
