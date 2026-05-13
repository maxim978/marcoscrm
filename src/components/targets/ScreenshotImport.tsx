'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Loader2, UploadCloud, CheckCircle2, Scan, AlertTriangle } from 'lucide-react'
import { analyzePlaylistScreenshot } from '@/app/actions/vision'
import { importTargetFromScreenshot, checkTargetDuplicate, updateTargetFollowers } from '@/app/actions/targets'
import { useRouter } from 'next/navigation'

type DuplicatePrompt = {
  newName: string
  existingName: string
  resolve: (val: boolean) => void
}

export function ScreenshotImport() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0, success: 0, skipped: 0 })
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicatePrompt | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsAnalyzing(true)
    setBatchProgress({ current: 1, total: files.length, success: 0, skipped: 0 })
    let successCount = 0
    let skippedCount = 0

    try {
      for (let i = 0; i < files.length; i++) {
        setBatchProgress(prev => ({ ...prev, current: i + 1 }))
        const file = files[i]
        
        try {
          const base64String = await new Promise<string>((resolve) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          })

          const result = await analyzePlaylistScreenshot(base64String)
          
          if (result.error) {
            console.error("Screenshot AI Error:", result.error)
            alert(`Fout bij analyseren foto ${i + 1}: ${result.error}`)
            continue
          }

          if (result.data) {
            const pName = result.data.playlistName || 'Unknown Playlist'
            const pCurator = result.data.curatorName || ''
            const pFollowers = result.data.followers || 0

            // Duplicate Check
            const dupCheck = await checkTargetDuplicate(pName)

            if (dupCheck.status === 'exact' && dupCheck.id) {
              if (pFollowers > (dupCheck.currentFollowers || 0)) {
                await updateTargetFollowers(dupCheck.id, pFollowers)
              }
              skippedCount++
              setBatchProgress(prev => ({ ...prev, skipped: skippedCount }))
              continue
            }

            if (dupCheck.status === 'fuzzy' && dupCheck.id && dupCheck.existingName) {
              const isSame = await new Promise<boolean>((resolve) => {
                setDuplicatePrompt({
                  newName: pName,
                  existingName: dupCheck.existingName!,
                  resolve: (val: boolean) => {
                    setDuplicatePrompt(null)
                    resolve(val)
                  }
                })
              })

              if (isSame) {
                if (pFollowers > (dupCheck.currentFollowers || 0)) {
                  await updateTargetFollowers(dupCheck.id, pFollowers)
                }
                skippedCount++
                setBatchProgress(prev => ({ ...prev, skipped: skippedCount }))
                continue
              }
            }

            // New Target
            const saveResult = await importTargetFromScreenshot(pName, pCurator, pFollowers)
            if (saveResult.error) {
               console.error("Database Error:", saveResult.error)
               alert(`Kon afspeellijst niet opslaan: ${saveResult.error}`)
            } else {
              successCount++
              setBatchProgress(prev => ({ ...prev, success: successCount }))
            }

            // Add a small delay to prevent OpenAI Rate Limits (TPM)
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        } catch (fileErr: any) {
          console.error("Error processing file", i, fileErr)
          alert(`Onverwachte fout bij foto ${i + 1}: ${fileErr.message || 'Onbekend'}`)
        }
      }
    } catch (fatalErr: any) {
      console.error("Fatal error in batch upload", fatalErr)
      alert("Er is een fatale fout opgetreden: " + (fatalErr.message || 'Onbekend'))
    } finally {
      setIsAnalyzing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsOpen(false)
        setBatchProgress({ current: 0, total: 0, success: 0, skipped: 0 })
        router.refresh()
      }, 3000)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open && isAnalyzing) return // Prevent closing while analyzing
        setIsOpen(open)
      }}>
        <DialogTrigger asChild>
          <Button variant="outline">
            <Scan className="mr-2 h-4 w-4 text-blue-500" />
            AI Screenshot Import
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Screenshot Import</DialogTitle>
            <DialogDescription>
              Upload screenshots of Spotify playlists. The AI will extract the name, curator, and followers.
              Duplicates are detected automatically.
            </DialogDescription>
          </DialogHeader>

          {/* Prompt Dialog blocks the UI visually */}
          {duplicatePrompt ? (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 my-4 animate-in fade-in zoom-in duration-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-6 w-6 text-amber-500 mt-1" />
                <div className="space-y-3 flex-1">
                  <h4 className="font-semibold text-amber-900">Mogelijke Dubbele Playlist</h4>
                  <p className="text-sm text-amber-800">
                    De AI vond de naam <strong>&quot;{duplicatePrompt.newName}&quot;</strong>, maar je hebt al een lijst genaamd <strong>&quot;{duplicatePrompt.existingName}&quot;</strong> in je database.
                  </p>
                  <p className="text-sm font-medium text-amber-900">Is dit dezelfde afspeellijst?</p>
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="w-full" onClick={() => duplicatePrompt.resolve(true)}>
                      Ja (Overslaan & Update)
                    </Button>
                    <Button className="w-full" onClick={() => duplicatePrompt.resolve(false)}>
                      Nee (Maak Nieuwe)
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-slate-200 border-dashed rounded-lg p-8 mt-4 hover:bg-slate-100 transition-colors">
              <Label className="flex flex-col items-center justify-center cursor-pointer space-y-4">
                <div className="flex items-center gap-2 text-lg text-slate-700 font-medium">
                  {isAnalyzing ? (
                    <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  ) : (batchProgress.success > 0 || batchProgress.skipped > 0) && !isAnalyzing ? (
                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                  ) : (
                    <UploadCloud className="h-8 w-8 text-blue-500" />
                  )}
                </div>
                
                <div className="text-center font-medium">
                  {isAnalyzing && batchProgress.total > 0 
                    ? `Analyzing ${batchProgress.current} of ${batchProgress.total} screenshots...` 
                    : (batchProgress.success > 0 || batchProgress.skipped > 0) && !isAnalyzing
                      ? `Done! ${batchProgress.success} added, ${batchProgress.skipped} skipped.`
                      : 'Click or drag screenshots here'}
                </div>
                
                <span className="text-sm text-slate-400 text-center max-w-xs">
                  Supports bulk upload. Exact matches are skipped automatically.
                </span>
                
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*" 
                  multiple
                  className="hidden" 
                  onChange={handleImageUpload}
                  disabled={isAnalyzing}
                />
              </Label>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
