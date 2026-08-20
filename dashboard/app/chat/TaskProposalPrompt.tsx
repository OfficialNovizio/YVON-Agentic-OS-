// TaskProposalPrompt — the inline Yes/No/Discuss-more prompt that appears
// when the agent judges a discussion has reached an actionable conclusion
// (2026-08-11 chat-as-task feature). Native buttons, no typing required —
// per operator direction over reusing the /confirm <token> slash-command
// pattern. See /api/chat/stream (marker parsing → task.proposed event).
//
// "Yes, start it" no longer creates a task directly (docs/PRD-prd-gated-
// task-conversion.md, 2026-08-18): it calls /api/chat/prd-proposal's
// 'generate' action, and the parent page swaps this card for
// PrdProposalCard — a real TASK-SPEC only gets created after THAT card's
// own approval, once spec's PRD has actually been shown. onPrdGenerated
// carries the handoff; the create-a-task-directly behavior is gone, not
// hidden behind a flag — no exemptions, per operator direction.
//
// "No" and "Discuss more" both resolve to the same server action
// (action: 'dismiss', still against /api/chat/task-proposal — no PRD has
// been generated yet at this stage, so there's nothing to discard) — neither
// creates a task, the only difference is intent to the person reading the
// chat, not a distinct backend effect.
//
// Restyled 2026-08-17 (Adora): the proposal is the one moment on this page
// that earns a filled violet CTA, so it gets it — everything else on screen
// stays ghost or hairline while this is open.
//
// Owner: dev · chat-as-task feature, 2026-08-11 · PRD-gated 2026-08-18
'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CircleCheck, X, MessageSquareMore, Sparkles } from 'lucide-react'
import type { PendingPrdProposal } from './PrdProposalCard'

export interface PendingTaskProposal {
  title: string
  summary: string
  correlation: string | null
}

interface TaskProposalPromptProps {
  proposal: PendingTaskProposal | null
  roomId: string
  onResolved: () => void
  /** Called instead of showing a terminal result when PRD generation
   * succeeds — the parent renders PrdProposalCard with this. */
  onPrdGenerated: (proposal: PendingPrdProposal) => void
}

export function TaskProposalPrompt({ proposal, roomId, onResolved, onPrdGenerated }: TaskProposalPromptProps) {
  const [busy, setBusy] = useState<'accept' | 'dismiss' | null>(null)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  if (!proposal) return null

  async function resolve(action: 'accept' | 'dismiss') {
    setBusy(action)
    setResult(null)
    try {
      if (action === 'accept') {
        const res = await fetch('/api/chat/prd-proposal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'generate',
            title: proposal!.title,
            summary: proposal!.summary,
            correlation: proposal!.correlation,
            roomId,
          }),
        })
        const data = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          pendingId?: string
          markdown?: string
          lead?: string
          departments?: string[]
          riceScore?: number
          warnings?: string[]
          error?: string
        }
        if (res.ok && data.ok && data.pendingId && data.markdown) {
          // Hand off to PrdProposalCard immediately — no terminal "result"
          // shown here, this card is simply replaced.
          onPrdGenerated({
            pendingId: data.pendingId,
            markdown: data.markdown,
            lead: data.lead ?? 'dev',
            departments: data.departments ?? [],
            riceScore: data.riceScore ?? 0,
            warnings: data.warnings ?? [],
            correlation: proposal!.correlation,
          })
          // Terminal state for THIS card, not buttons — PrdProposalCard is
          // now the live one; this card just fades out (finally block below).
          setResult({ ok: true, message: 'PRD ready — see below.' })
          setBusy(null)
          return
        }
        setResult({ ok: false, message: data.error ?? 'PRD generation failed' })
        setBusy(null)
        return
      }

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
      await res.json().catch(() => ({}))
      setResult({ ok: true, message: 'Dismissed' })
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : String(e) })
    } finally {
      setBusy(null)
      // Give the outcome a moment on screen, then paint the card away
      // instead of letting it just vanish when the parent clears state.
      const holdMs = action === 'accept' ? 1400 : 500
      setTimeout(() => {
        const el = cardRef.current
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        if (!el || reduced) {
          onResolved()
          return
        }
        gsap.to(el, {
          opacity: 0,
          y: -8,
          scale: 0.97,
          duration: 0.28,
          ease: 'power2.in',
          onComplete: onResolved,
        })
      }, holdMs)
    }
  }

  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <div
        ref={cardRef}
        className="adora-rise relative mx-auto w-full max-w-[780px] overflow-hidden rounded-[24px] border border-[rgba(89,46,255,0.28)] bg-white px-5 py-4"
      >
        {/* A single lime wash bleeding in from the corner — decorative only. */}
        <span
          className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-60"
          style={{ background: 'var(--chat-lime)', filter: 'blur(44px)' }}
          aria-hidden
        />

        {result ? (
          <div
            className="relative text-[13px] font-medium"
            style={{ color: result.ok ? '#587000' : '#b91c1c' }}
          >
            {result.message}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--chat-accent)]">
              <Sparkles className="h-3.5 w-3.5" />
              Ready to start this as a task?
            </div>
            <div className="adora-display mt-2 text-[19px]">{proposal.title}</div>
            <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[var(--chat-text-dim)]">
              {proposal.summary}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => resolve('accept')} disabled={busy !== null} className="adora-cta text-[14px]">
                <CircleCheck size={16} />
                {busy === 'accept' ? 'Creating…' : 'Yes, start it'}
              </button>
              <button
                onClick={() => resolve('dismiss')}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--chat-hairline)] bg-white px-4 py-2.5 text-[14px] text-[var(--chat-body)] transition hover:bg-[var(--chat-surface-strong)] disabled:opacity-50"
              >
                <X size={15} />
                No
              </button>
              <button
                onClick={() => resolve('dismiss')}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--chat-hairline)] bg-white px-4 py-2.5 text-[14px] text-[var(--chat-body)] transition hover:bg-[var(--chat-surface-strong)] disabled:opacity-50"
              >
                <MessageSquareMore size={15} />
                Discuss more
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
