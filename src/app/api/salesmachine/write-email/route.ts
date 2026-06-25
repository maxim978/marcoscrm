import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const { leadId, projectId } = await req.json()
  if (!leadId || !projectId) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = createServiceClient()

  const [{ data: lead }, { data: project }, { data: contact }] = await Promise.all([
    supabase.from('sm_leads').select('*').eq('id', leadId).single(),
    supabase.from('sm_projects').select('*').eq('id', projectId).single(),
    supabase.from('sm_contacts').select('*').eq('lead_id', leadId).eq('is_primary', true).maybeSingle(),
  ])

  if (!lead || !project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const profile = project.profile as Record<string, unknown>
  const enrichment = lead.enrichment_data as Record<string, unknown> | null
  const contactName = contact?.name ?? null

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [{
      role: 'user',
      content: `Schrijf een gepersonaliseerde Nederlandse cold email + follow-up voor dit bedrijf.

AFZENDER (wij):
- Business: ${profile?.businessType}
- Aanbod: ${profile?.offer}
- Waardepropositie: ${profile?.valueProposition}

ONTVANGER:
- Bedrijf: ${lead.name}
- Stad: ${lead.city}
- Categorie: ${lead.category}
- Website: ${lead.website}
${contactName ? `- Contactpersoon: ${contactName}` : ''}
${enrichment?.summary ? `- Analyse: ${enrichment.summary}` : ''}
${enrichment?.recommended_approach ? `- Aanpak: ${enrichment.recommended_approach}` : ''}

Regels:
- Persoonlijk, professioneel, niet salesy
- Max 5 zinnen voor de email
- Max 3 zinnen voor de follow-up
- Gebruik de naam van het bedrijf specifiek
- Nederlandse taal

Geef JSON terug (geen markdown):
{
  "subject": "emailonderwerp",
  "body": "volledige email tekst",
  "follow_up": "follow-up email tekst na 5 dagen geen reactie"
}`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '{}'
  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return NextResponse.json({ error: 'AI parse error' }, { status: 500 })

  try {
    const email = JSON.parse(match[0])
    const { data: saved } = await supabase
      .from('sm_emails')
      .insert({
        lead_id: leadId,
        project_id: projectId,
        subject: email.subject,
        body: email.body,
        follow_up: email.follow_up,
      })
      .select()
      .single()

    await supabase
      .from('sm_leads')
      .update({ phase: 'Mail klaar' })
      .eq('id', leadId)

    return NextResponse.json({ email: saved })
  } catch {
    return NextResponse.json({ error: 'Parse error' }, { status: 500 })
  }
}
