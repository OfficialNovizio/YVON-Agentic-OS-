// PrdProposalCard — the second stage of chat-as-task, after TaskProposalPrompt's
// "Yes, start it" (docs/PRD-prd-gated-task-conversion.md). No TASK-SPEC exists
// yet at this point — spec's generated PRD (prd-generator.ts) is shown in full
// for a real decision, not a rubber stamp. "Convert to task" runs the whole
// chain (new → PRD file → set-prd → fill-discovery → discover → approve →
// start) via /api/chat/prd-proposal's 'convert' action; "Discard" deletes the
// pending PRD and writes no record at all.
//
// Visual language matches TaskProposalPrompt (same card owner, same feature).
//
// Owner: dev · prd-gated-task-conversion, 2026-08-18
'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CircleCheck, X, FileText } from 'lucide-react'
import { Markdown } from './Markdown'

export interface PendingPrdProposal {
  pendingId: string
  markdown: string
  lead: string
  departments: string[]
  riceScore: number
  warnings: string[]
  correlation: string | null
}

interface PrdProposalCardProps {
  proposal: PendingPrdProposal | null
  roomId: string
  onResolved: () => void
}

export function PrdProposalCard({ proposal, roomId, onResolved }: PrdProposalCardProps) {
  const [busy, setBusy] = useState<'convert' | 'discard' | null>(null)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  if (!proposal) return null

  async function resolve(action: 'convert' | 'discard') {
    setBusy(action)
    setResult(null)
    try {
      const res = await fetch('/api/chat/prd-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          pendingId: proposal!.pendingId,
          correlation: proposal!.correlation,
          roomId,
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        taskId?: string
        status?: string
        kanbanOk?: boolean
        error?: string
      }
      if (action === 'convert') {
        if (data.taskId && data.status === 'executing') {
          setResult({ ok: true, message: `${data.taskId} created and advanced to executing${data.kanbanOk ? ' · on the task board' : ' · task board mirror failed, TASK-SPEC is still real'}` })
        } else if (data.taskId) {
          setResult({ ok: false, message: `${data.taskId} created but stalled: ${data.error}` })
        } else {
          setResult({ ok: false, message: data.error ?? 'Task creation failed' })
        }
      } else {
        setResult({ ok: true, message: 'Discarded — nothing was created.' })
      }
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : String(e) })
    } finally {
      setBusy(null)
      const holdMs = action === 'convert' ? 1800 : 600
      setTimeout(() => {
        const el = cardRef.current
        const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
        if (!el || reduced) {
          onResolved()
          return
        }
        gsap.to(el, { opacity: 0, y: -8, scale: 0.97, duration: 0.28, ease: 'power2.in', onComplete: onResolved })
      }, holdMs)
    }
  }

  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <div
        ref={cardRef}
        className="adora-rise relative mx-auto w-full max-w-[780px] overflow-hidden rounded-[24px] border border-[rgba(89,46,255,0.28)] bg-white px-5 py-4"
      >
        <span
          className="pointer-events-none absolute -right-10 -top-14 h-36 w-36 rounded-full opacity-60"
          style={{ background: 'var(--chat-lime)', filter: 'blur(44px)' }}
          aria-hidden
        />

        {result ? (
          <div className="relative text-[13px] font-medium" style={{ color: result.ok ? '#587000' : '#b91c1c' }}>
            {result.message}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--chat-accent)]">
              <FileText className="h-3.5 w-3.5" />
              spec's PRD — nothing created yet, this is the real decision point
            </div>

            <div className="mt-3 max-h-[420px] overflow-y-auto rounded-[14px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-4 text-[13.5px] leading-[1.6]">
              <Markdown text={proposal.markdown} />
            </div>

            <div className="mt-2 flex flex-wrap gap-3 text-[11.5px] text-[var(--chat-text-dim)]">
              <span>Lead: <strong>{proposal.lead}</strong></span>
              {proposal.departments.length > 0 && <span>Departments: {proposal.departments.join(', ')}</span>}
              <span>RICE: <strong>{proposal.riceScore}</strong> (reasoning-based, not formula-verified)</span>
            </div>
            {proposal.warnings.length > 0 && (
              <div className="mt-1.5 text-[11.5px] text-amber-700">
                {proposal.warnings.map((w, i) => (
                  <div key={i}>⚠️ {w}</div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button onClick={() => resolve('convert')} disabled={busy !== null} className="adora-cta text-[14px]">
                <CircleCheck size={16} />
                {busy === 'convert' ? 'Converting…' : 'Convert to task'}
              </button>
              <button
                onClick={() => resolve('discard')}
                disabled={busy !== null}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--chat-hairline)] bg-white px-4 py-2.5 text-[14px] text-[var(--chat-body)] transition hover:bg-[var(--chat-surface-strong)] disabled:opacity-50"
              >
                <X size={15} />
                Discard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
