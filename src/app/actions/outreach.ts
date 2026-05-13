'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function updateOutreachStatus(releaseTargetId: string, status: string, releaseId: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('release_targets')
    .update({ outreach_status: status })
    .eq('id', releaseTargetId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath(`/dashboard/releases/${releaseId}`)
  return { success: true }
}

export async function generateAIPitch(releaseId: string, targetId: string, tone: string) {
  const supabase = await createClient()

  // Fetch release and target details
  const { data: release } = await supabase
    .from('releases')
    .select('*, artists(name)')
    .eq('id', releaseId)
    .single()

  const { data: target } = await supabase
    .from('targets')
    .select('*')
    .eq('id', targetId)
    .single()

  if (!release || !target) return { error: 'Data not found' }

  if (!process.env.OPENAI_API_KEY) {
    return { error: 'OpenAI API key missing in .env.local' }
  }

  try {
    const prompt = `
      Write a music promotion pitch message.
      Target: ${target.name} (Type: ${target.type}, Platform: ${target.platform})
      Release: "${release.title}" by ${release.artists?.name}
      Genre: ${release.genre}
      Mood: ${release.mood}
      Tone: ${tone}
      
      Keep it concise and actionable. Include placeholders like [Your Name] if needed.
    `

    const openai = getOpenAIClient()
    if (!openai) {
      return { error: 'OpenAI API key missing in .env.local' }
    }

    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4o-mini",
    })

    const message = completion.choices[0].message.content

    // Save to outreach_messages
    await supabase.from('outreach_messages').insert([{
      release_id: release.id,
      target_id: target.id,
      channel: target.platform || 'email',
      message: message,
      tone: tone
    }])

    return { message }
  } catch (error: any) {
    return { error: error.message }
  }
}
