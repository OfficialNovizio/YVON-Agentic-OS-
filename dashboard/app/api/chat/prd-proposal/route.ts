// POST /api/chat/prd-proposal
// docs/PRD-prd-gated-task-conversion.md — the PRD-gate step now required
// before /api/chat/task-proposal's "accept" is allowed to create a real
// TASK-SPEC. Three actions:
//
//   { action: 'generate', title, summary, roomId, correlation }
//     spec runs prd-discipline + backlog-rules for real (prd-generator.ts)
//     against the chat discussion, writes a pending PRD (not a TASK-SPEC —
//     nothing governed exists yet), and returns it for the operator to
//     read in chat. Emits prd.proposal.generated (observability only).
//
//   { action: 'convert', pendingId, roomId, correlation, requestedBy }
//     Operator said yes. Runs createTaskFromPrd — new → PRD file → set-prd →
//     fill-discovery → discover → approve → start, all the way to
//     `executing` — then discards the pending record. Emits
//     task.proposal.accepted (same event kind task-spec/route.ts already
//     cross-references for room linkage, so Make Changes/Retry/Redo work
//     identically for a PRD-converted task).
//
//   { action: 'discard', pendingId, roomId, correlation }
//     Operator said no / wants to keep discussing. Deletes the pending PRD.
//     No TASK-SPEC record is ever written for a discarded proposal.
//
// Owner: dev · prd-gated-task-conversion, 2026-08-18

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { supabaseServer } from '@/lib/supabase-server'
import { activeWorkspace, type WorkspaceKey } from '@/lib/workspaces'
import { generatePrd } from '@/lib/prd-generator'
import { writePendingPrd, readPendingPrd, discardPendingPrd, type TaskEvidenceRef } from '@/lib/prd-pending'
import { findLatestSessionByRoom, renderDesignMd } from '@/lib/design-session'
import { createTaskFromPrd } from '@/lib/create-task-spec'
import { errMsg } from '@/lib/errors'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Body {
  action?: string
  title?: string
  summary?: string
  pendingId?: string
  correlation?: string
  roomId?: string
  /** Evidence rail fix ⑥ (2026-09-04): the proposal's artifacts[], forwarded
   * by TaskProposalPrompt on 'generate' so they ride the pending record into
   * the eventual TASK-SPEC's evidence block. */
  artifacts?: { url?: string; label?: string; kind?: string }[]
  /** Re-engineer Phase 8 — follow-on build linkage from the fence
   * (continue-to-backend): `task.py new --derived-from` at conversion. */
  derivedFrom?: string
}

/** Evidence rail ⑥: normalize the client-supplied artifacts[] into the
 * TaskEvidenceRef shape we persist. https-only (artifact URLs are always the
 * wrapper's https://hermes.yvon.in/artifacts/... store — anything else is
 * not evidence we saved), capped at 12 to match the proposal card. */
function normalizeEvidence(raw: Body['artifacts']): TaskEvidenceRef[] {
  if (!Array.isArray(raw)) return []
  return raw
    .filter((a): a is { url: string; label?: string; kind?: string } => !!a && typeof a.url === 'string' && a.url.startsWith('https://'))
    .slice(0, 12)
    .map((a) => ({
      url: a.url,
      label: typeof a.label === 'string' && a.label.trim() ? a.label.trim().slice(0, 120) : a.url.split('/').pop() || 'artifact',
      kind: typeof a.kind === 'string' && a.kind.trim() ? a.kind.trim().slice(0, 20) : undefined,
    }))
}

