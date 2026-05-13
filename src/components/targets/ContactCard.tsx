'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { updateTargetContactInfo } from '@/app/actions/contact'
import { getRelatedPlaylists } from '@/app/actions/related'
import { Mail, Phone, Video, User, Link as LinkIcon, Globe, Music } from 'lucide-react'
// No toast library found, using standard alert if needed

interface ContactCardProps {
  target: {
    id: string
    contact_name: string | null
    email: string | null
    phone?: string | null
    facebook_url?: string | null
    instagram_url?: string | null
    tiktok_url?: string | null
  }
  trigger?: React.ReactNode
}

export function ContactCard({ target, trigger }: ContactCardProps) {
  const [open, setOpen] = useState(false)
  const [related, setRelated] = useState<any[]>([])

  // Fetch related playlists when dialog opens
  const handleOpenChange = async (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen && target.contact_name) {
      const data = await getRelatedPlaylists(target.contact_name, target.id)
      setRelated(data)
    }
  }

  async function handleSubmit(formData: FormData) {
    const result = await updateTargetContactInfo(formData)
    if (result.success) {
      setOpen(false)
      // If you have a toast system: toast.success('Contactgegevens opgeslagen')
    } else {
      alert('Er is iets misgegaan: ' + result.error)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger || (
          <button className="text-blue-500 hover:underline font-medium text-left">
            {target.contact_name || 'Naam toevoegen'}
          </button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-slate-400" />
            Contactkaart
          </DialogTitle>
          <DialogDescription>
            Beheer de contactgegevens van de beheerder.
          </DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4 pt-4">
          <input type="hidden" name="id" value={target.id} />
          
          <div className="space-y-2">
            <Label htmlFor="contact_name">Naam beheerder</Label>
            <Input id="contact_name" name="contact_name" defaultValue={target.contact_name || ''} placeholder="Bijv. Mark de Vries" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" /> E-mail
            </Label>
            <Input id="email" name="email" type="email" defaultValue={target.email || ''} placeholder="mark@example.com" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Telefoonnummer
            </Label>
            <Input id="phone" name="phone" defaultValue={target.phone || ''} placeholder="+31 6 ..." />
          </div>

          <div className="grid grid-cols-1 gap-4 border-t pt-4">
            <div className="space-y-2">
              <Label htmlFor="instagram_url" className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-pink-500" /> Instagram Link
              </Label>
              <Input id="instagram_url" name="instagram_url" defaultValue={target.instagram_url || ''} placeholder="https://instagram.com/..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="facebook_url" className="flex items-center gap-2">
                <LinkIcon className="h-4 w-4 text-blue-600" /> Facebook Link
              </Label>
              <Input id="facebook_url" name="facebook_url" defaultValue={target.facebook_url || ''} placeholder="https://facebook.com/..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tiktok_url" className="flex items-center gap-2">
                <Video className="h-4 w-4 text-slate-900" /> TikTok Link
              </Label>
              <Input id="tiktok_url" name="tiktok_url" defaultValue={target.tiktok_url || ''} placeholder="https://tiktok.com/@..." />
            </div>
          </div>

          {related.length > 0 && (
            <div className="border-t pt-4 space-y-2">
              <Label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Andere Playlists van deze beheerder</Label>
              <div className="space-y-1">
                {related.map((pl) => (
                  <div key={pl.id} className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded border border-slate-100">
                    <div className="flex items-center gap-2 truncate">
                      <Music className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="truncate font-medium">{pl.name}</span>
                    </div>
                    {pl.social_links?.spotify && (
                      <a href={pl.social_links.spotify} target="_blank" rel="noreferrer" className="text-xs text-blue-500 hover:underline shrink-0 ml-2">
                        Open Spotify
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <SubmitButton className="w-full">Gegevens opslaan</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
