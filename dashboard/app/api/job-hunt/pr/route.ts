/**
 * GET /api/job-hunt/pr — PR Intelligence (2026-08-25).
 * Returns: the latest fetched IRCC/BC-PNP rules (with source + fetched_at),
 * and PR-aware posting stats (how many postings are BC-PNP in-demand or
 * Canadian-experience flagged, top PR-value postings with fit scores).
 * Informational only — rules carry their fetched dates; never legal advice.
 */

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  try {
    const sb = getServiceClient()

    const [{ data: rules, error: rulesErr }, { data: pnpRows, error: pnpErr }, { data: expRows, error: expErr }] = await Promise.all([
      sb.from('ircc_rules').select('topic, title, body, source_url, fetched_at').order('fetched_at', { ascending: false }),
      sb.from('job_postings').select('id, title, company, location, url, posted_at, fit_score').eq('bc_pnp_indemand', true).order('discovered_at', { ascending: false }).limit(40),
      sb.from('job_postings').select('id, title, company, location, url, posted_at, fit_score').eq('canadian_exp', true).order('discovered_at', { ascending: false }).limit(20),
    ])
    if (rulesErr) return Response.json({ error: rulesErr.message }, { status: 500 })
    if (pnpErr) return Response.json({ error: pnpErr.message }, { status: 500 })
    if (expErr) return Response.json({ error: expErr.message }, { status: 500 })

    // All rows (ordered by fetched_at desc) — the page groups: Recent =
    // latest per topic, Past = earlier versions, Upcoming = planned changes.
    return Response.json({
      rules: rules ?? [],
      stats: {
        bcPnpInDemand: pnpRows?.length ?? 0,
        canadianExp: expRows?.length ?? 0,
      },
      topPrPostings: [...(pnpRows ?? []), ...(expRows ?? [])]
        .filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i)
        .slice(0, 20),
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
