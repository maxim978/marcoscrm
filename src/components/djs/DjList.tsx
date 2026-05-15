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
  Music,
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
import { updateDj, deleteDj } from '@/app/actions/djs'

export function DjList({ initialDjs }: { initialDjs: any[] }) {
  const [djs, setDjs] = useState(initialDjs)
  const [editingDj, setEditingDj] = useState<any>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)

  useEffect(() => {
    setDjs(initialDjs)
  }, [initialDjs])

  const formatUrl = (url: string) => {
    if (!url) return ''
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    return `https://${url}`
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze DJ wilt verwijderen?')) return
    const res = await deleteDj(id)
    if (res.success) {
      setDjs(djs.filter(d => d.id !== id))
    } else {
      alert(res.error)
    }
  }

  const handleUpdate = async () => {
    if (!editingDj) return
    const res = await updateDj(editingDj.id, editingDj)
    if (res.success) {
      setDjs(djs.map(d => d.id === editingDj.id ? editingDj : d))
      setIsEditOpen(false)
    } else {
      alert(res.error)
    }
  }

  return (
    <div className="space-y-4">
      {/* Mobile View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
        {djs.map((dj) => (
          <div key={dj.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600/10 p-3 rounded-xl text-indigo-600">
                  <Music className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-lg leading-tight">{dj.name}</h3>
                  <Badge variant="secondary" className="mt-1 bg-slate-100 text-slate-600 border-none font-bold">
                    DJ
                  </Badge>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-400 hover:text-indigo-600" onClick={() => {
                  setEditingDj(dj)
                  setIsEditOpen(true)
                }}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0 text-slate-300 hover:text-red-500" onClick={() => handleDelete(dj.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                <Mail className="h-4 w-4 text-slate-400" /> {dj.email || 'Geen e-mail'}
              </div>
              {dj.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <Phone className="h-4 w-4 text-slate-400" /> {dj.phone}
                </div>
              )}
              {dj.website && (
                <div className="flex items-center gap-2 text-sm text-indigo-600 font-bold">
                  <Globe className="h-4 w-4" /> 
                  <a href={formatUrl(dj.website)} target="_blank" rel="noreferrer" className="hover:underline">Website</a>
                </div>
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
              <TableHead className="pl-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">DJ Naam & E-mail</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Website</TableHead>
              <TableHead className="font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Telefoon</TableHead>
              <TableHead className="text-right pr-6 font-black uppercase text-[11px] tracking-widest text-slate-400 h-14">Acties</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {djs.map((dj) => (
              <TableRow key={dj.id} className="hover:bg-indigo-50/30 transition-colors border-slate-50">
                <TableCell className="pl-6 py-4">
                  <div className="font-black text-slate-900 text-lg">{dj.name}</div>
                  <div className="text-sm text-slate-500 font-medium">{dj.email || 'Geen e-mail'}</div>
                </TableCell>
                <TableCell>
                  {dj.website ? (
                    <a href={formatUrl(dj.website)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-indigo-600 font-bold hover:underline">
                      <ExternalLink className="h-3.5 w-3.5" /> Site
                    </a>
                  ) : (
                    <span className="text-slate-300 font-bold">N/A</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="font-bold text-slate-700">{dj.phone || 'N/A'}</div>
                </TableCell>
                <TableCell className="text-right pr-6">
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-400 hover:text-indigo-600 rounded-xl" onClick={() => {
                      setEditingDj(dj)
                      setIsEditOpen(true)
                    }}>
                      <Edit className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-slate-300 hover:text-red-500 rounded-xl" onClick={() => handleDelete(dj.id)}>
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
        <DialogContent className="sm:max-w-[500px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">DJ Bewerken</DialogTitle>
            <DialogDescription className="font-medium">Pas de gegevens aan voor {editingDj?.name}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label className="font-bold">DJ Naam</Label>
                <Input value={editingDj?.name || ''} onChange={(e) => setEditingDj({...editingDj, name: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">E-mail</Label>
                <Input value={editingDj?.email || ''} onChange={(e) => setEditingDj({...editingDj, email: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Website</Label>
                <Input value={editingDj?.website || ''} onChange={(e) => setEditingDj({...editingDj, website: e.target.value})} className="h-11 rounded-xl" />
              </div>
              <div className="grid gap-2">
                <Label className="font-bold">Telefoon</Label>
                <Input value={editingDj?.phone || ''} onChange={(e) => setEditingDj({...editingDj, phone: e.target.value})} className="h-11 rounded-xl" />
              </div>
            </div>
          </div>
          <Button onClick={handleUpdate} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black h-12 text-lg rounded-xl shadow-lg shadow-indigo-500/20">Wijzigingen Opslaan</Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
