// pull-job.ts — async hiring pull with progress (2026-08-25).
//
// The 10-15 minute deep pull can't run inside one HTTP request. This module
// runs it in the Node process and tracks progress in a module-level Map; the
// UI polls GET /api/job-hunt/pull?jobId= for { status, stepsDone, stepsTotal,
// etaSec, perSource, log[] } and renders the Adora progress panel.
//
// Runs where the dashboard runs as a persistent Node process (local dev or a
// Node host). Serverless (Vercel functions) can't hold a job between
// requests — on Vercel the quick mode still works request-scoped; deep mode
// should run from the VPS boards script (--days=60).
//
// Depth: 60 days back from today. Adzuna is paged (search/{page}, 50/page)
// until results are older than the cutoff; free/remote sources serve what
// they serve (bounded); the boards script (VPS) has its own --days mode.

import { createClient } from '@supabase/supabase-js'
import { spawn } from 'child_process'
import { JOB_SOURCES } from './sources'
import { splitBcRelevant } from './bc-filter'
import type { NormalizedJob } from './types'

const DAYS_BACK = 60
const ADZUNA_LIMIT = 50
const FREE_LIMIT = 30
const ADZUNA_MAX_PAGES = 5 // v6: fewer pages — halves deep-pull time

// Indeed + LinkedIn run on the VPS (python-jobspy). The dashboard pull drives
// them over SSH so one button fetches EVERYTHING, streaming their output into
// the same progress panel. Requires key-based SSH to the VPS (one-time
// `ssh-copy-id root@169.58.107.148` if not already set up). BatchMode=yes
// makes an unauthenticated SSH fail fast with a clear message instead of
// hanging at a password prompt for the full timeout.
// 2026-08-25 v3: multiple python candidates (pinned venv first, PATH python3
// fallback) so a differently-provisioned VPS still runs the script; failures
// are classified into actionable messages instead of a bare "error".
const BOARD_HOST = process.env.JOBHUNT_BOARD_HOST ?? 'root@169.58.107.148'
const BOARD_TIMEOUT_MS = 25 * 60 * 1000 // deep board pulls take a while (incl. one-time pip install)
const BOARD_SSH_ARGS = ['-o', 'BatchMode=yes', '-o', 'ConnectTimeout=15', '-o', 'StrictHostKeyChecking=accept-new']

export interface PullStep {
  key: string
  label: string
  status: 'pending' | 'active' | 'done' | 'error'
  count: number
}

export interface PullJob {
  id: string
  status: 'running' | 'done' | 'error' | 'cancelled'
  mode: 'deep' | 'quick'
  startedAt: number
  finishedAt: number | null
  stepsTotal: number
  stepsDone: number
  fetched: number
  newCount: number
  dropped: number
  perSource: Record<string, { count: number; skipped: string | null; error?: string }>
  steps: PullStep[]
  log: string[]
  error: string | null
  cancelRequested: boolean
  children: ReturnType<typeof spawn>[]  // active ssh children, killed on cancel
}

const jobs = new Map<string, PullJob>()
let jobSeq = 0

export function getPullJob(id: string): PullJob | null {
  return jobs.get(id) ?? null
}

// Real cancellation: kills the running ssh child immediately and marks the
// job cancelled (progress is persisted, so even a restart doesn't lose the
// record). Anything already fetched but not yet inserted is discarded —
// inserts happen once at completion (boards write per-query as they go).
export function cancelPullJob(id: string): { ok: boolean; status?: string; error?: string } {
  const job = jobs.get(id)
  if (!job) return { ok: false, error: 'unknown job' }
  job.cancelRequested = true
  for (const c of job.children) {
    try { c.kill('SIGKILL') } catch { /* gone */ }
  }
  job.children = []
  job.status = 'cancelled'
  job.finishedAt = Date.now()
  log(job, 'cancelled by operator')
  return { ok: true, status: job.status }
}

function log(job: PullJob, line: string) {
  job.log.push(line)
  if (job.log.length > 80) job.log = job.log.slice(-80)
}

// Best-effort progress persistence (migration 138): a dev-server restart no
// longer erases the job — the UI recovers the last state from the DB.
async function persistJob(sb: ReturnType<typeof supabase>, job: PullJob) {
  try {
    await sb.from('job_hunt_pull_jobs').upsert({
      id: job.id,
      status: job.status,
      mode: job.mode,
      steps_done: job.stepsDone,
      steps_total: job.stepsTotal,
      per_source: job.perSource,
      log: job.log.slice(-40),
      error: job.error,
      started_at: new Date(job.startedAt).toISOString(),
      updated_at: new Date().toISOString(),
      finished_at: job.finishedAt ? new Date(job.finishedAt).toISOString() : null,
    }, { onConflict: 'id' })
  } catch { /* persistence is best-effort — the in-memory job still works */ }
}

