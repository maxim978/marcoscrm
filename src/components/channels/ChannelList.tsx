'use client'

import { useState, useEffect } from 'react'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Globe, 
  User,
  Instagram,
  Youtube,
  Music2,
  ExternalLink
} from 'lucide-react'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { updateChannel, deleteChannel } from '@/app/actions/channels'

export function ChannelList({ initialChannels }: { initialChannels: any[] }) {
  const [channels, setChannels] = useState(initialChannels)
  const [editingChannel, setEditingChannel] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    setChannels(initialChannels)
  }, [initialChannels])

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit kanaal wilt verwijderen?')) return
    const res = await deleteChannel(id)
    if (res.success) {
      setChannels(channels.filter(c => c.id !== id))
    } else {
      alert(res.error)
    }
  }

  const handleUpdate = async () => {
    if (!editingChannel) return
    const res = await updateChannel(editingChannel.id, editingChannel)
    if (res.success) {
      setChannels(channels.map(c => c.id === editingChannel.id ? editingChannel : c))
      setIsEditOpen(false)
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {channels.map((channel) => (
          <div key={channel.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-[#dfb433]/10 p-3 rounded-xl text-[#dfb433]">
                  <Globe className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{channel.name}</h3>
                  <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 border-none font-bold">
                    Groot Kanaal
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-[#3071d8]" onClick={() => {
                  setEditingChannel(channel)
                  setIsEditOpen(true)
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-300 hover:text-red-500" onClick={() => handleDelete(channel.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <User className="h-4 w-4 text-slate-400" /> {channel.contact_name || 'Geen contactpersoon'}
              </div>
              {channel.website && (
                <div className="flex items-center gap-2 text-sm text-[#3071d8] font-bold">
                  <ExternalLink className="h-4 w-4" /> 
                  <a href={channel.website} target="_blank" rel="noreferrer">Website</a>
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-1">
              {channel.instagram && (
                <a href={channel.instagram} target="_blank" rel="noreferrer" className="bg-pink-50 p-2 rounded-lg text-pink-600">
                  <Instagram className="h-4 w-4" />
                </a>
              )}
              {channel.tiktok && (
                <a href={channel.tiktok} target="_blank" rel="noreferrer" className="bg-slate-50 p-2 rounded-lg text-slate-900">
                  <Music2 className="h-4 w-4" />
                </a>
              )}
              {channel.youtube && (
                <a href={channel.youtube} target="_blank" rel="noreferrer" className="bg-red-50 p-2 rounded-lg text-red-600">
                  <Youtube className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="pl-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Kanaal & Contact</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Contactpersoon</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Socials</TableHead>
              <TableHead className="text-right pr-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {channels.map((channel) => (
              <TableRow key={channel.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                <TableCell className="pl-6 py-4">
                  <div className="font-black text-slate-900 text-lg">{channel.name}</div>
                  <div className="text-xs text-[#3071d8] font-bold uppercase tracking-wider">{channel.website || ''}</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-700">{channel.contact_name || 'N/A'}</div>
                  <div className="text-xs text-slate-400 font-medium">{channel.contact_email || ''}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {channel.instagram && (
                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-pink-50 text-pink-600">
                        <a href={channel.instagram} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /></a>
                      </Button>
                    )}
                    {channel.tiktok && (
                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 text-slate-900">
                        <a href={channel.tiktok} target="_blank" rel="noreferrer"><Music2 className="h-4 w-4" /></a>
                      </Button>
                    )}
                    {channel.youtube && (
                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-red-50 text-red-600">
                        <a href={channel.youtube} target="_blank" rel="noreferrer"><Youtube className="h-4 w-4" /></a>
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-[#3071d8] rounded-xl" onClick={() => {
                      setEditingChannel(channel)
                      setIsEditOpen(true)
                    }}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => handleDelete(channel.id)}>
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Kanaal Bewerken</DialogTitle>
            <DialogDescription className="font-medium">Pas de gegevens aan voor {editingChannel?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Kanaal Naam</Label>
                <Input value={editingChannel?.name || ''} onChange={(e) => setEditingChannel({...editingChannel, name: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Website</Label>
                <Input value={editingChannel?.website || ''} onChange={(e) => setEditingChannel({...editingChannel, website: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="border-t border-slate-100 pt-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Contactpersoon Gegevens</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label className="font-bold">Naam</Label>
                  <Input value={editingChannel?.contact_name || ''} onChange={(e) => setEditingChannel({...editingChannel, contact_name: e.target.value})} className="h-11 rounded-xl" />
                </div>
                <div className="grid gap-2">
                  <Label className="font-bold">E-mail</Label>
                  <Input value={editingChannel?.contact_email || ''} onChange={(e) => setEditingChannel({...editingChannel, contact_email: e.target.value})} className="h-11 rounded-xl" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold text-pink-600">Instagram</Label>
                <Input value={editingChannel?.instagram || ''} onChange={(e) => setEditingChannel({...editingChannel, instagram: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-900">TikTok</Label>
                <Input value={editingChannel?.tiktok || ''} onChange={(e) => setEditingChannel({...editingChannel, tiktok: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-red-600">YouTube</Label>
                <Input value={editingChannel?.youtube || ''} onChange={(e) => setEditingChannel({...editingChannel, youtube: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Notities</Label>
              <Textarea value={editingChannel?.notes || ''} onChange={(e) => setEditingChannel({...editingChannel, notes: e.target.value})} className="rounded-xl min-h-[100px]" />
            </div>
          </div>
          <Button onClick={handleUpdate} className="w-full bg-[#dfb433] hover:bg-[#dfb433]/90 text-slate-900 font-black h-12 text-lg rounded-xl shadow-lg shadow-yellow-500/20">Wijzigingen Opslaan</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
