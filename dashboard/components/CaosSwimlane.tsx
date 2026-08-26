'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabaseSource } from '@/lib/events/supabase-source'
import { gsap } from 'gsap'
import { Loader2 } from 'lucide-react'
import type { CaosView, CaosStep } from '@/lib/caos-v2'
import { CAOS_V2_STAGES } from '@/lib/caos-v2'

/* ═══════════════════════════════════════════════════════════════════════
   CAOS SWIMLANE (2026-08-26) — the CAOS v2 board as a horizontal flow:
     PREPARE → EXECUTE → SETTLE  (three lanes, step cards inside)
     + telemetry strip along the bottom (tool calls · cost · room).
   Steps are collapsed by default (status + summary); click to expand the
   full what-read→what-decided detail, verdict, and chips. Honest statuses
   (ok/warn/skip/run/pending) get real colors — "skip" renders dashed, never
   hidden. Live: refetches on new phase/gate/loop/tool events (debounced)
   with a scanning light + sequential flash.
   Data: /api/software-pipeline/caos (buildCaosView over the events table).
   ═══════════════════════════════════════════════════════════════════════ */

const STATUS_TONE: Record<CaosStep['status'], { color: string; label: string }> = {
  ok: { color: '#3ddc97', label: 'ok' },
  warn: { color: '#ffb693', label: 'warn' },
  skip: { color: '#5a5f68', label: 'skip' },
  run: { color: '#abc7ff', label: 'running' },
  pending: { color: 'rgba(255,255,255,.28)', label: 'pending' },
}

