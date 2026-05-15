'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Trash2, Loader2 } from 'lucide-react'
import { deleteAllDjs } from '@/app/actions/djs'
import { useRouter } from 'next/navigation'

export function DeleteAllDjsButton() {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    if (!confirm('Weet je zeker dat je ALLE DJ\'s wilt verwijderen? Dit kan niet ongedaan worden gemaakt.')) return
    
    setIsDeleting(true)
    const res = await deleteAllDjs()
    setIsDeleting(false)
    
    if (res.success) {
      router.refresh()
    } else {
      alert(res.error)
    }
  }

  return (
    <Button 
      variant="ghost" 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold h-11 px-4 rounded-xl"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
      Lijst Leegmaken
    </Button>
  )
}
