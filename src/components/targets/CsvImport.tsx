'use client'

import { useState } from 'react'
import Papa from 'papaparse'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Upload, Loader2 } from 'lucide-react'
import { importTargetsFromCsv } from '@/app/actions/targets'

export function CsvImport() {
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
          const res = await importTargetsFromCsv(results.data)
          if (res.error) {
            setError(res.error)
          } else {
            setIsOpen(false)
            alert(`Successfully imported ${results.data.length} targets!`)
          }
        } catch (err: any) {
          setError(err.message)
        } finally {
          setIsImporting(false)
        }
      },
      error: (error) => {
        setError('Error parsing CSV: ' + error.message)
        setIsImporting(false)
      }
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import CSV
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import Targets</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing your targets. The first row must contain exact column headers (e.g. name, type, platform, email).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-center w-full">
            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isImporting ? (
                  <Loader2 className="w-8 h-8 mb-4 text-slate-500 animate-spin" />
                ) : (
                  <Upload className="w-8 h-8 mb-4 text-slate-500" />
                )}
                <p className="mb-2 text-sm text-slate-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-slate-500">CSV files only</p>
              </div>
              <input 
                id="dropzone-file" 
                type="file" 
                accept=".csv" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isImporting}
              />
            </label>
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
