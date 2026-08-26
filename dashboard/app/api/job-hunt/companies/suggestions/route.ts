/**
 * /api/job-hunt/companies/suggestions — real employer names pulled out of
 * job_postings (which only ever come from the legitimate job-search APIs
 * wired up in Discover: Adzuna, RemoteOK, Remotive, Arbeitnow, Greenhouse,
 * freehire.dev — never scraped). Surfaces companies you've actually seen
 * post a real job, that aren't already on the target_companies watchlist,
 * so you can one-click promote them. No industry is inferred here — Discover
 * doesn't tag postings with an industry, so the caller picks one when
 * confirming the add (same as any manual company add).
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

    const [{ data: postings, error: postingsErr }, { data: companies, error: companiesErr }] = await Promise.all([
      sb.from('job_postings').select('company, location, url').order('discovered_at', { ascending: false }).limit(500),
      sb.from('target_companies').select('name'),
    ])
    if (postingsErr) return Response.json({ error: postingsErr.message }, { status: 500 })
    if (companiesErr) return Response.json({ error: companiesErr.message }, { status: 500 })

    const existing = new Set((companies ?? []).map((c) => c.name.trim().toLowerCase()))

    const byCompany = new Map<string, { name: string; locations: Set<string>; postingCount: number; sampleUrl: string | null }>()
    for (const p of postings ?? []) {
      const name = (p.company ?? '').trim()
      if (!name || existing.has(name.toLowerCase())) continue
      const key = name.toLowerCase()
      const entry = byCompany.get(key) ?? { name, locations: new Set<string>(), postingCount: 0, sampleUrl: p.url ?? null }
      entry.postingCount += 1
      if (p.location) entry.locations.add(p.location)
      byCompany.set(key, entry)
    }

    const suggestions = [...byCompany.values()]
      .map((s) => ({ name: s.name, locations: [...s.locations], postingCount: s.postingCount, sampleUrl: s.sampleUrl }))
      .sort((a, b) => b.postingCount - a.postingCount)

    return Response.json({ suggestions })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
