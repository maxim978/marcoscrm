'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Loader2, Check } from 'lucide-react'
import { bulkAutoSearchLinks } from '@/app/actions/bulk-search'

export function BulkSearchButton() {
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  async function handleBulkSearch() {
    if (!confirm('Dit gaat voor alle targets zonder links een AI-zoekopdracht doen. Dit kan even duren. Doorgaan?')) return
    
    setLoading(true)
    try {
      const result = await bulkAutoSearchLinks()
      if (result.success) {
        setDone(true)
        setTimeout(() => setDone(false), 3000)
      } else {
        alert('Fout: ' + result.error)
      }
    } catch (e) {
      console.error(e)
      alert('Er is een onverwachte fout opgetreden.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      onClick={handleBulkSearch} 
      disabled={loading} 
      variant="outline" 
      className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100 gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : done ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Sparkles className="h-4 w-4" />
      )}
      {loading ? 'Zoeken...' : done ? 'Klaar!' : 'Vul ontbrekende links (AI)'}
    </Button>
  )
}
