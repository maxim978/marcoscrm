import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function NewTargetPage() {
  async function createTargetAction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const rawData = {
      user_id: user.id,
      name: formData.get('name'),
      type: formData.get('type'),
      platform: formData.get('platform'),
      contact_name: formData.get('contact_name'),
      email: formData.get('email'),
      country: formData.get('country'),
      followers: parseInt(formData.get('followers') as string) || 0,
      relationship_status: formData.get('relationship_status'),
      notes: formData.get('notes'),
    }

    await supabase.from('targets').insert([rawData])
    revalidatePath('/dashboard/targets')
    redirect('/dashboard/targets')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Add Target</h3>
        <p className="text-slate-500 text-sm">Add a new promotional contact to your database.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contact Details</CardTitle>
          <CardDescription>Fill out the basic information for this target.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createTargetAction} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Target Name (e.g. Playlist Name, Blog)</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name">Contact Person (optional)</Label>
                <Input id="contact_name" name="contact_name" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select name="type" defaultValue="playlist">
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="playlist">Playlist</SelectItem>
                    <SelectItem value="curator">Curator</SelectItem>
                    <SelectItem value="radio">Radio</SelectItem>
                    <SelectItem value="social">Social Creator</SelectItem>
                    <SelectItem value="blog">Blog</SelectItem>
                    <SelectItem value="dj">DJ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Input id="platform" name="platform" placeholder="Spotify, TikTok, etc." />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input id="country" name="country" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="relationship_status">Relationship Status</Label>
                <Select name="relationship_status" defaultValue="koud">
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="koud">Koud</SelectItem>
                    <SelectItem value="warm">Warm</SelectItem>
                    <SelectItem value="supporter">Supporter</SelectItem>
                    <SelectItem value="prioriteit">Prioriteit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="followers">Followers</Label>
                <Input id="followers" name="followers" type="number" min="0" defaultValue="0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" name="notes" placeholder="Additional details..." />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/targets">Cancel</Link>
              </Button>
              <SubmitButton>Save Target</SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

