/**
 * /api/job-hunt/sectors — Sector Explorer v2 (2026-08-25).
 * GET  → catalog sectors + LIVE posting counts (keyword-matched against
 *        recent job_postings) + the current selection + Explorer ids +
 *        RECOMMENDED sectors (scored on demand, live pay, PR/BC-PNP value,
 *        and a keyword match against the operator's Job Hunt profile).
 * POST { selected: string[] } → saves the selection by writing
 *        job_hunt_sync_queries (the single source of truth): selected
 *        sectors become enabled industries with their keywords; unselected
 *        ones are disabled. Discover, the sync engines, resume variants, and
 *        PR tagging all follow.
 */

// Flatten the profile's relevant JSONB sections into lowercase text for
// keyword matching. Never reads compensation/location/identity — only what
// describes what the operator can do (skills, fit keywords, experience
// titles). Roles/narrative were removed from the profile form (2026-08-25):
// job preference now flows from the selected sectors, not target roles.
function profileTextOf(p: unknown): string {
  const parts: string[] = []
  const push = (v: unknown) => {
    if (typeof v === 'string') { if (v.trim().length > 2) parts.push(v.toLowerCase()); return }
    if (Array.isArray(v)) { v.forEach(push); return }
    if (v && typeof v === 'object') { Object.values(v as Record<string, unknown>).forEach(push) }
  }
  const anyP = p as Record<string, any> | undefined
  push(anyP?.behavioral?.fit_keywords)
  push(anyP?.skills)
  push((anyP?.experience ?? []).map((e: Record<string, unknown>) => [e?.title, e?.company]))
  return parts.join(' ')
}

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET() {
  try {
    const sb = getServiceClient()
    const [{ data: catalog, error: catErr }, { data: postings }, { data: syncRows }, { data: explorerRows }, { data: profile }] = await Promise.all([
      sb.from('job_hunt_sector_catalog').select('*').order('name'),
      sb.from('job_postings').select('title, description, salary_min, salary_max, teer_category, bc_pnp_indemand').order('discovered_at', { ascending: false }).limit(800),
      sb.from('job_hunt_sync_queries').select('industry, enabled'),
      sb.from('job_hunt_explorer').select('sector_id').order('created_at', { ascending: true }),
      sb.from('job_hunt_profile').select('target_roles, narrative, skills, behavioral, experience').eq('id', 'operator').maybeSingle(),
    ])
    if (catErr) return Response.json({ error: catErr.message }, { status: 500 })

    // Live demand + pay per sector: keyword-match recent postings. Custom
    // sectors have NO curated demand/pay/PR — those fields are DERIVED live
    // from the postings themselves (BC-PNP flags + TEER categories + counts),
    // never invented; the UI labels them "≈ live" via liveDerived.
    const sectors = (catalog ?? []).map((s) => {
      const kws = (s.keywords as string[]).map((k) => k.toLowerCase())
      let count = 0
      let min: number | null = null
      let max: number | null = null
      let bcPnp = 0
      const teerTally = new Map<string, number>()
      for (const p of postings ?? []) {
        const text = `${p.title ?? ''} ${p.description ?? ''}`.toLowerCase()
        if (kws.some((k) => text.includes(k))) {
          count += 1
          if (p.salary_min) min = min === null ? p.salary_min : Math.min(min, p.salary_min)
          if (p.salary_max) max = max === null ? p.salary_max : Math.max(max, p.salary_max)
          if (p.bc_pnp_indemand === true) bcPnp += 1
          if (p.teer_category) teerTally.set(p.teer_category, (teerTally.get(p.teer_category) ?? 0) + 1)
        }
      }
      const demand = s.demand ?? (count >= 25 ? 'high' : count >= 8 ? 'medium' : 'low')
      const prValue = s.pr_value ?? (bcPnp >= 10 ? 'excellent' : bcPnp >= 3 ? 'good' : null)
      const teer = s.teer ?? [...teerTally.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
      const liveDerived = demand !== s.demand || prValue !== s.pr_value || teer !== s.teer
      return {
        id: s.id, name: s.name, description: s.description, keywords: s.keywords,
        demand, typical_pay: s.typical_pay, pr_value: prValue, teer,
        custom: s.custom === true,
        liveDerived,
        livePostings: count,
        livePay: min !== null || max !== null ? `$${Math.round((min ?? 0) / 1000)}K–$${Math.round((max ?? 0) / 1000)}K` : null,
        payAvg: min !== null && max !== null ? (min + max) / 2 : null,
      }
    })

    // Only catalog-matched industries count as selected — legacy seed
    // industries like 'IT'/'Trucking' with no catalog sector are ignored,
    // otherwise phantom ids leak into the client's selection.
    const selected = (syncRows ?? [])
      .filter((r) => r.enabled !== false)
      .map((r) => (catalog ?? []).find((c) => c.name === r.industry)?.id)
      .filter((id): id is string => Boolean(id))

    const explorer = (explorerRows ?? []).map((r) => r.sector_id)

    // ── Recommendations: demand + live pay + PR/BC-PNP value + profile match ──
    const profileText = profile ? profileTextOf(profile) : ''
    const profileSeeded = profileText.split(/\s+/).filter(Boolean).length >= 5
    const recommended = sectors
      .map((s) => {
        const reasons: string[] = []
        let score = 0
        if (s.demand) {
          score += s.demand === 'high' ? 3 : s.demand === 'medium' ? 2 : 1
          reasons.push(`${s.demand} demand`)
        }
        if (s.payAvg !== null) {
          const w = s.payAvg >= 120000 ? 3 : s.payAvg >= 85000 ? 2 : 1
          score += w
          reasons.push(`${w === 3 ? 'top pay' : w === 2 ? 'strong pay' : 'fair pay'} ${s.livePay ?? ''}`.trim())
        }
        if (s.pr_value) {
          score += s.pr_value === 'excellent' ? 3 : s.pr_value === 'good' ? 2 : 1
          reasons.push(`PR ${s.pr_value}`)
        }
        if (profileSeeded) {
          const hits = (s.keywords as string[]).filter((k) => profileText.includes(k))
          if (hits.length > 0) { score += 2; reasons.push('matches your profile') }
        }
        return { id: s.id, name: s.name, score, reasons }
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    return Response.json({ sectors, selected, explorer, recommended, profileSeeded })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: { selected?: string[] }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }
  const selected = body.selected ?? []
  if (!Array.isArray(selected)) return Response.json({ error: 'selected must be an array' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data: catalog } = await sb.from('job_hunt_sector_catalog').select('id, name, keywords')

    // Selected catalog sectors → enabled sync industries.
    const chosen = (catalog ?? []).filter((c) => selected.includes(c.id))
    const chosenNames = new Set(chosen.map((c) => c.name))
    const rows = chosen.map((c) => ({
      industry: c.name,
      queries: c.keywords,
      enabled: true,
      updated_at: new Date().toISOString(),
    }))

    // Existing sync industries not in the selection get disabled (not
    // deleted). The queries column is NOT NULL, and upsert replaces the whole
    // row — so the existing queries must be carried over, never dropped.
    const { data: existing } = await sb.from('job_hunt_sync_queries').select('industry, queries')
    const disableRows = (existing ?? [])
      .filter((r) => !chosenNames.has(r.industry))
      .map((r) => ({ industry: r.industry, queries: r.queries ?? [], enabled: false, updated_at: new Date().toISOString() }))

    const upserts = [...rows, ...disableRows]
    if (upserts.length > 0) {
      const { error } = await sb.from('job_hunt_sync_queries').upsert(upserts, { onConflict: 'industry' })
      if (error) return Response.json({ error: error.message }, { status: 500 })
    }

    return Response.json({ ok: true, enabled: chosen.length, disabled: disableRows.length })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
