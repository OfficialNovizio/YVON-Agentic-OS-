// Browser-side Supabase client for auth flows (magic link, sign out).
// Uses @supabase/ssr so the session cookie stays in sync with the server client.
// Owner: raj · TS-009 WI-0
'use client'

import { createBrowserClient } from '@supabase/ssr'

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
