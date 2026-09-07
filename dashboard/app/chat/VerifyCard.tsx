// VerifyCard — the alignment loop's verdict surface (re-engineer Phase 7,
// 2026-09-06). Rendered from a design.verify frame (the agent's
// ```design-gate {"stage":"verify"} fence, parsed by the stream route): one
// verdict row per acceptance criterion (cited by WI ref) AND one per
// original user ask — the two things the output is actually judged against.
//
// The loop's two exits:
//   · Fix gaps    → TaskFocusView sends a [TASK FIX] turn with the gap list
//                   (build → verify → fix → verify … until aligned or the
//                   operator decides otherwise).
//   · Pass → review → /api/task-spec/[id]/command 'verify-pass': records
//                   every verdict via task.py set-acceptance (aligned → pass,
//                   gap → fail, evidence verbatim), then gate (which refuses
//                   when a produces path is missing), then review. The suite,
//                   not this card, decides done — review is a run, not a
//                   signature.
//
// Unknown statuses never reach here (the stream parser normalizes to 'gap').

'use client'

import { useState } from 'react'
import { CircleCheck, CircleAlert, ArrowRight, Wrench } from 'lucide-react'

export interface VerifyVerdictRow {
  ref?: string
  ask?: string
  status: 'aligned' | 'gap'
  evidence: string
}

interface VerifyCardProps {
  taskId: string
  verdicts: VerifyVerdictRow[]
  asks: VerifyVerdictRow[]
  summary: string
  /** ref → criterion text, from the live task record (the fence only cites refs). */
  criteriaText: Record<string, string>
  /** Starts the fix loop — receives the gap strings. */
  onFixGaps: (gaps: string[]) => void
  /** Re-runs the verify turn without a build/fix turn first — for when new
   * evidence landed (artifacts published, environment gaps closed) since the
   * last verdict. Verify is read-only, so re-running is always safe. */
  onReverify: () => void
  /** Called after a successful pass→review so the view reloads the task. */
  onPassed: () => void
}

