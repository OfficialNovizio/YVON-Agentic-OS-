// Auth middleware — gates /chat and /settings behind a Supabase session.
// Everything else (agents, office, foundry, dashboard, brand pages) stays open
// for now; auth on the rest of the app will land in a follow-up TASK-SPEC.
// Owner: raj · TS-009 WI-0
import { NextResponse, type NextRequest } from 'next/server'
// EDGE RUNTIME — do NOT import from '@/lib/supabase-server' (uses next/headers).
import { supabaseMiddleware } from '@/lib/supabase-middleware'

// Routes that require a signed-in session.
const PROTECTED = ['/chat', '/settings']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  // Refresh the session cookie on every request (kept fresh even on public pages).
  const supabase = supabaseMiddleware(request, response)
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
