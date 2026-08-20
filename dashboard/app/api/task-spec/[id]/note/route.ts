// POST /api/task-spec/[id]/note
//
// Backs the three task-detail lifecycle actions (docs/PRD-task-detail-lifecycle-actions.md
// §3.3): Retry and Redo write a history entry here BEFORE navigating back to the
// originating chat room; Make Changes navigates only and does not call this route.
//
// Shells out to `cli/task.py note <id> --event <event> --actor <actor> --note <note>`,
// the same execFile technique the sibling GET route uses for `list` — task.py owns the
// only parser/writer for this YAML (no pyyaml dependency, by design). Never writes the
// YAML from TypeScript directly.
//
// Body: { event: 'retry_opened' | 'redo_opened' | 'changes_requested', note?: string }
// actor is not accepted from the client — always 'operator' server-side (matches the
// convention already used by real records: TS-009/TS-028's gate_0_signoffs both list
// 'operator', not an invented named agent).
//
// Owner: dev · task-detail-lifecycle-actions, 2026-08-18

import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_EVENTS = new Set(['retry_opened', 'redo_opened', 'changes_requested'])

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!/^TS-\d+$/.test(id)) {
    return NextResponse.json({ ok: false, error: `invalid task id: ${id}` }, { status: 400 })
  }

  let body: { event?: string; note?: string }
  try {
    body = (await request.json()) as { event?: string; note?: string }
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const event = body.event ?? ''
  if (!ALLOWED_EVENTS.has(event)) {
    return NextResponse.json(
      { ok: false, error: `event must be one of: ${[...ALLOWED_EVENTS].join(', ')}` },
      { status: 400 },
    )
  }
  const note = (body.note ?? '').slice(0, 500)

  try {
    await execFileAsync(
      'python3',
      [TASK_PY, 'note', id, '--event', event, '--actor', 'operator', '--note', note],
      { cwd: REPO_ROOT, timeout: 15_000, maxBuffer: 1024 * 1024 },
    )
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    // Same discipline as the GET route: a failed write is a loud error, never
    // a silently-swallowed no-op — the UI must not proceed to navigate as if
    // the history entry was recorded when it wasn't (PRD §6 acceptance criteria).
    return NextResponse.json({ ok: false, error }, { status: 502 })
  }

  return NextResponse.json({ ok: true, id, event })
}
