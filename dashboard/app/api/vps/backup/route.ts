// POST /api/vps/backup — triggers the manual vault backup on the VPS
// (/v1/vps/backup in main.py: same tar the Monday cron runs, timestamped
// filename so it never collides with the cron's own file). Server-side
// bearer token only.

import { hermesConfig } from '@/lib/hermes-client'

export async function POST(): Promise<Response> {
  const cfg = hermesConfig()
  if (!cfg.configured || !cfg.url || !cfg.token) {
    return Response.json({ error: cfg.reason ?? 'hermes not configured' }, { status: 500 })
  }
  try {
    const res = await fetch(`${cfg.url}/v1/vps/backup`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}` },
      signal: AbortSignal.timeout(330_000), // VPS-side tar timeout is 300s
    })
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string }
    return Response.json(body, { status: res.ok ? 200 : res.status })
  } catch (err) {
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : String(err) },
      { status: 502 },
    )
  }
}
