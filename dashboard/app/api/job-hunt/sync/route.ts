/**
 * POST /api/job-hunt/sync — the full hiring sweep, driven from the UI.
 *
 * 2026-08-25: the pipeline used to live in the terminal (SSH + cron +
 * python). This route is the dashboard-native engine: it fans out over ALL
 * five industries × multiple keyword queries per industry × every enabled
 * TS source (Adzuna, RemoteOK, Remotive, Arbeitnow, freehire, Greenhouse),
 * and upserts incrementally — insert-only, so re-running a sync only adds
 * NEW postings, never duplicates (same UNIQUE(source, external_id) the
 * fetchers rely on).
 *
 * Adzuna free tier caps at 1,000 calls/month — this route gives Adzuna ONE
 * deep call (limit 50) per industry per sync (5/day quick, 15/day at 3x
 * syncs = 450/month, safely inside the tier). The free sources get the
 * multi-query breadth. Indeed + LinkedIn run on the VPS via python-jobspy
 * (fetch-hiring-boards.py, 3x daily) and land in the same table — this UI
 * shows their postings alongside, no terminal needed for anything.
 *
 * body: { mode?: 'quick' | 'full' }  — quick = 1 query/industry for Adzuna,
 * full = all queries for free sources (default quick).
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

// Fallback when the config table is empty — the seeded defaults live in
// migration 132 and are editable from the Discover page.
const DEFAULT_QUERIES: Record<string, string[]> = {
  Aerospace: ['aerospace engineer', 'aircraft maintenance', 'aviation', 'aeronautics'],
  IT: ['software engineer', 'full stack developer', 'machine learning', 'data engineer', 'backend developer'],
  Trucking: ['truck driver', 'dispatcher', 'logistics coordinator', 'freight'],
  Drone: ['drone operator', 'UAV', 'unmanned aerial', 'robotics engineer'],
  Business: ['business analyst', 'operations manager', 'project manager', 'account manager'],
}

const ADZUNA_LIMIT = 50   // Adzuna's max results_per_page
const FREE_LIMIT = 30

export async function POST(request: NextRequest) {
  let body: { mode?: 'quick' | 'full'; sources?: string[] }
  try { body = await request.json() } catch { body = {} }
  const full = body.mode === 'full'
  // The page passes its enabled-source set (Adzuna + RemoteOK + Remotive by
  // default — the German board and freehire are off unless toggled on).
  const requestedIds = body.sources?.length ? new Set(body.sources) : null

  try {
    const sb = getServiceClient()
    const [{ data: keyRows }, { data: queryRows }] = await Promise.all([
      sb.from('job_hunt_source_keys').select('source, config, enabled'),
      sb.from('job_hunt_sync_queries').select('industry, queries, enabled'),
    ])
    const configBySource = new Map((keyRows ?? []).map((r) => [r.source, r]))

    // Industry/keyword config is DATA (migration 132), editable in Discover —
    // the table wins, built-in defaults only when the table is empty.
    const industryQueries: Record<string, string[]> = {}
    if (queryRows && queryRows.length > 0) {
      for (const r of queryRows) {
        if (r.enabled !== false) industryQueries[r.industry] = r.queries ?? []
      }
    } else {
      Object.assign(industryQueries, DEFAULT_QUERIES)
    }
    if (Object.keys(industryQueries).length === 0) Object.assign(industryQueries, DEFAULT_QUERIES)
    const activeSources = JOB_SOURCES.filter((s) => !requestedIds || requestedIds.has(s.id))

    const startedAt = new Date().toISOString()
    const perIndustry: Record<string, { queryCount: number; found: number; newCount: number }> = {}
    const sourceStatus: Record<string, { count: number; skipped: string | null; error?: string }> = {}
    const allJobs: NormalizedJob[] = []

    for (const [industry, queries] of Object.entries(industryQueries)) {
      // Adzuna: ONE call per industry (free-tier budget) — use its own
      // category+keyword mapping (INDUSTRY_TO_ADZUNA) via the first query.
      const adzunaQueries = full ? queries : queries.slice(0, 1)
      perIndustry[industry] = { queryCount: adzunaQueries.length, found: 0, newCount: 0 }

      for (const query of adzunaQueries) {
        const results = await Promise.allSettled(
          activeSources.map(async (s) => {
            const keyRow = configBySource.get(s.id)
            if (s.needsKey && (!keyRow || keyRow.enabled === false)) return { id: s.id, jobs: [] as NormalizedJob[], skipped: 'not configured' }
            const limit = s.id === 'adzuna' ? ADZUNA_LIMIT : FREE_LIMIT
            const jobs = await s.search({
              query, location: 'British Columbia', limit,
              industry, province: 'BC',
              config: keyRow?.config as Record<string, unknown> | undefined,
            })
            return { id: s.id, jobs, skipped: null as string | null }
          }),
        )

        results.forEach((r, i) => {
          const sourceId = activeSources[i].id
          if (r.status === 'fulfilled') {
            const st = sourceStatus[sourceId] ?? { count: 0, skipped: null }
            st.count += r.value.jobs.length
            if (r.value.skipped) st.skipped = r.value.skipped
            sourceStatus[sourceId] = st
            allJobs.push(...r.value.jobs)
            perIndustry[industry].found += r.value.jobs.length
          } else {
            sourceStatus[sourceId] = { count: 0, skipped: null, error: String(r.reason) }
          }
        })
      }
    }

    // BC relevance filter (2026-08-25) — same rule as the discover sweep.
    const { kept, dropped } = splitBcRelevant(allJobs)
    if (dropped.length > 0) {
      sourceStatus['_filtered'] = { count: kept.length, skipped: `dropped ${dropped.length} non-BC (US/Germany/elsewhere on-site)` }
    }

    // Insert-only upsert — existing rows untouched, count = truly new.
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
      if (error) return Response.json({ error: error.message, sourceStatus }, { status: 500 })
      newCount = count ?? 0
    }

    const finishedAt = new Date().toISOString()
    return Response.json({
      ok: true,
      mode: full ? 'full' : 'quick',
      startedAt, finishedAt,
      industries: Object.keys(industryQueries).length,
      fetched: allJobs.length,
      new: newCount,
      perIndustry,
      sourceStatus,
    })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
