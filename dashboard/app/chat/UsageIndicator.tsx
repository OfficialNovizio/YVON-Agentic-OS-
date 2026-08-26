// UsageIndicator — context/usage/tools/model chips under the Composer, with a
// click-to-expand detail popover.
//
// Added 2026-08-20 (Task #20/#21, per Raj's own spec from a declined
// cross-repo request — see docs/PRD notes). Shows what main.py's chat_stream
// attaches to the final `done` event's `usage` object (see hermes-client.ts's
// TurnUsage type): provider/model/toolCalls/latencyMs/turnId are server-
// resolved facts and always real. Token counts and context-window usage are
// best-effort — `tokensReported: false` (or a null contextWindow) means the
// underlying agent runtime didn't expose them for this turn, and this
// component shows "not available" rather than a guessed number. Never
// silently drop that distinction — it's the whole reason the type carries
// a separate `tokensReported` flag instead of just letting a missing number
// read as zero.
//
// Popover pattern: portals straight to document.body, same as
// LocalRepoPathPicker's "Browse…" popover, and for the same reason (escaping
// ancestor stacking contexts / backdrop-filter cards). That one hit a real
// CSS cascade bug (globals.css's `.bg-yvon-image > *` silently overriding
// `position: fixed`) — fixed 2026-08-20 by scoping to `.bg-yvon-image-content`
// (see layout.tsx). This component also sets position/z-index inline so it
// keeps working even if a future global rule does the same thing again.
'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Gauge, Coins, Wrench, Cpu } from 'lucide-react'
import type { TurnUsage } from '@/lib/hermes-client'

function fmtCompact(n: number | null | undefined): string {
  if (n == null) return 'n/a'
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`
  return String(n)
}

export function UsageIndicator({ usage }: { usage: TurnUsage }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ bottom: number; left: number } | null>(null)
  const btnRef = useRef<HTMLButtonElement | null>(null)
  const popRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node
      if (btnRef.current?.contains(t)) return
      if (popRef.current?.contains(t)) return
      setOpen(false)
    }
    // Same fix as LocalRepoPathPicker (2026-08-20): only a real page scroll
    // should close this — not scrolling the popover's own content.
    const onScroll = (e: Event) => {
      if (popRef.current?.contains(e.target as Node)) return
      setOpen(false)
    }
    const onResize = () => setOpen(false)
    document.addEventListener('mousedown', onDoc)
    window.addEventListener('scroll', onScroll, true)
    window.addEventListener('resize', onResize)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      window.removeEventListener('scroll', onScroll, true)
      window.removeEventListener('resize', onResize)
    }
  }, [open])

  const togglePopover = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect()
      // Anchored above the button (popover opens upward — this row sits at
      // the very bottom of the composer, right above the page edge).
      setCoords({ bottom: window.innerHeight - rect.top + 8, left: rect.left })
    }
    setOpen((o) => !o)
  }

  const contextUsed = usage.tokensReported ? usage.totalTokens : null
  const contextLabel =
    contextUsed != null && usage.contextWindow
      ? `${fmtCompact(contextUsed)} / ${fmtCompact(usage.contextWindow)}`
      : 'n/a'

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={togglePopover}
        className="mt-1.5 flex w-fit items-center gap-3 rounded-full border border-[var(--chat-hairline)] bg-white px-3 py-1 text-[10.5px] text-[var(--chat-text-faint)] transition hover:text-[var(--chat-text-dim)]"
        title="Turn usage — click for detail"
      >
        <span className="flex items-center gap-1">
          <Gauge size={11} /> {contextLabel}
        </span>
        <span className="flex items-center gap-1">
          <Coins size={11} /> {usage.tokensReported ? fmtCompact(usage.totalTokens) : 'n/a'}
        </span>
        <span className="flex items-center gap-1">
          <Wrench size={11} /> {usage.toolCalls}
        </span>
        <span className="chat-mono flex items-center gap-1 truncate">
          <Cpu size={11} /> {usage.model ?? 'n/a'}
        </span>
      </button>

      {open &&
        coords &&
        createPortal(
          <div
            ref={popRef}
            className="w-80 overflow-hidden rounded-[18px] border border-[var(--chat-hairline)] bg-white p-3 text-[12px] shadow-[0_24px_60px_-38px_rgba(33,22,76,0.75)]"
            style={{ position: 'fixed', zIndex: 9999, bottom: coords.bottom, left: coords.left }}
          >
            <div className="mb-2 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-faint)]">
              Turn usage
            </div>
            <Row label="Provider" value={usage.provider ?? 'not available'} />
            <Row label="Model" value={usage.model ?? 'not available'} mono />
            <Row
              label="Tokens (in / out / total)"
              value={
                usage.tokensReported
                  ? `${usage.inputTokens ?? '—'} / ${usage.outputTokens ?? '—'} / ${usage.totalTokens ?? '—'}`
                  : 'not reported by agent this turn'
              }
            />
            <Row
              label="Context window"
              value={
                usage.contextWindow
                  ? `${fmtCompact(usage.contextWindow)} tokens (static table — may be stale)`
                  : 'not available'
              }
            />
            <Row label="Tool calls" value={String(usage.toolCalls)} />
            <Row label="Latency" value={`${(usage.latencyMs / 1000).toFixed(1)}s`} />
            <Row label="Turn ID" value={usage.turnId} mono />
            <Row label="Cost" value="not available — no live pricing source wired up" />
            <div className="mt-2 border-t border-[var(--chat-hairline)] pt-2 text-[10.5px] leading-snug text-[var(--chat-text-faint)]">
              {usage.tokensReported
                ? 'Token counts as reported by the agent runtime.'
                : "Token counts aren't exposed by the agent runtime for this turn — shown as unavailable rather than a guess."}
            </div>
          </div>,
          document.body,
        )}
    </>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="mb-1.5 flex items-start justify-between gap-3">
      <span className="shrink-0 text-[var(--chat-text-faint)]">{label}</span>
      <span className={`text-right text-[var(--chat-text)] ${mono ? 'chat-mono text-[10.5px]' : ''}`}>{value}</span>
    </div>
  )
}
