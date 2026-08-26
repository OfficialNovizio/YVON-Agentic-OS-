/**
 * /api/job-hunt/pull — async hiring pull (2026-08-25).
 *
 * POST { mode: 'deep' | 'quick', sources?: string[] } → starts (or returns
 * the running) pull job. Deep = 60 days back, Adzuna paged through history.
 * Returns { jobId } immediately — the pull runs in the Node process.
 *
 * GET ?jobId= → live progress: { status, stepsDone, stepsTotal, etaSec,
 *   perSource, steps, log, fetched, newCount, dropped }.
 *
 * POST { jobId, cancel: true } → requests cancellation.
 *
 * NOTE: runs where the dashboard is a persistent Node process (local dev /
 * Node host). On serverless (Vercel) the job can't survive between requests —
 * deep pulls then belong to the VPS boards script (--days=60).
 */

import { NextRequest } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getPullJob, startPull, cancelPullJob } from '@/lib/job-hunt/pull-job'

function getServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function POST(request: NextRequest) {
  let body: { mode?: 'deep' | 'quick'; sources?: string[]; jobId?: string; cancel?: boolean }
  try { body = await request.json() } catch { body = {} }

  if (body.cancel && body.jobId) {
    const result = cancelPullJob(body.jobId)
    if (!result.ok) {
      // Job not in memory (server restarted) — mark the persisted row cancelled.
      try {
        const sb = getServiceClient()
        const { error } = await sb.from('job_hunt_pull_jobs')
          .update({ status: 'cancelled', updated_at: new Date().toISOString(), finished_at: new Date().toISOString() })
          .eq('id', body.jobId)
        if (!error) return Response.json({ ok: true, status: 'cancelled' })
      } catch { /* fall through */ }
      return Response.json({ error: 'unknown job' }, { status: 404 })
    }
    return Response.json({ ok: true, status: result.status })
  }

  try {
    const jobId = await startPull({ mode: body.mode, sources: body.sources })
    return Response.json({ ok: true, jobId })
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const jobId = new URL(request.url).searchParams.get('jobId')
  if (!jobId) return Response.json({ error: 'jobId required' }, { status: 400 })
  const job = getPullJob(jobId)

  // Not in memory (server restarted) → recover from the persisted progress
  // (migration 138). A stale 'running' row becomes status 'lost' so the UI
  // shows where the pull got to instead of a dead 404.
  if (!job) {
    try {
      const sb = getServiceClient()
      const { data } = await sb.from('job_hunt_pull_jobs').select('*').eq('id', jobId).maybeSingle()
      if (data) {
        const staleRunning = data.status === 'running' && Date.now() - new Date(data.updated_at).getTime() > 120000
        return Response.json({
          jobId: data.id,
          status: staleRunning ? 'lost' : data.status,
          mode: data.mode,
          startedAt: new Date(data.started_at).getTime(),
          finishedAt: data.finished_at ? new Date(data.finished_at).getTime() : null,
          stepsDone: data.steps_done,
          stepsTotal: data.steps_total,
          etaSec: null,
          fetched: 0,
          newCount: 0,
          dropped: 0,
          perSource: data.per_source ?? {},
          steps: [],
          log: data.log ?? [],
          error: data.error,
          recovered: true,
        })
      }
    } catch { /* fall through to 404 */ }
    return Response.json({ error: 'unknown job' }, { status: 404 })
  }

  // ETA: elapsed × (remaining / done), smoothed; null until some progress.
  let etaSec: number | null = null
  if (job.stepsDone > 0 && job.stepsDone < job.stepsTotal) {
    const elapsed = (Date.now() - job.startedAt) / 1000
    etaSec = Math.round((elapsed / job.stepsDone) * (job.stepsTotal - job.stepsDone))
  }

  return Response.json({
    jobId: job.id,
    status: job.status,
    mode: job.mode,
    startedAt: job.startedAt,
    finishedAt: job.finishedAt,
    stepsDone: job.stepsDone,
    stepsTotal: job.stepsTotal,
    etaSec,
    fetched: job.fetched,
    newCount: job.newCount,
    dropped: job.dropped,
    perSource: job.perSource,
    steps: job.steps,
    log: job.log.slice(-25),
    error: job.error,
  })
}
