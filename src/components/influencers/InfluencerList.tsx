'use client'

import { useState } from 'react'
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
  Users, 
  ExternalLink,
  Instagram,
  Facebook,
  Video
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { updateInfluencer, deleteInfluencer } from '@/app/actions/influencers'

export function InfluencerList({ initialInfluencers }: { initialInfluencers: any[] }) {
  const [influencers, setInfluencers] = useState(initialInfluencers)
  const [editingInf, setEditingInf] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze influencer wilt verwijderen?')) return
    const res = await deleteInfluencer(id)
    if (res.success) {
      setInfluencers(influencers.filter(i => i.id !== id))
    } else {
      alert(res.error)
    }
  }

  const handleUpdate = async () => {
    if (!editingInf) return
    const res = await updateInfluencer(editingInf.id, editingInf)
    if (res.success) {
      setInfluencers(influencers.map(i => i.id === editingInf.id ? editingInf : i))
      setIsEditOpen(false)
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {influencers.map((inf) => (
          <div key={inf.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-[#3071d8]/10 p-3 rounded-xl text-[#3071d8]">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{inf.name}</h3>
                  <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 border-none font-bold">
                    Influencer
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-[#3071d8]" onClick={() => {
                  setEditingInf(inf)
                  setIsEditOpen(true)
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-300 hover:text-red-500" onClick={() => handleDelete(inf.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-50">
              <div className="bg-slate-50/50 p-3 rounded-xl">
                <div className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">Platform</div>
                <div className="font-bold text-slate-700">{inf.platform}</div>
              </div>
              <div className="bg-slate-50/50 p-3 rounded-xl">
                <div className="text-[10px] uppercase font-black text-[#dfb433] tracking-widest mb-1">Volgers</div>
                <div className="font-black text-slate-900">{inf.followers?.toLocaleString() || '0'}</div>
              </div>
            </div>

            <div className="flex items-center justify-between mt-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-black text-slate-400">Contact:</span>
                <span className="text-sm font-bold text-slate-700">{inf.contact_name || 'N/A'}</span>
              </div>
              <div className="flex gap-2">
                {inf.social_links?.instagram && (
                  <a href={inf.social_links.instagram} target="_blank" rel="noreferrer" className="bg-pink-50 p-2 rounded-lg text-pink-600">
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {inf.social_links?.tiktok && (
                  <a href={inf.social_links.tiktok} target="_blank" rel="noreferrer" className="bg-slate-50 p-2 rounded-lg text-slate-900">
                    <Video className="h-4 w-4" />
                  </a>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent border-slate-100">
              <TableHead className="pl-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Influencer & Contact</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Platform</TableHead>
              <TableHead className="text-center font-black uppercase text-[11px] tracking-widest text-[#dfb433] h-14">Volgers</TableHead>
              <TableHead className="text-right pr-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {influencers.map((inf) => (
              <TableRow key={inf.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                <TableCell className="pl-6 py-4">
                  <div className="font-black text-slate-900 text-lg">{inf.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] uppercase font-black text-slate-400">Contact:</span>
                    <span className="text-sm font-bold text-slate-700">{inf.contact_name || 'N/A'}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-600">{inf.platform}</div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full text-slate-900 font-black">
                    {inf.followers?.toLocaleString() || '0'}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <div className="flex gap-1 mr-4 border-r border-slate-100 pr-4">
                      {inf.social_links?.instagram && (
                        <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-pink-50 text-pink-600">
                          <a href={inf.social_links.instagram} target="_blank" rel="noreferrer"><Instagram className="h-4 w-4" /></a>
                        </Button>
                      )}
                      {inf.social_links?.tiktok && (
                        <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 text-slate-900">
                          <a href={inf.social_links.tiktok} target="_blank" rel="noreferrer"><Video className="h-4 w-4" /></a>
                        </Button>
                      )}
                    </div>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-[#3071d8] rounded-xl" onClick={() => {
                      setEditingInf(inf)
                      setIsEditOpen(true)
                    }}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => handleDelete(inf.id)}>
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
            <DialogTitle className="text-2xl font-black">Influencer Bewerken</DialogTitle>
            <DialogDescription className="font-medium">Pas de gegevens aan voor {editingInf?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Naam / Kanaal</Label>
                <Input value={editingInf?.name || ''} onChange={(e) => setEditingInf({...editingInf, name: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Contactpersoon</Label>
                <Input value={editingInf?.contact_name || ''} onChange={(e) => setEditingInf({...editingInf, contact_name: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Platform</Label>
                <Select value={editingInf?.platform} onValueChange={(v) => setEditingInf({...editingInf, platform: v})}>
                  <SelectTrigger className="h-11 rounded-xl font-bold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Volgers</Label>
                <Input type="number" value={editingInf?.followers || 0} onChange={(e) => setEditingInf({...editingInf, followers: parseInt(e.target.value)})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold text-pink-600">Instagram URL</Label>
                <Input value={editingInf?.social_links?.instagram || ''} onChange={(e) => setEditingInf({...editingInf, social_links: {...editingInf.social_links, instagram: e.target.value}})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-900">TikTok URL</Label>
                <Input value={editingInf?.social_links?.tiktok || ''} onChange={(e) => setEditingInf({...editingInf, social_links: {...editingInf.social_links, tiktok: e.target.value}})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-blue-600">Facebook URL</Label>
                <Input value={editingInf?.social_links?.facebook || ''} onChange={(e) => setEditingInf({...editingInf, social_links: {...editingInf.social_links, facebook: e.target.value}})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Notities</Label>
              <Textarea value={editingInf?.notes || ''} onChange={(e) => setEditingInf({...editingInf, notes: e.target.value})} className="rounded-xl min-h-[100px]" />
            </div>
          </div>
          <Button onClick={handleUpdate} className="w-full bg-[#3071d8] text-white font-black h-12 text-lg rounded-xl shadow-lg shadow-blue-500/20">Wijzigingen Opslaan</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
