'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Music, Search, Users, ExternalLink, Sparkles, Loader2, ArrowRight } from 'lucide-react'
import { huntTikTokSound } from '@/app/actions/tiktok'
import { Badge } from '@/components/ui/badge'

export default function TikTokSoundHunter() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query) return
    setLoading(true)
    try {
      const data = await huntTikTokSound(query)
      setResult(data)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">TikTok Sound Hunter</h1>
        <p className="text-slate-500">Ontdek welke creators jouw sound (gaan) gebruiken.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sound Onderzoek</CardTitle>
          <CardDescription>
            Voer de naam van een liedje, artiest of Sound ID in om creators te vinden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Music className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Bijv: 'Marco Kraats - Magie' of Sound ID..." 
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Hunter Starten
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && !result.error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Voorgestelde Creators
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {result.suggestedCreators?.map((c: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100 hover:border-blue-200 transition-colors">
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-2">
                        {c.name}
                        <Badge variant="secondary" className="text-[10px]">Potentieel</Badge>
                      </div>
                      <p className="text-sm text-slate-600">{c.reason}</p>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={c.profileUrl || `https://www.tiktok.com/search/user?q=${encodeURIComponent(c.name)}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-bold text-sm mb-2 uppercase text-slate-400 tracking-wider">Directe Zoekopdrachten</h3>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={result.tiktokSearchUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 text-pink-500" /> Open TikTok Video Search
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" asChild>
                    <a href={result.googleSearchUrl} target="_blank" rel="noreferrer">
                      <ExternalLink className="h-4 w-4 text-blue-500" /> Deep Search via Google
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Sparkles className="h-5 w-5" />
                AI Strategie
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-relaxed text-slate-300">
              {result.strategy}
              <div className="mt-6 p-4 bg-slate-800 rounded border border-slate-700 italic text-xs">
                "Tip: Gebruik deze creators om een 'chain reaction' te starten. Benader eerst de kleinste voor sociaal bewijs."
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
