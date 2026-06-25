import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function scrapeWebsite(url: string): Promise<string> {
  try {
    const normalizedUrl = url.startsWith('http') ? url : `https://${url}`
    const pagesToTry = [
      normalizedUrl,
      `${normalizedUrl}/contact`,
      `${normalizedUrl}/over-ons`,
      `${normalizedUrl}/team`,
    ]

    for (const pageUrl of pagesToTry) {
      const res = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Salesmachine/1.0)' },
        signal: AbortSignal.timeout(5000),
      })
      if (!res.ok) continue
      const html = await res.text()
      // Strip HTML tags and get text content
      const text = html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/<style[\s\S]*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(0, 3000)
      if (text.includes('@') || text.toLowerCase().includes('contact')) return text
    }
    return ''
  } catch {
    return ''
  }
}

interface ContactResult {
  name: string | null
  title: string | null
  email: string | null
  is_primary: boolean
}

async function extractContacts(websiteText: string, projectProfile: Record<string, unknown>): Promise<ContactResult[]> {
  if (!websiteText) return []

  const message = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Extraheer e-mailadressen en contactpersonen uit deze websitetekst.
Context: we zijn op zoek naar de meest relevante persoon voor: ${projectProfile.targetAudience}

Websitetekst:
${websiteText}

Geef een JSON array terug (geen markdown):
[{"name": "...", "title": "...", "email": "...", "is_primary": true/false}]
Maximaal 3 contacten. Als er geen e-mailadressen zijn, geef dan [].`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  try { return JSON.parse(match[0]) } catch { return [] }
}

export async function POST(req: NextRequest) {
  const { projectId, leadIds, profile } = await req.json()
  if (!projectId) return NextResponse.json({ error: 'projectId required' }, { status: 400 })

  const supabase = createServiceClient()

  let query = supabase
    .from('sm_leads')
    .select('id, website, name')
    .eq('project_id', projectId)
    .not('website', 'is', null)

  if (leadIds?.length) query = query.in('id', leadIds)
  else query = query.limit(500)

  const { data: leads } = await query
  if (!leads?.length) return NextResponse.json({ processed: 0, found: 0 })

  let processed = 0
  let found = 0

  for (const lead of leads) {
    if (!lead.website) continue
    try {
      const websiteText = await scrapeWebsite(lead.website)
      const contacts = await extractContacts(websiteText, profile ?? {})

      if (contacts.length > 0) {
        const rows = contacts.map((c) => ({
          lead_id: lead.id,
          project_id: projectId,
          name: c.name,
          title: c.title,
          email: c.email,
          is_primary: c.is_primary,
        }))
        await supabase.from('sm_contacts').insert(rows)
        found += contacts.length
      }
      processed++
    } catch {
      processed++
    }
  }

  return NextResponse.json({ processed, found })
}
