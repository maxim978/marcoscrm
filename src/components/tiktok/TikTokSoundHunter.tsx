'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Music, Plus, Loader2, ExternalLink, Heart, Eye, Users, Trash2 } from 'lucide-react'
import { createTikTokSound, addTikTokVideoToSound, getTikTokSounds } from '@/app/actions/tiktok-tracker'
import { Badge } from '@/components/ui/badge'

export default function TikTokSoundHunter() {
  const [sounds, setSounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newSoundName, setNewSoundName] = useState('')
  const [addingVideoTo, setAddingVideoTo] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')

  useEffect(() => {
    fetchSounds()
  }, [])

  async function fetchSounds() {
    setLoading(true)
    const data = await getTikTokSounds()
    setSounds(data)
    setLoading(false)
  }

  async function handleCreateSound(e: React.FormEvent) {
    e.preventDefault()
    if (!newSoundName) return
    try {
      const res = await createTikTokSound(newSoundName)
      if (res.success) {
        setNewSoundName('')
        fetchSounds()
      } else {
        alert('Database fout: ' + res.error)
      }
    } catch (err: any) {
      alert('Systeem fout: ' + err.message)
    }
  }

  async function handleAddVideo(soundId: string) {
    if (!videoUrl) return
    setAddingVideoTo(soundId)
    const res = await addTikTokVideoToSound(soundId, videoUrl)
    if (res.success) {
      setVideoUrl('')
      fetchSounds()
    } else {
      alert(res.error)
    }
    setAddingVideoTo(null)
  }

  if (loading && sounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">TikTok Sound Tracker</h1>
          <p className="text-slate-500 text-sm md:text-base">Beheer video's en statistieken per sound.</p>
        </div>
        
        <form onSubmit={handleCreateSound} className="flex gap-2 w-full md:w-auto">
          <Input 
            placeholder="Nieuwe Sound Naam..." 
            value={newSoundName}
            onChange={(e) => setNewSoundName(e.target.value)}
            className="flex-1 md:w-64"
          />
          <Button type="submit">
            <Plus className="h-4 w-4 md:mr-2" /> <span className="hidden md:inline">Sound Aanmaken</span>
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {sounds.map((sound) => (
          <Card key={sound.id} className="overflow-hidden border-l-4 border-l-blue-500">
            <CardHeader className="bg-slate-50/50 p-4 md:p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Music className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base md:text-lg">{sound.name}</CardTitle>
                    <CardDescription className="text-xs md:text-sm">{sound.tiktok_videos?.length || 0} video's gevolgd</CardDescription>
                  </div>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                  <Input 
                    placeholder="Plak TikTok video link..." 
                    className="flex-1 md:w-80 text-sm"
                    value={addingVideoTo === sound.id ? videoUrl : ''}
                    onChange={(e) => {
                      setAddingVideoTo(sound.id)
                      setVideoUrl(e.target.value)
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddVideo(sound.id)}
                  />
                  <Button 
                    onClick={() => handleAddVideo(sound.id)} 
                    disabled={addingVideoTo === sound.id}
                    variant="secondary"
                    size="sm"
                    className="md:size-default"
                  >
                    {addingVideoTo === sound.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              {sound.tiktok_videos && sound.tiktok_videos.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="pl-6">Account</TableHead>
                      <TableHead className="text-center">Views</TableHead>
                      <TableHead className="text-center">Likes</TableHead>
                      <TableHead className="text-center">Volgers</TableHead>
                      <TableHead className="text-right pr-6">Link</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sound.tiktok_videos.map((video: any) => (
                      <TableRow key={video.id}>
                        <TableCell className="pl-6 font-bold text-blue-600">
                          @{video.account_name}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Eye className="h-3 w-3 text-slate-400" />
                            {video.views?.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-medium">
                          <div className="flex items-center justify-center gap-1">
                            <Heart className="h-3 w-3 text-red-500" />
                            {video.likes?.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1 text-slate-500">
                            <Users className="h-3 w-3" />
                            {video.followers?.toLocaleString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" asChild>
                            <a href={video.url} target="_blank" rel="noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="p-8 text-center text-slate-400 italic">
                  Nog geen video's toegevoegd voor deze sound. Plak hierboven een link om te beginnen.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
