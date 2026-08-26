// /assignTask [description] — manual task creation from chat, now PRD-gated
// (docs/PRD-prd-gated-task-conversion.md, supersedes the instant-create
// version of 2026-08-11). Two-phase, using the SAME confirm-token mechanism
// /deploy already uses for infrastructure-touching commands (confirm.ts) —
// not a new UI, just this command's existing `confirm: true` contract:
//
//   /assignTask <description>     (ctx.confirmed=false) — spec generates a
//     real PRD (prd-generator.ts) from the typed text or the room's recent
//     chat, writes it to a pending file (not a TASK-SPEC — nothing governed
//     exists yet), and prints it in full plus a confirm token.
//
//   /confirm <token>               (ctx.confirmed=true, args=[pendingId]) —
//     runs createTaskFromPrd: new → PRD file → set-prd → fill-discovery →
//     discover → approve → start. Reaches `executing` in one shot, since the
//     PRD already is discovery's answer.
//
// Complements the agent-offered flow (see /api/chat/prd-proposal +
// /api/chat/task-proposal), which runs the identical generate/convert split
// through a chat card instead of a slash command — one PRD-generation
// implementation (prd-generator.ts), two entry points, per the same
// principle create-task-spec.ts already establishes.
//
// Owner: dev · prd-gated-task-conversion, 2026-08-18
import type { Command, CommandContext, CommandResult } from './types'
import { issueToken } from './confirm-tokens'
import { generatePrd } from '@/lib/prd-generator'
import { writePendingPrd, readPendingPrd, discardPendingPrd } from '@/lib/prd-pending'
import { createTaskFromPrd } from '@/lib/create-task-spec'
import { errMsg } from '@/lib/errors'

const HISTORY_LIMIT = 12

interface HistoryRow {
  author_kind: string
  author_name: string | null
  content: string
  created_at: string
}

async function transcriptFromRoom(ctx: CommandContext): Promise<{ title: string; summary: string } | null> {
  const { data, error } = await ctx.supabase
    .from('chat_messages')
    .select('author_kind, author_name, content, created_at')
    .eq('room_id', ctx.roomId)
    .order('created_at', { ascending: false })
    .limit(HISTORY_LIMIT)

  if (error || !data || (data as HistoryRow[]).length === 0) return null

  const rows = (data as HistoryRow[]).slice().reverse() // chronological
  const lastUserLine = [...rows].reverse().find((r) => r.author_kind === 'user')?.content?.trim()
  const title = lastUserLine ? lastUserLine.slice(0, 80) : `Task from chat discussion (${new Date().toISOString().slice(0, 10)})`
  const transcript = rows
    .map((r) => `${r.author_name ?? r.author_kind}: ${r.content}`)
    .join('\n')
    .slice(0, 4000) // TASK-SPEC source_message shouldn't balloon unbounded
  return { title, summary: transcript }
}

export const assignTaskCommand: Command = {
  name: 'assigntask',
  aliases: ['task'],
  summary: 'Generate a real PRD from typed text (or the recent chat) and, on /confirm, convert it to a governed TASK-SPEC',
  usage: 'assignTask [description]  (no description = uses this room\'s recent messages)',
  confirm: true,
  async run(ctx: CommandContext): Promise<CommandResult> {
    // ── Phase 2: /confirm <token> already resolved args to [pendingId] ─────
    if (ctx.confirmed) {
      const pendingId = ctx.args[0]
      if (!pendingId) {
        return { ok: false, message: 'Confirm token had no pending PRD id attached — re-run /assignTask.', effect: { kind: 'none' } }
      }
      const pending = await readPendingPrd(pendingId)
      if (!pending) {
        return { ok: false, message: 'That pending PRD is gone (already converted, discarded, or expired) — re-run /assignTask.', effect: { kind: 'none' } }
      }
      const result = await createTaskFromPrd(pending.title, pending.summary, pending.prd, 'operator')
      await discardPendingPrd(pendingId)

      if (!result.taskId) {
        return {
          ok: false,
          message: `Task creation failed at step '${result.failedStep}': ${result.error}`,
          effect: { kind: 'none' },
          detail: { ran: true, ok: false, reason: result.error, failedStep: result.failedStep },
        }
      }
      if (result.status !== 'executing') {
        return {
          ok: false,
          message: `**${result.taskId}** was created but stalled at \`${result.failedStep}\` (currently \`${result.status}\`): ${result.error}. The record is real — fix the blocking condition and advance it manually with \`cli/task.sh\`.`,
          effect: { kind: 'none' },
          detail: { ran: true, ok: false, taskId: result.taskId, status: result.status, failedStep: result.failedStep },
        }
      }
      return {
        ok: true,
        message: `✓ **${result.taskId}** created and advanced to \`executing\` (PRD attached, RICE=${pending.prd.riceScore}, lead=${pending.prd.meta.lead}). ` +
          `${result.kanbanOk ? 'On the task board too.' : `Task board mirror failed (${result.kanbanError}) — TASK-SPEC is still real.`}`,
        effect: { kind: 'none' },
        detail: { ran: true, ok: true, taskId: result.taskId, status: result.status, kanbanOk: result.kanbanOk },
      }
    }

    // ── Phase 1: generate the PRD, issue a confirm token ────────────────────
    const typed = ctx.args.join(' ').trim()

    let title: string
    let summary: string
    if (typed) {
      title = typed.slice(0, 80)
      summary = typed
    } else {
      const fromChat = await transcriptFromRoom(ctx)
      if (!fromChat) {
        return {
          ok: false,
          message: 'Usage: `/assignTask <description>` — or send a few messages first so there\'s a chat to pull from.',
          effect: { kind: 'none' },
        }
      }
      title = fromChat.title
      summary = fromChat.summary
    }

    let generated
    try {
      generated = await generatePrd(title, summary)
    } catch (e) {
      return { ok: false, message: `PRD generation failed: ${errMsg(e)}`, effect: { kind: 'none' } }
    }

    const pendingId = await writePendingPrd(title, summary, generated)
    const issued = await issueToken(ctx.supabase, { userId: ctx.userId, roomId: ctx.roomId, command: 'assigntask', args: [pendingId] })

    return {
      ok: true,
      message: `${generated.markdown}\n\n---\n\n${issued.message}`,
      effect: { kind: 'none' },
      detail: { pending: true, pendingId, riceScore: generated.riceScore, lead: generated.meta.lead },
    }
  },
}
