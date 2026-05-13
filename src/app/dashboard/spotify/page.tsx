'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { autoScrapeSpotifyPlaylists } from '@/app/actions/spotify'
import { Search, Loader2, Music, CheckCircle2 } from 'lucide-react'

export default function SpotifyFinderPage() {
  const [query, setQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [resultData, setResultData] = useState<{
    searchTermsUsed: string[],
    totalFound: number,
    filteredCount: number,
    savedPlaylists: any[]
  } | null>(null)

  const handleAutoScrape = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query) return
    
    setIsSearching(true)
    setError(null)
    setResultData(null)
    
    const result = await autoScrapeSpotifyPlaylists(query)
    
    if (result.error) {
      setError(result.error)
    } else {
      setResultData({
        searchTermsUsed: result.searchTermsUsed,
        totalFound: result.totalFound,
        filteredCount: result.filteredCount,
        savedPlaylists: result.savedPlaylists || []
      })
    }
    setIsSearching(false)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Smart Auto-Scraper (Spotify)</h3>
        <p className="text-slate-500 text-sm">Automatically searches synonyms, checks follower counts, and saves playlists {'>'} 500 followers directly to your CRM.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Auto-Scrape</CardTitle>
          <CardDescription>Enter a base genre or mood (e.g. "Tech House"). This process takes about 5-10 seconds as it performs deep checks in the background.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAutoScrape} className="flex gap-2">
            <Input 
              placeholder="e.g. 'Dutch Tech House' or 'Chill Vibes'" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              {isSearching ? 'Scraping & Checking Followers...' : 'Auto-Scrape & Save'}
            </Button>
          </form>
          {error && <p className="text-red-500 text-sm mt-4 font-semibold">{error}</p>}
        </CardContent>
      </Card>

      {resultData && (
        <div className="space-y-4">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="py-4">
              <CardTitle className="text-green-800 flex items-center gap-2 text-lg">
                <CheckCircle2 className="h-5 w-5" />
                Scrape Completed Successfully!
              </CardTitle>
              <CardDescription className="text-green-700">
                Searched using terms: <span className="font-semibold">{resultData.searchTermsUsed.join(', ')}</span>.<br/>
                Found {resultData.totalFound} unique playlists, of which <span className="font-bold">{resultData.filteredCount}</span> had more than 500 followers.<br/>
                These have been automatically saved to your Targets database!
              </CardDescription>
            </CardHeader>
          </Card>

          {resultData.savedPlaylists.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resultData.savedPlaylists.map((pl) => (
                <Card key={pl.id} className="flex flex-col">
                  <CardHeader className="flex-row items-center gap-4 space-y-0">
                    {pl.images && pl.images[0] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={pl.images[0].url} alt={pl.name} className="w-16 h-16 rounded shadow-sm object-cover" />
                    ) : (
                      <div className="w-16 h-16 rounded bg-slate-100 flex items-center justify-center">
                        <Music className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base leading-tight truncate" title={pl.name}>{pl.name}</CardTitle>
                      <CardDescription className="mt-1 truncate">By {pl.owner?.display_name || 'Unknown'}</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent className="mt-auto pt-4 flex justify-between items-center border-t border-slate-100">
                    <span className="text-sm font-semibold text-slate-700">
                      👥 {pl.followers_count.toLocaleString()} followers
                    </span>
                    <a href={pl.external_urls?.spotify} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline">
                      View on Spotify
                    </a>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
