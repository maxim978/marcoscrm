'use client'

import { useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SubmitButton } from '@/components/ui/SubmitButton'

interface AddArtistFormProps {
  action: (formData: FormData) => Promise<void>
}

export function AddArtistForm({ action }: AddArtistFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  async function handleSubmit(formData: FormData) {
    await action(formData)
    formRef.current?.reset()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Artist</CardTitle>
        <CardDescription>Create a new artist profile.</CardDescription>
      </CardHeader>
      <CardContent>
        <form ref={formRef} action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Artist Name</Label>
            <Input id="name" name="name" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genre">Primary Genre</Label>
            <Input id="genre" name="genre" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Input id="country" name="country" />
          </div>
          <SubmitButton className="w-full">Save Artist</SubmitButton>
        </form>
      </CardContent>
    </Card>
  )
}
