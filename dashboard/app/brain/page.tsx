// /brain — Graph Memory. Dependency/impact view of the agent fleet.
// Departments as layers, worktree edges as directional flow. Click an agent to
// trace what it depends on (consumes) and what it feeds (handoff) — the blast radius.
// Data: dashboard/public/fleet-graph.json (built by cli/fleet-graph.py from worktrees).
// Owner: mia · G-track (Brain tab, v1)
'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui'

type GNode = { id: string; dept: string; role: string; skills: string[]; tools: string[]; builder: boolean; produces: string; gate: string }
type GEdge = { from: string; to: string; kind: 'consumes' | 'handoff' | 'related' }
type Graph = { departments: string[]; nodes: GNode[]; edges: GEdge[] }

const DCOL: Record<string, string> = {
  'AI & Agents': '#8b5cf6', 'Brand Studio': '#ec4899', 'Cybersecurity': '#ef4444',
  'Engineering': '#3b82f6', 'Executive Office': '#f59e0b', 'Governance': '#14b8a6', 'Product': '#22c55e',
}
const KIND: Record<string, string> = { consumes: '#3b82f6', handoff: '#22c55e', related: '#33384a' }

const W = 1280, TOP = 96, ROW = 60, MARGIN = 70

export default function BrainPage() {
  const [g, setG] = useState<Graph | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [q, setQ] = useState('')

  useEffect(() => { fetch('/fleet-graph.json').then(r => r.json()).then(setG).catch(() => setG(null)) }, [])

  const { pos, H } = useMemo(() => {
    const pos: Record<string, { x: number; y: number; dept: string }> = {}
    if (!g) return { pos, H: 600 }
    const depts = g.departments
    const colW = (W - 2 * MARGIN) / depts.length
    let maxRows = 0
    depts.forEach((d, ci) => {
      const ags = g.nodes.filter(n => n.dept === d).sort((a, b) => a.id.localeCompare(b.id))
      maxRows = Math.max(maxRows, ags.length)
      ags.forEach((n, ri) => { pos[n.id] = { x: MARGIN + colW * ci + colW / 2, y: TOP + ri * ROW, dept: d } })
    })
    return { pos, H: TOP + maxRows * ROW + 40 }
  }, [g])

  const focus = useMemo(() => {
    if (!g || !sel) return null
    const up = g.edges.filter(e => e.to === sel && e.kind !== 'related').map(e => ({ id: e.from, kind: e.kind }))
    const down = g.edges.filter(e => e.from === sel && e.kind !== 'related').map(e => ({ id: e.to, kind: e.kind }))
    const rel = g.edges.filter(e => e.kind === 'related' && (e.from === sel || e.to === sel)).map(e => (e.from === sel ? e.to : e.from))
    const active = new Set<string>([sel, ...up.map(x => x.id), ...down.map(x => x.id), ...rel])
    return { up, down, rel, active }
  }, [g, sel])

  if (!g) return (
    <div className="p-8">
      <PageHeader title="Graph Memory" subtitle="Dependency & impact map of the fleet" />
      <p className="text-on-surface-variant mt-6 text-sm">No graph data. Run <code className="px-1 rounded bg-surface-container">python3 cli/fleet-graph.py</code> to build <code>public/fleet-graph.json</code>.</p>
    </div>
  )

  const selNode = sel ? g.nodes.find(n => n.id === sel) : null
  const dim = (id: string) => (focus && !focus.active.has(id) ? 0.14 : 1)

  return (
    <div className="relative p-6">
      <PageHeader title="Graph Memory" subtitle={`${g.nodes.length} agents · ${g.departments.length} departments · click an agent to trace impact`} />

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search agent or skill…"
          className="bg-surface-container border border-outline/30 rounded-lg px-3 py-2 text-sm w-64 outline-none" />
        <div className="flex items-center gap-4 text-xs text-on-surface-variant">
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-0.5" style={{ background: KIND.consumes }} />consumes →</span>
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-0.5" style={{ background: KIND.handoff }} />handoff →</span>
          <span className="flex items-center gap-1"><i className="inline-block w-2 h-2 rounded-full bg-white" />filled = builder</span>
        </div>
        {sel && <button onClick={() => setSel(null)} className="text-xs text-primary ml-auto">clear focus</button>}
      </div>

      <div className="mt-4 overflow-auto rounded-xl border border-outline/20 bg-surface-container-low">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 900 }}>
          {/* department headers */}
          {g.departments.map((d, ci) => {
            const colW = (W - 2 * MARGIN) / g.departments.length
            const x = MARGIN + colW * ci + colW / 2
            return <text key={d} x={x} y={54} textAnchor="middle" fontSize={12.5} fontWeight={700} fill={DCOL[d]}>{d}</text>
          })}
          {/* edges */}
          {g.edges.map((e, i) => {
            const a = pos[e.from], b = pos[e.to]
            if (!a || !b) return null
            const opacity = focus ? (focus.active.has(e.from) && focus.active.has(e.to) && (e.kind !== 'related') ? 0.9 : 0.05) : (e.kind === 'related' ? 0.12 : 0.5)
            const mx = (a.x + b.x) / 2
            return <path key={i} d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`}
              fill="none" stroke={KIND[e.kind]} strokeWidth={e.kind === 'related' ? 1 : 1.8} opacity={opacity}
              markerEnd={e.kind !== 'related' ? `url(#arr-${e.kind})` : undefined} />
          })}
          <defs>
            {['consumes', 'handoff'].map(k => (
              <marker key={k} id={`arr-${k}`} markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 z" fill={KIND[k]} />
              </marker>
            ))}
          </defs>
          {/* nodes */}
          {g.nodes.map(n => {
            const p = pos[n.id]; if (!p) return null
            const c = DCOL[n.dept]
            const hit = !q || n.id.includes(q.toLowerCase()) || n.skills.some(s => s.includes(q.toLowerCase()))
            const o = (q && !hit) ? 0.12 : dim(n.id)
            return (
              <g key={n.id} opacity={o} style={{ cursor: 'pointer' }} onClick={() => setSel(n.id === sel ? null : n.id)}>
                <circle cx={p.x} cy={p.y} r={8} fill={n.builder ? c : 'var(--md-sys-color-surface-container, #12151f)'} stroke={c} strokeWidth={sel === n.id ? 3 : 1.8} />
                <text x={p.x} y={p.y + 20} textAnchor="middle" fontSize={10.5} fill="currentColor" className="text-on-surface">{n.id}</text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* detail panel */}
      {selNode && focus && (
        <aside className="fixed top-0 right-0 h-full w-[360px] bg-surface-container border-l border-outline/30 p-6 overflow-auto z-50 shadow-xl">
          <button onClick={() => setSel(null)} className="absolute top-4 right-5 text-on-surface-variant">✕</button>
          <div className="text-xs font-bold tracking-wider uppercase" style={{ color: DCOL[selNode.dept] }}>{selNode.dept}</div>
          <h2 className="text-2xl font-semibold capitalize mt-1">{selNode.id}</h2>
          <div className="text-on-surface-variant text-sm">{selNode.role || '—'}</div>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border border-outline/40 text-on-surface-variant mt-2">
            {selNode.builder ? 'Builder · repo write' : 'Advisory · read-only'}
          </span>

          <Section title={`Depends on (${focus.up.length})`}>
            {focus.up.length ? focus.up.map(u => <Chip key={u.id} onClick={() => setSel(u.id)} label={`${u.id}`} sub={u.kind} />) : <Empty />}
          </Section>
          <Section title={`Hands to (${focus.down.length})`}>
            {focus.down.length ? focus.down.map(d => <Chip key={d.id} onClick={() => setSel(d.id)} label={d.id} sub={d.kind} />) : <Empty />}
          </Section>
          <Section title={`Skills (${selNode.skills.length})`}>
            {selNode.skills.length ? selNode.skills.map(s => <span key={s} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline/20">{s}</span>) : <Empty />}
          </Section>
          <Section title="Tools">
            {selNode.tools.map(t => <span key={t} className="text-[11.5px] px-2.5 py-1 rounded-lg border border-outline/20">{t}</span>)}
          </Section>
          {selNode.produces && <p className="text-xs text-on-surface-variant mt-4">produces <b>{selNode.produces}</b> · verify gate <b>{selNode.gate || '—'}</b></p>}
        </aside>
      )}
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-5">
      <h3 className="text-[11px] tracking-wider uppercase text-on-surface-variant mb-2">{title}</h3>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
  )
}
function Chip({ label, sub, onClick }: { label: string; sub?: string; onClick?: () => void }) {
  return <button onClick={onClick} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline/20 hover:border-primary">{label}{sub && <span className="text-on-surface-variant"> · {sub}</span>}</button>
}
function Empty() { return <span className="text-xs text-on-surface-variant">—</span> }