const CAOS_KINDS = ['phase.classify', 'phase.resolve', 'phase.retrieve', 'tool.call', 'gate.passed', 'gate.blocked', 'loop.iteration', 'run.completed', 'run.failed']

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function CaosSwimlane({ workspaceKey }: { workspaceKey: string }) {
  const [turns, setTurns] = useState<{ id: string; ts: number; agent: string | null; count: number }[]>([])
  const [view, setView] = useState<CaosView | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const scanRef = useRef<HTMLDivElement | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const load = useCallback(async (turnId?: string) => {
    try {
      const qs = turnId ? `?turn=${encodeURIComponent(turnId)}` : ''
      const res = await fetch(`/api/software-pipeline/caos${qs}`)
      const d = await res.json()
      if (d.turns?.length) {
        setTurns(d.turns)
        if (!selectedId) setSelectedId(d.turns[0].id)
      }
      if (d.view) setView(d.view)
    } catch { /* keep current */ }
    setLoading(false)
  }, [selectedId])

  useEffect(() => { load() }, [load])

  // Live: refetch (debounced) when CAOS events land.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsub = supabaseSource(workspaceKey).subscribe((e) => {
      if (!CAOS_KINDS.includes(e.kind)) return
      setLive(true)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => load(), 600)
    })
    return () => { unsub(); if (timer) clearTimeout(timer) }
  }, [workspaceKey, load])

  // Ambient scan line across the lanes + step flash on view change.
  useEffect(() => {
    const scan = scanRef.current
    if (scan) {
      gsap.killTweensOf(scan)
      gsap.set(scan, { left: '-20%', opacity: 0.9 })
      gsap.to(scan, { left: '110%', duration: 5, repeat: -1, ease: 'none' })
    }
    const steps = view?.steps ?? []
    steps.forEach((s, i) => {
      const el = cardRefs.current[s.id]
      if (!el) return
      gsap.killTweensOf(el)
      gsap.fromTo(
        el,
        { boxShadow: '0 0 0 rgba(61,220,151,0)' },
        { boxShadow: '0 0 20px rgba(61,220,151,.45)', duration: 0.3, delay: i * 0.12, yoyo: true, repeat: 1, ease: 'power2.inOut' },
      )
    })
  }, [view])

  const lanes = useMemo(() => {
    const byStage = new Map<string, CaosStep[]>()
    for (const st of view?.steps ?? []) {
      const arr = byStage.get(st.stage) ?? []
      arr.push(st)
      byStage.set(st.stage, arr)
    }
    return CAOS_V2_STAGES.map((s) => ({ ...s, steps: byStage.get(s.id) ?? [] }))
  }, [view])

  const calls = view?.calls ?? []
  const cost = view?.cost
  const room = view?.room

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-on-surface">CAOS v2 — orchestration flow</span>
        {live && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
          </span>
        )}
        {view?.elapsedMs != null && <span className="text-[10.5px] text-on-surface-variant/60">{view.elapsedMs}ms turn</span>}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {turns.slice(0, 6).map((t) => (
            <button
              key={t.id}
              onClick={() => { setSelectedId(t.id); setExpanded(null) }}
              className={`rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition ${
                selectedId === t.id
                  ? 'border-white/25 bg-white/10 text-on-surface'
                  : 'border-white/5 bg-transparent text-on-surface-variant hover:border-white/10'
              }`}
            >
              {t.agent ?? 'turn'} · {timeAgo(t.ts)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-on-surface-variant/50" /></div>
      ) : !view ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">account_tree</span>
          <p className="text-[12.5px] text-on-surface-variant">No CAOS turns recorded yet — send a message in chat and the orchestration flow appears here.</p>
        </div>
      ) : (
        <>
          {/* ── the three lanes ── */}
          <div className="relative overflow-hidden rounded-xl border border-white/8 bg-black/20">
            {/* scan line */}
            <div ref={scanRef} className="pointer-events-none absolute top-0 h-full w-[18%] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
            <div className="grid grid-cols-1 gap-3 p-3 md:grid-cols-3">
              {lanes.map((lane) => (
                <div key={lane.id} className="flex flex-col gap-2">
                  <div className="flex items-baseline gap-2 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-on-surface">{lane.label}</span>
                    <span className="text-[10px] text-on-surface-variant/60">{lane.note}</span>
                    <span className="ml-auto rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] text-on-surface-variant">{lane.steps.length}</span>
                  </div>
                  {lane.steps.length === 0 && (
                    <div className="rounded-xl border border-dashed border-white/8 px-3 py-4 text-center text-[10.5px] italic text-on-surface-variant/50">no steps recorded</div>
                  )}
                  {lane.steps.map((s) => {
                    const tone = STATUS_TONE[s.status]
                    const open = expanded === s.id
                    return (
                      <div
                        key={s.id}
                        ref={(el) => { cardRefs.current[s.id] = el }}
                        onClick={() => setExpanded(open ? null : s.id)}
                        className={`cursor-pointer rounded-xl border p-2.5 backdrop-blur transition hover:border-white/25 ${
                          s.status === 'skip' ? 'border-dashed' : ''
                        }`}
                        style={{
                          borderColor: open ? `${tone.color}66` : s.status === 'skip' ? 'rgba(255,255,255,.1)' : 'rgba(255,255,255,.1)',
                          background: s.status === 'skip' ? 'rgba(255,255,255,.02)' : 'rgba(255,255,255,.05)',
                        }}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9.5px] font-bold text-on-surface-variant">{s.n}</span>
                          <span className="truncate text-[12px] font-semibold text-on-surface">{s.title}</span>
                          <span
                            className="ml-auto flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                            style={{ background: `${tone.color}1c`, color: tone.color }}
                          >
                            {s.status === 'run' && <i className="h-1 w-1 animate-pulse rounded-full" style={{ background: tone.color }} />}
                            {tone.label}
                          </span>
                        </div>
                        <p className={`mt-1 text-[11px] leading-snug ${open ? 'text-on-surface' : 'truncate text-on-surface-variant'}`}>{s.summary || '—'}</p>
                        {s.ms != null && <p className="mt-0.5 text-[9.5px] text-on-surface-variant/50">{s.ms}ms</p>}

                        {open && (
                          <div className="mt-2 space-y-1.5 border-t border-white/5 pt-2">
                            {s.chips && s.chips.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {s.chips.map((c) => (
                                  <span key={c.text} className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold ${c.on ? 'bg-white/10 text-on-surface' : 'bg-white/[0.03] text-on-surface-variant/60 line-through'}`}>{c.text}</span>
                                ))}
                              </div>
                            )}
                            {s.detail.map((d) => (
                              <div key={d.label} className="flex items-baseline gap-2">
                                <span className="w-24 shrink-0 text-[9.5px] font-bold uppercase tracking-wider text-on-surface-variant/70">{d.label}</span>
                                <span className={`text-[11px] leading-snug ${d.muted ? 'text-on-surface-variant/60' : 'text-on-surface'}`}>{d.value}</span>
                              </div>
                            ))}
                            {s.verdict && (
                              <p className="pt-1 text-[11px] font-medium" style={{ color: s.status === 'warn' ? '#ffb693' : s.status === 'skip' ? '#5a5f68' : '#3ddc97' }}>{s.verdict}</p>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* ── telemetry strip ── */}
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
            <div className="rounded-xl border border-white/8 bg-black/25 p-3">
              <div className="mb-2 text-[9.5px] font-bold uppercase tracking-widest text-on-surface-variant/70">Tool calls</div>
              {calls.length === 0 ? (
                <p className="text-[10.5px] italic text-on-surface-variant/50">none recorded</p>
              ) : (
                <div className="space-y-1">
                  {calls.slice(-6).map((c, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px]">
                      <i className="h-1.5 w-1.5 rounded-full" style={{ background: c.status === 'error' ? '#ff6b60' : c.status === 'hold' ? '#ffb693' : c.status === 'run' ? '#abc7ff' : '#3ddc97' }} />
                      <span className="font-mono text-[10px] text-on-surface-variant/70">#{c.n}</span>
                      <span className="truncate text-on-surface">{c.tool ?? '—'}</span>
                      <span className="ml-auto text-[9.5px] text-on-surface-variant/60">{c.ms != null ? `${c.ms}ms` : ''}{c.waitMs ? ` · wait ${(c.waitMs / 1000).toFixed(1)}s` : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-xl border border-white/8 bg-black/25 p-3">
              <div className="mb-2 text-[9.5px] font-bold uppercase tracking-widest text-on-surface-variant/70">Cost</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <span className="text-on-surface-variant/70">LLM calls</span><span className="text-right text-on-surface">{cost?.llmCalls ?? '—'}</span>
                <span className="text-on-surface-variant/70">Est. input</span><span className="text-right text-on-surface">{cost?.estInputTokens != null ? `${cost.estInputTokens.toLocaleString()} tok` : '—'}</span>
                <span className="text-on-surface-variant/70">Governor wait</span><span className="text-right text-on-surface">{cost?.governorWaitS != null ? `${cost.governorWaitS}s` : '—'}</span>
                <span className="text-on-surface-variant/70">Provider tokens</span><span className="text-right text-on-surface">{cost?.providerTokens ?? '—'}</span>
                <span className="text-on-surface-variant/70">Tier</span><span className="text-right capitalize text-on-surface">{cost?.tier ?? '—'}</span>
                <span className="text-on-surface-variant/70">Iteration cap</span><span className="text-right text-on-surface">{cost?.iterationCap ?? '—'}</span>
              </div>
            </div>

            <div className="rounded-xl border border-white/8 bg-black/25 p-3">
              <div className="mb-2 text-[9.5px] font-bold uppercase tracking-widest text-on-surface-variant/70">Room</div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px]">
                <span className="text-on-surface-variant/70">Turns</span><span className="text-right text-on-surface">{room?.turns ?? '—'}</span>
                <span className="text-on-surface-variant/70">Until recycle</span><span className="text-right text-on-surface">{room?.turnsUntilRecycle ?? '—'}</span>
                <span className="text-on-surface-variant/70">Recycle at</span><span className="text-right text-on-surface">{room?.recycleAtTurns ?? '—'}</span>
                <span className="text-on-surface-variant/70">Est. tokens</span><span className="text-right text-on-surface">{room?.estInputTokens != null ? `${room.estInputTokens.toLocaleString()} tok` : '—'}</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
