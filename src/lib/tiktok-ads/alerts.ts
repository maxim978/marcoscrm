import type { TikTokCampaign, TikTokAd, DashboardGoals, TikTokAlert } from './types'

let alertIdCounter = 0
function newId() {
  alertIdCounter++
  return `runtime-alert-${alertIdCounter}`
}

/**
 * Rule-based alert engine.
 * Evaluates campaigns and ads against goals and thresholds,
 * and returns a list of detected alerts.
 */
export function evaluateAlerts(
  campaigns: TikTokCampaign[],
  ads: TikTokAd[],
  goals: DashboardGoals
): TikTokAlert[] {
  const alerts: TikTokAlert[] = []
  const now = new Date().toISOString()

  for (const campaign of campaigns) {
    if (campaign.status !== 'ACTIVE') continue

    // Budget depleting: spend > 90% of daily budget
    if (campaign.budgetMode === 'DAILY') {
      const todaySpend = campaign.spend / 30 // rough estimate
      const pct = (todaySpend / campaign.budget) * 100
      if (pct >= 90) {
        alerts.push({
          id: newId(),
          type: 'BUDGET_DEPLETING',
          severity: pct >= 95 ? 'critical' : 'warning',
          title: 'Budget bijna op',
          description: `Campagne "${campaign.name}" heeft ~${Math.round(pct)}% van het dagbudget (€${campaign.budget}) verbruikt.`,
          campaignId: campaign.id,
          detectedAt: now,
          isRead: false,
          suggestedAction: 'Verhoog het dagbudget of pauzeer de campagne tot morgen.',
        })
      }
    }

    // CTR below threshold
    if (goals.minCtr && campaign.ctr < goals.minCtr) {
      alerts.push({
        id: newId(),
        type: 'CTR_DROP',
        severity: 'warning',
        title: 'CTR onder drempel',
        description: `Campagne "${campaign.name}" heeft een CTR van ${campaign.ctr.toFixed(2)}%, lager dan de ingestelde drempel van ${goals.minCtr}%.`,
        campaignId: campaign.id,
        detectedAt: now,
        isRead: false,
        suggestedAction: 'Vernieuw de advertentiecreatives of pas de targeting aan.',
      })
    }

    // CPM above threshold
    if (goals.maxCpm && campaign.cpm > goals.maxCpm) {
      alerts.push({
        id: newId(),
        type: 'CPM_HIGH',
        severity: 'warning',
        title: 'Hoge CPM',
        description: `Campagne "${campaign.name}" heeft een CPM van €${campaign.cpm.toFixed(2)}, hoger dan het maximum van €${goals.maxCpm}.`,
        campaignId: campaign.id,
        detectedAt: now,
        isRead: false,
        suggestedAction: 'Overweeg targeting te verfijnen om de CPM te verlagen.',
      })
    }

    // CPF above threshold
    if (goals.maxCostPerFollower && campaign.costPerFollower > goals.maxCostPerFollower) {
      alerts.push({
        id: newId(),
        type: 'CPF_HIGH',
        severity: 'info',
        title: 'Hoge cost per volger',
        description: `Campagne "${campaign.name}" heeft een cost-per-follower van €${campaign.costPerFollower.toFixed(2)}, hoger dan het maximum van €${goals.maxCostPerFollower}.`,
        campaignId: campaign.id,
        detectedAt: now,
        isRead: false,
        suggestedAction: 'Overweeg de doelgroep of creative te optimaliseren.',
      })
    }
  }

  // Ad-level alerts
  for (const ad of ads) {
    if (ad.status !== 'ACTIVE') continue

    // Hook rate too low (2s)
    if (ad.hookRate2s < 70) {
      alerts.push({
        id: newId(),
        type: 'HOOK_RATE_LOW',
        severity: 'warning',
        title: 'Lage 2s hook rate',
        description: `Advertentie "${ad.name}" heeft een 2s hook rate van ${ad.hookRate2s.toFixed(1)}%. De eerste 2 seconden trekken niet genoeg aandacht.`,
        campaignId: ad.campaignId,
        adId: ad.id,
        detectedAt: now,
        isRead: false,
        suggestedAction: 'Verander de opening van de video om meteen aandacht te trekken.',
      })
    }

    // Completion rate too low
    if (goals.minCompletionRate && ad.completionRate < goals.minCompletionRate) {
      alerts.push({
        id: newId(),
        type: 'COMPLETION_RATE_LOW',
        severity: 'info',
        title: 'Lage voltooiingsratio',
        description: `Advertentie "${ad.name}" heeft een voltooiingsratio van ${ad.completionRate.toFixed(1)}%.`,
        campaignId: ad.campaignId,
        adId: ad.id,
        detectedAt: now,
        isRead: false,
        suggestedAction: 'Overweeg de video in te korten of de call-to-action te verplaatsen.',
      })
    }
  }

  return alerts
}
