// POST /api/chat/task-kickoff  body: { taskId, roomId?, mode?, gaps? }
// Re-engineer Phase 6+7 (2026-09-05/06): the execution loop's server half.
//
// Three modes, one governed path — every turn is a real chat turn the client
// then streams via GET /api/chat/stream?userMessageId=<id>:
//   build  (default)  Start-build: the builder turn (Phase 6).
//   verify            Alignment loop: the [TASK VERIFY] turn — the agent
//                     checks the real output against the user's verbatim
//                     asks + each acceptance criterion and ends with a
//                     ```design-gate {"stage":"verify"} fence the stream
//                     route parses into the design.verify frame. No building.
//   fix               Fix-gaps: the gap list from the verify card rides the
//                     message; the [ACTIVE TASK] block re-grounds the builder.
//
// A TASK-SPEC in `executing` is still prose until something actually sends a
// turn the builder can execute against. This route is that something: it
// inserts the turn's user-message into the room that holds the task's
// execution gate (chat_rooms.execution_task_id) — the stream route derives
// every payload from disk (task.py list + design session + room messages),
// never from client input.
//
// Room resolution is server-authoritative: the turn goes to the room whose
// execution gate is actually pointed at this task. A client-supplied roomId
// that doesn't match is refused (409), not silently overridden — a turn
// landing in a room without the gate would run as an ordinary unsteered turn,
// which is exactly the failure Phase 6 exists to close.
//
// Owner: dev · re-engineer Phase 6/7 execution wiring, 2026-09-05/06

import { cookies } from 'next/headers'
import { randomUUID } from 'crypto'
import { execFile } from 'child_process'
import { promisify } from 'util'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { activeWorkspace } from '@/lib/workspaces'
import { errMsg } from '@/lib/errors'

const execFileAsync = promisify(execFile)
const REPO_ROOT = path.resolve(process.cwd(), '..')

