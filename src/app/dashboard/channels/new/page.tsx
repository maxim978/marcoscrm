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

export default async function NewChannelPage() {
  async function createChannelAction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const rawData = {
      user_id: user.id,
      name: formData.get('name'),
      instagram: formData.get('instagram'),
      facebook: formData.get('facebook'),
      tiktok: formData.get('tiktok'),
      youtube: formData.get('youtube'),
      website: formData.get('website'),
      contact_name: formData.get('contact_name'),
      contact_email: formData.get('contact_email'),
      contact_phone: formData.get('contact_phone'),
      notes: formData.get('notes'),
    }

    const { error } = await supabase.from('channels').insert([rawData])
    if (error) {
      console.error('Error creating channel:', error)
      return
    }
    
    revalidatePath('/dashboard/channels')
    redirect('/dashboard/channels')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Groot Kanaal Toevoegen</h1>
        <p className="text-slate-500 font-medium">Voeg een nieuw groot kanaal of media outlet toe.</p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black">Kanaal Details</CardTitle>
          <CardDescription className="font-medium text-slate-500">Vul de gegevens in voor dit kanaal.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={createChannelAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-slate-700">Kanaal Naam</Label>
                <Input id="name" name="name" placeholder="bijv. Dumpert, Radio 538" required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website" className="font-bold text-slate-700">Website URL</Label>
                <Input id="website" name="website" placeholder="https://www.kanaal.nl" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest mb-4">Contactpersoon</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="contact_name" className="font-bold text-slate-700">Naam</Label>
                  <Input id="contact_name" name="contact_name" placeholder="Voornaam Achternaam" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_email" className="font-bold text-slate-700">E-mail</Label>
                  <Input id="contact_email" name="contact_email" type="email" placeholder="mail@kanaal.nl" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact_phone" className="font-bold text-slate-700">Telefoon</Label>
                  <Input id="contact_phone" name="contact_phone" placeholder="+31 6 ..." className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-4 border-t border-slate-100 pt-6">
              <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Social Media Links</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="instagram" className="font-bold text-slate-700">Instagram URL</Label>
                  <Input id="instagram" name="instagram" placeholder="https://instagram.com/..." className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tiktok" className="font-bold text-slate-700">TikTok URL</Label>
                  <Input id="tiktok" name="tiktok" placeholder="https://tiktok.com/@..." className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="youtube" className="font-bold text-slate-700">YouTube URL</Label>
                  <Input id="youtube" name="youtube" placeholder="https://youtube.com/..." className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook" className="font-bold text-slate-700">Facebook URL</Label>
                  <Input id="facebook" name="facebook" placeholder="https://facebook.com/..." className="h-12 rounded-xl" />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-bold text-slate-700">Notities</Label>
              <Textarea id="notes" name="notes" placeholder="Extra informatie over dit kanaal..." className="min-h-[120px] rounded-xl" />
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Button asChild variant="ghost" className="h-12 px-6 font-bold rounded-xl text-slate-500 hover:bg-slate-50">
                <Link href="/dashboard/channels">Annuleren</Link>
              </Button>
              <SubmitButton className="bg-[#dfb433] hover:bg-[#dfb433]/90 text-slate-900 shadow-lg shadow-yellow-500/20 h-12 px-8 font-black rounded-xl">
                Kanaal Opslaan
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
