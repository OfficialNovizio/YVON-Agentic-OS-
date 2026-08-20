// GET /api/task-spec?roomId=<uuid>
//
// Real governed TASK-SPEC records (store/tasks/TS-NNN.yaml) — the source of
// truth, NOT the Kanban mirror (/api/task-board reads Supabase execution_steps
// and only backs the sidebar badge count + the /task-board page's own fetch)
// and NOT the legacy, currently-unused per-venture /api/tasks route.
//
// Shells out to `cli/task.py list` — the same execFile technique
// lib/create-task-spec.ts already uses to WRITE records, just for reading.
// task.py owns the only parser for this YAML (no pyyaml dependency, by
// design — see its own header comment), so this route defers to it rather
// than re-implementing YAML parsing in TypeScript.
//
// Room scoping: task.py's records have no "which chat" field at all — the
// only place that link exists is the events table, written by
// chat_emit_task_proposal_event (107_chat_task_proposal.sql) when a proposal
// is accepted (kind='task.proposal.accepted', payload.room_id, payload.taskId).
// So ?roomId cross-references that table to flag which tasks trace back to
// this room; it never invents the link if the lookup fails or finds nothing —
// `fromRoom` is left undefined, not defaulted to false, so the UI can tell
// "not from this room" apart from "couldn't check."
//
// Owner: dev · task-section-in-chat feature, 2026-08-18

import { NextRequest, NextResponse } from 'next/server'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import fs from 'fs'
import { supabaseServer } from '@/lib/supabase-server'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')
const TASK_PY = path.join(REPO_ROOT, 'cli', 'task.py')

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export type TaskStage = 'draft' | 'discovery' | 'approved' | 'executing' | 'gated' | 'done'

export interface TaskSpecWorkItem {
  id: string
  owner: string
  objective: string
}

export interface TaskHistoryEntry {
  ts: string
  actor: string
  event: string
  note: string
}

export interface TaskSpecItem {
  id: string
  status: TaskStage
  sourceMessage: string
  requester: string
  taskType: string
  departments: string[]
  lead: string
  discoveryQuestions: string[]
  workItems: TaskSpecWorkItem[]
  exitOwner: string
  exitProof: string
  approvedBy: string
  approvedAt: string
  nextBlocking: string
  active: boolean
  /** undefined = not checked (no roomId passed, or the lookup itself failed) */
  fromRoom?: boolean
  /** 2026-08-18 (docs/PRD-task-detail-lifecycle-actions.md) — additive fields,
   * absent/empty on records written before that date, never invented. */
  createdAt: string
  revisionOf: string
  gate0: boolean
  gate0Signoffs: string[]
  history: TaskHistoryEntry[]
  /** the room this task actually traces back to, regardless of ?roomId — resolved
   * from the same events cross-reference as fromRoom, just not scoped to one room.
   * undefined = no task.proposal.accepted event found for this task, or the lookup failed. */
  roomId?: string
  /** 2026-08-18 — full content of store/tasks/{id}-prd.md, when that file exists on
   * disk (opt-in, per task — no PRD is auto-generated). undefined = no such file,
   * which the frontend must render as an honest "not available" state, never faked. */
  prdContent?: string
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const roomId = url.searchParams.get('roomId')

  let tasks: TaskSpecItem[]
  try {
    const { stdout } = await execFileAsync('python3', [TASK_PY, 'list'], {
      cwd: REPO_ROOT,
      timeout: 15_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    tasks = JSON.parse(stdout) as TaskSpecItem[]
  } catch (e) {
    const error = e instanceof Error ? e.message : String(e)
    // The governed records are the one thing this route must not fake —
    // fail loudly rather than fall back to any mock list.
    return NextResponse.json({ tasks: [], source: 'error', error }, { status: 502 })
  }

  let roomTaskIds: Set<string> | null = null
  let roomLookupError: string | null = null
  // taskId -> room_id for EVERY task with a proposal-accepted event, not just
  // ones from ?roomId — this is what lets the task-detail lifecycle actions
  // (Make Changes / Retry / Redo) navigate to a task's origin room regardless
  // of which room the operator opened the Tasks panel from.
  let taskRoomMap: Map<string, string> | null = null
  try {
    const supabase = await supabaseServer()
    const { data, error: qErr } = await supabase
      .from('events')
      .select('payload')
      .eq('kind', 'task.proposal.accepted')
    if (qErr) throw qErr
    taskRoomMap = new Map(
      ((data ?? []) as { payload: Record<string, unknown> | null }[])
        .map((r) => [r.payload?.taskId as string | undefined, r.payload?.room_id as string | undefined])
        .filter((pair): pair is [string, string] => Boolean(pair[0]) && Boolean(pair[1])),
    )
    if (roomId) {
      roomTaskIds = new Set([...taskRoomMap.entries()].filter(([, r]) => r === roomId).map(([t]) => t))
    }
  } catch (e) {
    roomLookupError = e instanceof Error ? e.message : String(e)
    // Room-scoping is layered on top of the real source of truth — never
    // fail the whole response because the cross-reference couldn't resolve.
  }

  const readPrd = (id: string): string | undefined => {
    // Opt-in per task, disk-checked — never invented. Convention:
    // store/tasks/{id}-prd.md, same directory as the record itself.
    try {
      const p = path.join(REPO_ROOT, 'store', 'tasks', `${id}-prd.md`)
      if (!fs.existsSync(p)) return undefined
      return fs.readFileSync(p, 'utf-8')
    } catch {
      return undefined
    }
  }

  const withScope: TaskSpecItem[] = tasks.map((t) => ({
    ...t,
    fromRoom: roomId ? (roomTaskIds ? roomTaskIds.has(t.id) : undefined) : undefined,
    roomId: taskRoomMap?.get(t.id),
    prdContent: readPrd(t.id),
  }))

  return NextResponse.json({
    tasks: withScope,
    source: 'live',
    roomId: roomId ?? null,
    roomLookupError,
  })
}
