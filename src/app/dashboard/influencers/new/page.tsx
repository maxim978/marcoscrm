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

export default async function NewInfluencerPage() {
  async function createInfluencerAction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const rawData = {
      user_id: user.id,
      name: formData.get('name'),
      platform: formData.get('platform'),
      contact_name: formData.get('contact_name'),
      email: formData.get('email'),
      country: formData.get('country'),
      followers: parseInt(formData.get('followers') as string) || 0,
      relationship_status: formData.get('relationship_status'),
      notes: formData.get('notes'),
      social_links: {
        instagram: formData.get('instagram'),
        tiktok: formData.get('tiktok'),
        facebook: formData.get('facebook'),
      }
    }

    const { error } = await supabase.from('influencers').insert([rawData])
    if (error) {
      console.error('Error creating influencer:', error)
      return
    }
    
    revalidatePath('/dashboard/influencers')
    redirect('/dashboard/influencers')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Influencer Toevoegen</h1>
        <p className="text-slate-500 font-medium">Voeg een nieuwe creator of influencer toe aan je netwerk.</p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black">Creator Details</CardTitle>
          <CardDescription className="font-medium text-slate-500">Vul de basisgegevens in voor deze influencer.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={createInfluencerAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-slate-700">Naam / Kanaal</Label>
                <Input id="name" name="name" placeholder="bijv. TikTok Naam" required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contact_name" className="font-bold text-slate-700">Contactpersoon</Label>
                <Input id="contact_name" name="contact_name" placeholder="Voornaam Achternaam" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="platform" className="font-bold text-slate-700">Hoofdplatform</Label>
                <Select name="platform" defaultValue="TikTok">
                  <SelectTrigger className="h-12 rounded-xl font-bold">
                    <SelectValue placeholder="Selecteer platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TikTok">TikTok</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="YouTube">YouTube</SelectItem>
                    <SelectItem value="Facebook">Facebook</SelectItem>
                    <SelectItem value="Overig">Overig</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="followers" className="font-bold text-slate-700">Aantal Volgers</Label>
                <Input id="followers" name="followers" type="number" min="0" defaultValue="0" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">E-mailadres</Label>
                <Input id="email" name="email" type="email" placeholder="contact@creator.com" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country" className="font-bold text-slate-700">Land</Label>
                <Input id="country" name="country" placeholder="bijv. Nederland" className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relationship_status" className="font-bold text-slate-700">Status Relatie</Label>
              <Select name="relationship_status" defaultValue="koud">
                <SelectTrigger className="h-12 rounded-xl font-bold">
                  <SelectValue placeholder="Selecteer status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="koud">Koud</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="supporter">Supporter</SelectItem>
                  <SelectItem value="prioriteit">Prioriteit</SelectItem>
                </SelectContent>
              </Select>
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
              <Textarea id="notes" name="notes" placeholder="Extra details over samenwerking..." className="min-h-[120px] rounded-xl" />
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Button asChild variant="ghost" className="h-12 px-6 font-bold rounded-xl text-slate-500 hover:bg-slate-50">
                <Link href="/dashboard/influencers">Annuleren</Link>
              </Button>
              <SubmitButton className="bg-[#3071d8] hover:bg-[#3071d8]/90 text-white shadow-lg shadow-blue-500/20 h-12 px-8 font-black rounded-xl">
                Influencer Opslaan
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
