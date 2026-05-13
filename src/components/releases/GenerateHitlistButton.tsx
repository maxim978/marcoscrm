'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Play, Loader2 } from 'lucide-react'
import { generateHitlist } from '@/app/actions/hitlist'

interface GenerateHitlistButtonProps {
  releaseId: string
  hasHitlist: boolean
}

export function GenerateHitlistButton({ releaseId, hasHitlist }: GenerateHitlistButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  async function handleGenerate() {
    setIsLoading(true)
    try {
      await generateHitlist(releaseId)
    } catch (error) {
      console.error('Failed to generate hitlist:', error)
      alert('Er is iets misgegaan bij het genereren van de hitlijst.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleGenerate} 
      variant="secondary" 
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Genereren...
        </>
      ) : (
        <>
          <Play className="mr-2 h-4 w-4" />
          {hasHitlist ? 'Regenerate Hitlist' : 'Maak Hitlist'}
        </>
      )}
    </Button>
  )
}
