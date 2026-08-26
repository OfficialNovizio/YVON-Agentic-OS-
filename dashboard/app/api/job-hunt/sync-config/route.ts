/**
 * /api/job-hunt/sync-config — the industry/keyword configuration behind the
 * sync engines (2026-08-25). DATA, not code: editing this from the Discover
 * page changes what both engines fetch — no script edits, no terminal.
 *
 * GET  → the map { industry: { queries: string[], enabled: boolean } },
 *        falling back to built-in defaults if the table is empty.
 * PUT  → replace the map (row-per-industry upsert).
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

const DEFAULT_QUERIES: Record<string, string[]> = {
  Aerospace: ['aerospace engineer', 'aircraft maintenance', 'aviation', 'aeronautics'],
  IT: ['software engineer', 'full stack developer', 'machine learning', 'data engineer', 'backend developer'],
  Trucking: ['truck driver', 'dispatcher', 'logistics coordinator', 'freight'],
  Drone: ['drone operator', 'UAV', 'unmanned aerial', 'robotics engineer'],
  Business: ['business analyst', 'operations manager', 'project manager', 'account manager'],
}

export type SyncConfig = Record<string, { queries: string[]; enabled: boolean }>

export async function GET() {
  try {
    const sb = getServiceClient()
    const { data, error } = await sb.from('job_hunt_sync_queries').select('industry, queries, enabled')
    if (error) return Response.json({ error: error.message }, { status: 500 })

    const rows = data ?? []
    if (rows.length === 0) {
      return Response.json({
        config: Object.fromEntries(
          Object.entries(DEFAULT_QUERIES).map(([industry, queries]) => [industry, { queries, enabled: true }]),
        ),
        fromDefaults: true,
      })
    }

    const config: SyncConfig = {}
    for (const r of rows) config[r.industry] = { queries: r.queries ?? [], enabled: r.enabled !== false }
    return Response.json({ config, fromDefaults: false })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  let body: { config?: SyncConfig }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const config = body.config
  if (!config || typeof config !== 'object') return Response.json({ error: 'config object required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const rows = Object.entries(config).map(([industry, c]) => ({
      industry,
      queries: Array.isArray(c.queries) ? c.queries : [],
      enabled: c.enabled !== false,
      updated_at: new Date().toISOString(),
    }))
    if (rows.length === 0) return Response.json({ error: 'at least one industry required' }, { status: 400 })

    const { error } = await sb.from('job_hunt_sync_queries').upsert(rows, { onConflict: 'industry' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, industries: rows.length })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
