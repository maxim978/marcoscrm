'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/SubmitButton'
import { updateTargetContactInfo } from '@/app/actions/contact'
import { Mail, Phone, Video, User, Link as LinkIcon, Globe } from 'lucide-react'
import { toast } from 'sonner' // Assuming sonner is used, if not I'll use alert

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
    <Dialog open={open} onOpenChange={setOpen}>
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

          <div className="flex justify-end pt-4">
            <SubmitButton className="w-full">Gegevens opslaan</SubmitButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
