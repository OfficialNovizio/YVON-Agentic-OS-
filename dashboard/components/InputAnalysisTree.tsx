'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabaseSource } from '@/lib/events/supabase-source'
import { gsap } from 'gsap'
import { Loader2 } from 'lucide-react'

/* ═══════════════════════════════════════════════════════════════════════
   INPUT ANALYSIS TREE (2026-08-26 v3)
   A real node tree: MESSAGE (root) → CLASSIFY (tier·relation leaves) →
   EXTRACT (field leaves) → MUST-HAVES (item leaves) → ROUTE (agent leaves).
   · Geometry is computed so no card overlaps another (verified spacing).
   · CONTINUOUS flow: every edge has a looping light pulse (GSAP, repeat -1)
     with staggered phase — data streams down the tree forever, plus a
     one-shot flash on selection/replay.
   · Interlinks: build-tier → route, venture-relation → extract (dashed).
   Data: /api/software-pipeline/input-analysis + Realtime on input.analysis.
   ═══════════════════════════════════════════════════════════════════════ */

interface Analysis {
  id: string
  ts: number
  message: string | null
  correlation: string | null
  tier: 'generic' | 'info' | 'build'
  relation: 'venture' | 'general'
  fields: [string, string][]
  mustHaves: string[]
  targetAgents: { primary: string; team: string[]; reason: string; scores?: { agent: string; score: number; hits: string[] }[] } | null
}

const TIER_LABEL = { generic: 'GENERIC', info: 'INFO', build: 'BUILD' } as const
const TIER_TONE = { generic: '#8a8f98', info: '#abc7ff', build: '#4ade80' } as const
const REL_LABEL = { venture: 'VENTURE', general: 'GENERAL' } as const
const REL_TONE = { venture: '#abc7ff', general: '#ffb693' } as const
const MINT = '#3ddc97'
const VIOLET = '#8e7bf0'

function parseEventPayload(p: Record<string, unknown>): Analysis | null {
  const tier = (p.tier === 'build' || p.tier === 'generic' ? p.tier : 'info') as Analysis['tier']
  const relation = (p.relation === 'general' ? 'general' : 'venture') as Analysis['relation']
  const order: [string, string][] = tier === 'info'
    ? [['type', 'Type'], ['subject', 'Subject'], ['scope', 'Scope'], ['expected', 'Expected'], ['format', 'Format']]
    : [['what', 'What'], ['why', 'Why'], ['how', 'How'], ['endResult', 'End result'], ['desiredOutput', 'Desired output']]
  const fields = order
    .map(([key, label]) => [label, String(p[key] ?? '')] as [string, string])
    .filter(([, v]) => v && v !== 'not specified' && v !== 'undefined')
  return {
    id: `live-${Date.now()}`,
    ts: Date.now(),
    message: (p.message as string | null) ?? (p.text as string | null) ?? null,
    correlation: (p.correlation as string | null) ?? null,
    tier,
    relation,
    fields,
    mustHaves: Array.isArray(p.mustHaves) ? (p.mustHaves as string[]) : [],
    targetAgents: p.targetAgents ? (p.targetAgents as Analysis['targetAgents']) : null,
  }
}

