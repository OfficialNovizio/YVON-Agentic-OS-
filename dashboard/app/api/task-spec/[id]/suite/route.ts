// POST /api/task-spec/[id]/suite  body: { swap?: 'swapped' | 'waived' }
// Re-engineer Phase 8 (2026-09-06) — the company loop's HTTP surface: spins
// scripts/run-task-suite.mjs, which runs the mechanical checks (produces on
// disk, product build, task/product Playwright suites when they exist), writes
// store/runs/run-N.md, and lets task.py suite close review → done (or record
// the failure and stay in review). The run record IS the proof; this route
// never writes task YAML itself.
//
// Asset-swap gate (decision 1, enforced here with a loud degrade): when the
// task's design session built with the reference's own assets (hybrid), real
// delivery requires the swap list resolved. The suite refuses to start until
// the caller confirms 'swapped' or explicitly 'waives' — and the choice is
// recorded as an append-only history event on the design session, so the
// waiver is visible forever, not silently absorbed.
//
// Owner: dev · re-engineer Phase 8 company loop, 2026-09-06

import { cookies } from 'next/headers'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { readDesignSession, updateDesignSession } from '@/lib/design-session'
import { errMsg } from '@/lib/errors'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const RUNNER = path.join(REPO_ROOT, 'scripts', 'run-task-suite.mjs')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// The runner's own build/spec steps cap at 300s each; the route allows the
// full worst case once (build + specs in one run).
const SUITE_TIMEOUT_MS = 480_000

interface SuiteCheck {
  name: string
  state: 'pass' | 'fail' | 'skipped'
  detail?: string
}
interface RunnerOk {
  ok: true
  taskId: string
  result: 'pass' | 'fail'
  run: string
  checks: SuiteCheck[]
  nextStatus: string
}
interface SwapAsset {
  kind?: string
  what?: string
  origin?: string
  note?: string
}
/** task.py list row — only the fields this route reads. */
interface TaskListRow {
  id: string
  status: string
  designSessionId?: string | null
}

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { id } = await context.params
  if (!/^TS-\d+$/.test(id)) {
    return NextResponse.json({ ok: false, error: `invalid task id: ${id}` }, { status: 400 })
  }

  let body: { swap?: string }
  try {
    body = (await request.json().catch(() => ({}))) as { swap?: string }
  } catch {
    body = {}
  }

  // The task must be real and in review — the runner enforces this too, but
  // the operator deserves the message from the route that owns the action.
  let row: TaskListRow | undefined
  try {
    const { stdout } = await execFileAsync('python3', [path.join(REPO_ROOT, 'cli', 'task.py'), 'list'], {
      cwd: REPO_ROOT,
      timeout: 20_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    row = (JSON.parse(stdout) as TaskListRow[]).find((r) => r.id === id)
  } catch (e) {
    return NextResponse.json({ ok: false, error: `task.py list failed: ${errMsg(e)}` }, { status: 500 })
  }
  if (!row) return NextResponse.json({ ok: false, error: `${id} not found` }, { status: 404 })
  if (row.status !== 'review') {
    return NextResponse.json(
      { ok: false, error: `${id} is ${row.status ?? 'unknown'}, not review — the suite only runs against an open review` },
      { status: 409 },
    )
  }

  // ── Asset-swap gate (decision 1) ───────────────────────────────────────────
  // Hybrid builds borrowed the reference's own assets; the recipe's swap list
  // names exactly what must be replaced before real delivery. No confirmation
  // → the suite doesn't start, and the response carries the list so the card
  // can show WHAT needs swapping. A waiver is recorded, never swallowed.
  let swapList: SwapAsset[] = []
  if (row.designSessionId) {
    const session = await readDesignSession(row.designSessionId)
    const recipe = (session?.recipe ?? {}) as { assetPlan?: SwapAsset[]; assetsNeedSwapping?: number }
    swapList = (recipe.assetPlan ?? []).filter((a) => a && (a as { swapRequired?: boolean }).swapRequired === true)
    if (swapList.length === 0 && typeof recipe.assetsNeedSwapping === 'number' && recipe.assetsNeedSwapping > 0) {
      swapList = [{ what: `${recipe.assetsNeedSwapping} asset group(s) flagged swapRequired (plan detail unavailable)` }]
    }
    if (swapList.length > 0) {
      const swap = body.swap
      if (swap !== 'swapped' && swap !== 'waived') {
        return NextResponse.json(
          {
            ok: false,
            error:
              'This build used the reference’s own assets — confirm the swap before the suite runs for delivery',
            swapRequired: true,
            swapList,
          },
          { status: 409 },
        )
      }
      const recorded = await updateDesignSession(
        row.designSessionId,
        {},
        'swap_gate',
        swap === 'swapped'
          ? 'confirmed — reference assets replaced with licensed/AI/stock equivalents before the delivery suite'
          : 'waived for delivery — operator accepted reference assets shipping as-is',
      )
      if (!recorded) {
        // The gate's whole point is the visible record; a waiver we couldn't
        // write is a gate that didn't happen. Loud 502, suite not started.
        return NextResponse.json(
          { ok: false, error: 'could not record the swap decision on the design session — suite not started' },
          { status: 502 },
        )
      }
    }
  }

  // ── The runner owns the checks, the run record, and the transition ────────
  try {
    const { stdout, stderr } = await execFileAsync('node', [RUNNER, '--task', id], {
      cwd: REPO_ROOT,
      timeout: SUITE_TIMEOUT_MS,
      maxBuffer: 8 * 1024 * 1024,
    })
    const parsed = JSON.parse(stdout) as Partial<RunnerOk> & { error?: string }
    if (!parsed?.ok) {
      return NextResponse.json(
        { ok: false, error: parsed?.error ?? 'suite runner reported failure without detail', checks: parsed?.checks },
        { status: 502 },
      )
    }
    const { ok: _runnerOk, ...rest } = parsed as RunnerOk
    return NextResponse.json({ ok: true, ...rest })
  } catch (e) {
    // execFile rejection carries stdout/stderr of the dead process — the tail
    // usually names the exact check that broke.
    const raw = `${(e as { stdout?: string })?.stdout ?? ''}\n${stderrTail(e)}`.trim()
    return NextResponse.json(
      { ok: false, error: `suite runner failed: ${errMsg(e)} — ${raw.slice(-400)}` },
      { status: 502 },
    )
  }
}

function stderrTail(e: unknown): string {
  const anyErr = e as { stderr?: string }
  return (anyErr?.stderr ?? '').slice(-300)
}
