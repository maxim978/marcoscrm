import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  // Unauthenticated: stuur naar login
  const protectedPrefixes = ['/dashboard', '/salesmachine', '/admin', '/releases', '/targets']
  if (!user && protectedPrefixes.some((p) => path.startsWith(p))) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Ingelogd op auth pagina's: stuur naar product selector
  if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Controleer product-toegang voor ingelogde gebruikers
  if (user && (path.startsWith('/dashboard') || path.startsWith('/salesmachine'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('products, is_admin')
      .eq('id', user.id)
      .single()

    const products = (profile?.products ?? {}) as { salesmachine?: boolean; marcos_crm?: boolean }
    const isAdmin = profile?.is_admin === true

    // Admins hebben altijd toegang
    if (!isAdmin) {
      if (path.startsWith('/dashboard') && !products.marcos_crm) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
      if (path.startsWith('/salesmachine') && !products.salesmachine) {
        const url = request.nextUrl.clone()
        url.pathname = '/'
        return NextResponse.redirect(url)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
