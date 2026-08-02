import { Suspense } from 'react'
import { TikTokAdsDashboard } from '@/components/tiktok-ads/TikTokAdsDashboard'
import { getMockDashboardData } from '@/lib/tiktok-ads/mock'

export default async function TikTokAdsPage() {
  const isMockMode = process.env.TIKTOK_ADS_MOCK_MODE !== 'false'
  const data = isMockMode
    ? getMockDashboardData()
    : (() => { throw new Error('Real data not yet connected') })()

  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center text-slate-400">Laden...</div>}>
      <TikTokAdsDashboard initialData={data} isMockMode={isMockMode} />
    </Suspense>
  )
}
