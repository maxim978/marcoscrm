import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'
import { SubmitButton } from '@/components/ui/SubmitButton'

export default async function NewContactPage() {
  async function createContactAction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const rawData = {
      user_id: user.id,
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      instagram: formData.get('instagram'),
      facebook: formData.get('facebook'),
      tiktok: formData.get('tiktok'),
      spotify: formData.get('spotify'),
      notes: formData.get('notes'),
    }

    const { error } = await supabase.from('contacts').insert([rawData])
    if (error) {
      console.error('Error creating contact:', error)
      return
    }
    
    revalidatePath('/dashboard/contacts')
    redirect('/dashboard/contacts')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Contact Toevoegen</h1>
        <p className="text-slate-500 font-medium">Voeg een nieuw algemeen contact toe aan je CRM.</p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black">Contact Details</CardTitle>
          <CardDescription className="font-medium text-slate-500">Vul de basisgegevens in voor dit contact.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={createContactAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-slate-700">Naam</Label>
                <Input id="name" name="name" placeholder="Volledige naam" required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">E-mailadres</Label>
                <Input id="email" name="email" type="email" placeholder="mail@voorbeeld.nl" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-slate-700">Telefoonnummer</Label>
                <Input id="phone" name="phone" placeholder="+31 6 ..." className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spotify" className="font-bold text-slate-700">Spotify Link</Label>
                <Input id="spotify" name="spotify" placeholder="https://open.spotify.com/..." className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="font-bold text-slate-700">Instagram URL</Label>
                  <Input id="instagram" name="instagram" placeholder="https://instagram.com/..." className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="font-bold text-slate-700">TikTok URL</Label>
                  <Input id="tiktok" name="tiktok" placeholder="https://tiktok.com/@..." className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="font-bold text-slate-700">Facebook URL</Label>
                  <Input id="facebook" name="facebook" placeholder="https://facebook.com/..." className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-bold text-slate-700">Notities</Label>
              <Textarea id="notes" name="notes" placeholder="Extra informatie over dit contact..." className="min-h-[120px] rounded-xl" />
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Button asChild variant="ghost" className="h-12 px-6 font-bold rounded-xl text-slate-500 hover:bg-slate-50">
                <Link href="/dashboard/contacts">Annuleren</Link>
              </Button>
              <SubmitButton className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white shadow-lg shadow-blue-500/20 h-12 px-8 font-black rounded-xl">
                Contact Opslaan
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
