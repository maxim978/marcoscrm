'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Loader2, FileText } from 'lucide-react'
import { importRadioData } from '@/app/actions/radio'
import { Textarea } from '@/components/ui/textarea'

export function RadioImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleImport = async () => {
    if (!text.trim()) return

    setIsImporting(true)
    setError(null)

    try {
      const res = await importRadioData(text)
      if (res.error) {
        setError(res.error)
      } else {
        setIsOpen(false)
        setText('')
        alert('Radio data succesvol geïmporteerd!')
      }
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 font-bold border-slate-200">
          <FileText className="mr-2 h-4 w-4 text-orange-500" />
          Importeer Radio Lijst
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">Radio Stations Importeren</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Plak hier de lijst met radiostations en DJ's in het formaat: **1. Station Naam**, gevolgd door de namen van de DJ's.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Textarea 
            placeholder="1. Radio 538&#10;Bekende DJ's / shows:&#10;Frank Dane&#10;Wietze de Jager&#10;...&#10;2. Qmusic&#10;..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[300px] rounded-xl font-mono text-sm p-4 bg-slate-50 border-slate-200"
            disabled={isImporting}
          />
          
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}

          <Button 
            onClick={handleImport} 
            disabled={isImporting || !text.trim()} 
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black h-12 rounded-xl shadow-lg shadow-orange-500/20"
          >
            {isImporting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Upload className="h-5 w-5 mr-2" />}
            Start Import
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
