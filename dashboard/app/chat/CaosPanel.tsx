// CaosPanel — the CAOS v2 rail panel. Replaces PipelineHud.tsx (30KB, twelve
// phases of which three ever emitted an event; see docs/CAOS-V1-DEPRECATED.md).
//
// DESIGN DECISIONS, and where they came from
// ------------------------------------------
// · Seven steps in three stages, because the stages have genuinely different
//   cost profiles: PREPARE is local and free, EXECUTE is the only stage that
//   spends, SETTLE is a durable record. That split is the whole mental model.
// · Cost is the headline. The panel exists to answer "is it stuck" and "why
//   did that cost so much"; v1 could answer neither.
// · Every row expands to show what it decided — operator request, 22 Aug.
// · Governor sleep is its OWN state, not a slower kind of working — operator
//   decision, same day. Twelve seconds asleep and twelve thinking look
//   identical today, and that is a large part of why turns feel stuck.
// · The rail does NOT widen during a live turn — operator decision. Everything
//   here is sized for 312px (page.tsx `w-[312px]`).
// · Numbers are never invented. A measurement we do not have renders as
//   "not measured", never 0 — see buildCaosView's null discipline.
//
// All decision logic lives in lib/caos-v2.ts as pure functions with unit tests
// (dashboard/tests/caos-v2.test.ts). This file only renders. That separation is
// deliberate: docs/SESSION-HANDOUT.md §5.1 records a /chat redesign verified by
// tsc alone and rolled back in full, so the parts that can be proven without a
// browser are kept where they can be.
'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { buildCaosView, CAOS_V2_STAGES } from '@/lib/caos-v2'
import type { CaosCall, CaosStep, CaosView, StageId, TurnUsageLike } from '@/lib/caos-v2'
import type { PipelineStage } from '@/lib/pipeline'
// styles live in app/chat/caos-panel.css, imported by page.tsx alongside
// chat.css — matching this route's existing convention rather than importing
// CSS from inside a component.

interface CaosPanelProps {
  stages: PipelineStage[]
  source: 'live' | 'past' | 'none'
  agents: string[]
  thinking: string | null
  /** the `usage` payload from the turn's `done` event, when it has landed */
  usage?: TurnUsageLike | null
  /** true while a turn is streaming — drives the live/hold states */
  awaiting?: boolean
}

const CARD_FOR_STAGE: Record<StageId, string> = {
  prepare: 'caos2-card-prepare',
  execute: 'caos2-card-execute',
  settle: 'caos2-card-settle',
}

