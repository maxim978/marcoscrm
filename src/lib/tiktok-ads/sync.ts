/**
 * TikTok Ads sync service interface.
 * Handles syncing data from TikTok API to Supabase.
 */

export interface SyncOptions {
  accountId: string
  periodStart: string
  periodEnd: string
  entities?: ('campaigns' | 'ads' | 'metrics' | 'audience')[]
}

export interface SyncResult {
  success: boolean
  recordsProcessed: number
  errors: string[]
  periodStart: string
  periodEnd: string
}

/**
 * Main sync function — fetches all TikTok Ads data for a period
 * and upserts it into Supabase.
 *
 * Currently a stub — implement when API credentials are available.
 */
export async function syncTikTokAdsData(_options: SyncOptions): Promise<SyncResult> {
  // TODO: Implement real sync
  // 1. Get API credentials from tiktok_ad_accounts (decrypt tokens)
  // 2. Create TikTokAdsClient
  // 3. Fetch campaigns, ad groups, ads
  // 4. Fetch daily metrics per entity
  // 5. Upsert to Supabase
  // 6. Update sync log

  throw new Error(
    'TikTok Ads sync is not yet implemented. Add TIKTOK_ADS_MOCK_MODE=true to use mock data.'
  )
}

/**
 * Get date range for sync period (last N days)
 */
export function getSyncDateRange(days: number): { start: string; end: string } {
  const end = new Date()
  end.setDate(end.getDate() - 1) // yesterday (data is complete)
  const start = new Date(end)
  start.setDate(start.getDate() - days + 1)

  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  }
}
