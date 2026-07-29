// Auth middleware — gates /chat and /settings behind a Supabase session.
//
// Runs on Vercel's Edge Runtime (V8 isolate, not Node).
// The Supabase client is created INLINE here, not imported from lib/, because
// Vercel's Edge bundler couldn't resolve @/lib/supabase-middleware — mirroring
// Supabase's official Next 15 middleware pattern.
//
// Owner: raj · TS-009 WI-0
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes that require a signed-in session.
const PROTECTED = ['/chat', '/settings']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Refresh the session cookie on every request (kept fresh even on public pages).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const needsAuth = PROTECTED.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (needsAuth && !user) {
    const url = new URL('/login', request.url)
    url.searchParams.set('next', pathname)
    return NextResponse.redirect(url)
  }

  // Already signed in and hitting /login — send to /chat.
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/chat', request.url))
  }

  return response
}

export const config = {
  matcher: [
    // Run on everything except static assets, images, favicon, and the callback route
    // (callback needs to see the code param before we intervene).
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|auth/callback).*)',
  ],
}
