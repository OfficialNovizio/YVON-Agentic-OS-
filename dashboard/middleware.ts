// Auth middleware — gates the ENTIRE dashboard behind a Supabase session.
// Anyone hitting any route without a session is redirected to /login with
// ?next= preserving where they were headed.
//
// Edge Runtime (V8 isolate, not Node). ROUND 4 (2026-08-12): this file no
// longer imports @supabase/ssr. Its createServerClient is a known source of
// __dirname references that survive into Vercel's deployed Edge bundle and
// crash with "MIDDLEWARE_INVOCATION_FAILED / ReferenceError: __dirname is
// not defined" (supabase/supabase#21009) — the same class of platform-only
// bundling gap as ua-parser-js (see next.config.ts). Session validation now
// uses jose (edge-safe, already a dependency): the Supabase auth cookie
// (`sb-<ref>-auth-token`, a JWT) is verified directly.
//
// Session refresh still works: lib/supabase-browser.ts (createBrowserClient)
// keeps the cookie fresh client-side; this middleware only validates it.
//
// Owner: raj · TS-009 WI-0
import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify, decodeJwt } from 'jose'

// Routes reachable WITHOUT a session. Everything else needs auth.
// The matcher (bottom of this file) already excludes _next/*, static files,
// favicon, and /auth/callback — those don't need to be listed here.
const PUBLIC_ROUTES = ['/login']

// Supabase project ref, derived from the public anon URL — used to build the
// auth cookie name. (e.g. sb-cjjllgexiecesgwenpph-auth-token)
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const PROJECT_REF = SUPABASE_URL.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? ''
const AUTH_COOKIE = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : 'sb-auth-token'

// JWT signing secret. Set this in Vercel env (Production) + .env.local:
// Supabase → Project Settings → API → JWT Secret.
// When set, the cookie is signature-verified (full security).
// When unset, we degrade to structural decode + expiry check (weaker — a
// forged cookie would pass). The gate is intended to be SIGNATURE-VERIFIED;
// set the secret.
const JWT_SECRET = process.env.SUPABASE_JWT_SECRET ?? ''

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({ request })
  const { pathname } = request.nextUrl

  const isPublic = PUBLIC_ROUTES.some((p) => pathname === p || pathname.startsWith(p + '/'))

  // Validate the session cookie JWT without @supabase/ssr.
  let sessionValid = false
  const token = request.cookies.get(AUTH_COOKIE)?.value
  if (token) {
    try {
      if (JWT_SECRET) {
        await jwtVerify(token, new TextEncoder().encode(JWT_SECRET))
      } else {
        const payload = decodeJwt(token)
        sessionValid = typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
      }
      if (JWT_SECRET) sessionValid = true
    } catch {
      // Invalid signature / expired / malformed — treat as not logged in.
      sessionValid = false
    }
  }

  // Not signed in and not on a public route → send to /login, preserving intent.
  if (!sessionValid && !isPublic) {
    const url = new URL('/login', request.url)
    if (pathname !== '/') url.searchParams.set('next', pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // Already signed in and hitting /login — send to the dashboard home.
  if (sessionValid && pathname === '/login') {
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
