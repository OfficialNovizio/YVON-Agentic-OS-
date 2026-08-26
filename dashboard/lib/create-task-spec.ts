// createTaskSpecAndMirror — shared by the chat-as-task feature's two entry
// points: /api/chat/task-proposal (agent-offered, Yes button) and the
// /assignTask command (manual, instant). One implementation, so "how do we
// actually create a task from chat" has a single source of truth.
//
// Creates a REAL governed TASK-SPEC draft via `cli/task.py new` — the same
// script `cli/task.sh new` already wraps — and mirrors a card into the
// Hermes Kanban board (what dashboard/app/task-board/page.tsx renders) so
// it's visible where the user already looks too. "Both — bridge", per
// operator direction 2026-08-11. Full-gate: only ever creates status=draft;
// nothing is auto-approved.
//
// KNOWN GAP (2026-08-11, disclosed, not silently patched): this shells out
// to a local python3 + cli/task.py via child_process. That's correct for
// `next dev`/`next start` run from a real repo checkout (verified — see
// task 55's sandbox test) but will NOT work if this dashboard is deployed to
// Vercel: `dashboard/lib/commands/where.ts` already documents "Vercel — no
// repo checkout here", and cli/task.py lives outside the dashboard/ app root
// that Vercel bundles, on a runtime with no python3 available either. It
// fails loudly (a real error, not a silent no-op) rather than pretending
// success — same principle /deploy's YVON_DEPLOY_EXECUTOR gap already
// documents. Fixing it for a real Vercel deploy means building the same
// remote-executor bridge /deploy anticipates (YVON_DEPLOY_EXECUTOR env var +
// an HTTP endpoint on a box with a real repo checkout) — not done here,
// flagged as follow-up scope.
//
// Owner: dev · chat-as-task feature, 2026-08-11

import { execFile } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import { hermesConfig } from '@/lib/hermes-client'
import { errMsg } from '@/lib/errors'
import type { GeneratedPrd } from '@/lib/prd-generator'

const execFileAsync = promisify(execFile)

const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')

export interface CreateTaskResult {
  taskId: string | null
  taskSpecError: string | null
  kanbanOk: boolean
  kanbanError: string | null
}

