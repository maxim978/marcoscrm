'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function huntTikTokSound(soundName: string) {
  if (!soundName) return { error: 'Geen geluidsnaam opgegeven' }

  try {
    // Since we don't have a direct TikTok scraper, we use AI to guide the user 
    // and provide search URLs that lead directly to the results.
    // In a more advanced version, we could use a scraper API.
    
    const tiktokSearchUrl = `https://www.tiktok.com/search/video?q=${encodeURIComponent(soundName)}`
    const googleSearchUrl = `https://www.google.com/search?q=site:tiktok.com+"${encodeURIComponent(soundName)}"+music`

    const prompt = `
      Ik wil onderzoeken welke TikTok creators het geluid "${soundName}" hebben gebruikt.
      Geef me een lijst van 5 bekende of waarschijnlijke creators/typen creators die dit geluid vaak gebruiken voor promotie.
      Geef ook strategisch advies over hoe we deze creators kunnen benaderen.
      
      Antwoord in JSON formaat:
      {
        "strategy": "tekst",
        "suggestedCreators": [
          { "name": "Naam", "reason": "Waarom deze creator?", "profileUrl": "Link" }
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
      tiktokSearchUrl,
      googleSearchUrl
    }
  } catch (error: any) {
    console.error('TikTok Hunt error:', error)
    return { error: error.message }
  }
}
