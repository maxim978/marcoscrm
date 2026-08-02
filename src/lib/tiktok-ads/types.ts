export interface TikTokAdAccount {
  id: string
  name: string
  currency: string
  timezone: string
}

export interface TikTokCampaign {
  id: string
  name: string
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT' | 'REJECTED'
  objective: string
  budget: number
  budgetMode: 'DAILY' | 'LIFETIME'
  spend: number
  impressions: number
  reach: number
  videoViews: number
  clicks: number
  ctr: number
  cpm: number
  cpc: number
  profileVisits: number
  followers: number
  likes: number
  comments: number
  shares: number
  costPerFollower: number
  engagementRate: number
  artistId?: string
  releaseId?: string
  soundId?: string
  startDate: string
  endDate?: string
  createdAt: string
}

export interface TikTokAd {
  id: string
  campaignId: string
  name: string
  status: string
  thumbnailUrl?: string
  spend: number
  impressions: number
  videoViews: number
  avgWatchTime: number
  view2s: number
  view6s: number
  completions: number
  clicks: number
  ctr: number
  likes: number
  comments: number
  shares: number
  profileVisits: number
  followers: number
  costPerFollower: number
  engagementRate: number
  completionRate: number
  hookRate2s: number
  hookRate6s: number
}

export interface DailyMetric {
  date: string
  spend: number
  impressions: number
  reach: number
  videoViews: number
  clicks: number
  ctr: number
  cpm: number
  cpc: number
  profileVisits: number
  followers: number
  likes: number
  comments: number
  shares: number
}

export interface AudienceSegment {
  label: string
  value: number
  percentage: number
}

export interface AudienceData {
  byAge: AudienceSegment[]
  byGender: AudienceSegment[]
  byCountry: AudienceSegment[]
  byDevice: AudienceSegment[]
  byHour: { hour: number; impressions: number }[]
  byDayOfWeek: { day: string; impressions: number }[]
}

export interface AiInsight {
  id: string
  category: string
  conclusion: string
  reasoning: string
  action: string
  priority: 'low' | 'medium' | 'high'
}

export interface TikTokAlert {
  id: string
  type: string
  severity: 'info' | 'warning' | 'critical'
  title: string
  description: string
  campaignId?: string
  adId?: string
  detectedAt: string
  isRead: boolean
  suggestedAction?: string
}

export interface DashboardGoals {
  maxCpm?: number
  maxCpc?: number
  maxCostPerFollower?: number
  minCtr?: number
  minEngagementRate?: number
  minCompletionRate?: number
  weekBudget?: number
  monthBudget?: number
  targetFollowers?: number
}

export interface SyncLog {
  id: string
  status: 'idle' | 'running' | 'success' | 'partial' | 'failed'
  startedAt?: string
  completedAt?: string
  recordsProcessed?: number
  errorMessage?: string
  periodStart?: string
  periodEnd?: string
}

export type DateRangeOption =
  | 'today'
  | 'yesterday'
  | 'last7'
  | 'last14'
  | 'last30'
  | 'thisMonth'
  | 'lastMonth'
  | 'custom'

export type CompareOption =
  | 'none'
  | 'previousPeriod'
  | 'previousWeek'
  | 'previousMonth'

export type MetricKey =
  | 'spend'
  | 'impressions'
  | 'reach'
  | 'videoViews'
  | 'clicks'
  | 'ctr'
  | 'cpm'
  | 'cpc'
  | 'profileVisits'
  | 'followers'
  | 'likes'
  | 'comments'
  | 'shares'

export interface DashboardData {
  accounts: TikTokAdAccount[]
  campaigns: TikTokCampaign[]
  ads: TikTokAd[]
  dailyMetrics: DailyMetric[]
  audience: AudienceData
  insights: AiInsight[]
  alerts: TikTokAlert[]
  goals: DashboardGoals
  syncLog: SyncLog
}
