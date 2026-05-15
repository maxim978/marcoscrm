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

export default async function NewDjPage() {
  async function createDjAction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const rawData = {
      user_id: user.id,
      name: formData.get('name'),
      email: formData.get('email'),
      website: formData.get('website'),
      phone: formData.get('phone'),
    }

    const { error } = await supabase.from('djs').insert([rawData])
    if (error) {
      console.error('Error creating dj:', error)
      return
    }
    
    revalidatePath('/dashboard/djs')
    redirect('/dashboard/djs')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">DJ Toevoegen</h1>
        <p className="text-slate-500 font-medium">Voeg een nieuwe DJ of los e-mailadres toe.</p>
      </div>

      <Card className="border-none shadow-xl shadow-slate-200/50 rounded-2xl overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <CardTitle className="text-xl font-black text-indigo-600">DJ Details</CardTitle>
          <CardDescription className="font-medium text-slate-500">Vul de basisgegevens in voor deze DJ.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form action={createDjAction} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold text-slate-700">Naam / Alias</Label>
                <Input id="name" name="name" placeholder="bijv. DJ Marco" required className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="font-bold text-slate-700">E-mailadres</Label>
                <Input id="email" name="email" type="email" placeholder="dj@voorbeeld.nl" required className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="website" className="font-bold text-slate-700">Website</Label>
                <Input id="website" name="website" placeholder="https://www.dj-alias.nl" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="font-bold text-slate-700">Telefoonnummer</Label>
                <Input id="phone" name="phone" placeholder="+31 6 ..." className="h-12 rounded-xl" />
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t border-slate-100">
              <Button asChild variant="ghost" className="h-12 px-6 font-bold rounded-xl text-slate-500 hover:bg-slate-50">
                <Link href="/dashboard/djs">Annuleren</Link>
              </Button>
              <SubmitButton className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 h-12 px-8 font-black rounded-xl">
                DJ Opslaan
              </SubmitButton>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100">
        <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest mb-2">Tip</h4>
        <p className="text-amber-800 text-sm font-medium leading-relaxed">
          Wil je veel DJ's tegelijk toevoegen? Gebruik dan de **Importeer CSV** knop op het overzichtsscherm. 
          Zorg dat je bestand kolommen heeft voor: **name, email, website, phone**.
        </p>
      </div>
    </div>
  )
}
