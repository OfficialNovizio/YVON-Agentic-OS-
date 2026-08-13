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
// It reads the Supabase session cookie (`sb-<ref>-auth-token`, a JWT), checks
// expiry, and redirects to /login (preserving ?next) when invalid. /login and
// /auth/* are exempt. Real data security remains server-side (API routes
// already auth independently); this gate restores the route-level UX gate.
//
// Owner: raj · TS-009 WI-0
'use client'

import { useEffect, useState } from 'react'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const PROJECT_REF = SUPABASE_URL.match(/^https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? ''
const AUTH_COOKIE = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : 'sb-auth-token'

function hasValidSession(): boolean {
  const match = document.cookie.match(new RegExp(`(?:^|; )${AUTH_COOKIE}=([^;]+)`))
  const token = match?.[1]
  if (!token) return false
  try {
    const payloadJson = atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
    const payload = JSON.parse(payloadJson)
    return typeof payload.exp === 'number' && payload.exp * 1000 > Date.now()
  } catch {
    return false
  }
}

export default function SessionGate({ children }: { children: React.ReactNode }) {
  const [ok, setOk] = useState<boolean | null>(null)

  useEffect(() => {
    const { pathname, search } = window.location

    // Public/auth surfaces don't need a session.
    if (pathname === '/login' || pathname.startsWith('/auth/')) {
      setOk(true)
      return
    }

    if (hasValidSession()) {
      setOk(true)
      return
    }

    // Not logged in → /login, preserving intent.
    const next = pathname !== '/' ? encodeURIComponent(pathname + search) : ''
    window.location.replace(next ? `/login?next=${next}` : '/login')
  }, [])

  // Blank until the check resolves (prevents flashing protected content).
  if (ok === null) return null
  if (!ok) return null // redirect in flight
  return <>{children}</>
}
