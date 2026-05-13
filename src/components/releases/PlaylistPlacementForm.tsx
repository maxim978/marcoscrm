'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { addManualPlacement } from '@/app/actions/placements'

export function PlaylistPlacementForm({ releaseId }: { releaseId: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    playlistName: '',
    curatorName: '',
    playlistLink: '',
    followers: '',
    dateAdded: new Date().toISOString().split('T')[0]
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    const result = await addManualPlacement(
      releaseId,
      formData.playlistName,
      formData.curatorName,
      formData.playlistLink,
      parseInt(formData.followers) || 0,
      formData.dateAdded
    )

    setIsSubmitting(false)

    if (result.error) {
      alert(result.error)
    } else {
      setIsOpen(false)
      setFormData({
        playlistName: '',
        curatorName: '',
        playlistLink: '',
        followers: '',
        dateAdded: new Date().toISOString().split('T')[0]
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Placement
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Playlist Placement</DialogTitle>
          <DialogDescription>
            Quickly log a new playlist addition. This will automatically save the playlist to your Targets CRM.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="playlistName">Playlist Name *</Label>
            <Input 
              id="playlistName" 
              required
              value={formData.playlistName}
              onChange={(e) => setFormData({...formData, playlistName: e.target.value})}
              placeholder="e.g. Summer Hits 2026"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="curatorName">Curator Name</Label>
            <Input 
              id="curatorName" 
              value={formData.curatorName}
              onChange={(e) => setFormData({...formData, curatorName: e.target.value})}
              placeholder="e.g. John Doe or Spotify"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="playlistLink">Playlist Link (URL)</Label>
            <Input 
              id="playlistLink" 
              type="url"
              value={formData.playlistLink}
              onChange={(e) => setFormData({...formData, playlistLink: e.target.value})}
              placeholder="https://open.spotify.com/playlist/..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="followers">Followers *</Label>
              <Input 
                id="followers" 
                type="number"
                required
                value={formData.followers}
                onChange={(e) => setFormData({...formData, followers: e.target.value})}
                placeholder="e.g. 1500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateAdded">Date Added *</Label>
              <Input 
                id="dateAdded" 
                type="date"
                required
                value={formData.dateAdded}
                onChange={(e) => setFormData({...formData, dateAdded: e.target.value})}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save Placement
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
