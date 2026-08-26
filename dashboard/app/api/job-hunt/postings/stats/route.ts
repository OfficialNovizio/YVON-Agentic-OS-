/**
 * GET /api/job-hunt/postings/stats — what's actually in the DB (2026-08-25).
 * Per-source counts (adzuna / remoteok / remotive / indeed / linkedin) and
 * per-status counts, so the Discover page can show the real picture instead
 * of just the visible slice — e.g. whether the boards fetcher has landed
 * Indeed/LinkedIn rows yet.
 */

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

function tally<T extends string>(rows: { [k: string]: unknown }[], key: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const r of rows) {
    const v = String(r[key] ?? 'unknown')
    out[v] = (out[v] ?? 0) + 1
  }
  return out
}

export async function GET() {
  try {
    const sb = getServiceClient()
    const [{ data: sourceRows, error: srcErr }, { data: statusRows, error: stErr }, { count }] = await Promise.all([
      sb.from('job_postings').select('source').not('status', 'eq', 'archived'),
      sb.from('job_postings').select('status'),
      sb.from('job_postings').select('*', { count: 'exact', head: true }),
    ])
    if (srcErr) return Response.json({ error: srcErr.message }, { status: 500 })
    if (stErr) return Response.json({ error: stErr.message }, { status: 500 })

    return Response.json({
      total: count ?? 0,
      bySource: tally(sourceRows ?? [], 'source'),
      byStatus: tally(statusRows ?? [], 'status'),
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