interface TaskListRow {
  id: string
  status: string
  sourceMessage?: string
}

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  let body: { taskId?: string; roomId?: string; mode?: string; gaps?: string[] }
  try {
    body = (await request.json()) as { taskId?: string; roomId?: string; mode?: string; gaps?: string[] }
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }
  const taskId = body.taskId?.trim() ?? ''
  if (!/^TS-\d+$/.test(taskId)) {
    return NextResponse.json({ error: 'taskId is required (TS-NNN)' }, { status: 400 })
  }
  const mode = body.mode === 'verify' || body.mode === 'fix' ? body.mode : 'build'
  // Fix mode carries the verify card's gap list into the turn text — the
  // [ACTIVE TASK] block re-grounds the builder on the task itself.
  const gaps = (Array.isArray(body.gaps) ? body.gaps : [])
    .map((g) => String(g).trim())
    .filter(Boolean)
    .slice(0, 12)
  if (mode === 'fix' && gaps.length === 0) {
    return NextResponse.json({ error: 'fix mode requires gaps[]' }, { status: 400 })
  }

  // ── 1. The task must be real and executing ────────────────────────────────
  // task.py list is the only read interface (same source the stream route's
  // [ACTIVE TASK] derivation uses seconds later — one parser, no drift).
  let task: TaskListRow | undefined
  try {
    const { stdout } = await execFileAsync('python3', [path.join(REPO_ROOT, 'cli', 'task.py'), 'list'], {
      cwd: REPO_ROOT,
      timeout: 15_000,
      maxBuffer: 10 * 1024 * 1024,
    })
    task = (JSON.parse(stdout) as TaskListRow[]).find((r) => r.id === taskId)
  } catch (e) {
    return NextResponse.json({ error: `task.py list failed: ${errMsg(e)}` }, { status: 500 })
  }
  if (!task) return NextResponse.json({ error: `${taskId} not found` }, { status: 404 })
  if (task.status !== 'executing') {
    return NextResponse.json(
      { error: `${taskId} is ${task.status}, not executing — start it before kicking off a build` },
      { status: 409 },
    )
  }

  // ── 2. The room that holds this task's execution gate ─────────────────────
  const { data: gateRows } = await supabase
    .from('chat_rooms')
    .select('id, execution_unlocked_at')
    .eq('execution_task_id', taskId)
    .order('execution_unlocked_at', { ascending: false, nullsFirst: false })
    .limit(1)
  const gatedRoom = ((gateRows as unknown as { id: string; execution_unlocked_at: string | null }[] | null) ?? [])[0]
  if (!gatedRoom?.execution_unlocked_at) {
    return NextResponse.json(
      { error: `${taskId} has no execution-unlocked room — convert an approved proposal into it first` },
      { status: 409 },
    )
  }
  const roomId = gatedRoom.id
  if (body.roomId?.trim() && body.roomId.trim() !== roomId) {
    return NextResponse.json(
      { error: `roomId mismatch: the execution gate for ${taskId} lives in another room`, executionRoomId: roomId },
      { status: 409 },
    )
  }

  // ── 3. The kickoff turn — same insert path as /api/chat/send ──────────────
  const { data: profile } = await supabase
    .from('profiles')
    .select('username, email')
    .eq('id', user.id)
    .single()
  const profileRow = profile as unknown as { username?: string; email?: string } | null
  const authorName = profileRow?.username || (profileRow?.email ?? 'unknown').split('@')[0]

  const correlation = randomUUID()
  // Short and human-readable: the heavy payload (task facts, design.md,
  // recipe, acceptance criteria, verify contract) arrives via the stream
  // route's blocks, derived from disk — the message row only has to say what
  // happened so the chat transcript reads honestly. The [TASK VERIFY] /
  // [TASK FIX] markers are load-bearing: the stream route detects them to
  // switch its payload assembly for this turn.
  const content =
    mode === 'verify'
      ? `[TASK VERIFY] ${taskId} — verify the finished build against the user's original asks and each acceptance criterion.` +
        ` Inspect the real output (files, rendered result), do not modify anything, and end with the verify verdict fence.`
      : mode === 'fix'
        ? `[TASK FIX] ${taskId} — fix these gaps from the verify pass:\n` +
          gaps.map((g, i) => `${i + 1}. ${g.slice(0, 300)}`).join('\n') +
          `\nThen report against each acceptance criterion again.`
        : `Start build on ${taskId} — begin execution now.` +
          ` Load the recipe's named skills and libraries before writing code,` +
          ` build in the repo checkout, and end with a per-criterion status report` +
          ` against the acceptance criteria.`

  const { data: userMsg, error: userErr } = await supabase
    .from('chat_messages')
    .insert({
      room_id: roomId,
      author_kind: 'user',
      author_id: user.id,
      author_name: authorName,
      content,
      mentions: [],
      correlation,
    })
    .select('id, created_at')
    .single()
  if (userErr) {
    const code = (userErr as { code?: string })?.code
    if (code === '42501' || String((userErr as { message?: string })?.message ?? '').includes('row-level security')) {
      return NextResponse.json({ error: "you don't have access to this room" }, { status: 403 })
    }
    return NextResponse.json(
      { error: String((userErr as { message?: string })?.message ?? userErr) },
      { status: 500 },
    )
  }
  const row = userMsg as { id: string; created_at: string } | null
  if (!row?.id) {
    return NextResponse.json({ error: 'kickoff message saved without an id' }, { status: 500 })
  }

  // ── 4. Observability — same conversation event every send emits ───────────
  const cookieStore = await cookies()
  let validVentureSlugs: string[] = []
  try {
    const { data: ventureRows } = await supabase.from('ventures').select('slug')
    validVentureSlugs = ((ventureRows as unknown as { slug: string }[] | null) ?? []).map((r) => r.slug)
  } catch {
    // fall through with yvon-os only
  }
  const contextId = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)
  try {
    await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
    }).rpc('chat_emit_conversation_event', {
      p_context_id: contextId,
      p_correlation: correlation,
      p_room_id: roomId,
      p_author_id: user.id,
      p_kind: 'chat.conversation',
      p_preview: content.slice(0, 120),
    })
  } catch {
    // observability never breaks the kickoff
  }

  return NextResponse.json({
    ok: true,
    taskId,
    mode,
    roomId,
    correlation,
    userMessage: { id: row.id, createdAt: row.created_at },
  })
}
