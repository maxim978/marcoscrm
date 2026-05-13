'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function generateHitlist(releaseId: string) {
  const supabase = await createClient()

  // 1. Fetch release details
  const { data: release } = await supabase
    .from('releases')
    .select('*')
    .eq('id', releaseId)
    .single()

  if (!release) return { error: 'Release not found' }

  // 2. Fetch all user's targets
  const { data: targets } = await supabase
    .from('targets')
    .select('*')
    .eq('user_id', release.user_id || (await supabase.auth.getUser()).data.user?.id)

  if (!targets || targets.length === 0) return { error: 'No targets found in CRM' }

  // 3. Simple Ranking Logic for MVP
  // - match genre/mood (if present)
  // - warm relationship = +50 score
  // - score scaling
  const scoredTargets = targets.map((target) => {
    let priority_score = target.score || 0

    if (target.relationship_status === 'warm') priority_score += 30
    if (target.relationship_status === 'supporter') priority_score += 50
    if (target.relationship_status === 'prioriteit') priority_score += 80

    // simple text match for genre
    if (release.genre && target.genres && target.genres.join(' ').toLowerCase().includes(release.genre.toLowerCase())) {
      priority_score += 40
    }

    return {
      release_id: release.id,
      target_id: target.id,
      priority_score: priority_score,
      outreach_status: 'nog niet benaderd'
    }
  })

  // Sort by highest score first
  scoredTargets.sort((a, b) => b.priority_score - a.priority_score)

  // 4. Insert into release_targets (ignore duplicates)
  // Use upsert to avoid breaking if target already in hitlist
  const { error } = await supabase
    .from('release_targets')
    .upsert(scoredTargets, { onConflict: 'release_id, target_id' })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/releases/${releaseId}`)
  return { success: true }
}
