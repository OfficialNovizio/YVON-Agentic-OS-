// BrandSuggestionsCard — Gate 3 (2026-09-07). After the user states their
// changes, the agent proposes brand-studio suggestions (atlas/pixel stance):
// concrete changes + why they fit the product AND the reference. The user
// toggles which to adopt; adopting sends the follow-up turn that folds them
// into the design study, design.md and the PRD. The agent proposes, the user
// decides — this card is that decision surface.
//
// Owner: mia/dev · design-to-product re-engineer, 2026-09-07
'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Check, Sparkles } from 'lucide-react'

export interface BrandSuggestionItem {
  title: string
  text: string
  why: string
}

export interface BrandGatePayload {
  stage: 'brand'
  sessionId: string
  suggestions: BrandSuggestionItem[]
}

export function BrandSuggestionsCard({
  gate,
  roomId,
  onSend,
  onResolved,
}: {
  gate: BrandGatePayload | null
  roomId: string
  onSend: (text: string) => void
  onResolved: () => void
}) {
  const [adopted, setAdopted] = useState<Set<number>>(new Set())
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  // new gate → reset the toggles
  useEffect(() => {
    setAdopted(new Set())
    setError(null)
  }, [gate?.sessionId])

  if (!gate || gate.suggestions.length === 0) return null

  function toggle(i: number) {
    setAdopted((prev) => {
      const next = new Set(prev)
      if (next.has(i)) next.delete(i)
      else next.add(i)
      return next
    })
  }

  async function paintAway() {
    const el = cardRef.current
    if (el && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      await gsap.to(el, { opacity: 0, y: -8, scale: 0.97, duration: 0.28, ease: 'power2.in' })
    }
  }

  async function resolve() {
    if (busy || !gate) return
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/chat/design-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'brand',
          sessionId: gate.sessionId,
          roomId,
          adopted: [...adopted].sort((a, b) => a - b),
        }),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text.slice(0, 200) || `design-gate ${res.status}`)
      }
      const data = (await res.json()) as { followUp?: string }
      await paintAway()
      onResolved()
      if (data.followUp) onSend(data.followUp)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not record the decision')
      setBusy(false)
    }
  }

  return (
    <div ref={cardRef} className="relative z-10 px-4 pb-2 sm:px-8">
      <div className="adora-rise mx-auto w-full max-w-[780px] overflow-hidden rounded-[18px] border border-[rgba(89,46,255,0.28)] bg-white shadow-[0_18px_50px_-24px_rgba(89,46,255,0.45)]">
        <div className="relative flex items-center gap-2 overflow-hidden border-b border-[var(--chat-hairline)] px-4 py-3">
          <div className="pointer-events-none absolute -right-10 -top-14 h-28 w-40 rounded-full bg-lime-300/25 blur-2xl" />
          <Sparkles size={14} className="text-[var(--chat-accent)]" />
          <span className="text-[12.5px] font-medium text-[var(--chat-body)]">
            Brand suggestions from the studio
          </span>
          <span className="chat-mono ml-auto text-[11px] text-[var(--chat-text-faint)]">
            adopt what you like
          </span>
        </div>
        <div className="px-4 py-3">
          <div className="space-y-2">
            {gate.suggestions.map((sug, i) => {
              const on = adopted.has(i)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => toggle(i)}
                  className={`flex w-full items-start gap-2.5 rounded-xl border px-3 py-2.5 text-left transition-colors ${
                    on
                      ? 'border-[var(--chat-accent)] bg-[rgba(89,46,255,0.05)]'
                      : 'border-[var(--chat-hairline)] hover:border-[rgba(89,46,255,0.35)]'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-[5px] border ${
                      on
                        ? 'border-[var(--chat-accent)] bg-[var(--chat-accent)] text-white'
                        : 'border-[var(--chat-hairline)] bg-white text-transparent'
                    }`}
                  >
                    <Check size={11} strokeWidth={3} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[12.5px] font-medium text-[var(--chat-body)]">
                      {sug.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] leading-snug text-[var(--chat-text-dim)]">
                      {sug.text}
                    </span>
                    <span className="mt-1 block text-[11px] leading-snug text-[var(--chat-text-faint)]">
                      Why: {sug.why}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
          {error && (
            <div className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-[11.5px] text-red-700">
              {error}
            </div>
          )}
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={resolve}
              disabled={busy}
              className="rounded-full bg-[var(--chat-accent)] px-4 py-2 text-[12px] font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {busy
                ? 'Recording…'
                : adopted.size > 0
                  ? `Adopt ${adopted.size} and continue`
                  : 'None — continue as stated'}
            </button>
            <span className="text-[11px] text-[var(--chat-text-faint)]">
              adopted suggestions fold into design.md and the PRD
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
