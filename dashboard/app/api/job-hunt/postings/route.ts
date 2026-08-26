/**
 * /api/job-hunt/postings — list stored postings (GET) and change a posting's
 * status (PATCH) — the only write this route allows is status, and it never
 * goes further than 'queued' from here. 'applied'/'interview'/'offer'/
 * 'rejected' are for the tracker artifact (Job Hunt #4), set by the operator
 * after they've actually gone and applied on the real site themselves.
 */

import { createClient } from '@supabase/supabase-js'
import { NextRequest } from 'next/server'
import { scorePosting, type FitProfile } from '@/lib/job-hunt/fit-score'
import { inferPrTags, prValue } from '@/lib/job-hunt/pr-tags'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const limit = Math.min(Number(searchParams.get('limit') ?? '50'), 200)
    const offset = Number(searchParams.get('offset') ?? '0')

    const sb = getServiceClient()
    let q = sb
      .from('job_postings')
      .select('*', { count: 'exact' })
      .order('discovered_at', { ascending: false })
      .range(offset, offset + limit - 1)
    if (status) q = q.eq('status', status)
    if (source) q = q.eq('source', source)

    const { data, error, count } = await q
    if (error) return Response.json({ error: error.message }, { status: 500 })
    const postings = data ?? []
    const total = count ?? postings.length

    // Fit-scoring (2026-08-25): score every posting against the operator's
    // profile using the weights seeded from ai-job-search (migration 121).
    // The fit_score column exists in the schema; persist it so future
    // sorting/filtering by score needs no re-compute.
    const { data: profileRow } = await sb.from('job_hunt_profile').select('*').eq('id', 'operator').maybeSingle()
    const profile = (profileRow ?? {}) as FitProfile

    const scored = postings.map((p: Record<string, unknown>) => {
      const fit = scorePosting(profile, {
        title: (p.title as string | null) ?? '',
        company: (p.company as string | null) ?? '',
        description: (p.description as string | null) ?? '',
        location: (p.location as string | null) ?? '',
        remote: (p.remote as boolean | null) ?? null,
        salary_min: (p.salary_min as number | null) ?? null,
        salary_max: (p.salary_max as number | null) ?? null,
      })
      const pr = inferPrTags(p.title as string | null, p.description as string | null)
      const prScore = prValue(pr)
      if (p.fit_score === null && !fit.vetoed) {
        // persist lazily — only fill rows that never had a score
        void sb.from('job_postings').update({ fit_score: fit.score }).eq('id', p.id)
      }
      if (p.teer_category === null && (pr.teerCategory || pr.canadianExp || pr.bcPnpInDemand)) {
        void sb.from('job_postings').update({
          teer_category: pr.teerCategory,
          canadian_exp: pr.canadianExp,
          bc_pnp_indemand: pr.bcPnpInDemand,
        }).eq('id', p.id)
      }
      return { ...p, fit, pr: { ...pr, score: prScore } }
    })

    return Response.json({ postings: scored, total })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

const ALLOWED_STATUSES = ['discovered', 'queued', 'applied', 'interview', 'offer', 'rejected', 'archived']

export async function PATCH(request: NextRequest) {
  let body: { id?: string; status?: string }
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { id, status } = body
  if (!id || !status) return Response.json({ error: 'id and status are required' }, { status: 400 })
  if (!ALLOWED_STATUSES.includes(status)) return Response.json({ error: `status must be one of ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 })

  try {
    const sb = getServiceClient()
    const { data, error } = await sb
      .from('job_postings')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single()

    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true, posting: data })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
