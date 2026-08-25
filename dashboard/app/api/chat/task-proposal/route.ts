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
// Owner: dev · chat-as-task feature, 2026-08-11

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
