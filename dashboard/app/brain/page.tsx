// /brain — Graph Memory. Two levels: a hub of brains (worlds) you zoom into,
// and each brain's inner graph (Node-Zero core, department lobes, agents, systems,
// dependency edges). Glowing Bifrost connections. Data: public/brain-graph.json
// (cli/graph-build.py). Owner: mia · G-track (G2+G5).
'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { PageHeader } from '@/components/ui'

type World = { id: string; name: string; kind: string; tagline: string; populated: boolean; parent?: string }
type Sys = { id: string; type: string; region: string; desc: string }
type GNode = { id: string; type: string; dept: string; role: string; skills: string[]; tools: string[]; builder: boolean; produces: string }
type Edge = { from: string; to: string; kind: string }
type Graph = { worlds: World[]; worldEdges: { from: string; to: string }[]; yvon: { departments: string[]; systems: Sys[]; nodes: GNode[]; edges: Edge[] } }

const DCOL: Record<string, string> = {
  'AI & Agents': '#8b5cf6', 'Brand Studio': '#ec4899', 'Cybersecurity': '#ef4444',
  'Engineering': '#38bdf8', 'Executive Office': '#f59e0b', 'Governance': '#2dd4bf', 'Product': '#22c55e',
}
const WCOL: Record<string, string> = { master: '#8b5cf6', brand: '#f59e0b', factory: '#a78bfa', client: '#d97706', slot: '#64748b' }
const KIND: Record<string, string> = { consumes: '#38bdf8', handoff: '#22c55e', related: '#2b3040' }
const W = 1300, H = 860

