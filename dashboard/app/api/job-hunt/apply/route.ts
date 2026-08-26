/**
 * /api/job-hunt/apply — Apply Hub (2026-08-25).
 * GET  → the queue (joined with posting details + fit + PR tags).
 * POST { posting_id, resume_variant? } → add a posting to the queue (or
 *      resume_variant/cover_letter/status/notes updates when id present).
 * DELETE ?id= → drop from the queue.
 * Nothing sends or submits — applying happens on the real site, manually.
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

export async function GET() {
  try {
    const sb = getServiceClient()
    const [{ data, error }, { data: profileRow }] = await Promise.all([
      sb.from('job_hunt_apply_queue').select('*, posting:job_postings(*)').order('created_at', { ascending: false }),
      sb.from('job_hunt_profile').select('*').eq('id', 'operator').maybeSingle(),
    ])
    if (error) return Response.json({ error: error.message }, { status: 500 })
    const profile = (profileRow ?? {}) as FitProfile

    const rows = (data ?? []).map((q) => {
      const p = q.posting as Record<string, unknown> | null
      const fit = p ? scorePosting(profile, {
        title: (p.title as string | null) ?? '', company: (p.company as string | null) ?? '',
        description: (p.description as string | null) ?? '', location: (p.location as string | null) ?? '',
        remote: (p.remote as boolean | null) ?? null, salary_min: (p.salary_min as number | null) ?? null,
        salary_max: (p.salary_max as number | null) ?? null,
      }) : null
      const pr = p ? inferPrTags(p.title as string | null, p.description as string | null) : null
      return { ...q, fit, pr: pr ? { ...pr, score: prValue(pr) } : null }
    })

    return Response.json({ queue: rows })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  try {
    const sb = getServiceClient()

    // Update existing queue row (resume_variant / cover_letter / status / notes).
    if (body.id) {
      const { error } = await sb
        .from('job_hunt_apply_queue')
        .update({ ...body, updated_at: new Date().toISOString() })
        .eq('id', body.id)
      if (error) return Response.json({ error: error.message }, { status: 500 })
      return Response.json({ ok: true })
    }

    // Add a posting to the queue.
    if (!body.posting_id) return Response.json({ error: 'posting_id required' }, { status: 400 })
    const { error } = await sb
      .from('job_hunt_apply_queue')
      .upsert({
        posting_id: body.posting_id as string,
        resume_variant: (body.resume_variant as string | undefined) ?? 'default',
        status: 'prepared',
      }, { onConflict: 'posting_id' })
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return Response.json({ error: 'id required' }, { status: 400 })
  try {
    const sb = getServiceClient()
    const { error } = await sb.from('job_hunt_apply_queue').delete().eq('id', id)
    if (error) return Response.json({ error: error.message }, { status: 500 })
    return Response.json({ ok: true })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}
