import type { MetricKey } from './types'

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function formatPercent(value: number, decimals = 2): string {
  return `${value.toFixed(decimals)}%`
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('nl-NL').format(Math.round(value))
}

export function formatMs(value: number): string {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}s`
  return `${Math.round(value)}ms`
}

export interface MetricConfig {
  label: string
  format: (value: number) => string
  isPositiveUp: boolean
  description: string
  color: string
}

export const METRIC_CONFIG: Record<MetricKey, MetricConfig> = {
  spend: {
    label: 'Uitgegeven',
    format: formatCurrency,
    isPositiveUp: false,
    description: 'Totaal besteed budget in de geselecteerde periode',
    color: '#3071D8',
  },
  impressions: {
    label: 'Impressies',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Aantal keer dat een advertentie is weergegeven',
    color: '#8b5cf6',
  },
  reach: {
    label: 'Bereik',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Unieke gebruikers die de advertentie hebben gezien',
    color: '#06b6d4',
  },
  videoViews: {
    label: 'Video views',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Aantal keer dat de video is bekeken',
    color: '#10b981',
  },
  clicks: {
    label: 'Clicks',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Totaal aantal clicks op de advertentie',
    color: '#f97316',
  },
  ctr: {
    label: 'CTR',
    format: (v) => formatPercent(v, 2),
    isPositiveUp: true,
    description: 'Click-through rate: clicks gedeeld door impressies',
    color: '#E0B533',
  },
  cpm: {
    label: 'CPM',
    format: formatCurrency,
    isPositiveUp: false,
    description: 'Kosten per 1000 impressies',
    color: '#ef4444',
  },
  cpc: {
    label: 'CPC',
    format: formatCurrency,
    isPositiveUp: false,
    description: 'Kosten per click',
    color: '#ec4899',
  },
  profileVisits: {
    label: 'Profielbezoeken',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Aantal profielbezoeken via de advertentie',
    color: '#84cc16',
  },
  followers: {
    label: 'Volgers',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Nieuwe volgers via advertentie',
    color: '#3071D8',
  },
  likes: {
    label: 'Likes',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Totaal aantal likes op advertentievideo\'s',
    color: '#f43f5e',
  },
  comments: {
    label: 'Reacties',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Totaal aantal reacties op advertentievideo\'s',
    color: '#a855f7',
  },
  shares: {
    label: 'Delingen',
    format: formatNumber,
    isPositiveUp: true,
    description: 'Totaal aantal delingen van advertentievideo\'s',
    color: '#14b8a6',
  },
}

export const DEFAULT_CHART_METRICS: MetricKey[] = ['spend', 'impressions', 'followers']

export const CHART_COLORS = ['#3071D8', '#E0B533', '#10b981']
