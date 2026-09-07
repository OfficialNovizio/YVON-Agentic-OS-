// GET /api/vps/status — proxies the VPS's /v1/vps/status (yvon-hermes-http
// main.py, added 2026-09-04 for this tab). Server-side bearer token only —
// HERMES_TOKEN never reaches the browser.
//
// No mock fallback here on purpose: the VPS tab is a telemetry surface, and
// showing stale/invented stats on it would be worse than showing an error.
// The page renders the error state with a retry button instead.

import { hermesConfig } from '@/lib/hermes-client'

export async function GET(): Promise<Response> {
  const cfg = hermesConfig()
  if (!cfg.configured || !cfg.url || !cfg.token) {
    return Response.json({ error: cfg.reason ?? 'hermes not configured' }, { status: 500 })
  }
  try {
    const res = await fetch(`${cfg.url}/v1/vps/status`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(45_000),
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return Response.json({ error: `hermes ${res.status}: ${body.slice(0, 200)}` }, { status: 502 })
    }
    return Response.json(await res.json())
  } catch (err) {
    return Response.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    )
  }
}
