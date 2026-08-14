// Client-side session gate — replaces the Edge middleware (2026-08-12, round 6).
//
// WHY: Vercel's platform-side edge bundler injects `__dirname` into the
// middleware function, crashing their V8 Edge runtime with
// MIDDLEWARE_INVOCATION_FAILED. The local `next build` produces a middleware
// bundle with ZERO __dirname references (verified in .next/server/middleware.js),
// so this is a platform bug, not our code — rounds 1–5 (DefinePlugin, drop
// standalone, ua-parser-js alias incl. internal path, drop @supabase/ssr)
// all confirmed it. Fix: NO edge middleware. This client component enforces
// the same session gate in the browser.
//
// Redirects to /login (preserving ?next) when not authenticated. /login and
// /auth/* are exempt. Real data security remains server-side (API routes
// already auth independently); this gate restores the route-level UX gate.
//
// 2026-08-12 follow-up fix (login loop): the original version hand-parsed
// document.cookie for an exact `sb-<ref>-auth-token` cookie. @supabase/ssr
// chunks that cookie into `sb-<ref>-auth-token.0`, `.1`, ... whenever the
// encoded session exceeds 3180 bytes — true for basically any real session
// (JWT + refresh token + user metadata). The regex never matched a chunked
// cookie, so this always concluded "not logged in" and bounced back to
// /login in an infinite loop, even with a fully valid session (proven by
// /api/ventures returning 200 in the same request cycle — server-side code
// reassembles chunks correctly via @supabase/ssr's own logic). Fix: don't
// reimplement cookie/chunk parsing in the browser — ask a tiny server route
// (/api/auth/session) that reuses the same supabaseServer() helper every
// other API route already uses correctly.
//
// Owner: raj · TS-009 WI-0
'use client'

import { useEffect, useState } from 'react'

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    const { pathname, search } = window.location

    // Public/auth surfaces don't need a session.
    if (pathname === '/login' || pathname.startsWith('/auth/')) {
      setOk(true)
      return
    }

    let cancelled = false

    fetch('/api/auth/session')
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then(({ authenticated }: { authenticated: boolean }) => {
        if (cancelled) return
        if (authenticated) {
          setOk(true)
          return
        }
        const next = pathname !== '/' ? encodeURIComponent(pathname + search) : ''
        window.location.replace(next ? `/login?next=${next}` : '/login')
      })
      .catch(() => {
        // Network hiccup — fail open on the redirect (don't lock the user
        // out over a flaky request) but don't render protected content
        // either; the effect will re-run on next navigation.
        if (!cancelled) setOk(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  // Blank until the check resolves (prevents flashing protected content).
  if (ok === null) return null
  if (!ok) return null // redirect in flight
  return <>{children}</>
}