export async function POST(request: NextRequest) {
  const supabase = await supabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const userId = user.id
  const requesterName = user.email ?? userId

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400 })
  }

  const { action, title, summary, pendingId, correlation, roomId } = body
  if (!roomId) return NextResponse.json({ error: 'roomId is required' }, { status: 400 })

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

  if (action === 'generate') {
    if (!title?.trim() || !summary?.trim()) {
      return NextResponse.json({ error: 'title and summary are required to generate a PRD' }, { status: 400 })
    }
    try {
      // Re-engineer Phase 5 (2026-09-05): if this room has a reference-build
      // design session with both gates answered, fold its design.md facts
      // into the PRD and ride the session onto the pending record so the
      // convert step copies design.md into the task and sets its origin.
      // Best-effort: a missing/unreadable session degrades to today's
      // behavior, never fails generation.
      const session = await findLatestSessionByRoom(roomId)
      const hasGates = !!(session?.intent && session?.motion)
      const designContext = session && hasGates ? renderDesignMd(session) : undefined
      const generated = await generatePrd(title.trim(), summary.trim(), designContext)
      const evidence = normalizeEvidence(body.artifacts)
      const design =
        session && hasGates && session.designMd?.path
          ? { designSessionId: session.id, designMdPath: session.designMd.path }
          : undefined
      const pid = await writePendingPrd(
        title.trim(),
        summary.trim(),
        generated,
        evidence.length ? evidence : undefined,
        design,
        // Re-engineer Phase 8 — follow-on linkage from the proposal fence
        // (continue-to-backend): validated TS-id or absent.
        typeof body.derivedFrom === 'string' && /^TS-\d+$/.test(body.derivedFrom) ? body.derivedFrom : undefined,
      )
      await emitEvent('prd.proposal.generated', { title: title.trim(), pendingId: pid, riceScore: generated.riceScore, lead: generated.meta.lead, evidenceCount: evidence.length, designSessionId: design?.designSessionId })
      return NextResponse.json({
        ok: true,
        pendingId: pid,
        markdown: generated.markdown,
        lead: generated.meta.lead,
        departments: generated.meta.departments,
        riceScore: generated.riceScore,
        warnings: generated.warnings,
        // Present only when the room had a briefed design session — the card
        // renders Design.md/Recipe tabs from this, else it shows PRD alone.
        ...(design && session
          ? {
              design: {
                sessionId: session.id,
                designMdPath: session.designMd!.path,
                designMd: designContext!,
                recipe: session.recipe ?? null,
              },
            }
          : {}),
      })
    } catch (e) {
      return NextResponse.json({ ok: false, error: `PRD generation failed: ${errMsg(e)}` }, { status: 502 })
    }
  }

  if (action === 'discard') {
    if (!pendingId) return NextResponse.json({ error: 'pendingId is required' }, { status: 400 })
    await discardPendingPrd(pendingId)
    await emitEvent('prd.proposal.discarded', { pendingId })
    return NextResponse.json({ ok: true })
  }

  if (action === 'convert') {
    if (!pendingId) return NextResponse.json({ error: 'pendingId is required' }, { status: 400 })
    const pending = await readPendingPrd(pendingId)
    if (!pending) {
      return NextResponse.json({ ok: false, error: 'pending PRD not found or already converted/discarded' }, { status: 404 })
    }
    const result = await createTaskFromPrd(pending.title, pending.summary, pending.prd, requesterName, pending.evidence, pending.design, pending.derivedFrom)
    await discardPendingPrd(pendingId)

    if (!result.taskId) {
      return NextResponse.json({ ok: false, error: `TASK-SPEC creation failed at step '${result.failedStep}': ${result.error}` }, { status: 502 })
    }

    await emitEvent('task.proposal.accepted', {
      title: pending.title, summary: pending.summary, taskId: result.taskId, kanbanOk: result.kanbanOk,
      evidenceCount: pending.evidence?.length ?? 0,
    })

    // Evidence rail ⑥: collected set-evidence failures ride along loudly —
    // they never block the task, but they are never silently swallowed either.
    for (const ee of result.evidenceErrors ?? []) {
      console.error('[chat/prd-proposal] set-evidence failed:', ee)
    }
    // Re-engineer Phase 5: same discipline for the design-origin step.
    for (const de of result.designErrors ?? []) {
      console.error('[chat/prd-proposal] design-origin failed:', de)
    }

    if (result.status !== 'executing') {
      // Partial success: the record is real and on disk, but the chain stalled
      // at `result.failedStep` — report exactly where, never claim "executing"
      // when it isn't.
      return NextResponse.json({
        ok: false,
        taskId: result.taskId,
        status: result.status,
        error: `${result.taskId} was created but stalled at '${result.failedStep}' (currently ${result.status}): ${result.error}`,
        evidenceErrors: result.evidenceErrors,
      }, { status: 207 })
    }

    // Execution gate (2026-08-21, concern #5, chat_rooms_execution_gate
    // migration): result.status === 'executing' here means the full
    // new→prd→set-prd→fill-discovery→discover→approve→start chain actually
    // completed — a real, started TASK-SPEC, not just a draft. That's the
    // explicit sign-off stream/route.ts's discussion-only gate is waiting
    // for. Via RPC, not a plain .update() — see task-proposal/route.ts's
    // accept handler for why (chat_rooms' only UPDATE RLS policy is
    // thread-only; a direct update silently no-ops for every other room
    // kind). Best-effort — the TASK-SPEC itself is already safely created —
    // but NEVER silent: supabase-js resolves RPC failures as {error} rather
    // than throwing, so an unchecked result used to strand the room locked
    // with the first symptom minutes later (kickoff's 409
    // "no execution-unlocked room"). Now the failure surfaces in the convert
    // response itself and the card prints it.
    let unlockError: string | null = null
    try {
      const { error } = await (supabase as unknown as {
        rpc: (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>
      }).rpc('chat_room_unlock_execution', { p_room_id: roomId, p_task_id: result.taskId })
      if (error) unlockError = error.message
    } catch (e) {
      unlockError = e instanceof Error ? e.message : String(e)
    }
    if (unlockError) {
      console.error(`[prd-proposal] chat_room_unlock_execution failed for room ${roomId} / task ${result.taskId}: ${unlockError}`)
    }

    return NextResponse.json({ ok: true, taskId: result.taskId, status: result.status, kanbanOk: result.kanbanOk, kanbanError: result.kanbanOk ? null : result.kanbanError, evidenceErrors: result.evidenceErrors, unlockError })
  }

  return NextResponse.json({ error: `unknown action: ${action}` }, { status: 400 })
}
