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
import path from 'path'
import { hermesConfig } from '@/lib/hermes-client'
import { errMsg } from '@/lib/errors'

const execFileAsync = promisify(execFile)

const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')

export interface CreateTaskResult {
  taskId: string | null
  taskSpecError: string | null
  kanbanOk: boolean
  kanbanError: string | null
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
  let kanbanOk = false
  let kanbanError: string | null = null
  const cfg = hermesConfig()
  if (cfg.configured && cfg.url && cfg.token) {
    try {
      const res = await fetch(`${cfg.url}/api/hermes/plugins/kanban/tasks`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${cfg.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: taskId ? `${taskId} · ${title.trim()}` : title.trim() }),
      })
      kanbanOk = res.ok
      if (!res.ok) kanbanError = `Hermes Kanban responded ${res.status}`
    } catch (e) {
      kanbanError = errMsg(e)
    }
  } else {
    kanbanError = cfg.reason ?? 'Hermes not configured'
  }

  return { taskId, taskSpecError, kanbanOk, kanbanError }
}
