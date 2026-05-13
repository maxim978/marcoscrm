'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Music, Plus, Loader2, ExternalLink, Heart, Eye, Users, Trash2 } from 'lucide-react'
import { createTikTokSound, addTikTokVideoToSound, getTikTokSounds, addTikTokVideoManually } from '@/app/actions/tiktok-tracker'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function TikTokSoundHunter() {
  const [sounds, setSounds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newSoundName, setNewSoundName] = useState('')
  const [addingVideoTo, setAddingVideoTo] = useState<string | null>(null)
  const [videoUrl, setVideoUrl] = useState('')
  
  // Manual form state
  const [isManualOpen, setIsManualOpen] = useState(false)
  const [selectedSoundId, setSelectedSoundId] = useState('')
  const [manualData, setManualData] = useState({
    url: '',
    account_name: '',
    views: '',
    likes: '',
    followers: ''
  })

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

  const extractUrl = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g
    const match = text.match(urlRegex)
    return match ? match[0] : text
  }

  async function handleAddVideo(soundId: string) {
    const cleanedUrl = extractUrl(videoUrl)
    if (!cleanedUrl) return
    setAddingVideoTo(soundId)
    const res = await addTikTokVideoToSound(soundId, cleanedUrl)
    if (res.success) {
      setVideoUrl('')
      fetchSounds()
    } else {
      alert(res.error)
    }
    setAddingVideoTo(null)
  }

  async function handleManualSubmit() {
    const cleanedUrl = extractUrl(manualData.url)
    if (!cleanedUrl || !manualData.account_name) return
    setLoading(true)
    const res = await addTikTokVideoManually({
      sound_id: selectedSoundId,
      url: cleanedUrl,
      account_name: manualData.account_name,
      views: parseInt(manualData.views) || 0,
      likes: parseInt(manualData.likes) || 0,
      followers: parseInt(manualData.followers) || 0
    })
    
    if (res.success) {
      setIsManualOpen(false)
      setManualData({ url: '', account_name: '', views: '', likes: '', followers: '' })
      fetchSounds()
    } else {
      alert(res.error)
    }
    setLoading(false)
  }

  if (loading && sounds.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[#3071d8]" />
      </div>
    )
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">TikTok Sound Tracker</h1>
          <p className="text-slate-500 font-medium">Volg je sound-performance in real-time.</p>
        </div>
        
        <form onSubmit={handleCreateSound} className="flex gap-3 w-full lg:w-auto">
          <Input 
            placeholder="Bijv. Magie Release..." 
            value={newSoundName}
            onChange={(e) => setNewSoundName(e.target.value)}
            className="flex-1 lg:w-72 border-slate-200 focus:border-[#3071d8] focus:ring-[#3071d8]/10"
          />
          <Button type="submit" className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white shadow-lg shadow-blue-500/20 px-6 font-bold">
            <Plus className="h-4 w-4 mr-2" /> Sound Toevoegen
          </Button>
        </form>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {sounds.map((sound) => (
          <Card key={sound.id} className="overflow-hidden border-none shadow-xl shadow-slate-200/50 rounded-2xl bg-white">
            <div className="bg-[#3071d8] p-4 md:p-6 text-white">
              <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md hidden sm:block">
                    <Music className="h-6 w-6 text-[#dfb433]" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{sound.name}</h2>
                    <div className="flex gap-2 mt-1">
                      <Badge className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                        {sound.tiktok_videos?.length || 0} Video's
                      </Badge>
                      <Badge className="bg-[#dfb433] text-slate-900 border-none font-bold">
                        Totaal: {(sound.tiktok_videos?.reduce((acc: number, v: any) => acc + (v.views || 0), 0) || 0).toLocaleString()} Views
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
                  <div className="relative flex-1 sm:w-80">
                    <Input 
                      placeholder="Plak TikTok link hier..." 
                      className="w-full bg-white text-slate-900 border-none shadow-inner pr-12 h-11 text-sm sm:text-base"
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
                      className="absolute right-1 top-1 bottom-1 bg-[#3071d8] hover:bg-blue-700 text-white p-2 h-9 w-9"
                    >
                      {addingVideoTo === sound.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-5 w-5" />}
                    </Button>
                  </div>

                  <Dialog open={isManualOpen && selectedSoundId === sound.id} onOpenChange={(open) => {
                    setIsManualOpen(open)
                    if (open) setSelectedSoundId(sound.id)
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20 h-11 px-6 font-bold">
                        Handmatig
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] bg-white text-slate-900">
                      <DialogHeader>
                        <DialogTitle className="text-2xl font-bold">Video Handmatig Toevoegen</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                          Vul de gegevens handmatig in om de video toe te voegen aan {sound.name}.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-6 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="url" className="font-bold text-slate-700">Video Link</Label>
                          <Input id="url" placeholder="https://tiktok.com/..." value={manualData.url} onChange={(e) => setManualData({...manualData, url: e.target.value})} className="h-11" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="name" className="font-bold text-slate-700">Account</Label>
                            <Input id="name" placeholder="@naam" value={manualData.account_name} onChange={(e) => setManualData({...manualData, account_name: e.target.value})} className="h-11" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="views" className="font-bold text-slate-700">Views</Label>
                            <Input id="views" type="number" value={manualData.views} onChange={(e) => setManualData({...manualData, views: e.target.value})} className="h-11" />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label htmlFor="likes" className="font-bold text-slate-700">Likes</Label>
                            <Input id="likes" type="number" value={manualData.likes} onChange={(e) => setManualData({...manualData, likes: e.target.value})} className="h-11" />
                          </div>
                          <div className="grid gap-2">
                            <Label htmlFor="followers" className="font-bold text-slate-700">Volgers</Label>
                            <Input id="followers" type="number" value={manualData.followers} onChange={(e) => setManualData({...manualData, followers: e.target.value})} className="h-11" />
                          </div>
                        </div>
                      </div>
                      <Button onClick={handleManualSubmit} className="w-full bg-[#3071d8] text-white font-bold h-14 text-xl shadow-lg shadow-blue-500/20">Toevoegen aan Lijst</Button>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>

            <CardContent className="p-0">
              {/* Mobile View: Card List */}
              <div className="block md:hidden bg-slate-50 p-4 space-y-4">
                {sound.tiktok_videos && sound.tiktok_videos.length > 0 ? (
                  sound.tiktok_videos.map((video: any) => (
                    <div key={video.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-col gap-3">
                      <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                        <span className="font-black text-[#3071d8] text-lg">@{video.account_name}</span>
                        <a href={video.url} target="_blank" rel="noreferrer" className="bg-[#3071d8]/10 p-2 rounded-lg text-[#3071d8]">
                          <ExternalLink className="h-5 w-5" />
                        </a>
                      </div>
                      <div className="grid grid-cols-3 gap-2 py-1">
                        <div className="text-center">
                          <div className="text-[10px] uppercase text-slate-400 font-black tracking-wider mb-1">Views</div>
                          <div className="text-base font-black flex items-center justify-center gap-1 text-slate-900">
                            <Eye className="h-3.5 w-3.5 text-blue-500" />
                            {video.views?.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center border-x border-slate-100">
                          <div className="text-[10px] uppercase text-slate-400 font-black tracking-wider mb-1">Likes</div>
                          <div className="text-base font-black flex items-center justify-center gap-1 text-slate-900">
                            <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500" />
                            {video.likes?.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-[10px] uppercase text-slate-400 font-black tracking-wider mb-1">Volgers</div>
                          <div className="text-base font-black flex items-center justify-center gap-1 text-[#dfb433]">
                            <Users className="h-3.5 w-3.5" />
                            {video.followers?.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-slate-400 italic font-medium">Nog geen video's. Plak een link!</div>
                )}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden md:block">
                {sound.tiktok_videos && sound.tiktok_videos.length > 0 ? (
                  <Table>
                    <TableHeader className="bg-slate-50/50">
                      <TableRow className="hover:bg-transparent border-none">
                        <TableHead className="pl-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-12">Account</TableHead>
                        <TableHead className="text-center font-black uppercase text-[11px] tracking-widest text-slate-400 h-12">Views</TableHead>
                        <TableHead className="text-center font-black uppercase text-[11px] tracking-widest text-slate-400 h-12">Likes</TableHead>
                        <TableHead className="text-center font-black uppercase text-[11px] tracking-widest text-[#dfb433] h-12">Volgers</TableHead>
                        <TableHead className="text-right pr-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-12">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sound.tiktok_videos.map((video: any) => (
                        <TableRow key={video.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                          <TableCell className="pl-6 font-black text-[#3071d8] text-lg py-4">
                            @{video.account_name}
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-full text-blue-700 font-black">
                              <Eye className="h-4 w-4" />
                              {video.views?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5 text-red-500 font-black">
                              <Heart className="h-4 w-4 fill-current" />
                              {video.likes?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex items-center justify-center gap-1.5 text-[#dfb433] font-black">
                              <Users className="h-4 w-4" />
                              {video.followers?.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <Button variant="ghost" size="sm" asChild className="hover:bg-[#3071d8]/10 text-[#3071d8] rounded-xl h-10 w-10 p-0">
                              <a href={video.url} target="_blank" rel="noreferrer">
                                <ExternalLink className="h-5 w-5" />
                              </a>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="p-16 text-center text-slate-300 flex flex-col items-center gap-4">
                    <div className="bg-slate-50 p-6 rounded-full">
                      <Music className="h-12 w-12 opacity-20" />
                    </div>
                    <p className="italic font-bold text-lg">Nog geen video's gevolgd. Plak een link om te starten!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
