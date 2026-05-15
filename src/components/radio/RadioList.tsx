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
import { Button } from '@/components/ui/button'
import { 
  Edit, 
  Trash2, 
  Mail, 
  Camera,
  Music,
  Radio,
  ChevronDown,
  ChevronRight
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
import { updateRadioContact, deleteRadioContact, deleteRadioStation } from '@/app/actions/radio'
import { useRouter } from 'next/navigation'

export function RadioList({ stations }: { stations: any[] }) {
  const [expandedStations, setExpandedStations] = useState<string[]>([])
  const [editingContact, setEditingContact] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const router = useRouter()

  const toggleStation = (id: string) => {
    setExpandedStations(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const handleDeleteContact = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze contactpersoon wilt verwijderen?')) return
    const res = await deleteRadioContact(id)
    if (res.success) router.refresh()
  }

  const handleDeleteStation = async (id: string) => {
    if (!confirm('Weet je zeker dat je dit radiostation en ALLE contacten wilt verwijderen?')) return
    const res = await deleteRadioStation(id)
    if (res.success) router.refresh()
  }

  const handleUpdateContact = async () => {
    if (!editingContact) return
    const res = await updateRadioContact(editingContact.id, editingContact)
    if (res.success) {
      setIsEditOpen(false)
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  const formatUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  return (
    <div className="space-y-6">
      {stations.map((station) => (
        <div key={station.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {/* Station Header */}
          <div 
            className="flex items-center justify-between p-5 bg-slate-50/50 cursor-pointer hover:bg-slate-50 transition-colors"
            onClick={() => toggleStation(station.id)}
          >
            <div className="flex items-center gap-4">
              <div className="bg-orange-500/10 p-2.5 rounded-xl text-orange-600">
                <Radio className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">{station.name}</h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  {station.radio_contacts?.length || 0} Contacten
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-9 w-9 p-0 text-slate-300 hover:text-red-500"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeleteStation(station.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {expandedStations.includes(station.id) ? (
                <ChevronDown className="h-5 w-5 text-slate-400" />
              ) : (
                <ChevronRight className="h-5 w-5 text-slate-400" />
              )}
            </div>
          </div>

          {/* Contacts List */}
          {expandedStations.includes(station.id) && (
            <div className="border-t border-slate-100">
              <Table>
                <TableHeader className="bg-white">
                  <TableRow className="hover:bg-transparent border-slate-50">
                    <TableHead className="pl-6 font-black uppercase text-[10px] tracking-widest text-slate-400 h-10">Naam</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 h-10">E-mail</TableHead>
                    <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 h-10">Socials</TableHead>
                    <TableHead className="text-right pr-6 font-black uppercase text-[10px] tracking-widest text-slate-400 h-10">Acties</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {station.radio_contacts?.map((contact: any) => (
                    <TableRow key={contact.id} className="hover:bg-slate-50/50 transition-colors border-slate-50">
                      <TableCell className="pl-6 py-4 font-black text-slate-800">{contact.name}</TableCell>
                      <TableCell className="text-sm font-medium text-slate-500">{contact.email || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {contact.instagram && (
                            <a href={formatUrl(contact.instagram)} target="_blank" rel="noreferrer" className="text-pink-600 hover:opacity-70">
                              <Camera className="h-4 w-4" />
                            </a>
                          )}
                          {contact.tiktok && (
                            <a href={formatUrl(contact.tiktok)} target="_blank" rel="noreferrer" className="text-slate-900 hover:opacity-70">
                              <Music className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-400 hover:text-orange-600 rounded-lg" onClick={() => {
                            setEditingContact(contact)
                            setIsEditOpen(true)
                          }}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 rounded-lg" onClick={() => handleDeleteContact(contact.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!station.radio_contacts || station.radio_contacts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-slate-400 font-medium italic">
                        Geen contacten voor dit station.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      ))}

      {/* Edit Contact Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-orange-600">Contact Bewerken</DialogTitle>
            <DialogDescription className="font-medium text-slate-500">
              Vul de e-mail en socials in voor {editingContact?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-5 py-4">
            <div className="grid gap-2">
              <Label className="font-bold text-slate-700">Naam</Label>
              <Input 
                value={editingContact?.name || ''} 
                onChange={(e) => setEditingContact({...editingContact, name: e.target.value})} 
                className="h-11 rounded-xl"
              />
            </div>
            <div className="grid gap-2">
              <Label className="font-bold text-slate-700">E-mail</Label>
              <Input 
                value={editingContact?.email || ''} 
                onChange={(e) => setEditingContact({...editingContact, email: e.target.value})} 
                className="h-11 rounded-xl"
                placeholder="dj@station.nl"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label className="font-bold text-pink-600">Instagram</Label>
                <Input 
                  value={editingContact?.instagram || ''} 
                  onChange={(e) => setEditingContact({...editingContact, instagram: e.target.value})} 
                  className="h-11 rounded-xl"
                />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold text-slate-900">TikTok</Label>
                <Input 
                  value={editingContact?.tiktok || ''} 
                  onChange={(e) => setEditingContact({...editingContact, tiktok: e.target.value})} 
                  className="h-11 rounded-xl"
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleUpdateContact} 
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-500/20"
          >
            Opslaan
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
