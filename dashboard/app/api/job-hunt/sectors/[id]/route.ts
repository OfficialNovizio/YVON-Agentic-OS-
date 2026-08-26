/**
 * GET /api/job-hunt/sectors/[id] — one sector + its live postings (2026-08-25).
 * Postings are matched by the sector's keywords against title/description
 * (recent first, capped), with fit + PR values when computed.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const sb = getServiceClient()
    const { data: sector, error: secErr } = await sb.from('job_hunt_sector_catalog').select('*').eq('id', id).maybeSingle()
    if (secErr) return Response.json({ error: secErr.message }, { status: 500 })
    if (!sector) return Response.json({ error: 'sector not found' }, { status: 404 })

    const keywords = (sector.keywords as string[]).map((k) => k.toLowerCase())
    const { data: postings } = await sb
      .from('job_postings')
      .select('id, title, company, description, location, url, source, salary_min, salary_max, posted_at, fit_score, teer_category, canadian_exp, bc_pnp_indemand')
      .order('discovered_at', { ascending: false })
      .limit(800)

    const matched = (postings ?? []).filter((p) => {
      const text = `${p.title ?? ''} ${p.company ?? ''} ${p.description ?? ''}`.toLowerCase()
      return keywords.some((k) => text.includes(k))
    }).slice(0, 60)

    return Response.json({ sector, postings: matched })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