function daysBackIso(days: number): string {
  return new Date(Date.now() - days * 86400000).toISOString()
}

function isWithinDays(postedAt: string | null, days: number): boolean {
  if (!postedAt) return true // unknown date — keep (can't prove it's stale)
  const t = new Date(postedAt).getTime()
  if (Number.isNaN(t)) return true
  return t >= Date.now() - days * 86400000
}

function supabase() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
  if (!url || !key) throw new Error('Supabase service credentials not configured')
  return createClient(url, key)
}

export async function startPull(opts: { mode?: 'deep' | 'quick'; sources?: string[] }): Promise<string> {
  // One pull at a time — a running deep pull blocks a new one.
  for (const j of jobs.values()) {
    if (j.status === 'running') return j.id
  }

  const id = `pull-${Date.now()}-${++jobSeq}`
  const mode = opts.mode === 'deep' ? 'deep' : 'quick'
  const job: PullJob = {
    id, status: 'running', mode, startedAt: Date.now(), finishedAt: null,
    stepsTotal: 0, stepsDone: 0, fetched: 0, newCount: 0, dropped: 0,
    perSource: {}, steps: [], log: [], error: null, cancelRequested: false, children: [],
  }
  jobs.set(id, job)
  log(job, `${mode === 'deep' ? 'DEEP' : 'QUICK'} pull started — ${DAYS_BACK} days back`)

  // Kick off asynchronously; return the id immediately.
  void run(job, opts.sources)
  return id
}

// One ssh attempt of the boards script: streams output into the job log,
// counts "N postings" lines, resolves 'ok' on exit-0 (or any results) and
// 'fail' otherwise (tail of stderr kept in st.error for classification).
async function runBoardSsh(boardCmd: string, job: PullJob, step: PullStep, st: { count: number; skipped: string | null; error?: string }): Promise<boolean> {
  return new Promise((resolve) => {
    const child = spawn('ssh', [...BOARD_SSH_ARGS, BOARD_HOST, boardCmd], { stdio: ['ignore', 'pipe', 'pipe'] })
    job.children.push(child)
    const timer = setTimeout(() => { try { child.kill('SIGKILL') } catch { /* gone */ } }, BOARD_TIMEOUT_MS)
    // Cancel-aware: kill the ssh child within a second of a cancel request.
    const cancelWatcher = setInterval(() => {
      if (job.cancelRequested) {
        clearInterval(cancelWatcher)
        try { child.kill('SIGKILL') } catch { /* gone */ }
        job.children = job.children.filter((c) => c !== child)
      }
    }, 1000)
    let tail = ''
    const onData = (chunk: Buffer) => {
      const text = chunk.toString()
      tail = (tail + text).slice(-4000)
      for (const line of text.split('\n').filter(Boolean)) {
        job.log.push(line.slice(0, 300))
        if (job.log.length > 120) job.log = job.log.slice(-120)
      }
      // Parse per-query counts: "indeed 'query': N postings"
      const m = text.match(/(\d+) postings/)
      if (m) step.count = Math.max(step.count, parseInt(m[1], 10) || 0)
    }
    child.stdout.on('data', onData)
    child.stderr.on('data', onData)
    child.on('close', (c) => {
      clearTimeout(timer)
      clearInterval(cancelWatcher)
      job.children = job.children.filter((x) => x !== child)
      const exitCode = c ?? -1
      if (exitCode !== 0 && step.count === 0) {
        st.error = tail.slice(-250) || `ssh exited ${exitCode}`
        resolve(false)
      } else {
        resolve(true)
      }
    })
    child.on('error', () => { clearTimeout(timer); clearInterval(cancelWatcher); job.children = job.children.filter((x) => x !== child); st.error = 'ssh spawn failed'; resolve(false) })
  })
}

// Indeed + LinkedIn boards leg — moved FIRST (v5) so the VPS fetch (the slow,
// restart-prone part) runs before the main sources. The script upserts
// per-query, so boards data is never lost on cancel or restart.
async function runBoards(sb: ReturnType<typeof supabase>, job: PullJob) {
  // v6: both sites in parallel — halves the boards wall-time.
  await Promise.all(['indeed', 'linkedin'].map((site) => runBoardSite(sb, job, site)))
}

