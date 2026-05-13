'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import OpenAI from 'openai'

// Initialize OpenAI lazily inside functions to prevent module crash when key is missing
function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

async function getSpotifyToken() {
  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify API keys are missing in .env.local')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  
  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Failed to authenticate with Spotify API. Controleer of je Client ID en Secret correct zijn ingevuld.')
  }
  
  return data.access_token
}

export async function searchSpotifyPlaylists(query: string) {
  try {
    const token = await getSpotifyToken()

    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=playlist`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error?.message || 'Failed to fetch playlists' }
    }

    return { playlists: data.playlists.items }
  } catch (error: any) {
    return { error: error.message }
  }
}

export async function importSpotifyPlaylistAsTarget(playlist: any, followersCount?: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Not authenticated' }

  const rawData = {
    user_id: user.id,
    name: playlist.name,
    type: 'playlist',
    platform: 'Spotify',
    contact_name: playlist.owner?.display_name || '',
    social_links: { spotify: playlist.external_urls?.spotify },
    relationship_status: 'koud',
    followers: followersCount || 0,
    score: 50,
    notes: `Imported from Spotify Auto-Scrape. Description: ${playlist.description || 'none'}`
  }

  const { error } = await supabase.from('targets').insert([rawData])

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/targets')
  return { success: true }
}

export async function autoScrapeSpotifyPlaylists(originalQuery: string) {
  try {
    // 1. Get Synonyms from OpenAI (fallback if fails or no key)
    let searchTerms = [originalQuery]
    
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = getOpenAIClient()
        if (openai) {
          const completion = await openai.chat.completions.create({
            messages: [{ 
              role: "user", 
              content: `Give me exactly 2 different but highly related synonyms or subgenres for the music genre/mood: "${originalQuery}". Only return the 2 phrases separated by a comma, nothing else.`
            }],
            model: "gpt-4o-mini",
          })
          const text = completion.choices[0]?.message?.content || ""
          const synonyms = text.split(',').map(s => s.trim()).filter(Boolean)
          searchTerms = [originalQuery, ...synonyms]
        }
      } catch (e) {
        console.error("OpenAI synonym generation failed, falling back to original query", e)
      }
    }

    // 2. Fetch playlists from Spotify for each term
    const token = await getSpotifyToken()
    let allPlaylists: any[] = []

    for (const term of searchTerms) {
      for (const offset of [0, 20, 40]) {
        const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(term)}&type=playlist&offset=${offset}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok && data.playlists?.items) {
          const validItems = data.playlists.items.filter(Boolean)
          allPlaylists = [...allPlaylists, ...validItems]
        } else {
          console.error(`Spotify search failed for term "${term}" at offset ${offset}:`, data)
        }
      }
    }

    // Remove duplicates based on playlist ID
    const uniquePlaylistsMap = new Map()
    for (const pl of allPlaylists) {
      uniquePlaylistsMap.set(pl.id, pl)
    }
    const uniquePlaylists = Array.from(uniquePlaylistsMap.values())

    if (uniquePlaylists.length === 0) {
      return { error: 'No playlists found for these terms.' }
    }

    // 3. Fetch followers for each playlist in chunks to avoid overwhelming API
    const enrichedPlaylists = []
    
    // Chunking function to run promises in batches
    const chunkSize = 10;
    for (let i = 0; i < uniquePlaylists.length; i += chunkSize) {
      const chunk = uniquePlaylists.slice(i, i + chunkSize)
      
      const fetchPromises = chunk.map(async (pl) => {
        try {
          const res = await fetch(`https://api.spotify.com/v1/playlists/${pl.id}?fields=followers`, {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (res.ok) {
            const data = await res.json()
            return { ...pl, followers_count: data.followers?.total || 0 }
          }
        } catch (e) {
          console.error(`Failed to fetch followers for ${pl.id}`)
        }
        return { ...pl, followers_count: 0 }
      })

      const results = await Promise.all(fetchPromises)
      enrichedPlaylists.push(...results)
      
      // Small delay between chunks to respect rate limits
      if (i + chunkSize < uniquePlaylists.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

    // 4. Filter > 500 followers
    const filteredPlaylists = enrichedPlaylists.filter(pl => pl.followers_count >= 500)

    if (filteredPlaylists.length === 0) {
      return { error: 'Found playlists, but none had more than 500 followers.' }
    }

    // 5. Auto-save to database
    const savedPlaylists = []
    for (const pl of filteredPlaylists) {
      const result = await importSpotifyPlaylistAsTarget(pl, pl.followers_count)
      if (!result.error) {
        savedPlaylists.push(pl)
      }
    }

    return { 
      success: true, 
      searchTermsUsed: searchTerms,
      totalFound: uniquePlaylists.length,
      filteredCount: filteredPlaylists.length,
      savedPlaylists 
    }

  } catch (error: any) {
    return { error: error.message }
  }
}
