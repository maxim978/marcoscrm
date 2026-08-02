import { notFound } from 'next/navigation'
import { CampaignDetail } from '@/components/tiktok-ads/CampaignDetail'
import { getMockDashboardData } from '@/lib/tiktok-ads/mock'

interface Props {
  params: Promise<{ campaignId: string }>
}

export default async function CampaignDetailPage({ params }: Props) {
  const { campaignId } = await params
  const isMockMode = process.env.TIKTOK_ADS_MOCK_MODE !== 'false'

  const data = isMockMode
    ? getMockDashboardData()
    : (() => { throw new Error('Real data not yet connected') })()

  const campaign = data.campaigns.find((c) => c.id === campaignId)
  if (!campaign) notFound()

  const ads = data.ads.filter((a) => a.campaignId === campaignId)

  return <CampaignDetail campaign={campaign} ads={ads} />
}