async function runBoardSite(sb: ReturnType<typeof supabase>, job: PullJob, site: string) {
    const step: PullStep = { key: `boards|${site}`, label: `${site} (VPS fetch)`, status: 'active', count: 0 }
    job.steps.push(step)
    job.stepsTotal = job.steps.length
    const st = job.perSource[site] ?? { count: 0, skipped: null }
    log(job, `${site}: starting VPS fetch`)

    // Self-sync the script from the repo, self-provision the venv + jobspy,
    // verify the env file, then run. The only external requirement is the
    // SSH key (installed once via ssh-copy-id).
    // NOTE: no --days flag — the VPS checkout may still run the pre-fix
    // script whose 60-day cutoff crashes on datetime.date; the default fetch
    // path has no cutoff and works on every version. Re-enable --days once
    // the datetime fix is committed + pushed (self-sync then deploys it).
    const sync = 'git -C /root/YVON-Agentic-OS- pull --quiet 2>/dev/null || true'
    const auto = `bash -lc '${sync}; VENV=/opt/yvon-tools/venvs/jobhunt; SCRIPT=/root/YVON-Agentic-OS-/vps-scripts/fetch-hiring-boards.py; if [ ! -x $VENV/bin/python3 ]; then python3 -m venv $VENV && $VENV/bin/pip install --quiet python-jobspy pandas || { echo "venv setup failed"; exit 2; }; fi; if [ ! -f /root/.yvon-supabase.env ]; then echo "MISSING /root/.yvon-supabase.env" >&2; exit 3; fi; exec $VENV/bin/python3 -u $SCRIPT --site ${site}'`
    const plain = `bash -lc '${sync}; SCRIPT=/root/YVON-Agentic-OS-/vps-scripts/fetch-hiring-boards.py; if [ ! -f /root/.yvon-supabase.env ]; then echo "MISSING /root/.yvon-supabase.env" >&2; exit 3; fi; exec python3 -u $SCRIPT --site ${site}'`
    let ok = false
    for (const cmd of [auto, plain]) {
      ok = await runBoardSsh(cmd, job, step, st)
      if (ok) break
    }

    st.count = step.count
    job.perSource[site] = st
    if (!ok) {
      step.status = 'error'
      const msg = st.error ?? 'ssh/VPS unreachable'
      log(job, `${site}: FAILED — ${msg.slice(0, 200)}`)
      if (/permission denied|publickey|password/i.test(msg)) {
        log(job, `${site}: cause: SSH key not installed on the Mac → VPS. One-time fix: ssh-copy-id ${BOARD_HOST}`)
      } else if (/no such file|not found|venv|no module/i.test(msg)) {
        log(job, `${site}: cause: VPS python/jobspy missing — create the jobhunt venv (vps-scripts/fetch-hiring-boards.py header)`)
      } else if (/not set/i.test(msg)) {
        log(job, `${site}: cause: VPS env file /root/.yvon-supabase.env missing or stale`)
      }
    } else {
      step.status = 'done'
      log(job, `${site}: finished (~${step.count} postings)`)
    }
    job.stepsDone += 1
    void persistJob(sb, job)
}

