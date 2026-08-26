// GET /api/repo/tree?venture=<slug>
// Server-side proxy to the VPS's GET /v1/repo/tree — keeps the Hermes
// bearer token out of the browser entirely, same pattern as every other
// dashboard→wrapper call (stream/route.ts, venture-graphify.ts).
//
// Part of the "give me a URL to view repo files" feature (2026-08-21) —
// backs app/repo/[slug]/page.tsx's file tree.
import { supabaseServer } from '@/lib/supabase-server'
import { hermesConfig } from '@/lib/hermes-client'
import { errMsg } from '@/lib/errors'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const venture = searchParams.get('venture')?.trim()
  if (!venture) {
    return Response.json({ error: 'missing venture' }, { status: 400 })
  }

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  const cfg = hermesConfig()
  if (!cfg.configured || !cfg.url || !cfg.token) {
    return Response.json({ error: cfg.reason ?? 'Hermes not configured' }, { status: 502 })
  }

  try {
    const res = await fetch(`${cfg.url}/v1/repo/tree?venture_slug=${encodeURIComponent(venture)}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(15_000),
    })
    const body = await res.json().catch(() => ({}))
    return Response.json(body, { status: res.status })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 502 })
  }
}
