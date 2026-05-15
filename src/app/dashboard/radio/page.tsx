import { createClient } from '@/lib/supabase/server'
import { RadioList } from '@/components/radio/RadioList'
import { RadioImport } from '@/components/radio/RadioImport'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'
import { deleteAllRadioData } from '@/app/actions/radio'
import { revalidatePath } from 'next/cache'

export default async function RadioPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: stations } = await supabase
    .from('radio_stations')
    .select('*, radio_contacts(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  async function clearAction() {
    'use server'
    await deleteAllRadioData()
    revalidatePath('/dashboard/radio')
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Radiostations</h1>
          <p className="text-slate-500 font-medium">Beheer radiostations en hun bekende DJ's / shows.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <form action={clearAction}>
            <Button variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 font-bold h-11 px-4 rounded-xl">
              <Trash2 className="h-4 w-4 mr-2" /> Lijst Leegmaken
            </Button>
          </form>
          <RadioImport />
        </div>
      </div>

      <RadioList stations={stations || []} />
    </div>
  )
}
