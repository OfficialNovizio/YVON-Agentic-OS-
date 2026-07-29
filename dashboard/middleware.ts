// Auth middleware — gates the ENTIRE dashboard behind a Supabase session.
// Anyone hitting any route without a session is redirected to /login with
// ?next= preserving where they were headed.
//
// Runs on Vercel's Edge Runtime (V8 isolate, not Node).
// The Supabase client is created INLINE here, not imported from lib/, because
// Vercel's Edge bundler couldn't resolve @/lib/supabase-middleware — mirroring
// Supabase's official Next 15 middleware pattern.
//
// Owner: raj · TS-009 WI-0
import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

// Routes reachable WITHOUT a session. Everything else needs auth.
// The matcher (bottom of this file) already excludes _next/*, static files,
// favicon, and /auth/callback — those don't need to be listed here.
const PUBLIC_ROUTES = ['/login']

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

  // Refresh the session cookie on every request (kept fresh on all pages).
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isPublic = PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Not signed in and not on a public route → send to /login, preserving intent.
  if (!user && !isPublic) {
    const url = new URL('/login', request.url)
    if (pathname !== '/') url.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // Already signed in and hitting /login — send to the dashboard home.
  if (user && pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
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
