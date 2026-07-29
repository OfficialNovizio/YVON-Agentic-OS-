// Edge-compatible Supabase client for middleware.ts.
// MUST NOT import next/headers or any Node-only module — middleware runs on
// Vercel's Edge Runtime (V8 isolate). Use NextRequest/NextResponse cookies
// (both are Edge-safe) as the transport instead of the cookies() helper.
//
// See:
//   https://supabase.com/docs/guides/auth/server-side/nextjs#middleware
//
// Owner: raj · TS-009 WI-0 (split from lib/supabase-server.ts after Vercel
// deploy rejected middleware for referencing an unsupported module).
import { createServerClient } from '@supabase/ssr'
import type { NextRequest, NextResponse } from 'next/server'

/** For middleware — pass in the request; write cookies to the response. */
export function supabaseMiddleware(request: NextRequest, response: NextResponse) {
  return createServerClient(
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
}
