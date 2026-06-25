import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/service'
import { PROVINCES } from '@/lib/salesmachine/types'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

async function generateSearchQueries(profile: Record<string, unknown>): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 512,
    messages: [{
      role: 'user',
      content: `Genereer 8 Google Places zoekopdrachten in het Nederlands voor:
Business: ${profile.businessType}
Doelgroep: ${profile.targetAudience}
Zoekwoorden: ${(profile.keywords as string[])?.join(', ')}

Geef alleen een JSON array met 8 korte Nederlandse zoekopdrachten (max 3 woorden per query), geen markdown:
["query1", "query2", ...]`,
    }],
  })

  const text = message.content[0].type === 'text' ? message.content[0].text : '[]'
  const match = text.match(/\[[\s\S]*\]/)
  if (!match) return []
  try { return JSON.parse(match[0]) } catch { return [] }
}

async function searchGooglePlaces(
  query: string,
  province: string,
  pageToken?: string
): Promise<{ results: GooglePlace[]; nextPageToken?: string }> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return { results: [] }

  const body: Record<string, unknown> = {
    textQuery: `${query} ${province} Nederland`,
    regionCode: 'NL',
    languageCode: 'nl',
    pageSize: 20,
  }
  if (pageToken) body.pageToken = pageToken

  const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.websiteUri,places.internationalPhoneNumber,places.types,places.location,nextPageToken',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) return { results: [] }
  const data = await res.json()
  return {
    results: data.places ?? [],
    nextPageToken: data.nextPageToken,
  }
}

interface GooglePlace {
  id: string
  displayName?: { text: string }
  formattedAddress?: string
  websiteUri?: string
  internationalPhoneNumber?: string
  types?: string[]
  location?: { latitude: number; longitude: number }
}

function extractCity(address: string | undefined): string {
  if (!address) return ''
  const parts = address.split(',')
  if (parts.length >= 2) return parts[parts.length - 2].trim().replace(/\d{4}\s?\w{2}\s?/g, '').trim()
  return ''
}

export async function POST(req: NextRequest) {
  const { projectId, profile, scope, singleProvince, customKeywords } = await req.json()
  if (!projectId || !profile) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = createServiceClient()

  const queries: string[] = await generateSearchQueries(profile)
  if (customKeywords?.length) queries.push(...customKeywords.slice(0, 4))

  const provinces: string[] = scope === 'heel-nederland' ? PROVINCES : [singleProvince]

  let saved = 0
  let skipped = 0
  const errors: string[] = []

  for (const province of provinces) {
    for (const query of queries) {
      let pageToken: string | undefined
      let page = 0

      while (page < 3) {
        try {
          const { results, nextPageToken } = await searchGooglePlaces(query, province, pageToken)

          const leads = results.map((place) => ({
            project_id: projectId,
            google_place_id: place.id,
            name: place.displayName?.text ?? 'Onbekend',
            address: place.formattedAddress ?? null,
            city: extractCity(place.formattedAddress),
            province,
            website: place.websiteUri ?? null,
            phone: place.internationalPhoneNumber ?? null,
            google_types: place.types ?? [],
            phase: 'Nieuw',
            score: 0,
          }))

          if (leads.length > 0) {
            const { error, data } = await supabase
              .from('sm_leads')
              .upsert(leads, { onConflict: 'project_id,google_place_id', ignoreDuplicates: true })
              .select('id')

            saved += data?.length ?? 0
            skipped += leads.length - (data?.length ?? 0)
            if (error) errors.push(error.message)
          }

          if (!nextPageToken) break
          pageToken = nextPageToken
          page++
          await new Promise((r) => setTimeout(r, 200))
        } catch (e) {
          errors.push(String(e))
          break
        }
      }
    }
  }

  return NextResponse.json({ saved, skipped, errors })
}
