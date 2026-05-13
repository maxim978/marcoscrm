'use server'

import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function searchSocialsForCurator(curatorName: string, playlistName: string) {
  if (!curatorName) return { error: 'Geen curator naam gevonden' }

  try {
    const prompt = `
      Zoek of raad de meest waarschijnlijke social media links voor de volgende Spotify curator:
      Curator Naam: ${curatorName}
      Playlist Naam: ${playlistName}

      Geef me een JSON object terug met:
      {
        "instagram": "directe link of null",
        "facebook": "directe link of null",
        "tiktok": "directe link of null"
      }
      Zorg dat de links echt zijn als je ze kunt vinden, of geef de meest logische URL op basis van hun naam (bijv. instagram.com/naam).
      Alleen JSON teruggeven, geen tekst.
    `

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0].message.content
    if (!content) return { error: 'Geen antwoord van AI' }

    return JSON.parse(content)
  } catch (error: any) {
    console.error('AI Social Search error:', error)
    return { error: error.message }
  }
}