export function VerifyCard({ taskId, verdicts, asks, summary, criteriaText, onFixGaps, onReverify, onPassed }: VerifyCardProps) {
  const [busy, setBusy] = useState<'fix' | 'pass' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const gaps = verdicts.filter((v) => v.status === 'gap')
  const askGaps = asks.filter((a) => a.status === 'gap')
  const aligned = verdicts.filter((v) => v.status === 'aligned')
  // The fix loop's input: criterion gaps (with their ref + record text) AND
  // ask gaps — a gap ask with all-aligned criteria is exactly the "built the
  // wrong thing correctly" failure the alignment loop exists to catch.
  const gapStrings = [
    ...gaps.map((g) => {
      const text = g.ref ? criteriaText[g.ref] : undefined
      const head = g.ref ? `${g.ref}${text ? ` — ${text}` : ''}` : g.ask ?? 'criterion'
      return g.evidence ? `${head}: ${g.evidence}` : head
    }),
    ...askGaps.map((a) => `Original ask — "${a.ask}": ${a.evidence || 'not met in the built output'}`),
  ]
  const allClear = gaps.length === 0 && askGaps.length === 0

  // The [TASK VERIFY] contract instructs the verifier to cite "WI-N:M" refs,
  // but a model can emit its own criterion slugs instead (live E2E 2026-09-06:
  // ref "criterion-two-section-responsive-landing"). set-acceptance needs a
  // real WI ref, so slug-cited rows are resolved against the criterion texts
  // from the live record — unique best match only. Anything ambiguous or
  // unresolved is an honest error, never a guessed write into the record.
  function resolveVerdictRefs(rows: VerifyVerdictRow[]) {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
    const entries = Object.entries(criteriaText)
    return rows.map((v) => {
      if (v.ref && /^(.+):(\d+)$/.test(v.ref) && criteriaText[v.ref]) {
        return { ref: v.ref, status: v.status, evidence: v.evidence }
      }
      const slug = norm(`${v.ref ?? ''} ${v.ask ?? ''}`.replace(/\bcriterion\b/g, ' '))
      if (!slug) throw new Error('a verdict row carries no ref or ask text to resolve against the record')
      let best: { ref: string; score: number } | null = null
      let tie = false
      for (const [ref, text] of entries) {
        const t = norm(text)
        const tokens = slug.split(' ').filter(Boolean)
        const score = tokens.length ? tokens.filter((tok) => t.includes(tok)).length / tokens.length : 0
        if (score > (best?.score ?? -1)) { best = { ref, score }; tie = false }
        else if (best && score === best.score) tie = true
      }
      if (!best || best.score < 0.6 || tie) {
        throw new Error(`verdict "${v.ref ?? v.ask ?? '?'}" does not resolve to a unique criterion ref (best match ${best ? `${best.score.toFixed(2)}` : 'none'}) — re-verify so the verifier cites the WI refs from the record`)
      }
      return { ref: best.ref, status: v.status, evidence: v.evidence }
    })
  }

  async function handlePassReview() {
    setBusy('pass')
    setError(null)
    try {
      const resolved = resolveVerdictRefs(verdicts)
      const res = await fetch(`/api/task-spec/${taskId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cmd: 'verify-pass', verdicts: resolved }),
      })
      const data = (await res.json()) as { ok?: boolean; error?: string; steps?: { step: string; ok: boolean }[] }
      if (!res.ok || !data.ok) throw new Error(data.error ?? `HTTP ${res.status}`)
      onPassed()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="chat-glass-soft mt-4 p-5">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[var(--chat-text-faint)]">
          ✅ Verify · {taskId} — output vs original asks
        </div>
        <div
          className="chat-mono text-[11px]"
          style={{ color: gaps.length > 0 ? '#b91c1c' : '#587000' }}
        >
          {aligned.length} aligned · {gaps.length} gap{gaps.length === 1 ? '' : 's'}
        </div>
      </div>

      {summary && (
        <p className="mb-3 text-[12.5px] leading-[1.6] text-[var(--chat-body)]">{summary}</p>
      )}

      {/* Criteria verdicts — cited by WI ref, text resolved from the record */}
      <div className="space-y-1">
        {verdicts.map((v, i) => {
          const text = v.ref ? criteriaText[v.ref] : undefined
          const gap = v.status === 'gap'
          return (
            <div
              key={`${v.ref ?? i}-${i}`}
              className="flex items-start gap-2.5 rounded-[10px] px-1.5 py-2"
              style={{ background: gap ? 'rgba(239,68,68,0.04)' : undefined }}
            >
              <span
                className="mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-[4px] text-[9px] font-bold text-white"
                style={{ background: gap ? '#b91c1c' : '#587000' }}
              >
                {gap ? <CircleAlert className="h-2.5 w-2.5" /> : <CircleCheck className="h-2.5 w-2.5" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-[12.5px] leading-[1.45]" style={{ color: gap ? '#b91c1c' : 'var(--chat-body)' }}>
                  {v.ref && <span className="chat-mono mr-1.5 text-[10px] text-[var(--chat-text-faint)]">{v.ref}</span>}
                  {text ?? v.ask ?? v.ref ?? 'criterion'}
                </div>
                {v.evidence && (
                  <div className="mt-0.5 text-[11.5px] leading-[1.45] text-[var(--chat-text-dim)]">{v.evidence}</div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Original asks — the user's verbatim words judged in their own right */}
      {asks.length > 0 && (
        <div className="mt-3">
          <div className="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.1em] text-[var(--chat-text-faint)]">
            Original asks
          </div>
          <div className="space-y-1">
            {asks.map((a, i) => {
              const gap = a.status === 'gap'
              return (
                <div key={`ask-${i}`} className="flex items-start gap-2.5 px-1.5 py-1.5">
                  <span
                    className="mt-0.5 h-[7px] w-[7px] shrink-0 rounded-full"
                    style={{ background: gap ? '#b91c1c' : '#587000', marginTop: 6 }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] leading-[1.5]" style={{ color: gap ? '#b91c1c' : 'var(--chat-text-dim)' }}>
                      &ldquo;{a.ask}&rdquo;
                    </div>
                    {a.evidence && (
                      <div className="mt-0.5 text-[11px] leading-[1.45] text-[var(--chat-text-faint)]">{a.evidence}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* The loop's exits */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {!allClear ? (
          <>
            <button
              onClick={() => {
                setBusy('fix')
                onFixGaps(gapStrings)
              }}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-[13px] font-semibold text-white transition disabled:opacity-50"
              style={{ background: 'var(--chat-accent)' }}
            >
              <Wrench className="h-3.5 w-3.5" />
              {busy === 'fix' ? 'Starting…' : `Fix gaps (${gaps.length + askGaps.length})`}
            </button>
            <button
              onClick={() => {
                setBusy('fix')
                onReverify()
              }}
              disabled={busy !== null}
              className="inline-flex items-center gap-1.5 rounded-[8px] border border-[rgba(89,46,255,0.4)] bg-white px-3 py-2 text-[12.5px] font-medium text-[var(--chat-accent)] transition hover:border-[rgba(89,46,255,0.7)] disabled:opacity-50"
            >
              {busy === 'fix' ? 'Starting…' : 'Re-verify'}
            </button>
            <span className="text-[11px] text-[var(--chat-text-faint)]">
              Pass → review unlocks when the gaps are fixed and re-verified. New evidence (published artifacts, closed environment gaps) can be picked up with Re-verify — no build turn needed.
            </span>
          </>
        ) : (
          <button
            onClick={handlePassReview}
            disabled={busy !== null}
            className="inline-flex items-center gap-1.5 rounded-[8px] px-4 py-2 text-[13px] font-semibold text-white transition disabled:opacity-50"
            style={{ background: '#587000' }}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {busy === 'pass' ? 'Recording…' : 'Pass → review'}
          </button>
        )}
      </div>
      {error && (
        <div className="mt-2 rounded-[10px] border border-[rgba(239,68,68,0.25)] bg-[rgba(239,68,68,0.05)] px-3 py-2 text-[11.5px] text-[#b91c1c]">
          {error}
        </div>
      )}
    </div>
  )
}
