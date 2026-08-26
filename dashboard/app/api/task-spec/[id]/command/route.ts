// POST /api/task-spec/[id]/command
//
// v4 (2026-08-24, "One Request, End to End" artifact, beats 10–12): the
// interactive lifecycle surface — Block (sidecar), Unblock, Open review,
// and note (extended with criterion_deferred). Suite runs stay CLI-side
// (`task.sh suite --run <path>`) because the proof IS the run record file.
//
// Same discipline as the sibling note route: shells out to `cli/task.py`
// (task.py owns the only parser/writer for this YAML — never write it from
// TypeScript directly), actor is always 'operator' server-side, and a failed
// write is a loud 502, never a silently-swallowed no-op.
//
// Owner: dev · task-surface v4, 2026-08-24

import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_COMMANDS = new Set(['block', 'unblock', 'review', 'note'])
const ALLOWED_NOTE_EVENTS = new Set([
  'retry_opened',
  'redo_opened',
  'changes_requested',
  'criterion_deferred',
])

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  if (!/^TS-\d+$/.test(id)) {
    return NextResponse.json({ ok: false, error: `invalid task id: ${id}` }, { status: 400 })
  }

  let body: { cmd?: string; reason?: string; runner?: string; event?: string; note?: string }
  try {
    body = (await request.json()) as { cmd?: string; reason?: string; runner?: string; event?: string; note?: string }
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid JSON body' }, { status: 400 })
  }

  const cmd = body.cmd ?? ''
  if (!ALLOWED_COMMANDS.has(cmd)) {
    return NextResponse.json(
      { ok: false, error: `cmd must be one of: ${[...ALLOWED_COMMANDS].join(', ')}` },
      { status: 400 },
    )
  }

  const args: string[] = [cmd, id]
  if (cmd === 'block') {
    const reason = (body.reason ?? '').slice(0, 300)
    if (!reason.trim()) {
      return NextResponse.json({ ok: false, error: 'block needs a reason' }, { status: 400 })
    }
    args.push('--reason', reason)
  } else if (cmd === 'review') {
    args.push('--runner', 'operator')
  } else if (cmd === 'note') {
    const event = body.event ?? ''
    if (!ALLOWED_NOTE_EVENTS.has(event)) {
      return NextResponse.json(
        { ok: false, error: `event must be one of: ${[...ALLOWED_NOTE_EVENTS].join(', ')}` },
        { status: 400 },
      )
    }
    args.push('--event', event, '--note', (body.note ?? '').slice(0, 500))
  } else {
    args.push('--actor', 'operator')
  }

  try {
    await execFileAsync('python3', [TASK_PY, ...args], {
      cwd: REPO_ROOT,
      timeout: 15_000,
      maxBuffer: 1024 * 1024,
    })
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error }, { status: 502 })
  }

  return NextResponse.json({ ok: true, id, cmd })
}
