/**
 * POST /api/job-hunt/discover — fan out to the enabled Job Hunt sources,
 * normalize, dedupe, and upsert into job_postings.
 *
 * body: { query?: string; location?: string; sources?: string[]; limit?: number }
 * If query is omitted, it's derived from the Master Profile's first target
 * role (job_hunt_profile.target_roles.primary[0]) — "keywords come from the
 * profile" per operator instruction 2026-08-15.
 *
 * Never applies to anything — this route only discovers and stores postings
 * at status='discovered'. See app/job-hunt/discover/page.tsx for the queue
 * action that's the only thing that changes status.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { JOB_SOURCES } from '@/lib/job-hunt/sources'
import { splitBcRelevant } from '@/lib/job-hunt/bc-filter'
import type { NormalizedJob } from '@/lib/job-hunt/types'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

// Falls back to the Master Profile when the caller doesn't pass a query or
// industry — first a literal target-role title (target_roles.primary[0]),
// then the first primary-fit archetype's leading industry word (e.g.
// "Aerospace / Aviation Engineering" -> "Aerospace", matching
// INDUSTRY_TO_ADZUNA's keys) so Adzuna gets a usable category+keyword pair
// even before the operator has typed a specific job title.
// 2026-08-25: "Any industry + no keyword" = the FULL SWEEP, not a single
// profile-derived query. Fan out over every enabled industry's keyword
// queries (config table / defaults) × all sources, province-scoped, insert-
// only. This is what the operator expects "Any" to mean — everything.
async function fullSweep(
  sb: ReturnType<typeof getServiceClient>,
  opts: { province?: string; limit?: number; configBySource: Map<string, { config?: Record<string, unknown>; enabled?: boolean }>; sources?: Set<string> },
): Promise<{ fetched: number; newCount: number; sourceStatus: Record<string, { count: number; skipped: string | null; error?: string }> }> {
  const sweepSources = JOB_SOURCES.filter((s) => !opts.sources || opts.sources.has(s.id))
  const limit = opts.limit ?? 30
  const province = opts.province || 'BC'
  const location = province === 'Remote' ? 'Canada' : provinceToLocation(province)

  const { data: queryRows } = await sb.from('job_hunt_sync_queries').select('industry, queries, enabled')
  const industryQueries: Record<string, string[]> = {}
  if (queryRows && queryRows.length > 0) {
    for (const r of queryRows) if (r.enabled !== false) industryQueries[r.industry] = r.queries ?? []
  }
  if (Object.keys(industryQueries).length === 0) Object.assign(industryQueries, SWEEP_DEFAULT_QUERIES)

  const sourceStatus: Record<string, { count: number; skipped: string | null; error?: string }> = {}
  const allJobs: NormalizedJob[] = []

  for (const [industry, queries] of Object.entries(industryQueries)) {
    for (const [qi, query] of queries.entries()) {
      const results = await Promise.allSettled(
        sweepSources.map(async (s) => {
          const keyRow = opts.configBySource.get(s.id)
          if (s.needsKey && (!keyRow || keyRow.enabled === false)) return { id: s.id, jobs: [] as NormalizedJob[], skipped: 'not configured' }
          // Adzuna free tier: 1,000 calls/month — ONE call per industry here,
          // the keyword breadth comes from the free sources + the boards.
          if (s.id === 'adzuna' && qi > 0) return { id: s.id, jobs: [] as NormalizedJob[], skipped: 'adzuna capped to 1 call/industry' }
          const jobs = await s.search({
            query, location, limit,
            industry, province,
            config: keyRow?.config as Record<string, unknown> | undefined,
          })
          return { id: s.id, jobs, skipped: null as string | null }
        }),
      )
      results.forEach((r, i) => {
        const sourceId = sweepSources[i].id
        if (r.status === 'fulfilled') {
          const st = sourceStatus[sourceId] ?? { count: 0, skipped: null }
          st.count += r.value.jobs.length
          if (r.value.skipped) st.skipped = r.value.skipped
          sourceStatus[sourceId] = st
          allJobs.push(...r.value.jobs)
        } else {
          sourceStatus[sourceId] = { count: 0, skipped: null, error: String(r.reason) }
        }
      })
    }
  }

  // BC relevance filter (2026-08-25): RemoteOK/Remotive are global-remote and
  // Arbeitnow is Germany — sources that ignore the province param. Drop
  // anything that isn't remote or BC/Canada-located before it reaches the DB.
  const { kept, dropped } = splitBcRelevant(allJobs)
  if (dropped.length > 0) {
    sourceStatus['_filtered'] = { count: kept.length, skipped: `dropped ${dropped.length} non-BC (US/Germany/elsewhere on-site)` }
  }

  let newCount = 0
  if (kept.length > 0) {
    const { error, count } = await sb
      .from('job_postings')
      .upsert(
        kept.map((j) => ({
          source: j.source, external_id: j.external_id, title: j.title, company: j.company,
          location: j.location, remote: j.remote, url: j.url, description: j.description,
          salary_min: j.salary_min, salary_max: j.salary_max, salary_currency: j.salary_currency,
          posted_at: j.posted_at, raw: j.raw,
        })),
        { onConflict: 'source,external_id', ignoreDuplicates: true, count: 'exact' },
      )
    if (error) throw new Error(error.message)
    newCount = count ?? 0
  }

  return { fetched: kept.length, newCount, sourceStatus }
}

function provinceToLocation(province: string): string {
  return ({ BC: 'British Columbia', ON: 'Ontario', AB: 'Alberta', QC: 'Quebec' }[province] ?? province) as string
}

const SWEEP_DEFAULT_QUERIES: Record<string, string[]> = {
  Aerospace: ['aerospace engineer', 'aircraft maintenance', 'aviation', 'aeronautics'],
  IT: ['software engineer', 'full stack developer', 'machine learning', 'data engineer', 'backend developer'],
  Trucking: ['truck driver', 'dispatcher', 'logistics coordinator', 'freight'],
  Drone: ['drone operator', 'UAV', 'unmanned aerial', 'robotics engineer'],
  Business: ['business analyst', 'operations manager', 'project manager', 'account manager'],
}

async function deriveFromProfile(sb: ReturnType<typeof getServiceClient>): Promise<{ query: string; industry: string }> {
  const { data } = await sb.from('job_hunt_profile').select('target_roles').eq('id', 'operator').maybeSingle()
  const roles = data?.target_roles as { primary?: string[]; archetypes?: { name?: string; fit?: string }[] } | null
  const query = roles?.primary?.[0] ?? ''
  const primaryArchetype = roles?.archetypes?.find((a) => a.fit === 'primary')
  const industry = primaryArchetype?.name?.split('/')[0]?.trim() ?? ''
  return { query, industry }
}

export async function POST(request: NextRequest) {
  let body: { query?: string; location?: string; sources?: string[]; limit?: number; industry?: string; province?: string }
  try {
    body = await request.json()
  } catch {
    body = {}
  }

  try {
    const sb = getServiceClient()

    const needsFallback = !body.query?.trim() && !body.industry?.trim()

    // Load per-source credentials (only Adzuna needs one today).
    const { data: keyRows } = await sb.from('job_hunt_source_keys').select('source, config, enabled')
    const configBySource = new Map((keyRows ?? []).map((r) => [r.source, r]))

    // "Any industry + no keyword" → the full sweep (2026-08-25) — everything
    // the sync engines know how to fetch, province-scoped, insert-only.
    if (needsFallback) {
      const sweep = await fullSweep(sb, {
        province: body.province, limit: body.limit, configBySource,
        sources: requestedIds,
      })
      return Response.json({
        ok: true,
        mode: 'sweep',
        query: '', industry: null,
        fetched: sweep.fetched,
        new: sweep.newCount,
        sourceStatus: sweep.sourceStatus,
      })
    }

    const fallback = needsFallback ? await deriveFromProfile(sb) : { query: '', industry: '' }
    const query = body.query?.trim() || fallback.query
    const industry = body.industry?.trim() || fallback.industry
    const limit = body.limit ?? 25
    const requestedIds = body.sources?.length ? new Set(body.sources) : null
    const sources = JOB_SOURCES.filter((s) => !requestedIds || requestedIds.has(s.id))

    const results = await Promise.allSettled(
      sources.map(async (s) => {
        const keyRow = configBySource.get(s.id)
        if (s.needsKey && (!keyRow || keyRow.enabled === false)) return { id: s.id, jobs: [] as NormalizedJob[], skipped: 'not configured' }
        const jobs = await s.search({
          query, location: body.location, limit,
          industry, province: body.province,
          config: keyRow?.config as Record<string, unknown> | undefined,
        })
        return { id: s.id, jobs, skipped: null as string | null }
      }),
    )

    const sourceStatus: Record<string, { count: number; skipped: string | null; error?: string }> = {}
    const allJobs: NormalizedJob[] = []

    results.forEach((r, i) => {
      const sourceId = sources[i].id
      if (r.status === 'fulfilled') {
        sourceStatus[sourceId] = { count: r.value.jobs.length, skipped: r.value.skipped }
        allJobs.push(...r.value.jobs)
      } else {
        sourceStatus[sourceId] = { count: 0, skipped: null, error: String(r.reason) }
      }
    })

    // Dedupe within this batch by (source, external_id) before upsert.
    const seen = new Set<string>()
    const deduped = allJobs.filter((j) => {
      const key = `${j.source}:${j.external_id}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    // BC relevance filter — same rule as the sweep (2026-08-25).
    const { kept: bcKept, dropped: bcDropped } = splitBcRelevant(deduped)
    if (bcDropped.length > 0) {
      sourceStatus['_filtered'] = { count: bcKept.length, skipped: `dropped ${bcDropped.length} non-BC` }
    }

    let upserted = 0
    if (bcKept.length > 0) {
      const { error, count } = await sb
        .from('job_postings')
        .upsert(
          bcKept.map((j) => ({
            source: j.source,
            external_id: j.external_id,
            title: j.title,
            company: j.company,
            location: j.location,
            remote: j.remote,
            url: j.url,
            description: j.description,
            salary_min: j.salary_min,
            salary_max: j.salary_max,
            salary_currency: j.salary_currency,
            posted_at: j.posted_at,
            raw: j.raw,
            updated_at: new Date().toISOString(),
          })),
          { onConflict: 'source,external_id', ignoreDuplicates: false, count: 'exact' },
        )
      if (error) return Response.json({ error: error.message, sourceStatus }, { status: 500 })
      upserted = count ?? deduped.length
    }

    return Response.json({ ok: true, query, industry, upserted, totalFound: deduped.length, sourceStatus })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
