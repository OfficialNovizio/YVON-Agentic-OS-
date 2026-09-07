// IntentGateCard — Stage 1 of the re-engineered reference-build flow
// (2026-09-05). Rendered when the agent ends a reference turn with a
// ```design-gate {"stage":"intent",…} fence (parsed server-side in
// /api/chat/stream, emitted as a `design.gate` SSE frame). Asks the one
// question nothing used to ask: identical clone, or adapt — and what
// changes. The answer is recorded on the design session
// (store/design-sessions/, /api/chat/design-gate) and the follow-up turn
// flows through the room's normal send path.
//
// Modeled on TaskProposalPrompt (same card anatomy, same gsap exit).
//
// Owner: dev · design-to-product re-engineer, 2026-09-05
'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Check, Copy, PenLine, X } from 'lucide-react'

export interface DesignGatePayload {
  stage: 'intent'
  sessionId: string
  reference: {
    url: string
    taxonomy?: string
    motionSummary?: string
  }
}

interface IntentGateCardProps {
  gate: DesignGatePayload | null
  roomId: string
  /** Sends the decision text into the room as a normal user turn. */
  onSend: (text: string) => void
  onResolved: () => void
}

export function IntentGateCard({ gate, roomId, onSend, onResolved }: IntentGateCardProps) {
  const [mode, setMode] = useState<'identical' | 'adapt' | null>(null)
  const [changes, setChanges] = useState('')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  if (!gate) return null

  async function resolve(action: 'intent' | 'dismiss') {
    if (action === 'intent' && !mode) return
    if (action === 'intent' && mode === 'adapt' && !changes.trim()) return
    setBusy(true)
    setResult(null)
    let followUp: string | null = null
    try {
      const res = await fetch('/api/chat/design-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          sessionId: gate!.sessionId,
          roomId,
          ...(action === 'intent' ? { mode, changes: changes.trim() } : {}),
        }),
      })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        followUp?: string
        error?: string
      }
      if (!res.ok || !data.ok) {
        setResult({ ok: false, message: data.error ?? 'Could not record the decision' })
        setBusy(false)
        return
      }
      if (action === 'intent') followUp = data.followUp ?? null
      setResult({ ok: true, message: action === 'intent' ? 'Decision recorded — continuing…' : 'Dismissed' })
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : String(e) })
      setBusy(false)
      return
    }
    setBusy(false)
    paintAway(() => {
      onResolved()
      // The follow-up turn is sent only after the card is gone so the room's
      // send-supersedes-proposal cleanup doesn't fight this card's exit.
      if (followUp) onSend(followUp)
    })
  }

  function paintAway(after: () => void) {
    const el = cardRef.current
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (!el || reduced) {
      after()
      return
    }
    gsap.to(el, {
      opacity: 0,
      y: -8,
      scale: 0.97,
      duration: 0.28,
      ease: 'power2.in',
      onComplete: after,
    })
  }

  const host = (() => {
    try {
      return new URL(gate.reference.url).host
    } catch {
      return gate.reference.url
    }
  })()

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
          <div
            className="relative text-[13px] font-medium"
            style={{ color: result.ok ? '#587000' : '#b91c1c' }}
          >
            {result.message}
          </div>
        ) : (
          <div className="relative">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--chat-accent)]">
              <Copy className="h-3.5 w-3.5" />
              Reference captured — how should we build it?
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2">
              <a
                href={gate.reference.url}
                target="_blank"
                rel="noreferrer"
                className="text-[15px] font-medium underline decoration-[var(--chat-hairline)] underline-offset-4 hover:decoration-[var(--chat-accent)]"
              >
                {host}
              </a>
              {gate.reference.taxonomy && (
                <span className="rounded-[6px] border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--chat-text-dim)]">
                  {gate.reference.taxonomy}
                </span>
              )}
            </div>
            {gate.reference.motionSummary && (
              <p className="mt-1.5 text-[13.5px] leading-[1.6] text-[var(--chat-text-dim)]">
                {gate.reference.motionSummary}
              </p>
            )}

            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <button
                onClick={() => setMode('identical')}
                disabled={busy}
                className={`rounded-[14px] border px-4 py-3 text-left transition disabled:opacity-50 ${
                  mode === 'identical'
                    ? 'border-[var(--chat-accent)] bg-[rgba(89,46,255,0.06)]'
                    : 'border-[var(--chat-hairline)] bg-white hover:border-[var(--chat-accent)]'
                }`}
              >
                <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--chat-body)]">
                  <Check size={15} className="text-[var(--chat-accent)]" />
                  Identical clone
                </div>
                <div className="mt-1 text-[12.5px] leading-[1.5] text-[var(--chat-text-dim)]">
                  Same structure, layout, sections and motion — our content and brand.
                </div>
              </button>
              <button
                onClick={() => setMode('adapt')}
                disabled={busy}
                className={`rounded-[14px] border px-4 py-3 text-left transition disabled:opacity-50 ${
                  mode === 'adapt'
                    ? 'border-[var(--chat-accent)] bg-[rgba(89,46,255,0.06)]'
                    : 'border-[var(--chat-hairline)] bg-white hover:border-[var(--chat-accent)]'
                }`}
              >
                <div className="flex items-center gap-2 text-[14px] font-medium text-[var(--chat-body)]">
                  <PenLine size={15} className="text-[var(--chat-accent)]" />
                  Adapt it
                </div>
                <div className="mt-1 text-[12.5px] leading-[1.5] text-[var(--chat-text-dim)]">
                  Keep the spirit and style, redesign the rest for us.
                </div>
              </button>
            </div>

            {mode === 'adapt' && (
              <textarea
                value={changes}
                onChange={(e) => setChanges(e.target.value)}
                placeholder="What should change? (sections to drop, pages to add, brand direction…)"
                rows={3}
                className="mt-3 w-full resize-y rounded-[12px] border border-[var(--chat-hairline)] bg-white px-3 py-2.5 text-[13.5px] text-[var(--chat-body)] outline-none transition placeholder:text-[var(--chat-text-dim)] focus:border-[var(--chat-accent)]"
              />
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <button
                onClick={() => resolve('intent')}
                disabled={busy || !mode || (mode === 'adapt' && !changes.trim())}
                className="adora-cta text-[14px]"
              >
                <Check size={16} />
                {busy ? 'Recording…' : mode === 'identical' ? 'Clone it' : 'Record and continue'}
              </button>
              <button
                onClick={() => resolve('dismiss')}
                disabled={busy}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-[var(--chat-hairline)] bg-white px-4 py-2.5 text-[14px] text-[var(--chat-body)] transition hover:bg-[var(--chat-surface-strong)] disabled:opacity-50"
              >
                <X size={15} />
                Not building from this reference
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
