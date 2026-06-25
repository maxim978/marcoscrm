import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { description } = await req.json()
  if (!description) return NextResponse.json({ error: 'description required' }, { status: 400 })

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Je bent een B2B sales strategist. Analyseer deze business beschrijving en maak een gestructureerd projectprofiel.

Business beschrijving: "${description}"

Geef een JSON object terug met precies deze structuur (geen markdown, alleen JSON):
{
  "businessType": "type business in 2-4 woorden",
  "offer": "wat bied je aan in 1 zin",
  "goal": "wat is het sales doel in 1 zin",
  "targetAudience": "wie zijn de ideale klanten",
  "keywords": ["6 tot 10 zoekwoorden voor Google Places in het Nederlands"],
  "idealCompanyTypes": ["4 tot 6 ideale bedrijfstypes"],
  "valueProposition": "waarom zou een klant voor jou kiezen",
  "scoringCriteria": ["3 tot 5 criteria om leads te scoren"]
}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : ''
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) return NextResponse.json({ error: 'Invalid AI response' }, { status: 500 })

  try {
    const profile = JSON.parse(jsonMatch[0])
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 500 })
  }
}
