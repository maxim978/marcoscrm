'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Music, Search, Users, ExternalLink, Sparkles, Loader2, ArrowRight, Heart, MessageCircle, Bookmark, Plus } from 'lucide-react'
import { huntTikTokSound, saveTikTokCreatorToCrm } from '@/app/actions/tiktok'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

export default function TikTokSoundHunter() {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [savingId, setSavingId] = useState<string | null>(null)
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

  async function handleSave(video: any, index: number) {
    setSavingId(index.toString())
    try {
      const res = await saveTikTokCreatorToCrm(video)
      if (res.success) {
        alert(`${video.creator} toegevoegd aan CRM!`)
      } else {
        alert('Fout: ' + res.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setSavingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">TikTok Sound Hunter <Badge className="bg-blue-500 ml-2">DEEP</Badge></h1>
          <p className="text-slate-500">Ontdek exact wie jouw sound gebruikt en sla ze direct op.</p>
        </div>
      </div>

      <Card className="border-2 border-blue-100">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Music className="h-5 w-5 text-blue-600" />
            Sound Link of Naam
          </CardTitle>
          <CardDescription>
            Plak een TikTok Sound URL of zoek op naam om alle video's en stats te vinden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="https://www.tiktok.com/music/..." 
                className="pl-9"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              Deep Hunter Starten
            </Button>
          </form>
        </CardContent>
      </Card>

      {result && !result.error && (
        <div className="space-y-6">
          <Card className="bg-slate-900 text-white border-none shadow-xl overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Sparkles className="h-24 w-24" />
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400 text-sm uppercase tracking-widest">
                AI Analyse
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg leading-relaxed text-slate-100 italic">
                "{result.analysis}"
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  Gevonden Video's & Creators
                </CardTitle>
                {result.searchUrl && (
                  <Button variant="ghost" size="sm" asChild className="text-blue-500">
                    <a href={result.searchUrl} target="_blank" rel="noreferrer">
                      Open op TikTok <ExternalLink className="ml-2 h-3 w-3" />
                    </a>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Creator</TableHead>
                    <TableHead className="text-center"><Heart className="h-4 w-4 mx-auto" /></TableHead>
                    <TableHead className="text-center"><MessageCircle className="h-4 w-4 mx-auto" /></TableHead>
                    <TableHead className="text-center"><Bookmark className="h-4 w-4 mx-auto" /></TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.videos?.map((v: any, i: number) => (
                    <TableRow key={i}>
                      <TableCell>
                        <div className="font-bold text-blue-600">@{v.creator}</div>
                        <div className="text-[10px] text-slate-400">{v.followers?.toLocaleString()} followers</div>
                      </TableCell>
                      <TableCell className="text-center font-medium">{v.likes?.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-slate-500">{v.comments?.toLocaleString()}</TableCell>
                      <TableCell className="text-center text-slate-500">{v.saves?.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={v.videoUrl} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-green-50 text-green-700 border-green-100 hover:bg-green-100"
                            onClick={() => handleSave(v, i)}
                            disabled={savingId === i.toString()}
                          >
                            {savingId === i.toString() ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
