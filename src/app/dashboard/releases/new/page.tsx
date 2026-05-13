import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

export default async function NewReleasePage() {
  const supabase = await createClient()
  
  // Need artists to associate with release
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: artists } = await supabase.from('artists').select('*').eq('user_id', user.id)

  async function createRelease(formData: FormData) {
    'use server'
    const supabase = await createClient()

    const rawData = {
      artist_id: formData.get('artist_id'),
      title: formData.get('title'),
      release_date: formData.get('release_date'),
      genre: formData.get('genre'),
      mood: formData.get('mood'),
      status: formData.get('status'),
    }

    await supabase.from('releases').insert([rawData])
    revalidatePath('/dashboard/releases')
    redirect('/dashboard/releases')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">New Release</h3>
        <p className="text-slate-500 text-sm">Add a new track or album to promote.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Release Details</CardTitle>
          <CardDescription>Enter the basic information of the release.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={createRelease} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Release Title</Label>
              <Input id="title" name="title" required placeholder="Track Name" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="artist_id">Artist</Label>
                <Select name="artist_id" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select artist" />
                  </SelectTrigger>
                  <SelectContent>
                    {artists && artists.length > 0 ? (
                      artists.map(artist => (
                        <SelectItem key={artist.id} value={artist.id}>{artist.name}</SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No artists found (add one first)</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="release_date">Release Date</Label>
                <Input id="release_date" name="release_date" type="date" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="genre">Genre</Label>
                <Input id="genre" name="genre" placeholder="e.g. House, Pop" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mood">Mood</Label>
                <Input id="mood" name="mood" placeholder="e.g. Energetic, Chill" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue="gepland">
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gepland">Gepland</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="afgerond">Afgerond</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard/releases">Cancel</Link>
              </Button>
              <Button type="submit">Create Release</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
