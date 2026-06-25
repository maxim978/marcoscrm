import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

interface Lead {
  id: string
  name: string
  city: string | null
  google_types: string[]
}

async function categorizeBatch(leads: Lead[]): Promise<Record<string, string>> {
  const list = leads.map((l) =>
    `${l.id}|${l.name}|${l.city ?? ''}|${(l.google_types ?? []).join(',')}`
  ).join('\n')

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Categoriseer deze bedrijven. Bedenk zelf passende Nederlandse categorienamen op basis van de naam, stad en Google-types.

Formaat per regel: id|naam|stad|google-types

${list}

Geef een JSON object terug: { "id": "categorie", ... } — geen markdown, alleen JSON.`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return {}
  try { return JSON.parse(match[0]) } catch { return {} }
}

export async function POST(req: NextRequest) {
  const { projectId } = await req.json()
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: leads } = await supabase
    .from('sm_leads')
    .select('id, name, city, google_types')
    .eq('project_id', projectId)
    .is('category', null)
    .limit(2000)

  if (!leads?.length) return NextResponse.json({ categorized: 0 })

  const BATCH_SIZE = 40
  let categorized = 0

  for (let i = 0; i < leads.length; i += BATCH_SIZE) {
    const batch = leads.slice(i, i + BATCH_SIZE)
    const categories = await categorizeBatch(batch)

    const updates = Object.entries(categories).map(([id, category]) => ({ id, category }))
    if (updates.length > 0) {
      for (const update of updates) {
        await supabase.from('sm_leads').update({ category: update.category }).eq('id', update.id)
      }
      categorized += updates.length
    }
  }

  return NextResponse.json({ categorized })
}
