/**
 * /api/job-hunt/companies/leads/stats — per-industry-guess counts of
 * not-yet-dismissed, not-yet-promoted company_leads, for the filter chip
 * badges on the leads review page.
 */

import { createClient } from '@supabase/supabase-js'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

const INDUSTRIES = ['Aerospace', 'IT', 'Trucking', 'Drone', 'Business']

export async function GET() {
  try {
    const sb = getServiceClient()
    const counts: Record<string, number> = {}

    const results = await Promise.all(
      INDUSTRIES.map((ind) =>
        sb.from('company_leads').select('*', { count: 'exact', head: true }).eq('industry_guess', ind).eq('dismissed', false).eq('promoted', false)
      )
    )
    INDUSTRIES.forEach((ind, i) => { counts[ind] = results[i].count ?? 0 })

    const { count: unclassified } = await sb
      .from('company_leads').select('*', { count: 'exact', head: true }).is('industry_guess', null).eq('dismissed', false).eq('promoted', false)
    counts.unclassified = unclassified ?? 0

    const { count: total } = await sb
      .from('company_leads').select('*', { count: 'exact', head: true }).eq('dismissed', false).eq('promoted', false)

    return Response.json({ counts, total: total ?? 0 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
