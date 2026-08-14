import { supabaseServer } from '@/lib/supabase-server'

// GET /api/auth/session — 2026-08-12, fixes the login loop introduced by
// round 6's SessionGate (session-gate.tsx).
//
// Bug: SessionGate hand-parsed document.cookie looking for an exact
// `sb-<ref>-auth-token` cookie. @supabase/ssr chunks that cookie into
// `sb-<ref>-auth-token.0`, `.1`, ... whenever the encoded session value
// exceeds 3180 bytes (node_modules/@supabase/ssr/dist/module/utils/
// chunker.js) — true for basically any real logged-in session (JWT +
// refresh token + user metadata). The hand-rolled regex never matched a
// chunked cookie, so SessionGate always concluded "not logged in" and
// bounced back to /login — even with a fully valid session (proven by
// every /api/ventures call in the same request cycle returning 200, since
// server-side code correctly reassembles chunks via @supabase/ssr's own
// combineChunks()).
//
// Fix: don't reimplement Supabase's cookie/chunk handling in the browser.
// Delegate to this route, which reuses the same supabaseServer() helper
// every other API route already uses correctly.
export async function GET(): Promise<Response> {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return Response.json({ authenticated: !!user })
}
