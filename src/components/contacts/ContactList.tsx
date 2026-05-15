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
  Mail, 
  Phone,
  Camera,
  Link,
  Music
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
import { updateContact, deleteContact } from '@/app/actions/contacts'

export function ContactList({ initialContacts }: { initialContacts: any[] }) {
  const [contacts, setContacts] = useState(initialContacts)
  const [editingContact, setEditingContact] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    setContacts(initialContacts)
  }, [initialContacts])

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit contact wilt verwijderen?')) return
    const res = await deleteContact(id)
    if (res.success) {
      setContacts(contacts.filter(c => c.id !== id))
    } else {
      alert(res.error)
    }
  }

  const handleUpdate = async () => {
    if (!editingContact) return
    const res = await updateContact(editingContact.id, editingContact)
    if (res.success) {
      setContacts(contacts.map(c => c.id === editingContact.id ? editingContact : c))
      setIsEditOpen(false)
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-[#3071d8]/10 p-3 rounded-xl text-[#3071d8]">
                  <Mail className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{contact.name}</h3>
                  <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 border-none font-bold">
                    Algemeen Contact
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-[#3071d8]" onClick={() => {
                  setEditingContact(contact)
                  setIsEditOpen(true)
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-300 hover:text-red-500" onClick={() => handleDelete(contact.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50">
              {contact.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Mail className="h-4 w-4 text-slate-400" /> {contact.email}
                </div>
              )}
              {contact.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Phone className="h-4 w-4 text-slate-400" /> {contact.phone}
                </div>
              )}
            </div>

            <div className="flex gap-2 mt-1">
              {contact.instagram && (
                <a href={contact.instagram} target="_blank" rel="noreferrer" className="bg-pink-50 p-2 rounded-lg text-pink-600">
                  <Camera className="h-4 w-4" />
                </a>
              )}
              {contact.tiktok && (
                <a href={contact.tiktok} target="_blank" rel="noreferrer" className="bg-slate-50 p-2 rounded-lg text-slate-900">
                  <Music className="h-4 w-4" />
                </a>
              )}
              {contact.spotify && (
                <a href={contact.spotify} target="_blank" rel="noreferrer" className="bg-green-50 p-2 rounded-lg text-green-600">
                  <Globe className="h-4 w-4" />
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
              <TableHead className="pl-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Naam & Contact</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Telefoon</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Socials</TableHead>
              <TableHead className="text-right pr-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id} className="hover:bg-slate-50/80 transition-colors border-slate-50">
                <TableCell className="pl-6 py-4">
                  <div className="font-black text-slate-900 text-lg">{contact.name}</div>
                  <div className="text-sm text-slate-500 font-medium">{contact.email || 'Geen e-mail'}</div>
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-600">{contact.phone || 'N/A'}</div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {contact.instagram && (
                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-pink-50 text-pink-600">
                        <a href={contact.instagram} target="_blank" rel="noreferrer"><Camera className="h-4 w-4" /></a>
                      </Button>
                    )}
                    {contact.tiktok && (
                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-slate-100 text-slate-900">
                        <a href={contact.tiktok} target="_blank" rel="noreferrer"><Music className="h-4 w-4" /></a>
                      </Button>
                    )}
                    {contact.spotify && (
                      <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-lg hover:bg-green-50 text-green-600">
                        <a href={contact.spotify} target="_blank" rel="noreferrer"><Globe className="h-4 w-4" /></a>
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-[#3071d8] rounded-xl" onClick={() => {
                      setEditingContact(contact)
                      setIsEditOpen(true)
                    }}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => handleDelete(contact.id)}>
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
            <DialogTitle className="text-2xl font-black">Contact Bewerken</DialogTitle>
            <DialogDescription className="font-medium">Pas de gegevens aan voor {editingContact?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Naam</Label>
                <Input value={editingContact?.name || ''} onChange={(e) => setEditingContact({...editingContact, name: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">E-mail</Label>
                <Input value={editingContact?.email || ''} onChange={(e) => setEditingContact({...editingContact, email: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">Telefoon</Label>
                <Input value={editingContact?.phone || ''} onChange={(e) => setEditingContact({...editingContact, phone: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Spotify Link</Label>
                <Input value={editingContact?.spotify || ''} onChange={(e) => setEditingContact({...editingContact, spotify: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold text-pink-600">Instagram</Label>
                <Input value={editingContact?.instagram || ''} onChange={(e) => setEditingContact({...editingContact, instagram: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-900">TikTok</Label>
                <Input value={editingContact?.tiktok || ''} onChange={(e) => setEditingContact({...editingContact, tiktok: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-blue-600">Facebook</Label>
                <Input value={editingContact?.facebook || ''} onChange={(e) => setEditingContact({...editingContact, facebook: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="font-bold">Notities</Label>
              <Textarea value={editingContact?.notes || ''} onChange={(e) => setEditingContact({...editingContact, notes: e.target.value})} className="rounded-xl min-h-[100px]" />
            </div>
          </div>
          <Button onClick={handleUpdate} className="w-full bg-[#3071d8] text-white font-black h-12 text-lg rounded-xl shadow-lg shadow-blue-500/20">Wijzigingen Opslaan</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
