'use server'

import OpenAI from 'openai'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function huntTikTokSound(input: string) {
  if (!input) return { error: 'Geen geluidsnaam of URL opgegeven' }

  try {
    const isUrl = input.includes('tiktok.com')
    const soundName = isUrl ? 'Sound from URL' : input

    const prompt = `
      Ik wil een diepgaand onderzoek doen naar het TikTok geluid: "${input}".
      ${isUrl ? 'Dit is een directe URL naar de sound.' : ''}
      
      Geef me een lijst van 10 creators die dit geluid hebben gebruikt.
      Voor elke creator wil ik de volgende (geschatte of echte) data:
      - Naam
      - Aantal likes op de video
      - Aantal comments
      - Aantal saves
      - De directe link naar de video
      
      Geef ook een analyse van waarom dit geluid viraal gaat en welke 'niche' het beste werkt.

      Antwoord in JSON formaat:
      {
        "analysis": "tekst",
        "videos": [
          { "creator": "Naam", "likes": 1200, "comments": 45, "saves": 300, "videoUrl": "Link", "followers": 50000 }
        ]
      }
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const content = JSON.parse(response.choices[0].message.content || '{}')
    
    return {
      ...content,
      searchUrl: isUrl ? input : `https://www.tiktok.com/search/video?q=${encodeURIComponent(input)}`
    }
  } catch (error: any) {
    console.error('TikTok Deep Hunt error:', error)
    return { error: error.message }
  }
}

export async function saveTikTokCreatorToCrm(creator: any) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const targetData = {
    user_id: user.id,
    name: creator.creator,
    type: 'social creator',
    platform: 'TikTok',
    contact_name: creator.creator,
    followers: creator.followers || 0,
    tiktok_url: `https://www.tiktok.com/@${creator.creator.replace('@', '')}`,
    notes: `Added via TikTok Sound Hunter. Video stats: ${creator.likes} likes, ${creator.comments} comments.`,
    relationship_status: 'koud',
    score: 50
  }

  const { error } = await supabase.from('targets').insert([targetData])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/targets')
  return { success: true }
}
