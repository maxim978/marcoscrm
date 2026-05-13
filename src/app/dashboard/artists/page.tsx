import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export default async function ArtistsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: artists } = await supabase.from('artists').select('*').eq('user_id', user.id)

  async function createArtist(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return

    const rawData = {
      user_id: user.id,
      name: formData.get('name'),
      genre: formData.get('genre'),
      country: formData.get('country'),
    }

    await supabase.from('artists').insert([rawData])
    revalidatePath('/dashboard/artists')
    redirect('/dashboard/artists')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h3 className="text-2xl font-bold tracking-tight">Artists</h3>
        <p className="text-slate-500 text-sm">Manage the artists you promote.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Add Artist</CardTitle>
              <CardDescription>Create a new artist profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={createArtist} className="space-y-4">
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
                <Button type="submit" className="w-full">Save Artist</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-4">
          {artists && artists.length > 0 ? (
            artists.map(artist => (
              <Card key={artist.id}>
                <CardHeader>
                  <CardTitle>{artist.name}</CardTitle>
                  <CardDescription>{artist.genre} • {artist.country}</CardDescription>
                </CardHeader>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-slate-500">
                No artists found. Add your first artist to start creating releases.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