const timeAgo = (ts: number) => {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return `${s}s ago`
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

/* ── geometry — no-overlap spacing (chain nodes ~70px tall, leaves ~40px) ── */
const W = 1000
const H = 760
const CHAIN_X = W / 2
const CHAIN_W = 300
const CHAIN_Y = [70, 206, 342, 478, 614]
// leaf rows sit below the NEXT chain node's bottom + 18px of air
const CHILD_Y = [0, 294, 430, 566, 702]
const LEAF_W = 150
const LEAF_H = 40
const CYCLE = 5 // seconds — one full flow pass down the tree

interface TreeLeaf { id: string; x: number; y: number; label: string; sub?: string; tone: string }

function leafRow(count: number, y: number): number[] {
  const step = Math.min(240, Math.max(168, 900 / Math.max(1, count)))
  const span = step * Math.max(0, count - 1)
  return Array.from({ length: count }, (_, i) => CHAIN_X - span / 2 + i * step)
}

export default function InputAnalysisTree({ workspaceKey }: { workspaceKey: string }) {
  const [analyses, setAnalyses] = useState<Analysis[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [live, setLive] = useState(false)
  const [detail, setDetail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const dotRefs = useRef<Record<string, SVGCircleElement | null>>({})
  const dotTweens = useRef<ReturnType<typeof gsap.to>[]>([])

  const selected = useMemo(
    () => analyses.find((a) => a.id === selectedId) ?? analyses[0] ?? null,
    [analyses, selectedId],
  )

  useEffect(() => {
    fetch('/api/software-pipeline/input-analysis')
      .then((r) => r.json())
      .then((d: { analyses?: Analysis[] }) => {
        const list = d.analyses ?? []
        setAnalyses(list)
        if (list[0]) setSelectedId(list[0].id)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    const unsub = supabaseSource(workspaceKey).subscribe((e) => {
      if (e.kind !== 'input.analysis' || !e.payload) return
      const a = parseEventPayload(e.payload)
      if (!a) return
      setAnalyses((prev) => [a, ...prev.filter((x) => x.id !== a.id)].slice(0, 25))
      setSelectedId(a.id)
      setDetail(null)
      setLive(true)
    })
    return unsub
  }, [workspaceKey])

  /* ── tree model: chain nodes, leaf rows, edges, interlinks ── */
  const tree = useMemo(() => {
    if (!selected) return null
    const leaves: TreeLeaf[] = []
    const edges: { id: string; from: [number, number]; to: [number, number]; dashed?: boolean; color?: string }[] = []

    // chain edges FIRST (pulse phase order)
    for (let i = 0; i < CHAIN_Y.length - 1; i++) {
      edges.push({ id: `edge-chain-${i}`, from: [CHAIN_X, CHAIN_Y[i] + 40], to: [CHAIN_X, CHAIN_Y[i + 1]] })
    }

    // classify → tier + relation leaves
    const cr = leafRow(2, CHILD_Y[1])
    const tierLeaf: TreeLeaf = { id: 'tier', x: cr[0], y: CHILD_Y[1], label: TIER_LABEL[selected.tier], sub: 'tier', tone: TIER_TONE[selected.tier] }
    const relLeaf: TreeLeaf = { id: 'relation', x: cr[1], y: CHILD_Y[1], label: REL_LABEL[selected.relation], sub: 'relation', tone: REL_TONE[selected.relation] }
    leaves.push(tierLeaf, relLeaf)
    edges.push({ id: 'edge-tier', from: [CHAIN_X, CHAIN_Y[1] + 40], to: [tierLeaf.x, tierLeaf.y] })
    edges.push({ id: 'edge-relation', from: [CHAIN_X, CHAIN_Y[1] + 40], to: [relLeaf.x, relLeaf.y] })

    // extract → field leaves
    const fld = selected.fields.length > 0 ? selected.fields : ([['fields', 'not specified']] as [string, string][])
    const fr = leafRow(fld.length, CHILD_Y[2])
    fld.forEach(([label, value], i) => {
      leaves.push({ id: `field-${i}`, x: fr[i], y: CHILD_Y[2], label, sub: value, tone: VIOLET })
      edges.push({ id: `edge-field-${i}`, from: [CHAIN_X, CHAIN_Y[2] + 40], to: [fr[i], CHILD_Y[2]] })
    })

    // must-haves → item leaves
    const mh = selected.mustHaves.length > 0 ? selected.mustHaves : ['no must-haves declared']
    const mr = leafRow(mh.length, CHILD_Y[3])
    mh.forEach((m, i) => {
      leaves.push({ id: `must-${i}`, x: mr[i], y: CHILD_Y[3], label: m.slice(0, 40), sub: 'must-have', tone: MINT })
      edges.push({ id: `edge-must-${i}`, from: [CHAIN_X, CHAIN_Y[3] + 40], to: [mr[i], CHILD_Y[3]] })
    })

    // route → agent leaves
    const agents = selected.targetAgents?.scores?.length
      ? selected.targetAgents.scores.slice().sort((a, b) => b.score - a.score)
      : selected.targetAgents
        ? [{ agent: selected.targetAgents.primary, score: 100, hits: [] as string[] }]
        : []
    const ar = leafRow(Math.max(agents.length, 1), CHILD_Y[4])
    agents.forEach((a, i) => {
      leaves.push({ id: `agent-${i}`, x: ar[i], y: CHILD_Y[4], label: a.agent, sub: `score ${a.score}`, tone: a.agent === selected.targetAgents?.primary ? MINT : VIOLET })
      edges.push({ id: `edge-agent-${i}`, from: [CHAIN_X, CHAIN_Y[4] + 40], to: [ar[i], CHILD_Y[4]] })
    })

    // INTERLINKS (dashed): build-tier reaches the routing stage; venture
    // relation gates context extraction.
    if (selected.tier === 'build') {
      edges.push({ id: 'edge-tier-route', from: [tierLeaf.x, tierLeaf.y + LEAF_H], to: [CHAIN_X - 60, CHAIN_Y[4] + 6], dashed: true, color: 'rgba(74,222,128,.35)' })
    }
    edges.push({ id: 'edge-rel-extract', from: [relLeaf.x, relLeaf.y + LEAF_H], to: [CHAIN_X + 70, CHAIN_Y[2] + 6], dashed: true, color: 'rgba(171,199,255,.3)' })

    return { leaves, edges, fld, mh, agents }
  }, [selected])

  /* ── CONTINUOUS flow: looping pulses down every edge, staggered phase ── */
  const startFlow = useCallback(() => {
    if (!tree) return
    dotTweens.current.forEach((t) => t.kill())
    dotTweens.current = []
    tree.edges.forEach((e, i) => {
      const path = document.getElementById(e.id) as unknown as SVGPathElement | null
      const dot = dotRefs.current[e.id]
      if (!path || !dot) return
      const len = path.getTotalLength()
      const phase = (i * CYCLE) / Math.max(1, tree.edges.length - 1) // spread phases across the cycle
      const proxy = { t: 0 }
      dotTweens.current.push(
        gsap.to(proxy, {
          t: 1, duration: 1.15, delay: phase, repeat: -1, repeatDelay: CYCLE - 1.15, ease: 'power1.inOut',
          onUpdate: () => {
            const pt = path.getPointAtLength(proxy.t * len)
            dot.setAttribute('cx', String(pt.x))
            dot.setAttribute('cy', String(pt.y))
          },
        }),
      )
      dotTweens.current.push(
        gsap.to(dot, {
          keyframes: [
            { opacity: 0, duration: 0 },
            { opacity: 1, duration: 0.18 },
            { opacity: 1, duration: 0.62 },
            { opacity: 0, duration: 0.25 },
          ],
          delay: phase, repeat: -1, repeatDelay: CYCLE - 1.05, ease: 'none',
        }),
      )
    })
    // subtle constant breathing on the chain nodes — "alive"
    const chain = ['message', 'classify', 'extract', 'must', 'route'].map((k) => nodeRefs.current[k]).filter(Boolean)
    chain.forEach((el, i) => {
      if (!el) return
      dotTweens.current.push(
        gsap.to(el, { scale: 1.02, duration: 2.2, delay: i * 0.25, repeat: -1, yoyo: true, ease: 'sine.inOut' }),
      )
    })
  }, [tree])

  /* ── one-shot flash on selection change (replay) ── */
  const flash = useCallback(() => {
    if (!tree) return
    const order = ['message', 'classify', 'extract', 'must', 'route', ...tree.leaves.map((l) => l.id)]
    order.forEach((key, i) => {
      const el = nodeRefs.current[key]
      if (!el) return
      gsap.killTweensOf(el)
      gsap.fromTo(
        el,
        { boxShadow: '0 0 0 rgba(61,220,151,0)' },
        { boxShadow: '0 0 24px rgba(61,220,151,.6)', duration: 0.3, delay: 0.4 + i * 0.13, yoyo: true, repeat: 1, ease: 'power2.inOut' },
      )
    })
  }, [tree])

  useEffect(() => { startFlow(); flash() }, [startFlow, flash])

  const maxScore = Math.max(1, ...(selected?.targetAgents?.scores ?? []).map((s) => s.score))

  return (
    <div className="rounded-xl border border-white/10 bg-[#0b0b0f] p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-semibold text-on-surface">Input Analysis — live flow</span>
        {live && (
          <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
            <i className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> LIVE
          </span>
        )}
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          {analyses.slice(0, 8).map((a) => (
            <button
              key={a.id}
              onClick={() => { setSelectedId(a.id); setDetail(null) }}
              className={`rounded-full border px-2.5 py-1 text-[10.5px] font-medium transition ${
                selected?.id === a.id
                  ? 'border-white/25 bg-white/10 text-on-surface'
                  : 'border-white/5 bg-transparent text-on-surface-variant hover:border-white/10'
              }`}
              title={a.message ?? `analysis ${timeAgo(a.ts)}`}
            >
              {a.tier === 'build' ? 'build' : a.tier === 'info' ? 'info' : 'generic'} · {timeAgo(a.ts)}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center"><Loader2 size={18} className="animate-spin text-on-surface-variant/50" /></div>
      ) : !selected || !tree ? (
        <div className="flex h-48 flex-col items-center justify-center gap-2 text-center">
          <span className="material-symbols-outlined text-[40px] text-on-surface-variant/30">account_tree</span>
          <p className="text-[12.5px] text-on-surface-variant">No input analyses yet — send a message in chat and watch it flow here live.</p>
        </div>
      ) : (
        <div className="relative overflow-x-auto">
          <div className="relative" style={{ width: W, height: H }}>
            {/* ── edges + continuous pulse dots ── */}
            <svg width={W} height={H} className="absolute inset-0" style={{ pointerEvents: 'none' }}>
              {tree.edges.map((e) => {
                const [x1, y1] = e.from, [x2, y2] = e.to
                const midY = (y1 + y2) / 2
                return (
                  <path
                    key={e.id}
                    id={e.id}
                    d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                    fill="none"
                    stroke={e.dashed ? (e.color ?? 'rgba(255,255,255,.18)') : e.color ?? (e.id.startsWith('edge-agent') ? 'rgba(142,123,240,.42)' : e.id.startsWith('edge-must') ? 'rgba(61,220,151,.38)' : 'rgba(255,255,255,.16)')}
                    strokeWidth={e.dashed ? 1.1 : 1.4}
                    strokeDasharray={e.dashed ? '3 5' : undefined}
                    style={{ filter: 'drop-shadow(0 0 3px rgba(150,220,255,.25))' }}
                  />
                )
              })}
              {tree.edges.map((e) => (
                <circle key={`dot-${e.id}`} ref={(el) => { dotRefs.current[e.id] = el }} r={3.2} fill={e.dashed ? '#8ec5ff' : MINT} opacity={0}
                  style={{ filter: `drop-shadow(0 0 5px ${e.dashed ? '#8ec5ff' : MINT})` }} />
              ))}
            </svg>

            {/* ── chain nodes ── */}
            {([
              ['message', 'INPUT', 'message', selected.message ?? 'Incoming message'],
              ['classify', 'CLASSIFY', 'tier · relation', `${TIER_LABEL[selected.tier]} · ${REL_LABEL[selected.relation]}`],
              ['extract', 'EXTRACT', 'dynamic fields', `${selected.fields.length} field${selected.fields.length === 1 ? '' : 's'} extracted`],
              ['must', 'MUST-HAVES', 'defines “done”', `${selected.mustHaves.length} item${selected.mustHaves.length === 1 ? '' : 's'}`],
              ['route', 'ROUTE', 'agent routing', selected.targetAgents ? `→ ${selected.targetAgents.primary}` : 'no routing'],
            ] as const).map(([key, chip, title, value], i) => (
              <div
                key={key}
                ref={(el) => { nodeRefs.current[key] = el }}
                onClick={() => setDetail(detail === key ? null : key)}
                className="absolute -translate-x-1/2 cursor-pointer rounded-xl border border-white/12 bg-gradient-to-b from-white/[0.09] to-white/[0.04] p-3 backdrop-blur transition hover:border-white/30"
                style={{ left: CHAIN_X, top: CHAIN_Y[i], width: CHAIN_W, boxShadow: '0 10px 30px rgba(0,0,0,.35)' }}
              >
                <div className="flex items-center gap-2">
                  <span className="rounded bg-white/10 px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-on-surface-variant">{chip}</span>
                  <span className="text-[11px] font-semibold text-on-surface-variant">{title}</span>
                  <span className="ml-auto text-[10px] text-on-surface-variant/50">{i === 0 ? timeAgo(selected.ts) : ''}</span>
                </div>
                <p className="mt-0.5 truncate text-[13px] leading-snug text-on-surface">{value}</p>
              </div>
            ))}

            {/* ── leaf nodes ── */}
            {tree.leaves.map((l) => (
              <div
                key={l.id}
                ref={(el) => { nodeRefs.current[l.id] = el }}
                onClick={() => setDetail(detail === l.id ? null : l.id)}
                className="absolute -translate-x-1/2 cursor-pointer rounded-lg border px-2.5 py-1.5 backdrop-blur transition hover:border-white/30 hover:brightness-125"
                style={{ left: l.x, top: l.y, width: LEAF_W, minHeight: LEAF_H, background: `${l.tone}14`, borderColor: `${l.tone}44` }}
              >
                <span className="block truncate text-[9.5px] font-bold uppercase tracking-widest" style={{ color: l.tone }}>{l.label}</span>
                {l.sub && <span className="block truncate text-[10.5px] text-on-surface-variant">{l.sub}</span>}
              </div>
            ))}

            {/* ── detail panel ── */}
            {detail && selected && (
              <div className="absolute right-0 top-0 z-20 flex max-h-[720px] w-[260px] flex-col gap-2 overflow-y-auto rounded-xl border border-white/15 bg-[#101016]/95 p-3.5 backdrop-blur-xl">
                <button onClick={() => setDetail(null)} className="ml-auto -mr-1 -mt-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] text-on-surface-variant hover:text-on-surface">✕</button>

                {detail === 'message' && (
                  <>
                    <p className="text-[12px] leading-relaxed text-on-surface">“{selected.message ?? 'Incoming message'}”</p>
                    <p className="text-[10.5px] text-on-surface-variant">{new Date(selected.ts).toLocaleString()}</p>
                    {selected.correlation && <p className="text-[10.5px] text-on-surface-variant">correlation: <code className="text-violet-300">{selected.correlation}</code></p>}
                  </>
                )}
                {detail === 'classify' && (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: `${TIER_TONE[selected.tier]}22`, color: TIER_TONE[selected.tier] }}>{TIER_LABEL[selected.tier]}</span>
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: `${REL_TONE[selected.relation]}22`, color: REL_TONE[selected.relation] }}>{REL_LABEL[selected.relation]}</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-on-surface-variant">
                      {selected.tier === 'build' ? 'Build-tier: actionable engineering request — full dynamic fields, agent routing, iteration cap 30.'
                        : selected.tier === 'info' ? 'Info-tier: question or reference — shallow fields, lightweight handling, iteration cap 4.'
                        : 'Generic-tier: non-actionable — single iteration, no routing.'}
                    </p>
                  </>
                )}
                {detail === 'extract' && (
                  <div className="space-y-2">
                    {tree.fld.map(([label, value]) => (
                      <div key={label} className="rounded-lg border border-white/5 bg-black/20 px-2.5 py-1.5">
                        <div className="text-[9px] font-bold uppercase tracking-widest text-violet-300/80">{label}</div>
                        <div className="mt-0.5 text-[11px] leading-snug text-on-surface">{value}</div>
                      </div>
                    ))}
                  </div>
                )}
                {detail === 'must' && (
                  <div className="space-y-1">
                    {tree.mh.map((m) => (
                      <div key={m} className="flex items-start gap-1.5 text-[11.5px] text-on-surface"><span className="text-emerald-400">✓</span> {m}</div>
                    ))}
                  </div>
                )}
                {detail === 'route' && selected.targetAgents && (
                  <>
                    <p className="text-[12px] font-semibold text-on-surface">→ {selected.targetAgents.primary}</p>
                    <div className="flex flex-wrap gap-1">
                      {selected.targetAgents.team.map((t) => (
                        <span key={t} className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold text-violet-300">{t}</span>
                      ))}
                    </div>
                    {selected.targetAgents.scores && selected.targetAgents.scores.length > 0 && (
                      <div className="space-y-2 pt-1">
                        {selected.targetAgents.scores.slice().sort((a, b) => b.score - a.score).map((s) => (
                          <div key={s.agent}>
                            <div className="flex justify-between text-[11px]"><span className="font-semibold text-on-surface">{s.agent}</span><span className="text-on-surface-variant">{s.score}</span></div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/5">
                              <div className="h-full rounded-full" style={{ width: `${(s.score / maxScore) * 100}%`, background: s.agent === selected.targetAgents?.primary ? MINT : VIOLET }} />
                            </div>
                            {s.hits.length > 0 && <div className="mt-0.5 text-[10px] text-on-surface-variant/70">hits: {s.hits.join(' · ')}</div>}
                          </div>
                        ))}
                      </div>
                    )}
                    {selected.targetAgents.reason && <p className="text-[10.5px] text-on-surface-variant">{selected.targetAgents.reason}</p>}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
