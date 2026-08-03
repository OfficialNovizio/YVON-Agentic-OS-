// /brain — Graph Memory. The REAL graphify knowledge graph of the whole repo,
// aggregated to a legible module map (7.4k nodes / 414 communities are too many to
// draw flat). Click a module → its god-nodes (most-connected symbols/files).
// Data: public/graph-view.json (cli/graph-publish.py ← graphify-out/graph.json).
// Owner: mia · G-track (G2+G5, graphify-backed).
'use client'

import { useEffect, useMemo, useState } from 'react'
import { PageHeader } from '@/components/ui'

type God = { id: string; label: string; file: string; deg: number; kind: string }
type Module = { id: string; count: number; langs: string[]; communities: number; godNodes: God[] }
type View = { totals: { nodes: number; edges: number; communities: number }; commit: string; modules: Module[]; edges: { from: string; to: string; count: number }[] }

const PALETTE = ['#8b5cf6', '#38bdf8', '#22c55e', '#f59e0b', '#ec4899', '#2dd4bf', '#ef4444', '#a78bfa', '#84cc16', '#fb923c', '#60a5fa', '#f472b6']
const W = 1400, H = 900

export default function BrainPage() {
  const [v, setV] = useState<View | null>(null)
  const [sel, setSel] = useState<string | null>(null)
  const [q, setQ] = useState('')
  const [z, setZ] = useState(1); const [ox, setOx] = useState(0); const [oy, setOy] = useState(0)
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null)
  const reset = () => { setZ(1); setOx(0); setOy(0) }

  useEffect(() => { fetch('/graph-view.json').then(r => r.json()).then(setV).catch(() => setV(null)) }, [])

  const { pos, col } = useMemo(() => {
    const pos: Record<string, { x: number; y: number; r: number }> = {}
    const col: Record<string, string> = {}
    if (!v) return { pos, col }
    const cx = W / 2, cy = H / 2, R = 320
    const mods = v.modules
    const maxC = Math.max(...mods.map(m => m.count))
    mods.forEach((m, i) => {
      const a = (i / mods.length) * Math.PI * 2 - Math.PI / 2
      const r = Math.max(14, Math.min(64, Math.sqrt(m.count / maxC) * 64))
      pos[m.id] = { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R, r }
      col[m.id] = PALETTE[i % PALETTE.length]
    })
    return { pos, col }
  }, [v])

  if (!v) return (
    <div className="p-8"><PageHeader title="Graph Memory" subtitle="Loading the knowledge graph…" />
      <p className="text-on-surface-variant mt-6 text-sm">No graph yet. Generate it: <code className="px-1 rounded bg-surface-container">graphify extract . --code-only</code> then <code className="px-1 rounded bg-surface-container">python3 cli/graph-publish.py</code>.</p></div>
  )

  const ql = q.trim().toLowerCase()
  const selMod = sel ? v.modules.find(m => m.id === sel) : null
  const T = v.totals

  return (
    <div className="relative p-6 select-none">
      <style>{`@keyframes bp{0%,100%{opacity:.28}50%{opacity:.7}}.gp{animation:bp 3s ease-in-out infinite}`}</style>
      <PageHeader title="Graph Memory"
        subtitle={`graphify knowledge graph · ${T.nodes.toLocaleString()} nodes · ${T.edges.toLocaleString()} edges · ${T.communities} communities · @${v.commit}`} />

      <div className="mt-4 flex items-center gap-3 flex-wrap">
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search module or symbol…"
          className="bg-surface-container border border-outline/30 rounded-lg px-3 py-1.5 text-sm w-64 outline-none" />
        <div className="flex items-center gap-3 text-xs text-on-surface-variant ml-auto">
          <span>module size = node count</span>
          {sel && <button onClick={() => setSel(null)} className="text-primary">clear</button>}
          <button onClick={reset} className="hover:text-primary">reset view</button>
        </div>
      </div>
      <p className="mt-2 text-[11px] text-on-surface-variant/70">The real graphify graph, aggregated by module (folders = brain regions) so 7.4k nodes stay legible. Click a module for its god-nodes; per-node drill-down is next. Regenerate: <code>graphify extract . --code-only</code> → <code>cli/graph-publish.py</code>.</p>

      <div className="mt-3 overflow-hidden rounded-2xl border border-outline/20"
        style={{ background: 'radial-gradient(120% 90% at 50% 50%, #0e1220 0%, #07080e 72%)' }}>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minHeight: 560, cursor: drag ? 'grabbing' : 'grab' }}
          onWheel={e => setZ(x => Math.max(0.5, Math.min(3, x * (e.deltaY < 0 ? 1.1 : 0.9))))}
          onMouseDown={e => setDrag({ x: e.clientX - ox, y: e.clientY - oy })}
          onMouseMove={e => { if (drag) { setOx(e.clientX - drag.x); setOy(e.clientY - drag.y) } }}
          onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)} onClick={() => setSel(null)}>
          <defs><filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.4" result="b" /><feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge></filter></defs>
          <g transform={`translate(${ox},${oy}) scale(${z})`}>
            {/* inter-module edges */}
            {v.edges.map((e, i) => {
              const a = pos[e.from], b = pos[e.to]; if (!a || !b) return null
              const on = !sel || sel === e.from || sel === e.to
              const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2 - 40
              return <path key={i} d={`M${a.x},${a.y} Q${mx},${my} ${b.x},${b.y}`} fill="none"
                stroke="#3b4155" strokeWidth={Math.max(1, Math.min(6, Math.log(e.count + 1)))}
                opacity={on ? 0.4 : 0.06} />
            })}
            {/* module nodes */}
            {v.modules.map(m => {
              const p = pos[m.id]; if (!p) return null; const c = col[m.id]
              const hit = !ql || m.id.toLowerCase().includes(ql) || m.godNodes.some(gn => gn.label.toLowerCase().includes(ql))
              const op = (ql && !hit) ? 0.15 : (sel && sel !== m.id ? 0.25 : 1)
              return (
                <g key={m.id} opacity={op} style={{ cursor: 'pointer' }} onClick={ev => { ev.stopPropagation(); setSel(m.id === sel ? null : m.id) }}>
                  <circle cx={p.x} cy={p.y} r={p.r + 8} fill={c} opacity={0.1} className="gp" filter="url(#glow)" />
                  <circle cx={p.x} cy={p.y} r={p.r} fill={c} opacity={0.9} stroke={sel === m.id ? '#fff' : c} strokeWidth={sel === m.id ? 2.5 : 1} filter="url(#glow)" />
                  <text x={p.x} y={p.y - 2} textAnchor="middle" fontSize={Math.max(11, p.r / 3.4)} fontWeight={700} fill="#0b0d14">{m.id}</text>
                  <text x={p.x} y={p.y + p.r / 3.4 + 8} textAnchor="middle" fontSize={Math.max(9, p.r / 5)} fill="#0b0d14" opacity={0.75}>{m.count.toLocaleString()}</text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {selMod && (
        <aside className="fixed top-0 right-0 h-full w-[380px] bg-surface-container border-l border-outline/30 p-6 overflow-auto z-50 shadow-xl">
          <button onClick={() => setSel(null)} className="absolute top-4 right-5 text-on-surface-variant">✕</button>
          <div className="text-xs font-bold tracking-wider uppercase" style={{ color: col[selMod.id] }}>module</div>
          <h2 className="text-2xl font-semibold mt-1">{selMod.id}</h2>
          <div className="text-on-surface-variant text-sm">{selMod.count.toLocaleString()} nodes · {selMod.communities} communities{selMod.langs.length ? ` · ${selMod.langs.join(', ')}` : ''}</div>
          <h3 className="text-[11px] tracking-wider uppercase text-on-surface-variant mt-6 mb-2">God-nodes (most connected)</h3>
          <div className="flex flex-col gap-1.5">
            {selMod.godNodes.map(gn => (
              <div key={gn.id} className="rounded-lg bg-surface-container-high border border-outline/20 px-3 py-2">
                <div className="text-sm font-medium truncate">{gn.label} <span className="text-on-surface-variant text-[11px]">· {gn.deg} links{gn.kind ? ` · ${gn.kind}` : ''}</span></div>
                <div className="text-[11px] text-on-surface-variant truncate">{gn.file}</div>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  )
}
