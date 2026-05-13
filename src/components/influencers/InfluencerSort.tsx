'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function InfluencerSort({ currentSort }: { currentSort: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    router.push(`/dashboard/influencers?${params.toString()}`)
  }

  return (
    <Select defaultValue={currentSort} onValueChange={handleSortChange}>
      <SelectTrigger className="w-full h-11 bg-white border-slate-200 font-bold">
        <SelectValue placeholder="Kies sortering" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="newest">Nieuwste eerst</SelectItem>
        <SelectItem value="alphabetical">Alfabet (A-Z)</SelectItem>
        <SelectItem value="followers">Meeste Volgers</SelectItem>
      </SelectContent>
    </Select>
  )
}
