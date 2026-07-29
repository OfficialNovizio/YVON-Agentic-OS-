// Server-side Supabase client for RSC / route handlers ONLY.
// Uses next/headers cookies() — NOT Edge-compatible.
// Do NOT import this from middleware.ts — use lib/supabase-middleware.ts there.
// Owner: raj · TS-009 WI-0
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

/** For RSC + route handlers (uses next/headers cookies). */
export async function supabaseServer() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Called from a Server Component (read-only cookies) — safe to ignore.
          }
        },
      },
    }
  )
}
