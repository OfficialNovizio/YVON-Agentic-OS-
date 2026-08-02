// /brain — Graph Memory. The YVON brain as a real connected graph: Node-Zero core,
// the MASTER systems, 7 department lobes, 46 agents, and their dependency web.
// Only YVON exists today — no brands/clients are shown until they have a real graph.
// Data: public/brain-graph.json (cli/graph-build.py). Owner: mia · G-track (G2+G5).
'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui'

type Sys = { id: string; region: string; desc: string }
type GNode = { id: string; dept: string; role: string; skills: string[]; tools: string[]; builder: boolean; produces: string }
type Edge = { from: string; to: string; kind: string }
type Graph = { departments: string[]; systems: Sys[]; nodes: GNode[]; edges: Edge[] }

const DCOL: Record<string, string> = {
  'AI & Agents': '#8b5cf6', 'Brand Studio': '#ec4899', 'Cybersecurity': '#ef4444',
  'Engineering': '#38bdf8', 'Executive Office': '#f59e0b', 'Governance': '#2dd4bf', 'Product': '#22c55e',
}
const KIND: Record<string, string> = { consumes: '#38bdf8', handoff: '#22c55e', related: '#39405a' }
const W = 1400, H = 900

export default function BrainPage() {
  const [g, setG] = useState<Graph | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [z, setZ] = useState(1); const [ox, setOx] = useState(0); const [oy, setOy] = useState(0)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const reset = () => { setZ(1); setOx(0); setOy(0) }

  useEffect(() => { fetch('/brain-graph.json').then(r => r.json()).then(setG).catch(() => setG(null)) }, [])

  const pos = useMemo(() => {
    const p: Record<string, { x: number; y: number; dept?: string }> = {}
    if (!g) return p
    const cx = W / 2, cy = H / 2, Rd = 270
    g.departments.forEach((d, ci) => {
      const a = (ci / g.departments.length) * Math.PI * 2 - Math.PI / 2
      const hx = cx + Math.cos(a) * Rd, hy = cy + Math.sin(a) * Rd
      p['dept:' + d] = { x: hx, y: hy, dept: d }
      const ags = g.nodes.filter(n => n.dept === d).sort((x, y) => x.id.localeCompare(y.id))
      const spread = Math.min(Math.PI * 0.92, 0.4 + ags.length * 0.12)
      ags.forEach((n, j) => {
        const t = ags.length === 1 ? 0 : (j / (ags.length - 1) - 0.5)
        const aa = a + t * spread, r = j % 2 ? 158 : 112
        p[n.id] = { x: hx + Math.cos(aa) * r, y: hy + Math.sin(aa) * r, dept: d }
      })
    })
    g.systems.forEach((s, i) => {
      const a = (i / g.systems.length) * Math.PI * 2 - Math.PI / 2
      p['sys:' + s.id] = { x: cx + Math.cos(a) * 96, y: cy + Math.sin(a) * 96 }
    })
    return p
  }, [g])

  if (!g) return (
    <div className="p-8"><PageHeader title="Graph Memory" subtitle="Loading the brain…" />
      <p className="text-on-surface-variant mt-6 text-sm">No data — run <code className="px-1 rounded bg-surface-container">python3 cli/graph-build.py</code>.</p></div>
  )

  const cx = W / 2, cy = H / 2, ql = q.trim().toLowerCase()
  const selNode = sel ? g.nodes.find(n => n.id === sel) : null
  const focus = selNode ? new Set<string>([sel!, ...g.edges.filter(e => (e.from === sel || e.to === sel) && e.kind !== 'related').flatMap(e => [e.from, e.to])]) : null

  return (
    <div className="relative p-6 select-none">
      <style>{`@keyframes bp{0%,100%{opacity:.3}50%{opacity:.85}}@keyframes bd{to{stroke-dashoffset:-24}}
        .gp{animation:bp 2.6s ease-in-out infinite}.bf{stroke-dasharray:2 6;animation:bd 1.1s linear infinite}`}</style>
      <PageHeader title="Graph Memory" subtitle={`YVON brain — ${g.nodes.length} agents · ${g.systems.length} systems · click any node to trace its dependencies`} />

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search agent or skill…"
          className="bg-surface-container border border-outline/30 rounded-lg px-3 py-1.5 text-sm w-64 outline-none" />
        <div className="flex items-center gap-4 text-xs text-on-surface-variant ml-auto">
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-0.5" style={{ background: KIND.consumes }} />consumes</span>
          <span className="flex items-center gap-1"><i className="inline-block w-3 h-0.5" style={{ background: KIND.handoff }} />handoff</span>
          <span className="flex items-center gap-1"><i className="inline-block w-2 h-2 rounded-full bg-white" />builder</span>
          {sel && <button onClick={() => setSel(null)} className="text-primary">clear</button>}
          <button onClick={reset} className="hover:text-primary">reset view</button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-on-surface-variant/70">Only YVON's brain exists today. Brand &amp; client brains appear here once each has a real Node-Zero graph (G0) — none are shown before they exist.</p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-outline/20"
        style={{ background: 'radial-gradient(120% 90% at 50% 50%, #0e1220 0%, #07080e 72%)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 560, cursor: drag ? 'grabbing' : 'grab' }}
          onWheel={e => setZ(v => Math.max(0.5, Math.min(3.2, v * (e.deltaY < 0 ? 1.1 : 0.9))))}
          onMouseDown={e => setDrag({ x: e.clientX - ox, y: e.clientY - oy })}
          onMouseMove={e => { if (drag) { setOx(e.clientX - drag.x); setOy(e.clientY - drag.y) } }}
          onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)} onClick={() => setSel(null)}>
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            {['consumes', 'handoff'].map(k => <marker key={k} id={`a-${k}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill={KIND[k]} /></marker>)}
          </defs>
          <g transform={`translate(${ox},${oy}) scale(${z})`}>
            {/* structural spokes: core → dept → agent (faint) */}
            {g.departments.map(d => { const p = pos['dept:' + d]; return p && <line key={'c' + d} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#232838" strokeWidth={1} /> })}
            {g.nodes.map(n => { const p = pos[n.id], h = pos['dept:' + n.dept]; return p && h && <line key={'s' + n.id} x1={h.x} y1={h.y} x2={p.x} y2={p.y} stroke="#1c2130" strokeWidth={0.8} /> })}
            {/* the dependency web (always visible so it reads as a graph) */}
            {g.edges.map((e, i) => {
              const a = pos[e.from], b = pos[e.to]; if (!a || !b) return null
              const on = focus ? (focus.has(e.from) && focus.has(e.to) && e.kind !== 'related') : false
              const base = e.kind === 'related' ? 0.16 : 0.5
              const op = focus ? (on ? 0.95 : 0.03) : base
              const mx = (a.x + b.x) / 2
              return <path key={i} d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`} fill="none"
                stroke={KIND[e.kind]} strokeWidth={on ? 2.2 : e.kind === 'related' ? 0.7 : 1.3} opacity={op}
                markerEnd={e.kind !== 'related' && (!focus || on) ? `url(#a-${e.kind})` : undefined}
                filter={on ? 'url(#glow)' : undefined} className={on ? 'bf' : undefined} />
            })}
            {/* Node-Zero core */}
            <circle cx={cx} cy={cy} r={64} fill="#8b5cf6" opacity={0.09} className="gp" filter="url(#glow)" />
            <circle cx={cx} cy={cy} r={46} fill="#0e1220" stroke="#8b5cf6" strokeWidth={2} filter="url(#glow)" />
            <text x={cx} y={cy - 3} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">YVON Core</text>
            <text x={cx} y={cy + 13} textAnchor="middle" fontSize={8.5} fill="#aab2c5">Node Zero · systems</text>
            {/* systems */}
            {g.systems.map(s => { const p = pos['sys:' + s.id]; return p && <g key={s.id}><circle cx={p.x} cy={p.y} r={6} fill="#a78bfa" filter="url(#glow)" /><text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={8} fill="#c7bdf0">{s.id}</text></g> })}
            {/* department hubs */}
            {g.departments.map(d => { const p = pos['dept:' + d]; if (!p) return null; const c = DCOL[d]
              return <g key={d}><circle cx={p.x} cy={p.y} r={15} fill={c} opacity={0.92} filter="url(#glow)" /><text x={p.x} y={p.y < cy ? p.y - 21 : p.y + 29} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#e7ebf3">{d}</text></g> })}
            {/* agents */}
            {g.nodes.map(n => { const p = pos[n.id]; if (!p) return null; const c = DCOL[n.dept]
              const hit = !ql || n.id.includes(ql) || n.skills.some(s => s.includes(ql))
              const op = (ql && !hit) ? 0.1 : (focus && !focus.has(n.id) ? 0.12 : 1)
              return (
                <g key={n.id} opacity={op} style={{ cursor: 'pointer' }} onClick={ev => { ev.stopPropagation(); setSel(n.id === sel ? null : n.id) }}>
                  <circle cx={p.x} cy={p.y} r={8} fill={n.builder ? c : '#0e1220'} stroke={c} strokeWidth={sel === n.id ? 3 : 1.8} filter={sel === n.id ? 'url(#glow)' : undefined} />
                  <text x={p.x} y={p.y + 20} textAnchor="middle" fontSize={10} fill="#c7cede">{n.id}</text>
                </g>
              ) })}
          </g>
        </svg>
      </div>

      {selNode && (
        <aside className="fixed top-0 right-0 h-full w-[360px] bg-surface-container border-l border-outline/30 p-6 overflow-auto z-50 shadow-xl">
          <button onClick={() => setSel(null)} className="absolute top-4 right-5 text-on-surface-variant">✕</button>
          <div className="text-xs font-bold tracking-wider uppercase" style={{ color: DCOL[selNode.dept] }}>{selNode.dept}</div>
          <h2 className="text-2xl font-semibold capitalize mt-1">{selNode.id}</h2>
          <div className="text-on-surface-variant text-sm">{selNode.role || '—'}</div>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border border-outline/40 text-on-surface-variant mt-2">{selNode.builder ? 'Builder · repo write' : 'Advisory · read-only'}</span>
          <Sec title="Depends on"><Deps items={dep(g, selNode.id, 'in')} pick={setSel} /></Sec>
          <Sec title="Hands to"><Deps items={dep(g, selNode.id, 'out')} pick={setSel} /></Sec>
          <Sec title={`Skills (${selNode.skills.length})`}>{selNode.skills.map(s => <span key={s} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline/20">{s}</span>)}</Sec>
          <Sec title="Tools">{selNode.tools.map(t => <span key={t} className="text-[11.5px] px-2.5 py-1 rounded-lg border border-outline/20">{t}</span>)}</Sec>
          {selNode.produces && <p className="text-xs text-on-surface-variant mt-4">produces <b>{selNode.produces}</b></p>}
        </aside>
      )}
    </div>
  )
}

function Sec({ title, children }: { title: string; children: ReactNode }) {
  return <div className="mt-5"><h3 className="text-[11px] tracking-wider uppercase text-on-surface-variant mb-2">{title}</h3><div className="flex flex-wrap gap-1.5">{children}</div></div>
}
function Deps({ items, pick }: { items: { id: string; kind: string }[]; pick: (s: string) => void }) {
  return items.length ? <>{items.map(x => <button key={x.id} onClick={() => pick(x.id)} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline/20 hover:border-primary">{x.id} <span className="text-on-surface-variant">· {x.kind}</span></button>)}</> : <span className="text-xs text-on-surface-variant">—</span>
}
function dep(g: Graph, id: string, dir: 'in' | 'out'): { id: string; kind: string }[] {
  return g.edges.filter(e => e.kind !== 'related' && (dir === 'in' ? e.to === id : e.from === id)).map(e => ({ id: dir === 'in' ? e.from : e.to, kind: e.kind }))
}
