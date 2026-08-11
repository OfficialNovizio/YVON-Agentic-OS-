// TaskProposalPrompt — the inline Yes/No/Discuss-more prompt that appears
// when the agent judges a discussion has reached an actionable conclusion
// (2026-08-11 chat-as-task feature). Native buttons, no typing required —
// per operator direction over reusing the /confirm <token> slash-command
// pattern. See /api/chat/stream (marker parsing → task.proposed event) and
// /api/chat/task-proposal (accept → real TASK-SPEC draft + Kanban mirror).
//
// "No" and "Discuss more" both resolve to the same server action
// (action: 'dismiss') — neither creates a task, the only difference is
// intent to the person reading the chat, not a distinct backend effect.
//
// Owner: dev · chat-as-task feature, 2026-08-11
'use client'

import { useState } from 'react'
import { CircleCheck, X, MessageSquareMore } from 'lucide-react'

export interface PendingTaskProposal {
  title: string
  summary: string
  correlation: string | null
}

interface TaskProposalPromptProps {
  proposal: PendingTaskProposal | null
  roomId: string
  onResolved: () => void
}

export function TaskProposalPrompt({ proposal, roomId, onResolved }: TaskProposalPromptProps) {
  const [busy, setBusy] = useState<'accept' | 'dismiss' | null>(null)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)

  if (!proposal) return null

  async function resolve(action: 'accept' | 'dismiss') {
    setBusy(action)
    setResult(null)
    try {
      const res = await fetch('/api/chat/task-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          title: proposal!.title,
          summary: proposal!.summary,
          correlation: proposal!.correlation,
          roomId,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        taskId?: string
        kanbanOk?: boolean
        error?: string
      }
      if (action === 'accept') {
        if (res.ok && data.ok && data.taskId) {
          setResult({
            ok: true,
            message: `${data.taskId} created (draft)${data.kanbanOk ? ' · on the task board' : ' · task board mirror failed, TASK-SPEC is still real'}`,
          })
        } else {
          setResult({ ok: false, message: data.error ?? 'Task creation failed' })
        }
      } else {
        setResult({ ok: true, message: 'Dismissed' })
      }
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : String(e) })
    } finally {
      setBusy(null)
      // Give the outcome a moment on screen before the prompt clears.
      setTimeout(onResolved, action === 'accept' ? 1400 : 500)
    }
  }

  return (
    <div className="mx-4 mb-2 rounded-xl border border-[var(--chat-accent)]/30 bg-[var(--chat-accent)]/5 px-4 py-3">
      {result ? (
        <div className={`text-[12px] ${result.ok ? 'text-emerald-300' : 'text-red-300'}`}>{result.message}</div>
      ) : (
        <>
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-accent)]">
            Ready to start this as a task?
          </div>
          <div className="mt-1 text-[13px] font-medium text-[var(--chat-text)]">{proposal.title}</div>
          <div className="mt-0.5 text-[12px] leading-snug text-[var(--chat-text-dim)]">{proposal.summary}</div>
          <div className="mt-2.5 flex items-center gap-2">
            <button
              onClick={() => resolve('accept')}
              disabled={busy !== null}
              className="flex items-center gap-1.5 rounded-full bg-[var(--chat-accent)] px-3 py-1.5 text-[12px] font-semibold text-[#06121f] transition disabled:opacity-50"
            >
              <CircleCheck size={14} />
              {busy === 'accept' ? 'Creating…' : 'Yes, start it'}
            </button>
            <button
              onClick={() => resolve('dismiss')}
              disabled={busy !== null}
              className="flex items-center gap-1.5 rounded-full border border-[var(--chat-hairline)] px-3 py-1.5 text-[12px] text-[var(--chat-text-dim)] transition hover:bg-white/[0.04] disabled:opacity-50"
            >
              <X size={14} />
              No
            </button>
            <button
              onClick={() => resolve('dismiss')}
              disabled={busy !== null}
              className="flex items-center gap-1.5 rounded-full border border-[var(--chat-hairline)] px-3 py-1.5 text-[12px] text-[var(--chat-text-dim)] transition hover:bg-white/[0.04] disabled:opacity-50"
            >
              <MessageSquareMore size={14} />
              Discuss more
            </button>
          </div>
        </>
      )}
    </div>
  )
}
