/**
 * /api/job-hunt/source-keys — per-source discovery credentials (currently
 * just Adzuna's app_id/app_key). Matches /api/ai-keys' pattern: service-role
 * only, keys never returned in plaintext.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

function maskSecret(v: string): string {
  if (!v || v.length < 8) return v ? '••••••••' : ''
  return v.slice(0, 3) + '••••••••' + v.slice(-3)
}

export async function GET() {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb.from('job_hunt_source_keys').select('source, config, enabled, updated_at')
    if (error) return Response.json({ error: error.message }, { status: 500 })

    const rows = (data ?? []).map((r) => {
      const config = (r.config ?? {}) as Record<string, unknown>
      const masked: Record<string, unknown> = { ...config }
      for (const k of Object.keys(masked)) {
        if (typeof masked[k] === 'string' && /key|secret|token/i.test(k)) masked[k] = maskSecret(masked[k] as string)
      }
      return { source: r.source, enabled: r.enabled, updated_at: r.updated_at, config: masked, configured: Object.keys(config).length > 0 }
    })
    return Response.json({ sources: rows })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: { source?: string; config?: Record<string, unknown>; enabled?: boolean }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { source, config, enabled } = body
  if (!source || !config) return Response.json({ error: 'source and config are required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { error } = await sb.from('job_hunt_source_keys').upsert({
      source, config, enabled: enabled ?? true, updated_at: new Date().toISOString(),
    }, { onConflict: 'source' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, source })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
