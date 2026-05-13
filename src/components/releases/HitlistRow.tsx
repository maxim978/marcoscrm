'use client'

import { TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { updateOutreachStatus, generateAIPitch } from '@/app/actions/outreach'
import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'

export function HitlistRow({ item, releaseId }: { item: any, releaseId: string }) {
  const [status, setStatus] = useState(item.outreach_status)
  const [pitch, setPitch] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [tone, setTone] = useState('enthusiastic')

  const handleStatusChange = async (newStatus: string) => {
    setStatus(newStatus)
    await updateOutreachStatus(item.id, newStatus, releaseId)
  }

  const handleGeneratePitch = async () => {
    setIsGenerating(true)
    const result = await generateAIPitch(releaseId, item.targets.id, tone)
    if (result.message) {
      setPitch(result.message)
    } else {
      setPitch('Error generating pitch: ' + result.error)
    }
    setIsGenerating(false)
  }

  return (
    <TableRow>
      <TableCell className="font-medium">{item.targets.name}</TableCell>
      <TableCell><Badge variant="outline">{item.targets.type}</Badge></TableCell>
      <TableCell>
        <Badge variant={item.targets.relationship_status === 'warm' ? 'default' : 'secondary'}>
          {item.targets.relationship_status}
        </Badge>
      </TableCell>
      <TableCell>{item.priority_score}</TableCell>
      <TableCell>
        <Select value={status} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[160px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="nog niet benaderd">Nog niet benaderd</SelectItem>
            <SelectItem value="benaderd">Benaderd</SelectItem>
            <SelectItem value="geopend/gezien">Geopend/Gezien</SelectItem>
            <SelectItem value="gereageerd">Gereageerd</SelectItem>
            <SelectItem value="geplaatst">Geplaatst</SelectItem>
            <SelectItem value="afgewezen">Afgewezen</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="text-right">
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <Sparkles className="h-3 w-3" />
              AI Pitch
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>AI Pitch for {item.targets.name}</DialogTitle>
              <DialogDescription>Generate a personalized outreach message.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="short">Short & Direct</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleGeneratePitch} disabled={isGenerating}>
                  {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Generate
                </Button>
              </div>
              <Textarea 
                className="min-h-[200px]" 
                placeholder="Your generated pitch will appear here..."
                value={pitch}
                onChange={(e) => setPitch(e.target.value)}
              />
            </div>
          </DialogContent>
        </Dialog>
      </TableCell>
    </TableRow>
  )
}
