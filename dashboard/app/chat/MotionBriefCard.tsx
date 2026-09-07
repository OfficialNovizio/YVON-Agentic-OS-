// MotionBriefCard — Stage 2 of the reference-build flow (re-engineer
// Phase 3, 2026-09-05). The Motion Options Brief the operator specified:
// ALWAYS presented, not a budget rule — what video-based motion achieves
// and why, what pure CSS/JS + GSAP + Lottie achieves and why, a per-need
// interchange analysis (what changes if we substitute one for the other),
// then the four decision options.
//
// The comparison itself is lib/motion-brief.ts — fixed data, never
// agent-generated, so no cost/license/capability can be hallucinated. The
// agent's design-gate fence (stage "motion") supplies only the OBSERVED
// needs rendered above the table: what this specific reference animates.
//
// Modeled on IntentGateCard / TaskProposalPrompt (same card anatomy).
//
// Owner: dev · design-to-product re-engineer, 2026-09-05
'use client'

import { useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Clapperboard, Code2, Check, ArrowLeftRight } from 'lucide-react'
import {
  CODE_COLUMN,
  INTERCHANGE_TABLE,
  MOTION_OPTIONS,
  VIDEO_COLUMN,
  type MotionColumn,
  type MotionNeed,
} from '@/lib/motion-brief'

export interface MotionGatePayload {
  stage: 'motion'
  sessionId: string
  needs: MotionNeed[]
}

interface MotionBriefCardProps {
  gate: MotionGatePayload | null
  roomId: string
  /** Sends the decision text into the room as a normal user turn. */
  onSend: (text: string) => void
  onResolved: () => void
}

