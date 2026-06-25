import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { leadId, projectId } = await req.json()
  if (!leadId || !projectId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = createServiceClient()

  const { data: lead } = await supabase
    .from('sm_leads')
    .select('*')
    .eq('id', leadId)
    .single()

  const { data: project } = await supabase
    .from('sm_projects')
    .select('profile')
    .eq('id', projectId)
    .single()

  if (!lead || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  let websiteContent = ''
  if (lead.website) {
    try {
      const url = lead.website.startsWith('http') ? lead.website : `https://${lead.website}`
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Salesmachine/1.0)' },
        signal: AbortSignal.timeout(8000),
      })
      if (res.ok) {
        const html = await res.text()
        websiteContent = html
          .replace(/<script[\s\S]*?<\/script>/gi, '')
          .replace(/<style[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\s+/g, ' ')
          .slice(0, 5000)
      }
    } catch {}
  }

  const profile = project.profile as Record<string, unknown>

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: `Analyseer dit bedrijf als potentiële klant voor onze business.

Ons bedrijf: ${profile?.businessType}
Ons aanbod: ${profile?.offer}
Scoringscriteria: ${(profile?.scoringCriteria as string[])?.join(', ')}

Bedrijf: ${lead.name}
Stad: ${lead.city}
Website: ${lead.website}
Categorie: ${lead.category}
Google types: ${lead.google_types?.join(', ')}

Website content:
${websiteContent || '(niet beschikbaar)'}

Geef een JSON object (geen markdown):
{
  "score": 0-100,
  "summary": "1-2 zinnen samenvatting",
  "signals": ["positief signaal 1", "positief signaal 2"],
  "concerns": ["zorg 1"],
  "recommended_approach": "hoe benaderen",
  "has_events_page": true/false,
  "has_wedding_page": true/false,
  "has_preferred_suppliers": true/false
}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ error: 'AI parse error' }, { status: 500 })

  try {
    const enrichment = JSON.parse(match[0])
    await supabase
      .from('sm_leads')
      .update({
        enrichment_data: enrichment,
        score: enrichment.score ?? lead.score,
        phase: 'Verrijkt',
      })
      .eq('id', leadId)

    return NextResponse.json({ enrichment })
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 500 })
  }
}
