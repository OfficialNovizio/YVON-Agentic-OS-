// /assignTask [description] — manual, instant task creation from chat.
// Complements the agent-offered flow (task-proposal marker → inline Yes/No/
// Discuss-more prompt, see /api/chat/stream + TaskProposalPrompt.tsx): if
// the agent didn't offer, this is the explicit override. No confirm step —
// deliberately instant, per operator direction 2026-08-11 ("directly
// assigns task").
//
// Two forms:
//   /assignTask <description>   — creates the task from the typed text.
//   /assignTask                 — no description given: reads the current
//                                  room's recent messages and uses that
//                                  transcript as the task's source, instead
//                                  of asking the operator to retype what was
//                                  already discussed ("checking the chat we
//                                  just have").
//
// Shares the exact same creation path as the agent-offered flow
// (lib/create-task-spec.ts) — one implementation, not a second one that
// could drift. Same known gap applies here too (see that file's header):
// shells out to local python3 + cli/task.py, which works for `next dev`/
// `next start` run from a real repo checkout, not a Vercel deployment.
//
// Owner: dev · chat-as-task feature, 2026-08-11
import type { Command, CommandContext, CommandResult } from './types'
import { createTaskSpecAndMirror } from '@/lib/create-task-spec'

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
  summary: 'Manually create a real TASK-SPEC draft — from typed text, or from the recent chat if no text given',
  usage: 'assignTask [description]  (no description = uses this room\'s recent messages)',
  async run(ctx: CommandContext): Promise<CommandResult> {
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

    const { taskId, taskSpecError, kanbanOk, kanbanError } = await createTaskSpecAndMirror(title, summary)

    if (!taskId) {
      return {
        ok: false,
        message: `Task creation failed: ${taskSpecError}`,
        effect: { kind: 'none' },
        detail: { ran: true, ok: false, reason: taskSpecError },
      }
    }

    return {
      ok: true,
      message:
        `✓ **${taskId}** created (draft)${typed ? '' : ' — from this room\'s recent chat'}. ` +
        `${kanbanOk ? 'On the task board too.' : `Task board mirror failed (${kanbanError}) — TASK-SPEC is still real.`} ` +
        `Next: \`cli/task.sh discover\` (fill \`classification.lead\` first).`,
      effect: { kind: 'none' },
      detail: { ran: true, ok: true, taskId, kanbanOk },
    }
  },
}
