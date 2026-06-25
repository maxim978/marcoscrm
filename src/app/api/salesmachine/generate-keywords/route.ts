import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { profile, existingKeywords } = await req.json()
  if (!profile) return NextResponse.json({ error: 'profile required' }, { status: 400 })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Je bent een B2B leadgeneratie expert. Genereer aanvullende zoekwoorden voor Google Places zoekopdrachten in Nederland.

Projectprofiel:
- Business: ${profile.businessType}
- Aanbod: ${profile.offer}
- Doelgroep: ${profile.targetAudience}
- Ideale bedrijfstypes: ${profile.idealCompanyTypes?.join(', ')}

Bestaande zoekwoorden (NIET herhalen): ${existingKeywords?.join(', ')}

Genereer 40-60 aanvullende Nederlandse zoekwoorden voor Google Places. Bedenk zelf logische categorieën op basis van het project. Geef JSON terug (geen markdown):
{
  "categories": [
    {
      "name": "Categorie naam",
      "keywords": ["zoekwoord 1", "zoekwoord 2", ...]
    }
  ]
}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })

  try {
    const data = JSON.parse(jsonMatch[0])
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 500 })
  }
}
