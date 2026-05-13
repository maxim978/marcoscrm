'use server'

import OpenAI from 'openai'


function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

export async function analyzePlaylistScreenshot(base64Image: string) {
  try {
    const openai = getOpenAIClient()
    
    if (!openai) {
      return { error: 'OpenAI API key missing in .env.local' }
    }

    const prompt = `
      Analyze this screenshot of a music playlist (likely from Spotify, Apple Music, etc.).
      Extract the following information:
      1. Playlist Title
      2. Curator / Creator Name
      3. Number of Followers / Likes / Saves. Convert this to a pure integer (e.g. "1,523" -> 1523, "1.5K" -> 1500). If not found, return 0.
      
      Respond STRICTLY in JSON format with exactly these keys:
      {
        "playlistName": "string",
        "curatorName": "string",
        "followers": number
      }
    `

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 300,
    })

    const resultText = response.choices[0]?.message?.content
    if (!resultText) {
      return { error: 'Failed to extract data from image.' }
    }

    const data = JSON.parse(resultText)
    return { data }
    
  } catch (error: any) {
    console.error('Vision Error:', error)
    return { error: error.message || 'An error occurred during image analysis.' }
  }
}