function Chevron() {
  return (
    <svg className="caos2-chev" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** A number we do not have must not render as a number. */
function Metric({ k, v, sub, hot }: { k: string; v: number | null; sub?: string; hot?: boolean }) {
  const missing = v === null
  return (
    <div>
      <p className="k">{k}</p>
      <p className={`v${missing ? ' is-na' : hot ? ' is-hot' : ''}`}>
        {missing ? 'not measured' : v.toLocaleString()}
      </p>
      {sub ? <p className="s">{sub}</p> : null}
    </div>
  )
}

function StepRow({ step }: { step: CaosStep }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`caos2-step${open ? ' is-open' : ''}`}>
      <button
        type="button"
        className="caos2-head"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <span className={`caos2-dot is-${step.status}`} />
        <span>
          <span className="caos2-nm">{step.n} · {step.title}</span>
          <span className="caos2-de">{step.summary}</span>
        </span>
        <span className="caos2-ms">{step.ms == null ? '' : `${step.ms} ms`}</span>
        <Chevron />
      </button>
      {open && (
        <div className="caos2-body">
          {step.chips?.length ? (
            <div className="caos2-chips">
              {step.chips.map((c, i) => (
                <span key={`${c.text}-${i}`} className={`caos2-kw${c.on ? '' : ' is-off'}`}>{c.text}</span>
              ))}
            </div>
          ) : null}
          {step.detail.length ? (
            <dl className="caos2-kv">
              {step.detail.map((d, i) => (
                <div key={`${d.label}-${i}`} style={{ display: 'contents' }}>
                  <dt>{d.label}</dt>
                  <dd>{d.muted ? <span className="caos2-mut">{d.value}</span> : d.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          {step.verdict ? <div className="caos2-verdict">{step.verdict}</div> : null}
        </div>
      )}
    </div>
  )
}

function CallRow({ call }: { call: CaosCall }) {
  const [open, setOpen] = useState(false)
  const holding = call.status === 'hold'
  const running = call.status === 'run'
  const chipClass = holding ? ' is-hold' : call.status === 'error' ? ' is-err' : call.tool ? '' : ' is-nil'
  return (
    <div className={`caos2-call${open ? ' is-open' : ''}`}>
      <button type="button" className="caos2-chead" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        <span className="caos2-idx">CALL {call.n}</span>
        <span style={{ minWidth: 0 }}>
          <span className={`caos2-chip${chipClass}`}>
            {holding
              ? `⏸ rate-limited · ${(call.waitMs / 1000).toFixed(1)}s`
              : call.tool ?? 'no tool — final answer'}
          </span>
          {call.args ? <code className="caos2-cmd">{call.args}</code> : null}
          {running || holding ? (
            <span className={`caos2-pend${holding ? ' is-hold' : ''}`} data-caos-pulse="1">
              <span /><span /><span />
            </span>
          ) : null}
        </span>
        <span className="caos2-tok">{call.tokens == null ? (call.ms == null ? '' : `${call.ms} ms`) : call.tokens.toLocaleString()}</span>
        <Chevron />
      </button>
      {open && (
        <div className="caos2-body" style={{ paddingLeft: 45 }}>
          <dl className="caos2-kv">
            {call.waitMs > 0 ? (
              <div style={{ display: 'contents' }}>
                <dt>waited</dt>
                <dd><b style={{ color: '#8a6114' }}>{(call.waitMs / 1000).toFixed(1)}s on the rate limit</b></dd>
              </div>
            ) : null}
            <div style={{ display: 'contents' }}>
              <dt>duration</dt>
              <dd>{call.ms == null ? <span className="caos2-mut">not measured</span> : `${call.ms} ms`}</dd>
            </div>
            <div style={{ display: 'contents' }}>
              <dt>outcome</dt>
              <dd>{call.ok ? 'ok' : 'failed'}</dd>
            </div>
          </dl>
          {call.summary ? <div className="caos2-out">{call.summary}</div> : null}
        </div>
      )}
    </div>
  )
}

export function CaosPanel({ stages, source, agents, thinking, usage, awaiting }: CaosPanelProps) {
  const view: CaosView = useMemo(
    () => buildCaosView({ stages, source, usage, agent: agents[0] ?? null, awaiting }),
    [stages, source, usage, agents, awaiting],
  )

  const rootRef = useRef<HTMLDivElement | null>(null)
  const washRef = useRef<HTMLSpanElement | null>(null)
  const washTween = useRef<gsap.core.Tween | null>(null)

  const live = view.mode === 'live' || view.mode === 'hold'

  // ── the wash: the panel's only ambient motion, and it runs ONLY while a
  //    call is actually outstanding. Kept OUT of any timeline — a repeat:-1
  //    tween inside one makes that timeline's duration infinite, which is a
  //    real bug we hit building the mock. Killed on unmount and whenever the
  //    turn ends, so an aborted turn (Esc) cannot leak a running ticker.
  useEffect(() => {
    const el = washRef.current
    if (!el) return
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    washTween.current?.kill()
    washTween.current = null
    if (!live || reduced) {
      gsap.to(el, { opacity: 0, duration: 0.3 })
      return
    }
    gsap.to(el, { opacity: 1, duration: 0.35 })
    washTween.current = gsap.to(el, {
      backgroundPosition: '-280% 0', duration: 5, ease: 'none', repeat: -1,
    })
    return () => { washTween.current?.kill(); washTween.current = null }
  }, [live])

  // ── in-flight dots. Written straight to the DOM through GSAP rather than
  //    React state: a 60fps state update for a 20s turn is ~1,200 re-renders
  //    of a tree that includes the message list, which would make this panel
  //    the reason the page stutters.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    const dots = root.querySelectorAll('[data-caos-pulse="1"] > span')
    if (!dots.length) return
    const tw = gsap.to(dots, {
      scale: 1.9, opacity: 0.35, duration: view.mode === 'hold' ? 0.9 : 0.5,
      yoyo: true, repeat: -1, ease: 'sine.inOut', transformOrigin: '50% 50%',
      stagger: { each: view.mode === 'hold' ? 0.22 : 0.13, yoyo: true, repeat: -1 },
    })
    return () => { tw.kill(); gsap.set(dots, { scale: 1, opacity: 1 }) }
  }, [view.calls.length, view.mode])

  // stage pills are navigation — 1:1 with the cards below
  const jump = useCallback((stage: StageId) => {
    const el = rootRef.current?.querySelector(`.${CARD_FOR_STAGE[stage]}`)
    if (!(el instanceof HTMLElement)) return
    const reduced = typeof window !== 'undefined'
      && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest' })
    el.classList.remove('is-flash')
    void el.offsetWidth
    el.classList.add('is-flash')
    window.setTimeout(() => el.classList.remove('is-flash'), 1100)
  }, [])

  if (view.mode === 'none') {
    return (
      <div className="caos2" ref={rootRef}>
        <div className="caos2-hd">
          <div>
            <div className="caos2-ttl">CAOS <span className="caos2-badge is-past">Idle</span></div>
            <div className="caos2-sub">Context-Aware Orchestration System</div>
          </div>
        </div>
        <div className="caos2-card"><p className="caos2-empty">Send a message to see the turn.</p></div>
      </div>
    )
  }

  const badge = view.mode === 'hold' ? 'is-hold' : view.mode === 'live' ? 'is-live' : 'is-past'
  const badgeText = view.mode === 'hold' ? 'Hold' : view.mode === 'live' ? 'Live' : 'Past'
  const stageMs = (id: StageId) => {
    const ms = view.stageMs[id]
    return ms == null ? '—' : ms >= 1000 ? `${(ms / 1000).toFixed(1)} s` : `${ms} ms`
  }
  const byStage = (id: StageId) => view.steps.filter((s) => s.stage === id)

  return (
    <div className="caos2" ref={rootRef}>
      <div className="caos2-hd">
        <div>
          <div className="caos2-ttl">
            CAOS
            <span className={`caos2-badge ${badge}`}>
              {live ? <span className="caos2-lamp" /> : null}{badgeText}
            </span>
          </div>
          <div className="caos2-sub">Context-Aware Orchestration System</div>
        </div>
      </div>

      <p className="caos2-scope">This message</p>
      <div className="caos2-cost">
        <Metric k="Calls" v={view.cost.llmCalls}
          sub={view.cost.iterationCap ? `cap ${view.cost.iterationCap} · ${view.cost.tier}` : undefined} />
        <Metric k="Est input" v={view.cost.estInputTokens} hot
          sub={view.cost.llmCalls && view.cost.estInputTokens
            ? `~${Math.round(view.cost.estInputTokens / view.cost.llmCalls / 100) / 10}k per call`
            : undefined} />
        <Metric k="Fixed/call" v={view.cost.fixedPerCall} hot sub="before context" />
        <Metric k="Provider tokens" v={view.cost.providerTokens} sub="runtime exposes none" />
      </div>

      <p className="caos2-scope">This conversation</p>
      <div className="caos2-room">
        <span>
          {view.room.turns == null
            ? <span className="caos2-mut">pool position not reported</span>
            : <><b>{view.room.turns}</b> turn{view.room.turns === 1 ? '' : 's'} in this room</>}
        </span>
        {view.room.turnsUntilRecycle != null && (
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                title={`the pooled agent recycles at ${view.room.recycleAtTurns} turns`}>
            recycle in <b>{view.room.turnsUntilRecycle}</b>
            <span className="caos2-meter">
              <i style={{ width: `${Math.min(100, ((view.room.turns ?? 0) / view.room.recycleAtTurns) * 100)}%` }} />
            </span>
          </span>
        )}
      </div>

      <div className="caos2-stages">
        {CAOS_V2_STAGES.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`caos2-stg${s.id === 'execute' && live ? '' : view.stageMs[s.id] == null ? ' is-dim' : ''}`}
            onClick={() => jump(s.id)}
            title={s.note}
          >
            {s.id === 'execute' && (
              <span ref={washRef} className={`caos2-wash${view.mode === 'hold' ? ' is-hold' : ''}`} />
            )}
            <span className="n">{`Stage ${s.id === 'prepare' ? 1 : s.id === 'execute' ? 2 : 3}`}</span>
            <span className="v" style={{ display: 'block' }}>{s.label}</span>
            <span className="t" style={{ display: 'block' }}>
              {s.id === 'execute'
                ? (view.mode === 'hold' ? 'rate limited…' : `${stageMs(s.id)} · ${view.calls.length} calls`)
                : `${stageMs(s.id)} · ${byStage(s.id).length} rows`}
            </span>
          </button>
        ))}
      </div>

      <div className="caos2-card caos2-card-prepare">
        <div className="caos2-cardhd"><span className="l">Prepare</span><span className="r">local · no model</span></div>
        {byStage('prepare').map((s) => <StepRow key={s.id} step={s} />)}
      </div>

      <div className="caos2-card caos2-card-execute">
        <div className="caos2-cardhd">
          <span className="l">6 · Work loop</span>
          <span className="r">{view.calls.length} tool call{view.calls.length === 1 ? '' : 's'}</span>
        </div>
        <div className="caos2-loop">
          {view.calls.length === 0
            ? <p className="caos2-empty" style={{ padding: '10px 0' }}>
                {live ? 'no tool calls yet' : 'this turn used no tools'}
              </p>
            : view.calls.map((c) => <CallRow key={c.n} call={c} />)}
        </div>
        <div className="caos2-foot">
          <span>{thinking ?? (live ? 'running' : 'complete')}</span>
          <span className="caos2-elapsed">
            {view.elapsedMs == null ? '—' : `${(view.elapsedMs / 1000).toFixed(1)}s`}
          </span>
        </div>
      </div>

      <div className="caos2-card caos2-card-settle">
        <div className="caos2-cardhd"><span className="l">Settle</span><span className="r">durable</span></div>
        {byStage('settle').map((s) => <StepRow key={s.id} step={s} />)}
      </div>
    </div>
  )
}
