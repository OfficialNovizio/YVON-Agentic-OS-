// GET /api/repo/file?venture=<slug>&path=<relative/path>
// Server-side proxy to the VPS's GET /v1/repo/file — same rationale as
// tree/route.ts's header comment.
import { supabaseServer } from '@/lib/supabase-server'
import { hermesConfig } from '@/lib/hermes-client'
import { errMsg } from '@/lib/errors'

export const runtime = 'nodejs'

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const venture = searchParams.get('venture')?.trim()
  const path = searchParams.get('path')?.trim()
  if (!venture || !path) {
    return Response.json({ error: 'missing venture or path' }, { status: 400 })
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
    const url = `${cfg.url}/v1/repo/file?venture_slug=${encodeURIComponent(venture)}&path=${encodeURIComponent(path)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(15_000),
    })
    const body = await res.json().catch(() => ({}))
    return Response.json(body, { status: res.status })
  } catch (err) {
    return Response.json({ error: errMsg(err) }, { status: 502 })
  }
}
