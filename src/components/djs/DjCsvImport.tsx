'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Loader2 } from 'lucide-react'
import { importDjsFromCsv } from '@/app/actions/djs'

export function DjCsvImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    setError(null)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const res = await importDjsFromCsv(results.data)
          if (res.error) {
            setError(res.error)
          } else {
            setIsOpen(false)
            alert(`Succesvol ${results.data.length} DJ's geïmporteerd!`)
          }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsImporting(false)
        }
      },
      error: (error) => {
        setError('Fout bij het verwerken van CSV: ' + error.message)
        setIsImporting(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="h-11 font-bold border-slate-200">
          <Upload className="mr-2 h-4 w-4" />
          Importeer CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black">DJ's Importeren</DialogTitle>
          <DialogDescription className="font-medium text-slate-500">
            Upload een CSV-bestand met kolommen: **name, email, website, phone**.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dj-csv-upload" className="flex flex-col items-center justify-center w-full h-40 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                {isImporting ? (
                  <Loader2 className="w-10 h-10 mb-4 text-[#3071d8] animate-spin" />
                ) : (
                  <Upload className="w-10 h-10 mb-4 text-slate-400" />
                )}
                <p className="mb-2 text-sm text-slate-600 font-bold">
                  {isImporting ? 'Bezig met importeren...' : 'Klik om te uploaden of sleep hierheen'}
                </p>
                <p className="text-xs text-slate-400">Alleen CSV bestanden</p>
              </div>
              <input 
                id="dj-csv-upload" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isImporting}
              />
            </label>
          </div>
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-medium border border-red-100">
              {error}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