export default function BrainPage() {
  const [g, setG] = useState<Graph | null>(null)
  const [mode, setMode] = useState<'worlds' | 'brain'>('worlds')
  const [sel, setSel] = useState<string | null>(null)     // selected agent (brain) or world
  const [q, setQ] = useState('')

  useEffect(() => { fetch('/brain-graph.json').then(r => r.json()).then(setG).catch(() => setG(null)) }, [])

  // ── worlds layout ──────────────────────────────────────────────────────
  const worlds = useMemo(() => {
    const pos: Record<string, { x: number; y: number; w: World }> = {}
    if (!g) return pos
    const cx = W / 2, cy = H * 0.4, R = 250
    const ring: Record<string, [number, number]> = { novizio: [cx, cy - R], hourbour: [cx + R, cy - 10], upcoming: [cx - R, cy - 10], agentx: [cx, cy + R] }
    g.worlds.forEach(w => {
      if (w.id === 'yvon') pos[w.id] = { x: cx, y: cy, w }
      else if (ring[w.id]) pos[w.id] = { x: ring[w.id][0], y: ring[w.id][1], w }
    })
    const clients = g.worlds.filter(w => w.parent === 'agentx')
    const ax = pos['agentx']
    clients.forEach((c, i) => {
      const t = clients.length === 1 ? 0 : (i / (clients.length - 1) - 0.5)
      pos[c.id] = { x: (ax?.x ?? cx) + t * 520, y: (ax?.y ?? cy) + 150, w: c }
    })
    return pos
  }, [g])

  // ── brain (yvon) layout ────────────────────────────────────────────────
  const brain = useMemo(() => {
    const pos: Record<string, { x: number; y: number; dept?: string }> = {}
    if (!g) return { pos, H2: H }
    const cx = W / 2, cy = H / 2, depts = g.yvon.departments
    const Rd = 250
    depts.forEach((d, ci) => {
      const a = (ci / depts.length) * Math.PI * 2 - Math.PI / 2
      const hx = cx + Math.cos(a) * Rd, hy = cy + Math.sin(a) * Rd
      pos['dept:' + d] = { x: hx, y: hy, dept: d }
      const ags = g.yvon.nodes.filter(n => n.dept === d).sort((x, y) => x.id.localeCompare(y.id))
      const spread = Math.min(Math.PI * 0.9, 0.4 + ags.length * 0.12)
      ags.forEach((n, j) => {
        const t = ags.length === 1 ? 0 : (j / (ags.length - 1) - 0.5)
        const aa = a + t * spread, r = j % 2 ? 150 : 108
        pos[n.id] = { x: hx + Math.cos(aa) * r, y: hy + Math.sin(aa) * r, dept: d }
      })
    })
    g.yvon.systems.forEach((s, i) => {
      const a = (i / g.yvon.systems.length) * Math.PI * 2 - Math.PI / 2
      pos['sys:' + s.id] = { x: cx + Math.cos(a) * 92, y: cy + Math.sin(a) * 92 }
    })
    return { pos, H2: H }
  }, [g])

  // zoom/pan
  const [z, setZ] = useState(1); const [ox, setOx] = useState(0); const [oy, setOy] = useState(0)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const resetView = () => { setZ(1); setOx(0); setOy(0) }

  if (!g) return (
    <div className="p-8"><PageHeader title="Graph Memory" subtitle="Loading the brain…" />
      <p className="text-on-surface-variant mt-6 text-sm">No data — run <code className="px-1 rounded bg-surface-container">python3 cli/graph-build.py</code>.</p></div>
  )

  const selAgent = mode === 'brain' && sel ? g.yvon.nodes.find(n => n.id === sel) : null
  const selWorld = mode === 'worlds' && sel ? g.worlds.find(w => w.id === sel) : null
  const focus = selAgent ? new Set<string>([sel!,
    ...g.yvon.edges.filter(e => (e.from === sel || e.to === sel) && e.kind !== 'related').flatMap(e => [e.from, e.to])]) : null

  return (
    <div className="relative p-6 select-none">
      <style>{`
        @keyframes bpulse{0%,100%{opacity:.35}50%{opacity:.9}}
        @keyframes bdash{to{stroke-dashoffset:-24}}
        .glowpulse{animation:bpulse 2.6s ease-in-out infinite}
        .bifrost{stroke-dasharray:2 6;animation:bdash 1.1s linear infinite}
      `}</style>
      <PageHeader title="Graph Memory"
        subtitle={mode === 'worlds' ? 'The hub of brains — click YVON to enter its graph' : 'YVON brain — click an agent to trace its dependencies'} />

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        {mode === 'brain' && <button onClick={() => { setMode('worlds'); setSel(null); resetView() }}
          className="text-xs px-3 py-1.5 rounded-lg bg-surface-container border border-outline/30 hover:border-primary">← worlds</button>}
        {mode === 'brain' && <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search agent or skill…"
          className="bg-surface-container border border-outline/30 rounded-lg px-3 py-1.5 text-sm w-56 outline-none" />}
        <div className="flex items-center gap-4 text-xs text-on-surface-variant ml-auto">
          {mode === 'brain' && <>
            <span className="flex items-center gap-1"><i className="inline-block w-3 h-0.5" style={{ background: KIND.consumes }} />consumes</span>
            <span className="flex items-center gap-1"><i className="inline-block w-3 h-0.5" style={{ background: KIND.handoff }} />handoff</span>
          </>}
          <button onClick={resetView} className="hover:text-primary">reset view</button>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-2xl border border-outline/20"
        style={{ background: 'radial-gradient(120% 90% at 50% 40%, #0e1220 0%, #080a12 70%)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full"
          style={{ minHeight: 520, cursor: drag ? 'grabbing' : 'grab' }}
          onWheel={e => { const f = e.deltaY < 0 ? 1.1 : 0.9; setZ(v => Math.max(0.5, Math.min(3, v * f))) }}
          onMouseDown={e => setDrag({ x: e.clientX - ox, y: e.clientY - oy })}
          onMouseMove={e => { if (drag) { setOx(e.clientX - drag.x); setOy(e.clientY - drag.y) } }}
          onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}
          onClick={() => setSel(null)}>
          <defs>
            <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="3.2" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            {['consumes', 'handoff'].map(k => (
              <marker key={k} id={`a-${k}`} markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 z" fill={KIND[k]} /></marker>
            ))}
          </defs>
          <g transform={`translate(${ox},${oy}) scale(${z})`}>
            {mode === 'worlds' ? <Worlds g={g} pos={worlds} sel={sel} setSel={setSel} enter={() => { setMode('brain'); setSel(null) }} />
              : <Brain g={g} pos={brain.pos} sel={sel} setSel={setSel} focus={focus} q={q} />}
          </g>
        </svg>
      </div>

      {/* panels */}
      {selWorld && (
        <Panel onClose={() => setSel(null)} color={WCOL[selWorld.kind]} dept={selWorld.kind} title={selWorld.name} sub={selWorld.tagline}>
          {selWorld.populated
            ? <button onClick={() => { setMode('brain'); setSel(null) }} className="mt-4 text-sm px-3 py-1.5 rounded-lg bg-primary/20 border border-primary/50">Enter this brain →</button>
            : <p className="text-sm text-on-surface-variant mt-3">Node-Zero not created yet. This brain fills in once its <code>company.md / voice.md / STATE.md</code> exist (G0) and graphify indexes them.</p>}
        </Panel>
      )}
      {selAgent && focus && (
        <Panel onClose={() => setSel(null)} color={DCOL[selAgent.dept]} dept={selAgent.dept} title={selAgent.id} sub={selAgent.role || '—'}>
          <span className="inline-block text-[11px] px-2 py-0.5 rounded-full border border-outline/40 text-on-surface-variant mt-2">{selAgent.builder ? 'Builder · repo write' : 'Advisory · read-only'}</span>
          <Sec title={`Depends on`}><Deps items={depEdges(g, selAgent.id, 'in')} onPick={setSel} /></Sec>
          <Sec title={`Hands to`}><Deps items={depEdges(g, selAgent.id, 'out')} onPick={setSel} /></Sec>
          <Sec title={`Skills (${selAgent.skills.length})`}>{selAgent.skills.map(s => <span key={s} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline/20">{s}</span>)}</Sec>
          <Sec title="Tools">{selAgent.tools.map(t => <span key={t} className="text-[11.5px] px-2.5 py-1 rounded-lg border border-outline/20">{t}</span>)}</Sec>
          {selAgent.produces && <p className="text-xs text-on-surface-variant mt-4">produces <b>{selAgent.produces}</b></p>}
        </Panel>
      )}
    </div>
  )
}

// ── Worlds view ────────────────────────────────────────────────────────────
function Worlds({ g, pos, sel, setSel, enter }: { g: Graph; pos: Record<string, { x: number; y: number; w: World }>; sel: string | null; setSel: (s: string | null) => void; enter: () => void }) {
  return <>
    {g.worldEdges.map((e, i) => {
      const a = pos[e.from], b = pos[e.to]; if (!a || !b) return null
      const mx = (a.x + b.x) / 2
      return <path key={i} d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`} fill="none"
        stroke={a.w.populated && b.w.populated ? '#8b5cf6' : '#3a4155'} strokeWidth={1.4} opacity={0.5}
        className="bifrost" filter="url(#glow)" />
    })}
    {Object.values(pos).map(({ x, y, w }) => {
      const c = WCOL[w.kind], big = w.id === 'yvon', r = big ? 54 : w.kind === 'factory' ? 34 : w.parent ? 16 : 30
      return (
        <g key={w.id} style={{ cursor: 'pointer' }}
          onClick={ev => { ev.stopPropagation(); w.id === 'yvon' ? enter() : setSel(w.id) }}>
          {w.populated && <circle cx={x} cy={y} r={r + 10} fill={c} opacity={0.12} className="glowpulse" filter="url(#glow)" />}
          <circle cx={x} cy={y} r={r} fill={w.populated ? c : '#12151f'} stroke={c} strokeWidth={sel === w.id ? 3 : 1.8} opacity={w.populated ? 0.95 : 0.8} filter={w.populated ? 'url(#glow)' : undefined} />
          <text x={x} y={big ? y - 4 : y + r + 15} textAnchor="middle" fontSize={big ? 15 : 12} fontWeight={700} fill="#e7ebf3">{w.name}</text>
          {big && <text x={x} y={y + 14} textAnchor="middle" fontSize={9} fill="#aab2c5">master brain</text>}
        </g>
      )
    })}
  </>
}

// ── Brain view (YVON inner) ─────────────────────────────────────────────────
function Brain({ g, pos, sel, setSel, focus, q }: { g: Graph; pos: Record<string, { x: number; y: number; dept?: string }>; sel: string | null; setSel: (s: string | null) => void; focus: Set<string> | null; q: string }) {
  const cx = W / 2, cy = H / 2
  const ql = q.trim().toLowerCase()
  return <>
    {/* edges */}
    {g.yvon.edges.map((e, i) => {
      const a = pos[e.from], b = pos[e.to]; if (!a || !b) return null
      const on = focus ? (focus.has(e.from) && focus.has(e.to) && e.kind !== 'related') : false
      const op = focus ? (on ? 0.95 : 0.04) : (e.kind === 'related' ? 0.1 : 0.4)
      const mx = (a.x + b.x) / 2
      return <path key={i} d={`M${a.x},${a.y} C${mx},${a.y} ${mx},${b.y} ${b.x},${b.y}`} fill="none"
        stroke={KIND[e.kind]} strokeWidth={on ? 2.2 : 1.3} opacity={op}
        markerEnd={e.kind !== 'related' ? `url(#a-${e.kind})` : undefined}
        filter={on ? 'url(#glow)' : undefined} className={on ? 'bifrost' : undefined} />
    })}
    {/* Node-Zero core */}
    <circle cx={cx} cy={cy} r={62} fill="#8b5cf6" opacity={0.08} className="glowpulse" filter="url(#glow)" />
    <circle cx={cx} cy={cy} r={44} fill="#0e1220" stroke="#8b5cf6" strokeWidth={2} filter="url(#glow)" />
    <text x={cx} y={cy - 4} textAnchor="middle" fontSize={13} fontWeight={700} fill="#fff">YVON Core</text>
    <text x={cx} y={cy + 12} textAnchor="middle" fontSize={8.5} fill="#aab2c5">Node Zero · systems</text>
    {/* systems ring */}
    {g.yvon.systems.map(s => { const p = pos['sys:' + s.id]; if (!p) return null
      return <g key={s.id}><circle cx={p.x} cy={p.y} r={6} fill="#8b5cf6" opacity={0.8} />
        <text x={p.x} y={p.y - 9} textAnchor="middle" fontSize={8} fill="#aab2c5">{s.id}</text></g> })}
    {/* department hubs */}
    {g.yvon.departments.map(d => { const p = pos['dept:' + d]; if (!p) return null; const c = DCOL[d]
      return <g key={d}><circle cx={p.x} cy={p.y} r={16} fill={c} opacity={0.9} filter="url(#glow)" />
        <text x={p.x} y={p.y < cy ? p.y - 22 : p.y + 30} textAnchor="middle" fontSize={11.5} fontWeight={700} fill="#e7ebf3">{d}</text></g> })}
    {/* connect core → dept */}
    {g.yvon.departments.map(d => { const p = pos['dept:' + d]; if (!p) return null
      return <line key={'l' + d} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="#2b3040" strokeWidth={1} opacity={0.5} /> })}
    {/* agents */}
    {g.yvon.nodes.map(n => { const p = pos[n.id]; if (!p) return null; const c = DCOL[n.dept]
      const hit = !ql || n.id.includes(ql) || n.skills.some(s => s.includes(ql))
      const op = (ql && !hit) ? 0.12 : (focus && !focus.has(n.id) ? 0.14 : 1)
      return (
        <g key={n.id} opacity={op} style={{ cursor: 'pointer' }} onClick={ev => { ev.stopPropagation(); setSel(n.id === sel ? null : n.id) }}>
          {/* dept hub → agent */}
          <line x1={pos['dept:' + n.dept]?.x} y1={pos['dept:' + n.dept]?.y} x2={p.x} y2={p.y} stroke="#2b3040" strokeWidth={0.8} opacity={0.4} />
          <circle cx={p.x} cy={p.y} r={8} fill={n.builder ? c : '#0e1220'} stroke={c} strokeWidth={sel === n.id ? 3 : 1.8} filter={sel === n.id ? 'url(#glow)' : undefined} />
          <text x={p.x} y={p.y + 20} textAnchor="middle" fontSize={10} fill="#c7cede">{n.id}</text>
        </g>
      ) })}
  </>
}

// ── small components ─────────────────────────────────────────────────────────
function Panel({ title, sub, dept, color, children, onClose }: { title: string; sub: string; dept: string; color: string; children: ReactNode; onClose: () => void }) {
  return (
    <aside className="fixed top-0 right-0 h-full w-[360px] bg-surface-container border-l border-outline/30 p-6 overflow-auto z-50 shadow-xl">
      <button onClick={onClose} className="absolute top-4 right-5 text-on-surface-variant">✕</button>
      <div className="text-xs font-bold tracking-wider uppercase" style={{ color }}>{dept}</div>
      <h2 className="text-2xl font-semibold capitalize mt-1">{title}</h2>
      <div className="text-on-surface-variant text-sm">{sub}</div>
      {children}
    </aside>
  )
}
function Sec({ title, children }: { title: string; children: ReactNode }) {
  return <div className="mt-5"><h3 className="text-[11px] tracking-wider uppercase text-on-surface-variant mb-2">{title}</h3><div className="flex flex-wrap gap-1.5">{children}</div></div>
}
function Chip({ label, sub, onClick }: { label: string; sub?: string; onClick?: () => void }) {
  return <button onClick={onClick} className="text-[11.5px] px-2.5 py-1 rounded-lg bg-surface-container-high border border-outline/20 hover:border-primary">{label}{sub && <span className="text-on-surface-variant"> · {sub}</span>}</button>
}
function Em() { return <span className="text-xs text-on-surface-variant">—</span> }
function Deps({ items, onPick }: { items: { id: string; kind: string }[]; onPick: (s: string) => void }) {
  return items.length ? <>{items.map(x => <Chip key={x.id} label={x.id} sub={x.kind} onClick={() => onPick(x.id)} />)}</> : <Em />
}
function depEdges(g: Graph, id: string, dir: 'in' | 'out'): { id: string; kind: string }[] {
  return g.yvon.edges.filter(e => e.kind !== 'related' && (dir === 'in' ? e.to === id : e.from === id))
    .map(e => ({ id: dir === 'in' ? e.from : e.to, kind: e.kind }))
}
