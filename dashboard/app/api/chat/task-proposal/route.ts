// POST /api/chat/task-proposal
// Resolves a chat task-proposal prompt (see /api/chat/stream's marker
// parsing + TaskProposalPrompt.tsx). Two actions:
//
//   { action: 'dismiss', roomId, correlation }
//     Answered No / Discuss more. Emits task.proposal.dismissed so a page
//     reload doesn't re-show a resolved prompt. Never blocks the chat.
//
//   { action: 'accept', title, summary, roomId, correlation }
//     Answered Yes. Creates a REAL governed TASK-SPEC draft via
//     `cli/task.py new` — the same script `cli/task.sh new` already wraps;
//     chat just calls it programmatically instead of a human typing it —
//     and mirrors a card into the Hermes Kanban board (what
//     dashboard/app/task-board/page.tsx renders) so it's visible where the
//     user already looks too. "Both — bridge", per operator direction
//     2026-08-11. Full-gate: this only ever creates status=draft — nothing
//     is auto-approved. The rest of the state machine (discover/approve/
//     start/gate/done) still runs through the normal CLI, untouched.
//
// GET /api/chat/task-proposal?roomId=<id>
// Evidence rail fix ① rehydration (2026-09-04): the live task.proposed frame
// only exists during the turn's SSE stream — a page opened after that misses
// the prompt entirely. This replays the room's proposal lifecycle from the
// events table: the latest task.proposed is returned unless a resolution
// event (accepted / dismissed / PRD generated / PRD discarded) is newer, in
// which case there is nothing pending. Same shape the stream's
// task.proposed frame produces, so the prompt card looks identical rehydrated
// or live.
//
// Owner: dev · chat-as-task feature, 2026-08-11 · GET rehydration 2026-09-04

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase-server'
import { activeWorkspace, type WorkspaceKey } from '@/lib/workspaces'
import { createTaskSpecAndMirror } from '@/lib/create-task-spec'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Body {
  action?: string
  title?: string
  summary?: string
  correlation?: string
  roomId?: string
}

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const userId = user.id // hoisted: TS doesn't narrow `user` inside closures defined below

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const { action, title, summary, correlation, roomId } = body
  if (!roomId) return NextResponse.json({ error: 'roomId is required' }, { status: 400 })

  // Same venture-cookie resolution as /api/chat/stream — needed for the
  // events-table context_id on both actions.
  const cookieStore = await cookies()
  let validVentureSlugs: string[] = []
  try {
    const { data: ventureRows } = await supabase.from('ventures').select('slug')
    validVentureSlugs = ((ventureRows as unknown as { slug: string }[] | null) ?? []).map((r) => r.slug)
  } catch {
    // fall through with yvon-os only
  }
  const workspace: WorkspaceKey = activeWorkspace(cookieStore.get('yvon_active_venture')?.value, validVentureSlugs)

  async function emitEvent(kind: string, payload: Record<string, unknown>) {
    try {
      await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
      }).rpc('chat_emit_task_proposal_event', {
        p_context_id: workspace,
        p_correlation: correlation ?? null,
        p_room_id: roomId,
        p_author_id: userId,
        p_payload: payload,
        p_kind: kind,
      })
    } catch {
      // observability never breaks the request
    }
  }

  if (action === 'dismiss') {
    await emitEvent('task.proposal.dismissed', {})
    return NextResponse.json({ ok: true })
  }

  if (action !== 'accept') {
    return NextResponse.json({ error: `unknown action: ${action}` }, { status: 400 })
  }

  if (!title?.trim() || !summary?.trim()) {
    return NextResponse.json({ error: 'title and summary are required to accept a task proposal' }, { status: 400 })
  }

  const { taskId, taskSpecError, kanbanOk, kanbanError } = await createTaskSpecAndMirror(title, summary)

  await emitEvent('task.proposal.accepted', { title: title.trim(), summary: summary.trim(), taskId, kanbanOk })

  if (!taskId) {
    // The governed record is the one thing that must not silently fail.
    return NextResponse.json(
      { ok: false, error: `TASK-SPEC creation failed: ${taskSpecError}`, kanbanOk, kanbanError },
      { status: 502 },
    )
  }

  // Execution gate (2026-08-21, concern #5, chat_rooms_execution_gate
  // migration): the user just explicitly said "yes, make this a task" —
  // that's the sign-off stream/route.ts's discussion-only gate is waiting
  // for. Unlock this room so its NEXT turn onward gets real repo/tool
  // access. Via RPC, not a plain .update() — chat_rooms' only UPDATE RLS
  // policy is scoped to kind='thread' AND owner_user_id=auth.uid(), so a
  // direct update would silently no-op for Workforce/department/agent
  // rooms (0 rows, no error). Best-effort: if this fails, the task record
  // itself (the thing that must not silently fail) is already safely
  // created above — worst case the room just stays discussion-only until
  // a retry/reload.
  try {
    await (supabase as unknown as {
      rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
    }).rpc('chat_room_unlock_execution', { p_room_id: roomId, p_task_id: taskId })
  } catch {
    // best-effort — see comment above
  }

  return NextResponse.json({ ok: true, taskId, kanbanOk, kanbanError: kanbanOk ? null : kanbanError })
}

