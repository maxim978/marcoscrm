'use client'

import { useState } from 'react'
import Link from 'next/link'
import { login } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
    // Redirect is handled inside the action
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-slate-900">
      <div className="absolute inset-0 overflow-hidden opacity-10 pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-600 blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-yellow-600 blur-[120px]" />
      </div>
      
      <Card className="w-full max-w-sm relative z-10 border-slate-800 bg-slate-950/50 backdrop-blur-xl text-white shadow-2xl overflow-hidden">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-6">
            <div className="bg-white p-4 rounded-xl shadow-inner">
              <img src="/images/Logo-Marco-Kraats-2024-omlijnd (1).png" alt="Marco Kraats Logo" className="h-12 w-auto" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Artist Release CRM</CardTitle>
          <CardDescription className="text-slate-400">Log in op je persoonlijke dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <form id="login-form" action={handleSubmit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email" className="text-slate-300">Email</Label>
              <Input id="email" name="email" type="email" placeholder="naam@domein.nl" required className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-600" />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password" className="text-slate-300">Wachtwoord</Label>
              </div>
              <Input id="password" name="password" type="password" required className="bg-slate-900/50 border-slate-700 text-white" />
            </div>
            
            {error && (
              <div className="bg-red-500/10 text-red-400 text-sm p-3 rounded-md border border-red-500/20">
                {error}
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button form="login-form" type="submit" className="w-full bg-[#3071d8] hover:bg-[#3071d8]/90 text-white font-bold" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Laden...
              </>
            ) : (
              'Inloggen'
            )}
          </Button>
          <div className="text-center text-sm text-slate-400">
            Nog geen account?{' '}
            <Link href="/register" className="text-[#dfb433] hover:underline font-medium">
              Registreren
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

