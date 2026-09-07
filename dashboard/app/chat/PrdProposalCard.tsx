// PrdProposalCard — the second stage of chat-as-task, after TaskProposalPrompt's
// "Yes, start it" (docs/PRD-prd-gated-task-conversion.md). No TASK-SPEC exists
// yet at this point — spec's generated PRD (prd-generator.ts) is shown in full
// for a real decision, not a rubber stamp. "Convert to task" runs the whole
// chain (new → PRD file → set-prd → fill-discovery → discover → approve →
// start) via /api/chat/prd-proposal's 'convert' action; "Discard" deletes the
// pending PRD and writes no record at all.
//
// Re-engineer Phase 5 (2026-09-05): when the room had a reference-build design
// session with both gates answered, the response also carries the design.md
// and the routed recipe — the card presents all three (PRD / Design.md /
// Recipe) as tabs, per the target flow's Stage 6: "present them to user with
// a button to move to task".
//
// Visual language matches TaskProposalPrompt (same card owner, same feature).
//
// Owner: dev · prd-gated-task-conversion, 2026-08-18 · design tabs 2026-09-05
'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { CircleCheck, X, FileText, FlaskConical, ScrollText } from 'lucide-react'
import { Markdown } from './Markdown'

/** The design payload (re-engineer Phase 5) — present when the room had a
 * reference-build design session with both gates answered. designMd is the
 * rendered markdown; recipe is the routed BuildRecipe (lib/build-recipe.ts),
 * null when the recipe hasn't been routed yet. */
export interface PrdDesignPayload {
  sessionId: string
  designMdPath: string
  designMd: string
  recipe: Record<string, unknown> | null
}

export interface PendingPrdProposal {
  pendingId: string
  markdown: string
  lead: string
  departments: string[]
  riceScore: number
  warnings: string[]
  correlation: string | null
  /** Re-engineer Phase 5 — design tabs. Absent on PRDs from rooms with no
   * reference-build session. */
  design?: PrdDesignPayload
}

interface PrdProposalCardProps {
  proposal: PendingPrdProposal | null
  roomId: string
  onResolved: () => void
}

export function PrdProposalCard({ proposal, roomId, onResolved }: PrdProposalCardProps) {
  const [busy, setBusy] = useState<'convert' | 'discard' | null>(null)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const [tab, setTab] = useState<'prd' | 'design' | 'recipe'>('prd')
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
        unlockError?: string
      }
      if (action === 'convert') {
        if (data.taskId && data.status === 'executing') {
          setResult({
            ok: true,
            message: `${data.taskId} created and advanced to executing${data.kanbanOk ? ' · on the task board' : ' · task board mirror failed, TASK-SPEC is still real'}${data.unlockError ? ` · ⚠ room unlock failed (${data.unlockError}) — Start build will refuse` : ''}`,
          })
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
              {proposal.design
                ? 'PRD + design spec — nothing created yet, this is the real decision point'
                : "spec's PRD — nothing created yet, this is the real decision point"}
            </div>

            {proposal.design && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {([
                  { id: 'prd', label: 'PRD', Icon: FileText },
                  { id: 'design', label: 'Design.md', Icon: ScrollText },
                  { id: 'recipe', label: 'Recipe', Icon: FlaskConical },
                ] as const).map(({ id, label, Icon }) => (
                  <button
                    key={id}
                    onClick={() => setTab(id)}
                    className={`inline-flex items-center gap-1.5 rounded-[8px] border px-3 py-1.5 text-[12px] font-medium transition ${
                      tab === id
                        ? 'border-[var(--chat-accent)] bg-[rgba(89,46,255,0.06)] text-[var(--chat-accent)]'
                        : 'border-[var(--chat-hairline)] bg-white text-[var(--chat-text-dim)] hover:border-[var(--chat-accent)]'
                    }`}
                  >
                    <Icon size={13} />
                    {label}
                  </button>
                ))}
              </div>
            )}

            {tab === 'prd' && (
              <div className="mt-3 max-h-[420px] overflow-y-auto rounded-[14px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-4 text-[13.5px] leading-[1.6]">
                <Markdown text={proposal.markdown} />
              </div>
            )}
            {proposal.design && tab === 'design' && (
              <div className="mt-3 max-h-[420px] overflow-y-auto rounded-[14px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-4 text-[13.5px] leading-[1.6]">
                <Markdown text={proposal.design.designMd} />
              </div>
            )}
            {proposal.design && tab === 'recipe' && (
              <div className="mt-3 max-h-[420px] overflow-y-auto rounded-[14px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] p-4">
                {proposal.design.recipe ? (
                  <pre className="whitespace-pre-wrap break-words font-mono text-[11.5px] leading-[1.55] text-[var(--chat-body)]">
                    {JSON.stringify(proposal.design.recipe, null, 2)}
                  </pre>
                ) : (
                  <div className="text-[13px] text-[var(--chat-text-dim)]">
                    NOT YET ROUTED — the recipe router has not run for this session.
                  </div>
                )}
              </div>
            )}

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