function ColumnCard({ col }: { col: MotionColumn }) {
  return (
    <div
      className={`rounded-[14px] border px-4 py-3 ${
        col.id === 'video'
          ? 'border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)]'
          : 'border-[rgba(89,46,255,0.28)] bg-[rgba(89,46,255,0.04)]'
      }`}
    >
      <div className="flex items-center gap-2 text-[13px] font-semibold text-[var(--chat-body)]">
        {col.id === 'video' ? (
          <Clapperboard size={15} className="text-[var(--chat-accent)]" />
        ) : (
          <Code2 size={15} className="text-[var(--chat-accent)]" />
        )}
        {col.title}
        {col.hasUnverifiedDependency && (
          <span className="rounded-[6px] border border-[#b45309] px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em] text-[#b45309]">
            unverified dep
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[var(--chat-body)]">{col.what}</p>
      <p className="mt-1.5 text-[12.5px] leading-[1.55] text-[var(--chat-text-dim)]">
        {col.id === 'video' ? col.why : col.why}
      </p>
      <div className="mt-2 text-[12px] font-medium" style={{ color: col.costConfidence === 'verified' ? '#587000' : '#b45309' }}>
        {col.cost}
        {col.costConfidence === 'estimated' && ' (estimate)'}
      </div>
      <div className="mt-2 flex flex-wrap gap-1">
        {col.tooling.map((t) => (
          <span key={t} className="rounded-[6px] border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] text-[var(--chat-text-dim)]">
            {t}
          </span>
        ))}
      </div>
    </div>
  )
}

export function MotionBriefCard({ gate, roomId, onSend, onResolved }: MotionBriefCardProps) {
  const [pick, setPick] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null)
  const cardRef = useRef<HTMLDivElement | null>(null)

  if (!gate) return null

  async function resolve() {
    const option = MOTION_OPTIONS.find((o) => o.id === pick)
    if (!option) return
    setBusy(true)
    setResult(null)
    let followUp: string | null = null
    try {
      const res = await fetch('/api/chat/design-gate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'motion',
          sessionId: gate!.sessionId,
          roomId,
          decision: option.id,
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
      followUp = data.followUp ?? null
      setResult({ ok: true, message: 'Decision recorded — continuing…' })
    } catch (e) {
      setResult({ ok: false, message: e instanceof Error ? e.message : String(e) })
      setBusy(false)
      return
    }
    setBusy(false)
    const el = cardRef.current
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const done = () => {
      onResolved()
      if (followUp) onSend(followUp)
    }
    if (!el || reduced) done()
    else
      gsap.to(el, { opacity: 0, y: -8, scale: 0.97, duration: 0.28, ease: 'power2.in', onComplete: done })
  }

  const observed = gate.needs.filter((n) => n.need)

  return (
    <div className="relative z-10 px-4 pb-2 sm:px-8">
      <div
        ref={cardRef}
        className="adora-rise relative mx-auto w-full max-w-[880px] overflow-hidden rounded-[24px] border border-[rgba(89,46,255,0.28)] bg-white px-5 py-4"
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
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Motion — video or code? The options brief
            </div>

            {/* What THIS reference animates — observed by the agent. */}
            {observed.length > 0 && (
              <div className="mt-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--chat-text-dim)]">
                  What this reference animates
                </div>
                <ul className="mt-1.5 space-y-1">
                  {observed.map((n, i) => (
                    <li key={i} className="text-[13px] leading-[1.5] text-[var(--chat-body)]">
                      <span className="font-medium">{n.need}</span>
                      {n.reference ? <span className="text-[var(--chat-text-dim)]"> — {n.reference}</span> : null}
                      {n.bestPath ? (
                        <span className="ml-1.5 rounded-[6px] border border-[var(--chat-hairline)] px-1.5 py-0.5 text-[10px] uppercase tracking-[0.08em] text-[var(--chat-text-dim)]">
                          leans {n.bestPath}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* The two paths, side by side. */}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <ColumnCard col={VIDEO_COLUMN} />
              <ColumnCard col={CODE_COLUMN} />
            </div>

            {/* Per-need interchange: what changes if we substitute. */}
            <div className="mt-4 overflow-x-auto">
              <table className="w-full border-collapse text-left text-[12px] leading-[1.5]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.12em] text-[var(--chat-text-dim)]">
                    <th className="border-b border-[var(--chat-hairline)] pb-1.5 pr-3 font-semibold">Motion need</th>
                    <th className="border-b border-[var(--chat-hairline)] pb-1.5 pr-3 font-semibold">Video path</th>
                    <th className="border-b border-[var(--chat-hairline)] pb-1.5 pr-3 font-semibold">Code path</th>
                    <th className="border-b border-[var(--chat-hairline)] pb-1.5 font-semibold">What swapping changes</th>
                  </tr>
                </thead>
                <tbody>
                  {INTERCHANGE_TABLE.map((r) => (
                    <tr key={r.need} className="align-top">
                      <td className="border-b border-[var(--chat-hairline)] py-2 pr-3 font-medium text-[var(--chat-body)]">
                        {r.need}
                      </td>
                      <td className="border-b border-[var(--chat-hairline)] py-2 pr-3 text-[var(--chat-body)]">{r.videoPath}</td>
                      <td className="border-b border-[var(--chat-hairline)] py-2 pr-3 text-[var(--chat-body)]">{r.codePath}</td>
                      <td className="border-b border-[var(--chat-hairline)] py-2 text-[var(--chat-text-dim)]">{r.swapEffect}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* The four decisions. */}
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {MOTION_OPTIONS.map((o) => (
                <button
                  key={o.id}
                  onClick={() => setPick(o.id)}
                  disabled={busy}
                  className={`rounded-[14px] border px-4 py-3 text-left transition disabled:opacity-50 ${
                    pick === o.id
                      ? 'border-[var(--chat-accent)] bg-[rgba(89,46,255,0.06)]'
                      : 'border-[var(--chat-hairline)] bg-white hover:border-[var(--chat-accent)]'
                  }`}
                >
                  <div className="flex items-center gap-2 text-[13.5px] font-medium text-[var(--chat-body)]">
                    <Check size={14} className={pick === o.id ? 'text-[var(--chat-accent)]' : 'text-transparent'} />
                    {o.title}
                  </div>
                  <div className="mt-1 text-[12px] leading-[1.5] text-[var(--chat-text-dim)]">{o.detail}</div>
                  {pick === o.id && o.obligation && (
                    <div className="mt-1.5 text-[11px] font-medium text-[#b45309]">{o.obligation}</div>
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <button onClick={resolve} disabled={busy || !pick} className="adora-cta text-[14px]">
                <Check size={16} />
                {busy ? 'Recording…' : 'Record motion decision'}
              </button>
              <span className="text-[12px] text-[var(--chat-text-dim)]">
                The build does not start until this is decided.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