async function mirrorToKanban(taskId: string | null, title: string): Promise<{ kanbanOk: boolean; kanbanError: string | null }> {
  const cfg = hermesConfig()
  if (!cfg.configured || !cfg.url || !cfg.token) {
    return { kanbanOk: false, kanbanError: cfg.reason ?? 'Hermes not configured' }
  }
  try {
    const res = await fetch(`${cfg.url}/api/hermes/plugins/kanban/tasks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: taskId ? `${taskId} · ${title.trim()}` : title.trim() }),
    })
    return res.ok ? { kanbanOk: true, kanbanError: null } : { kanbanOk: false, kanbanError: `Hermes Kanban responded ${res.status}` }
  } catch (e) {
    return { kanbanOk: false, kanbanError: errMsg(e) }
  }
}

export async function createTaskSpecAndMirror(title: string, summary: string): Promise<CreateTaskResult> {
  // ── 1. Real, governed TASK-SPEC draft ────────────────────────────────────
  const sourceMessage = `${title.trim()}\n\n${summary.trim()}`
  let taskId: string | null = null
  let taskSpecError: string | null = null
  try {
    const { stdout } = await execFileAsync('python3', [TASK_PY, 'new', sourceMessage], {
      cwd: REPO_ROOT,
      timeout: 15_000,
    })
    const match = stdout.match(/TS-\d+/)
    taskId = match ? match[0] : null
    if (!taskId) taskSpecError = `task.py new ran but no TS-id found in its output: ${stdout.slice(0, 200)}`
  } catch (e) {
    taskSpecError = errMsg(e)
  }

  // ── 2. Mirror a card into the Hermes Kanban board ────────────────────────
  // Best-effort — the TASK-SPEC draft above is the real, governed artifact;
  // the Kanban card is a visibility mirror, not the source of truth, so its
  // failure doesn't fail the whole operation.
  const { kanbanOk, kanbanError } = await mirrorToKanban(taskId, title)

  return { taskId, taskSpecError, kanbanOk, kanbanError }
}

// ─── createTaskFromPrd — the PRD-gated path ─────────────────────────────────
// docs/PRD-prd-gated-task-conversion.md. Unlike createTaskSpecAndMirror above
// (draft only, everything else manual), this runs the record all the way to
// `executing`: the generated PRD already IS discovery's answer, so there is
// nothing left for a human to fill in before work can start. Chain:
//   new → write {id}-prd.md → set-prd → fill-discovery → discover → approve → start
// Any step failing stops the chain and reports exactly which step and why —
// never silently partial, per the same "fail loud" rule task-spec/route.ts
// already documents for reads.

export interface CreateTaskFromPrdResult {
  taskId: string | null
  status: string | null
  error: string | null
  /** which step failed, for an honest error message — null if taskId is set */
  failedStep: string | null
  kanbanOk: boolean
  kanbanError: string | null
}

async function runTask(...args: string[]): Promise<{ ok: boolean; stdout: string; stderr: string }> {
  try {
    const { stdout } = await execFileAsync('python3', [TASK_PY, ...args], { cwd: REPO_ROOT, timeout: 15_000 })
    return { ok: true, stdout, stderr: '' }
  } catch (e) {
    const err = e as { stdout?: string; stderr?: string; message?: string }
    return { ok: false, stdout: err.stdout ?? '', stderr: err.stderr || err.message || errMsg(e) }
  }
}

export async function createTaskFromPrd(
  title: string,
  summary: string,
  generated: GeneratedPrd,
  approvedBy: string,
): Promise<CreateTaskFromPrdResult> {
  const sourceMessage = `${title.trim()}\n\n${summary.trim()}`

  const created = await runTask('new', sourceMessage, '--actor', approvedBy)
  const idMatch = created.stdout.match(/TS-\d+/)
  if (!created.ok || !idMatch) {
    return { taskId: null, status: null, error: created.stderr || 'task.py new produced no TS id', failedStep: 'new', kanbanOk: false, kanbanError: null }
  }
  const taskId = idMatch[0]

  // Write the real PRD file BEFORE set-prd — set-prd requires it to exist on disk.
  const prdRelPath = path.join('store', 'tasks', `${taskId}-prd.md`)
  try {
    await fs.promises.writeFile(path.join(REPO_ROOT, prdRelPath), generated.markdown)
  } catch (e) {
    return { taskId, status: 'draft', error: `wrote ${taskId} but failed to write its PRD file: ${errMsg(e)}`, failedStep: 'write-prd', kanbanOk: false, kanbanError: null }
  }

  const setPrd = await runTask('set-prd', taskId, '--ref', prdRelPath, '--rice', String(generated.riceScore), '--actor', 'spec')
  if (!setPrd.ok) {
    return { taskId, status: 'draft', error: setPrd.stderr, failedStep: 'set-prd', kanbanOk: false, kanbanError: null }
  }

  const fillDiscovery = await runTask(
    'fill-discovery', taskId,
    '--lead', generated.meta.lead,
    '--decisions', JSON.stringify(generated.meta.decisions),
    '--objective', generated.meta.objective,
    '--actor', 'spec',
  )
  if (!fillDiscovery.ok) {
    return { taskId, status: 'draft', error: fillDiscovery.stderr, failedStep: 'fill-discovery', kanbanOk: false, kanbanError: null }
  }

  const discover = await runTask('discover', taskId, '--actor', 'spec')
  if (!discover.ok) {
    return { taskId, status: 'draft', error: discover.stderr, failedStep: 'discover', kanbanOk: false, kanbanError: null }
  }

  const approve = await runTask('approve', taskId, '--by', approvedBy)
  if (!approve.ok) {
    return { taskId, status: 'discovery', error: approve.stderr, failedStep: 'approve', kanbanOk: false, kanbanError: null }
  }

  const start = await runTask('start', taskId, '--actor', approvedBy)
  if (!start.ok) {
    return { taskId, status: 'approved', error: start.stderr, failedStep: 'start', kanbanOk: false, kanbanError: null }
  }

  const { kanbanOk, kanbanError } = await mirrorToKanban(taskId, title)
  return { taskId, status: 'executing', error: null, failedStep: null, kanbanOk, kanbanError }
}