async function run(job: PullJob, requestedSources?: string[]) {
  try {
    const sb = supabase()
    void persistJob(sb, job) // initial row — progress survives restarts

    // Boards FIRST (2026-08-25 v5): Indeed + LinkedIn run before the source
    // loop — the slow VPS leg runs early so its results survive restarts,
    // and the operator sees boards data immediately.
    await runBoards(sb, job)

    const [{ data: keyRows }, { data: queryRows }] = await Promise.all([
      sb.from('job_hunt_source_keys').select('source, config, enabled'),
      sb.from('job_hunt_sync_queries').select('industry, queries, enabled'),
    ])
    const configBySource = new Map((keyRows ?? []).map((r) => [r.source, r]))
    const requested = requestedSources?.length ? new Set(requestedSources) : null
    const activeSources = JOB_SOURCES.filter((s) => !requested || requested.has(s.id))

    const industryQueries: Record<string, string[]> = {}
    if (queryRows && queryRows.length > 0) {
      for (const r of queryRows) if (r.enabled !== false) industryQueries[r.industry] = r.queries ?? []
    }
    if (Object.keys(industryQueries).length === 0) {
      Object.assign(industryQueries, {
        Aerospace: ['aerospace engineer', 'aviation'],
        IT: ['software engineer', 'full stack developer'],
        Trucking: ['truck driver', 'logistics'],
        Drone: ['drone operator', 'UAV'],
        Business: ['business analyst', 'operations manager'],
      })
    }

    // Build the step plan: industry × query × source.
    for (const [industry, queries] of Object.entries(industryQueries)) {
      for (const query of queries) {
        for (const s of activeSources) {
          job.steps.push({ key: `${industry}|${query}|${s.id}`, label: `${industry} · "${query}" · ${s.label}`, status: 'pending', count: 0 })
        }
      }
    }
    job.stepsTotal = job.steps.length
    log(job, `plan: ${job.stepsTotal} source-query steps across ${Object.keys(industryQueries).length} industries`)

    const cutoff = daysBackIso(DAYS_BACK)
    const allJobs: NormalizedJob[] = []

    for (let si = 0; si < job.steps.length; si++) {
      if (job.cancelRequested) {
        job.status = 'cancelled'
        job.finishedAt = Date.now()
        log(job, 'cancelled by operator')
        void persistJob(sb, job)
        return
      }
      const step = job.steps[si]
      const [, query, sourceId] = step.key.split('|')
      const source = activeSources.find((s) => s.id === sourceId)
      if (!source) { step.status = 'error'; job.stepsDone = si + 1; continue }

      step.status = 'active'
      const keyRow = configBySource.get(source.id)
      const industry = step.key.split('|')[0]
      try {
        if (source.needsKey && (!keyRow || keyRow.enabled === false)) {
          step.status = 'done'
          job.perSource[source.id] = { count: 0, skipped: 'not configured' }
          job.stepsDone = si + 1
          continue
        }

        // Deep mode: page Adzuna back through history until older than the cutoff.
        const pages = job.mode === 'deep' && source.id === 'adzuna' ? ADZUNA_MAX_PAGES : 1
        let found = 0
        for (let p = 1; p <= pages; p++) {
          // Per-step timeout (2026-08-25): a hanging source used to freeze
          // the whole pull at some percentage forever. 25s and the step
          // errors out, the job moves on.
          const jobsOnPage = await Promise.race([
            source.search({
              query, location: 'British Columbia', limit: ADZUNA_LIMIT,
              industry, province: 'BC', page: p,
              config: keyRow?.config as Record<string, unknown> | undefined,
            }),
            new Promise<NormalizedJob[]>((resolve) => setTimeout(() => resolve([]), 25000)),
          ])
          if (jobsOnPage.length === 0) break
          const fresh = jobsOnPage.filter((j) => isWithinDays(j.posted_at, DAYS_BACK))
          allJobs.push(...fresh)
          found += fresh.length
          // Stop paging once a whole page is older than the cutoff.
          if (fresh.length < jobsOnPage.length) break
        }
        step.count = found
        step.status = 'done'
        const st = job.perSource[source.id] ?? { count: 0, skipped: null }
        st.count += found
        job.perSource[source.id] = st
        log(job, `${step.label}: +${found}`)
      } catch (e) {
        step.status = 'error'
        const st = job.perSource[source.id] ?? { count: 0, skipped: null }
        st.error = String(e).slice(0, 120)
        job.perSource[source.id] = st
        log(job, `${step.label}: error — ${String(e).slice(0, 120)}`)
      }
      job.stepsDone = si + 1
      void persistJob(sb, job)
    }

    // Boards leg ran FIRST (runBoards above) — if the operator cancelled
    // while the main sources were fetching, nothing unsaved is inserted.
    if (job.cancelRequested) {
      job.status = 'cancelled'
      job.finishedAt = Date.now()
      log(job, 'cancelled after boards — main sources discarded')
      void persistJob(sb, job)
      return
    }

    // Strict BC filter, then insert-only upsert.
    const { kept, dropped } = splitBcRelevant(allJobs)
    job.dropped = dropped.length
    job.fetched = kept.length
    log(job, `BC filter: kept ${kept.length}, dropped ${dropped.length} non-BC`)
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
      job.newCount = count ?? 0
    }
    void cutoff

    job.status = 'done'
    job.finishedAt = Date.now()
    log(job, `done — ${job.newCount} new postings stored (${job.fetched} fetched, ${job.dropped} filtered)`)
    void persistJob(sb, job)
  } catch (e) {
    job.status = 'error'
    job.finishedAt = Date.now()
    job.error = String(e)
    log(job, `fatal: ${String(e)}`)
    void persistJob(sb, job)
  }
}
