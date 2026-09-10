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
import { readDesignSession } from '@/lib/design-session'
import { errMsg } from '@/lib/errors'
import type { GeneratedPrd } from '@/lib/prd-generator'
import type { TaskEvidenceRef } from '@/lib/prd-pending'

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
  /** Evidence rail fix ⑥ (2026-09-04): stderr from best-effort `set-evidence`
   * runs that failed. Evidence is enrichment — a failed run never fails the
   * conversion — but it fails LOUD, collected here instead of vanishing. */
  evidenceErrors?: string[]
  /** Re-engineer Phase 5 (2026-09-05): failures from the best-effort
   * design-origin step (design.md copy + set-design-origin). Same discipline
   * as evidenceErrors — enrichment, loud, never fatal. */
  designErrors?: string[]
  /** 2026-09-08: failures from the best-effort PRD §6 acceptance import
   * (task.py import-acceptance). Same loud-not-fatal discipline. */
  acceptanceErrors?: string[]
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
  evidence?: TaskEvidenceRef[],
  /** Re-engineer Phase 5 (2026-09-05) — the room's reference-build design
   * session (from the pending PRD record). Present → the session's design.md
   * is copied next to the task's PRD and the task's design origin is set,
   * which finally calls task.py's implemented-but-orphaned set-design-origin
   * and lights TaskFocusView's DesignPreviewPanel. */
  design?: { designSessionId: string; designMdPath: string },
  /** Re-engineer Phase 8 (2026-09-06) — follow-on build linkage
   * (continue-to-backend): task.py's derived_from — "different goal, made
   * possible by the first" — never revision_of (that supersedes). */
  derivedFrom?: string,
): Promise<CreateTaskFromPrdResult> {
  const sourceMessage = `${title.trim()}\n\n${summary.trim()}`

  const created = await runTask(
    'new',
    sourceMessage,
    '--actor',
    approvedBy,
    ...(derivedFrom && /^TS-\d+$/.test(derivedFrom) ? ['--derived-from', derivedFrom] : []),
  )
  const idMatch = created.stdout.match(/TS-\d+/)
  if (!created.ok || !idMatch) {
    return { taskId: null, status: null, error: created.stderr || 'task.py new produced no TS id', failedStep: 'new', kanbanOk: false, kanbanError: null }
  }
  const taskId = idMatch[0]

  // ── Evidence block (evidence rail fix ⑥, 2026-09-04) ─────────────────────
  // Carry the chat proposal's artifacts into the TASK-SPEC's evidence block
  // BEFORE the PRD chain, so a chain that stalls later still records what the
  // task builds on. Best-effort by design: a failed set-evidence is collected
  // into evidenceErrors, never allowed to fail the conversion — the evidence
  // lives in the chat transcript either way.
  const evidenceErrors: string[] = []
  for (const a of (evidence ?? []).slice(0, 12)) {
    if (!a?.url) continue
    const label = a.label?.trim() || a.url.split('/').pop() || 'artifact'
    const r = await runTask('set-evidence', taskId, '--url', a.url, '--label', label, '--kind', a.kind || 'file', '--actor', approvedBy)
    if (!r.ok) evidenceErrors.push(r.stderr.slice(0, 200))
  }

  // ── Design origin (re-engineer Phase 5, 2026-09-05) ─────────────────────
  // The room's design session produced design.md (facts: reference profile,
  // intent, motion decision, build recipe). Copy it next to the task's PRD —
  // the PRD is generated from it, so the task carries both — then set the
  // task's design origin via task.py set-design-origin (--tool
  // reference-build). Best-effort like evidence: failures are collected,
  // loud, never fatal to the conversion.
  const designErrors: string[] = []
  if (design?.designSessionId && design.designMdPath) {
    const designRelPath = path.join('store', 'tasks', `${taskId}-design.md`)
    try {
      const md = await fs.promises.readFile(design.designMdPath, 'utf-8')
      await fs.promises.writeFile(path.join(REPO_ROOT, designRelPath), md)
      const r = await runTask(
        'set-design-origin', taskId,
        '--session', design.designSessionId,
        '--tool', 'reference-build',
        '--handoff', designRelPath,
        '--actor', approvedBy,
      )
      if (!r.ok) designErrors.push(r.stderr.slice(0, 200))
    } catch (e) {
      designErrors.push(`design.md copy from ${design.designMdPath} failed: ${errMsg(e)}`)
    }
  }

  // ── Product home stamp (re-engineer Phase 8 residual, 2026-09-06) ───────
  // Decision 3 made workspaces/<venture>/ the product home, and
  // scripts/run-task-suite.mjs derives product-root ONLY from workspaces/
  // produces paths — an unstamped record makes product-build skip and the
  // suite hard-fail on zero executed checks. So the convert chain stamps
  // WI-1's produces from the design session's venture. Session missing or
  // venture-less → loud note here, chain proceeds exactly as before.
  let producesArg: string | null = null
  if (design?.designSessionId) {
    const session = await readDesignSession(design.designSessionId)
    if (session?.venture) {
      producesArg = `workspaces/${session.venture}/`
    } else {
      designErrors.push(
        `design session ${design.designSessionId} has no venture — WI-1 produces not stamped; the suite's product checks will be skipped`,
      )
    }
  }

  // Write the real PRD file BEFORE set-prd — set-prd requires it to exist on disk.
  const prdRelPath = path.join('store', 'tasks', `${taskId}-prd.md`)
  try {
    await fs.promises.writeFile(path.join(REPO_ROOT, prdRelPath), generated.markdown)
  } catch (e) {
    return { taskId, status: 'draft', error: `wrote ${taskId} but failed to write its PRD file: ${errMsg(e)}`, failedStep: 'write-prd', kanbanOk: false, kanbanError: null, evidenceErrors, designErrors }
  }

  const setPrd = await runTask('set-prd', taskId, '--ref', prdRelPath, '--rice', String(generated.riceScore), '--actor', 'spec')
  if (!setPrd.ok) {
    return { taskId, status: 'draft', error: setPrd.stderr, failedStep: 'set-prd', kanbanOk: false, kanbanError: null, evidenceErrors, designErrors }
  }

  // ── Acceptance import (2026-09-08) ──────────────────────────────────────
  // The record's acceptance block starts as TEMPLATE's single empty
  // criterion; the PRD's §6 criteria never reached it, so the acceptance
  // card + build-progress bar showed "0/1" with a blank row for the whole
  // build. Import the PRD's numbered criteria into WI-1 right after set-prd.
  // Best-effort like evidence/design: a PRD whose §6 format drifted leaves
  // the block empty and fails LOUD here instead of silently.
  const acceptanceErrors: string[] = []
  const importAcc = await runTask('import-acceptance', taskId, '--prd', prdRelPath, '--actor', 'spec')
  if (!importAcc.ok) {
    acceptanceErrors.push(importAcc.stderr.slice(0, 300))
    console.error(`[convert] ${taskId} acceptance import failed:`, importAcc.stderr)
  }

  const fillDiscovery = await runTask(
    'fill-discovery', taskId,
    '--lead', generated.meta.lead,
    '--decisions', JSON.stringify(generated.meta.decisions),
    '--objective', generated.meta.objective,
    '--actor', 'spec',
    ...(producesArg ? ['--produces', producesArg] : []),
  )
  if (!fillDiscovery.ok) {
    return { taskId, status: 'draft', error: fillDiscovery.stderr, failedStep: 'fill-discovery', kanbanOk: false, kanbanError: null, evidenceErrors, designErrors, acceptanceErrors }
  }

  const discover = await runTask('discover', taskId, '--actor', 'spec')
  if (!discover.ok) {
    return { taskId, status: 'draft', error: discover.stderr, failedStep: 'discover', kanbanOk: false, kanbanError: null, evidenceErrors, designErrors, acceptanceErrors }
  }

  const approve = await runTask('approve', taskId, '--by', approvedBy)
  if (!approve.ok) {
    return { taskId, status: 'discovery', error: approve.stderr, failedStep: 'approve', kanbanOk: false, kanbanError: null, evidenceErrors, designErrors, acceptanceErrors }
  }

  const start = await runTask('start', taskId, '--actor', approvedBy)
  if (!start.ok) {
    return { taskId, status: 'approved', error: start.stderr, failedStep: 'start', kanbanOk: false, kanbanError: null, evidenceErrors, designErrors, acceptanceErrors }
  }

  const { kanbanOk, kanbanError } = await mirrorToKanban(taskId, title)
  return { taskId, status: 'executing', error: null, failedStep: null, kanbanOk, kanbanError, evidenceErrors, designErrors, acceptanceErrors }
}
