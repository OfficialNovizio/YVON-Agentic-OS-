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

const ALLOWED_COMMANDS = new Set(['block', 'unblock', 'review', 'note', 'gate', 'verify-pass'])
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

  let body: {
    cmd?: string
    reason?: string
    runner?: string
    event?: string
    note?: string
    // Re-engineer Phase 7: verify-pass verdicts — ref "WI-1:2", status from
    // the verify fence, evidence from the verifier's actual observation.
    verdicts?: { ref?: string; status?: string; evidence?: string }[]
  }
  try {
    body = (await request.json()) as typeof body
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

  // Re-engineer Phase 7: 'verify-pass' is the alignment loop's exit — a
  // composite that records each verify verdict (set-acceptance: aligned →
  // pass, gap → fail, evidence verbatim), then gate (executing → gated,
  // refuses when a produces path is missing — task.py's check, not ours),
  // then review (gated → review). Fail-fast with a per-step log: a half-run
  // is reported exactly where it stopped, never dressed up as a pass.
  if (cmd === 'verify-pass') {
    const verdicts = (Array.isArray(body.verdicts) ? body.verdicts : []).filter(
      (v) => v && typeof v.ref === 'string' && /^(.+):(\d+)$/.test(v.ref),
    )
    if (verdicts.length === 0) {
      return NextResponse.json({ ok: false, error: 'verify-pass needs verdicts[] with WI refs' }, { status: 400 })
    }
    const steps: { step: string; ok: boolean; detail?: string }[] = []
    const run = async (label: string, args: string[]) => {
      try {
        await execFileAsync('python3', [TASK_PY, ...args], {
          cwd: REPO_ROOT,
          timeout: 15_000,
          maxBuffer: 1024 * 1024,
        })
        steps.push({ step: label, ok: true })
        return true
      } catch (e) {
        steps.push({ step: label, ok: false, detail: (e instanceof Error ? e.message : String(e)).slice(0, 500) })
        return false
      }
    }
    for (const v of verdicts) {
      const m = /^(.+):(\d+)$/.exec(v.ref as string)!
      const status = v.status === 'aligned' ? 'pass' : 'fail'
      const evidence = (v.evidence ?? '').slice(0, 400) || `${status} from verify pass`
      // Refs are 1-based as the record displays them ("[WI-1:2]" = the second
      // criterion); task.py set-acceptance --i is 0-based (live-E2E fix
      // 2026-09-06: without the -1 every verdict landed one criterion down
      // and the last row crashed out of range, aborting the composite).
      const idx0 = String(Number(m[2]) - 1)
      const ok = await run(`set-acceptance ${v.ref} → ${status}`, [
        'set-acceptance', id, '--wi', m[1], '--i', idx0, '--status', status, '--evidence', evidence, '--actor', 'operator',
      ])
      if (!ok) {
        return NextResponse.json({ ok: false, error: `verify-pass stopped at set-acceptance for ${v.ref}`, steps }, { status: 502 })
      }
    }
    if (!(await run('gate (executing → gated)', ['gate', id, '--actor', 'operator']))) {
      return NextResponse.json({ ok: false, error: 'verify-pass recorded the verdicts but the gate step failed', steps }, { status: 502 })
    }
    if (!(await run('review (gated → review)', ['review', id, '--runner', 'operator']))) {
      return NextResponse.json({ ok: false, error: 'verify-pass gated but could not open review', steps }, { status: 502 })
    }
    return NextResponse.json({ ok: true, id, cmd, steps })
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