// ── GET — proposal rehydration (evidence rail fix ①, 2026-09-04) ─────────────
const PROPOSAL_KINDS = ['task.proposed', 'task.proposal.accepted', 'task.proposal.dismissed', 'prd.proposal.generated', 'prd.proposal.discarded']
const RESOLUTION_KINDS = new Set(['task.proposal.accepted', 'task.proposal.dismissed', 'prd.proposal.generated', 'prd.proposal.discarded'])

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url)
  const roomId = searchParams.get('roomId')?.trim()
  if (!roomId) return Response.json({ error: 'roomId required' }, { status: 400 })

  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'unauthorized' }, { status: 401 })

  // Room-visibility guard, same spirit as events/route.ts's chat_messages
  // probe: RLS on chat_rooms decides whether the caller may see this room at
  // all — an id alone must never leak another room's proposal.
  const { data: roomRows } = await supabase.from('chat_rooms').select('id').eq('id', roomId).limit(1)
  if (!roomRows || roomRows.length === 0) return Response.json({ error: 'not found' }, { status: 404 })

  // The RPC chat_emit_task_proposal_event embeds room_id inside payload, so
  // room scoping is a payload filter (same convention page.tsx's past-turn
  // effect already uses for artifact rows).
  const { data, error } = await supabase
    .from('events')
    .select('ts, kind, payload')
    .filter('payload->>room_id', 'eq', roomId)
    .in('kind', PROPOSAL_KINDS)
    .order('ts', { ascending: false })
    .limit(30)

  if (error) return Response.json({ error: String(error.message ?? error) }, { status: 500 })

  const rows = (data as unknown as { ts: string; kind: string; payload: Record<string, unknown> }[] | null) ?? []
  const latestProposed = rows.find((r) => r.kind === 'task.proposed')
  if (!latestProposed) return Response.json({ proposal: null })

  // Resolved? Any resolution event strictly newer than the latest proposal
  // means the prompt was already answered (Yes → PRD path, No/Discuss more,
  // or a PRD that was itself generated/discarded) — nothing to re-show.
  const proposedTs = Date.parse(latestProposed.ts)
  const resolved = rows.some((r) => RESOLUTION_KINDS.has(r.kind) && Date.parse(r.ts) > proposedTs)
  if (resolved) return Response.json({ proposal: null })

  const p = latestProposed.payload
  const title = typeof p.title === 'string' ? p.title : ''
  const summary = typeof p.summary === 'string' ? p.summary : ''
  if (!title || !summary) return Response.json({ proposal: null })

  // artifacts[] arrived with the evidence rail (2026-09-04) — proposals from
  // before it simply have none.
  const rawArtifacts = Array.isArray(p.artifacts) ? p.artifacts : []
  const artifacts = rawArtifacts
    .filter((a): a is { url: string; label?: string; kind?: string } => !!a && typeof (a as { url?: unknown }).url === 'string')
    .slice(0, 12)
    .map((a) => ({
      url: a.url,
      label: typeof a.label === 'string' && a.label ? a.label : a.url.split('/').pop() || 'artifact',
      kind: typeof a.kind === 'string' ? a.kind : undefined,
    }))

  return Response.json({
    proposal: {
      title,
      summary,
      correlation: typeof p.correlation === 'string' ? p.correlation : null,
      artifacts,
    },
  })
}
