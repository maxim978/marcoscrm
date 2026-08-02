/**
 * TikTok Ads API Client stub.
 * This will be filled in when TikTok Ads API credentials are available.
 * See: https://ads.tiktok.com/marketing_api/docs
 */

export interface TikTokApiConfig {
  appId: string
  appSecret: string
  accessToken: string
  advertiserId: string
  sandbox?: boolean
}

export interface TikTokApiResponse<T> {
  code: number
  message: string
  data?: T
}

const TIKTOK_ADS_API_BASE = 'https://business-api.tiktok.com/open_api/v1.3'

export class TikTokAdsClient {
  private config: TikTokApiConfig

  constructor(config: TikTokApiConfig) {
    this.config = config
  }

  private async request<T>(
    endpoint: string,
    params: Record<string, unknown> = {}
  ): Promise<TikTokApiResponse<T>> {
    const url = new URL(`${TIKTOK_ADS_API_BASE}${endpoint}`)
    url.searchParams.set('advertiser_id', this.config.advertiserId)

    const response = await fetch(url.toString(), {
      headers: {
        'Access-Token': this.config.accessToken,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`TikTok API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  async getCampaigns(dateStart: string, dateEnd: string) {
    return this.request('/campaign/get/', {
      page_size: 100,
      fields: [
        'campaign_id', 'campaign_name', 'status', 'objective_type',
        'budget', 'budget_mode', 'create_time',
      ],
    })
  }

  async getAdGroups(campaignIds: string[]) {
    return this.request('/adgroup/get/', {
      filtering: { campaign_ids: campaignIds },
      fields: ['adgroup_id', 'adgroup_name', 'campaign_id', 'status', 'budget'],
    })
  }

  async getAds(adGroupIds: string[]) {
    return this.request('/ad/get/', {
      filtering: { adgroup_ids: adGroupIds },
      fields: ['ad_id', 'adgroup_id', 'ad_name', 'status', 'cover_image_url'],
    })
  }

  async getReportIntegrated(params: {
    advertiserId: string
    reportType: 'BASIC' | 'AUDIENCE'
    dimensions: string[]
    metrics: string[]
    startDate: string
    endDate: string
    dataLevel: 'AUCTION_ADVERTISER' | 'AUCTION_CAMPAIGN' | 'AUCTION_ADGROUP' | 'AUCTION_AD'
  }) {
    return this.request('/report/integrated/get/', {
      ...params,
      page_size: 1000,
    })
  }
}

export function createTikTokAdsClient(config: TikTokApiConfig): TikTokAdsClient {
  return new TikTokAdsClient(config)
}
