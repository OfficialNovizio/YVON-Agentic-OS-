/**
 * /api/job-hunt/companies — target company watchlist/browser. Adapted from
 * the operator's own YVON-OS app/api/jobs/companies/route.ts (2026-08-15),
 * same logic ported to this project's service-role client pattern.
 *
 * 2026-08-25 v3 (Discover merge): the "hiring now" side now carries the
 * features Discover had — per-company top postings with location, source,
 * TEER / BC-PNP / Canadian-exp flags, a PR-compatibility score (heuristic
 * from the stored flags), a pay range; a source (platform) filter; and
 * pagination (offset/limit + total) so thousands of postings don't render
 * at once.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { PROVINCE_BY_CODE } from '@/lib/job-hunt/canada-geo'
import { isBcRelevant } from '@/lib/job-hunt/bc-filter'
import { scorePosting, type FitProfile } from '@/lib/job-hunt/fit-score'
import { inferPrTags, prValue } from '@/lib/job-hunt/pr-tags'
import boardSnapshot from '@/data/boards-snapshot.json'

// Snapshot rows are fetched on the operator's side (web search of the
// boards' syndication network) and committed here so boards data shows on
// screen without the VPS leg. Skipped when the URL already exists in the DB.
interface SnapshotRow {
  source?: string
  title: string
  company: string
  location?: string | null
  url?: string | null
  salary_min?: number | null
  salary_max?: number | null
  salary_currency?: string | null
  posted_at?: string | null
  description?: string | null
}

// PostgREST caps every request at 1000 rows — chunked fetch to see the WHOLE
// table (sorting by fit needs every posting, not a 1000-row sample).
async function fetchAllPostings(sb: SupabaseClient, cols: string, cap = 8000): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = []
  for (let offset = 0; offset < cap; offset += 1000) {
    const { data } = await sb
      .from('job_postings')
      .select(cols)
      .order('discovered_at', { ascending: false })
      .range(offset, offset + 999)
    if (!data || data.length === 0) break
    out.push(...(data as Record<string, unknown>[]))
  }
  return out
}

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

// PR compatibility 0–100, from stored flags only (never invented): BC-PNP
// in-demand postings are the strongest PR signal, TEER 0–2 is skilled, and
// Canadian-experience eligibility closes the loop.
function prScoreOf(p: Record<string, unknown>): number {
  let s = 0
  if (p.bc_pnp_indemand === true) s += 40
  const teer = String(p.teer_category ?? '')
  if (teer === '0' || teer === '1' || teer === '2') s += 35
  else if (teer === '3') s += 15
  if (p.canadian_exp === true) s += 25
  return s
}

interface HiringAcc {
  name: string
  locations: Set<string>
  sources: Set<string>
  postingCount: number
  sampleUrl: string | null
  samplePostingId: string | null
  onWatchlist: boolean
  teerCounts: Record<string, number>
  bcPnp: number
  canExp: number
  payMin: number | null
  payMax: number | null
  postings: {
    id: string; title: string; location: string | null; source: string | null
    teer: string | null; bcPnp: boolean; canExp: boolean
    salaryMin: number | null; salaryMax: number | null; salaryCurrency: string | null
    url: string | null; prScore: number
  }[]
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const industries = searchParams.get('industries')?.split(',').filter(Boolean) ?? []
  const provinces = searchParams.get('provinces')?.split(',').filter(Boolean) ?? []
  const cities = searchParams.get('cities')?.split(',').filter(Boolean) ?? []
  const sizes = searchParams.get('sizes')?.split(',').filter(Boolean) ?? []
  const watching = searchParams.get('watching') === 'true'
  // sources=adzuna,indeed — multi-platform filter (was a single source=).
  const sources = searchParams.get('sources')?.split(',').map((s) => s.trim()).filter(Boolean) ?? []
  // view=jobs (default): flat, paginated list of individual postings.
  // view=companies: the grouped-by-company hiring snapshot.
  const view = searchParams.get('view') || 'jobs'
  // sort=fit (default): highest probability of hire first. sort=newest: recency.
  const sort = searchParams.get('sort') || 'fit'
  const offset = Math.max(0, Number(searchParams.get('offset') ?? '0') || 0)
  const limit = Math.min(Math.max(1, Number(searchParams.get('limit') ?? '48') || 48), 100)

  try {
    const sb = getServiceClient()
    let query = sb.from('target_companies').select('*').order('name')

    if (industries.length) query = query.in('industry', industries)
    if (provinces.length) query = query.in('province', provinces)
    if (cities.length) query = query.in('city', cities)
    if (sizes.length) query = query.in('size', sizes)
    if (watching) query = query.eq('is_watching', true)

    // "Hiring now" — companies derived from job_postings (real pull sources),
    // grouped per company with per-posting detail for the cards. The jobs
    // view also needs descriptions so PR/fit can be inferred for every card.
    const cols = view === 'jobs'
      ? 'id, company, title, description, location, remote, url, source, salary_min, salary_max, salary_currency, teer_category, bc_pnp_indemand, canadian_exp, posted_at, fit_score'
      : 'id, company, title, location, remote, url, source, salary_min, salary_max, salary_currency, teer_category, bc_pnp_indemand, canadian_exp, posted_at, fit_score'
    const [{ data, error }, postings, { data: profileRow }] = await Promise.all([
      query,
      fetchAllPostings(sb, cols),
      sb.from('job_hunt_profile').select('*').eq('id', 'operator').maybeSingle(),
    ])
    if (error) return Response.json({ error: error.message }, { status: 500 })
    const profile = (profileRow ?? {}) as FitProfile

    const watchNames = new Set((data ?? []).map((c) => c.name.trim().toLowerCase()))
    const byCompany = new Map<string, HiringAcc>()
    for (const p of postings ?? []) {
      if (sources.length > 0 && !sources.includes(String(p.source ?? ''))) continue
      const name = (p.company ?? '').trim()
      if (!name) continue
      const key = name.toLowerCase()
      let entry = byCompany.get(key)
      if (!entry) {
        entry = {
          name, locations: new Set<string>(), sources: new Set<string>(), postingCount: 0,
          sampleUrl: p.url ?? null, samplePostingId: p.id ?? null, onWatchlist: watchNames.has(key),
          teerCounts: {}, bcPnp: 0, canExp: 0, payMin: null, payMax: null, postings: [],
        }
        byCompany.set(key, entry)
      }
      entry.postingCount += 1
      if (p.location) entry.locations.add(p.location)
      if (p.source) entry.sources.add(p.source)
      if (!entry.samplePostingId && p.id) entry.samplePostingId = p.id
      if (p.teer_category) entry.teerCounts[p.teer_category] = (entry.teerCounts[p.teer_category] ?? 0) + 1
      if (p.bc_pnp_indemand === true) entry.bcPnp += 1
      if (p.canadian_exp === true) entry.canExp += 1
      if (typeof p.salary_min === 'number') entry.payMin = entry.payMin === null ? p.salary_min : Math.min(entry.payMin, p.salary_min)
      if (typeof p.salary_max === 'number') entry.payMax = entry.payMax === null ? p.salary_max : Math.max(entry.payMax, p.salary_max)
      if (entry.postings.length < 3) {
        entry.postings.push({
          id: String(p.id), title: (p.title as string) ?? 'Untitled role', location: (p.location as string | null) ?? null,
          source: (p.source as string | null) ?? null, teer: (p.teer_category as string | null) ?? null,
          bcPnp: p.bc_pnp_indemand === true, canExp: p.canadian_exp === true,
          salaryMin: (p.salary_min as number | null) ?? null, salaryMax: (p.salary_max as number | null) ?? null,
          salaryCurrency: (p.salary_currency as string | null) ?? null, url: (p.url as string | null) ?? null,
          prScore: prScoreOf(p),
        })
      }
    }

    // "Pulled in the last 24h" — the visible side-effect of the pull/sync.
    const { count: recentCount } = await sb
      .from('job_postings')
      .select('*', { count: 'exact', head: true })
      .gte('discovered_at', new Date(Date.now() - 86400000).toISOString())

    // Province match on posting locations. BC (the default) uses the strict
    // city-aware matcher (BC cities + Canada terms + pure-remote locations);
    // other provinces fall back to code/name matching.
    const provMatches = (loc: string | null | undefined, remote: boolean | null | undefined): boolean => {
      if (provinces.length === 0) return true
      if (provinces.length === 1 && provinces[0] === 'BC') return isBcRelevant(loc, remote)
      const l = (loc ?? '').toLowerCase()
      return provinces.some((code) => {
        const prov = PROVINCE_BY_CODE[code]
        return l.includes(code.toLowerCase()) || (prov ? l.includes(prov.name.toLowerCase()) : false)
      })
    }

    // JOB-TITLE VIEW (default): every posting as its own item, sorted by
    // PROBABILITY OF HIRE (fit score vs the profile — highest first, vetoed
    // last), with PR/TEER inferred for EVERY card so badges always render.
    if (view === 'jobs') {
      const jobs = (postings ?? [])
        .filter((p) => ((p.company as string | null) ?? '').trim() !== '')
        .filter((p) => sources.length === 0 || sources.includes(String(p.source ?? '')))
        .filter((p) => provMatches(p.location, p.remote))
        .map((p) => {
          const title = (p.title as string) ?? ''
          const company = (p.company as string) ?? ''
          const description = (p.description as string | null) ?? ''
          const fit = scorePosting(profile, {
            title, company, description,
            location: (p.location as string | null) ?? '',
            remote: (p.remote as boolean | null) ?? null,
            salary_min: (p.salary_min as number | null) ?? null,
            salary_max: (p.salary_max as number | null) ?? null,
          })
          const pr = inferPrTags(title, description)
          const prScore = prValue(pr)
          // Lazy-persist inferred flags so later loads read stored values.
          if (p.teer_category === null && (pr.teerCategory || pr.canadianExp || pr.bcPnpInDemand)) {
            void sb.from('job_postings').update({
              teer_category: pr.teerCategory,
              canadian_exp: pr.canadianExp,
              bc_pnp_indemand: pr.bcPnpInDemand,
            }).eq('id', p.id)
          }
          if (p.fit_score === null && !fit.vetoed) {
            void sb.from('job_postings').update({ fit_score: fit.score }).eq('id', p.id)
          }
          return {
            id: String(p.id),
            title: title || 'Untitled role',
            company,
            location: (p.location as string | null) ?? null,
            source: (p.source as string | null) ?? null,
            teer: (p.teer_category as string | null) ?? pr.teerCategory ?? null,
            bcPnp: p.bc_pnp_indemand === true || pr.bcPnpInDemand === true,
            canExp: p.canadian_exp === true || pr.canadianExp === true,
            salaryMin: (p.salary_min as number | null) ?? null,
            salaryMax: (p.salary_max as number | null) ?? null,
            salaryCurrency: (p.salary_currency as string | null) ?? null,
            url: (p.url as string | null) ?? null,
            postedAt: (p.posted_at as string | null) ?? null,
            prScore,
            fitScore: fit.score,
            fitVetoed: fit.vetoed,
          }
        })

      // Boards snapshot — fetched on the operator's side (web search of the
      // boards' syndication network) so boards data shows WITHOUT the VPS
      // leg. URLs already in the DB are skipped; rows go through the same
      // fit/PR pipeline, so cards get full badges.
      const existingUrls = new Set((postings ?? []).map((p) => String((p as Record<string, unknown>).url ?? '').toLowerCase()).filter(Boolean))
      for (const r of boardSnapshot as SnapshotRow[]) {
        const url = String(r.url ?? '').toLowerCase()
        if (!url || existingUrls.has(url)) continue
        const fit = scorePosting(profile, {
          title: r.title, company: r.company, description: r.description ?? '',
          location: r.location ?? '', remote: null,
          salary_min: r.salary_min ?? null, salary_max: r.salary_max ?? null,
        })
        const pr = inferPrTags(r.title, r.description ?? '')
        jobs.push({
          id: `snap-${jobs.length}`,
          title: r.title,
          company: r.company,
          location: r.location ?? null,
          source: r.source ?? 'glassdoor',
          teer: pr.teerCategory ?? null,
          bcPnp: pr.bcPnpInDemand === true,
          canExp: pr.canadianExp === true,
          salaryMin: r.salary_min ?? null,
          salaryMax: r.salary_max ?? null,
          salaryCurrency: r.salary_currency ?? 'CAD',
          url: r.url ?? null,
          postedAt: r.posted_at ?? null,
          prScore: prValue(pr),
          fitScore: fit.score,
          fitVetoed: fit.vetoed,
        })
      }

      jobs.sort((a, b) => sort === 'newest'
        ? String(b.postedAt ?? '').localeCompare(String(a.postedAt ?? ''))
        : Number(b.fitVetoed) - Number(a.fitVetoed) || b.fitScore - a.fitScore)
      const totalJobs = jobs.length
      const jobPage = jobs.slice(offset, offset + limit)
      return Response.json({ companies: data ?? [], hiring: [], jobs: jobPage, total: totalJobs, recentCount: recentCount ?? 0 })
    }

    const all = [...byCompany.values()]
      .filter((h) => [...h.locations].some((loc) => provMatches(loc, null)))
      .sort((a, b) => b.postingCount - a.postingCount)
    const total = all.length
    const hiring = all.slice(offset, offset + limit).map((h) => ({
      name: h.name,
      locations: [...h.locations].slice(0, 5),
      sources: [...h.sources].sort(),
      postingCount: h.postingCount,
      sampleUrl: h.sampleUrl,
      samplePostingId: h.samplePostingId,
      onWatchlist: h.onWatchlist,
      teerCounts: h.teerCounts,
      bcPnp: h.bcPnp,
      canExp: h.canExp,
      payMin: h.payMin,
      payMax: h.payMax,
      postings: h.postings,
    }))

    return Response.json({ companies: data ?? [], hiring, total, recentCount: recentCount ?? 0 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { id, ...updates } = body
  if (!id) return Response.json({ error: 'id is required' }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb.from('target_companies').update(updates).eq('id', id).select().single()
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ company: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const required = ['name', 'industry', 'province']
  for (const f of required) {
    if (!body[f]) return Response.json({ error: `${f} is required` }, { status: 400 })
  }

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('target_companies')
      .insert({
        name: body.name,
        domain: body.domain ?? null,
        industry: body.industry,
        province: body.province,
        city: body.city ?? null,
        size: body.size ?? 'medium',
        description: body.description ?? null,
        careers_url: body.careers_url ?? null,
        is_watching: body.is_watching ?? false,
      })
      .select()
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ company: data }, { status: 201 })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
