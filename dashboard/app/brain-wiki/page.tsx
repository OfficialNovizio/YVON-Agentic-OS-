'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { PageHeader, StatusBadge, Card } from '@/components/ui'
import { useLiveData } from '@/lib/use-live-data'
import { useWorkspace } from '@/lib/WorkspaceContext'
import YvonGraph from '@/components/YvonGraph'
import type { GraphNode, GraphEdge, LibraryDoc } from '@/app/api/knowledge-graph/route'

type VisibilityFilter = 'all' | 'private' | 'team' | 'workspace' | 'cross-workspace'

interface NodePosition {
  id: string
  x: number
  y: number
}

const FILTER_OPTIONS: { label: string; value: VisibilityFilter }[] = [
  { label: 'All areas', value: 'all' },
  { label: 'Private', value: 'private' },
  { label: 'Team', value: 'team' },
  { label: 'Workspace', value: 'workspace' },
  { label: 'Cross-WS', value: 'cross-workspace' },
]

export default function BrainWikiPage() {
  const [view, setView] = useState<'graphMemory' | 'graph' | 'library' | 'caos' | 'cie' | 'rag' | 'context' | 'input'>('graphMemory')
  const [selNode, setSelNode] = useState<GraphNode | null>(null)
  const [selDoc, setSelDoc] = useState<LibraryDoc | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const [nodePositions, setNodePositions] = useState<NodePosition[]>([])

  const animRef = useRef<number | null>(null)
  const positionsRef = useRef<NodePosition[]>([])

  // 2026-08-14 — venture data source. 'fleet' = the original generic
  // agent_memory-backed view (unchanged default). Any other value is a real
  // venture slug: /api/knowledge-graph?venture=<slug> swaps in that
  // venture's actual graphify graph + mempalace mined knowledge (migration
  // 120) — see the route's ventureKnowledgeGraph() for the mapping. Sourced
  // from the same useWorkspace() ventures list YvonGraph.tsx's satellites
  // use, filtered to real (non-core) brands — yvon-os's own graph doesn't
  // come through this pipeline (it uses graphify-cron.sh instead, see the
  // operator discussion this session).
  const { ventures } = useWorkspace()
  const [ventureFilter, setVentureFilter] = useState<string>('fleet')
  const ventureOptions = ventures.filter((v) => v.kind !== 'core')

  const knowledgeGraphUrl =
    ventureFilter === 'fleet'
      ? '/api/knowledge-graph'
      : `/api/knowledge-graph?venture=${encodeURIComponent(ventureFilter)}`

  const { data } = useLiveData<{
    nodes: GraphNode[]
    edges: GraphEdge[]
    docs: LibraryDoc[]
    topicsCount: number
    documentsCount: number
  }>({
    url: knowledgeGraphUrl,
    pollIntervalMs: 60000,
  })

  const nodes = data?.nodes ?? []
  const edges = data?.edges ?? []
  const docs = data?.docs ?? []

  // Client-side filtering by visibility
  const filteredNodes =
    visibilityFilter === 'all'
      ? nodes
      : nodes.filter((n) => n.visibility === visibilityFilter)

  const filteredDocs =
    visibilityFilter === 'all'
      ? docs
      : docs.filter((d) => d.visibility === visibilityFilter)

  // Only draw edges where both endpoints are in filteredNodes
  const visibleNodeIds = new Set(filteredNodes.map((n) => n.id))
  const visibleEdges = edges.filter(
    (e) => visibleNodeIds.has(e.source) && visibleNodeIds.has(e.target),
  )

  // ── Force-directed graph layout ───────────────────────────────────────
  useEffect(() => {
    if (filteredNodes.length === 0 || view !== 'graph') {
      setNodePositions([])
      return
    }

    const W = 640
    const H = 380
    const cx = W / 2
    const cy = H / 2

    // Initialize positions in a circle
    const init: NodePosition[] = filteredNodes.map((n, i) => {
      const angle = (2 * Math.PI * i) / filteredNodes.length
      const r = Math.min(W, H) * 0.32
      return {
        id: n.id,
        x: cx + Math.cos(angle) * r + (Math.random() - 0.5) * 20,
        y: cy + Math.sin(angle) * r + (Math.random() - 0.5) * 20,
      }
    })

    positionsRef.current = init
    setNodePositions([...init])

    const repulsion = 4000
    const attraction = 0.008
    const minDist = 35
    let tickCount = 0
    const maxTicks = 100

    function tick() {
      if (tickCount >= maxTicks) {
        animRef.current = null
        return
      }

      const pos = positionsRef.current.map((p) => ({ ...p }))
      const len = pos.length

      // Repulsion — every node pair
      for (let i = 0; i < len; i++) {
        for (let j = i + 1; j < len; j++) {
          const dx = pos[j].x - pos[i].x
          const dy = pos[j].y - pos[i].y
          const dist = Math.max(Math.sqrt(dx * dx + dy * dy), minDist)
          const f = repulsion / (dist * dist)
          const fx = (dx / dist) * f
          const fy = (dy / dist) * f
          pos[i].x -= fx
          pos[i].y -= fy
          pos[j].x += fx
          pos[j].y += fy
        }
      }

      // Attraction — along edges
      for (const e of visibleEdges) {
        const si = pos.findIndex((p) => p.id === e.source)
        const ti = pos.findIndex((p) => p.id === e.target)
        if (si === -1 || ti === -1) continue
        const dx = pos[ti].x - pos[si].x
        const dy = pos[ti].y - pos[si].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist === 0) continue
        const f = dist * attraction * e.weight
        const fx = (dx / dist) * f
        const fy = (dy / dist) * f
        pos[si].x += fx
        pos[si].y += fy
        pos[ti].x -= fx
        pos[ti].y -= fy
      }

      // Gentle center gravity
      for (const p of pos) {
        p.x += (cx - p.x) * 0.006
        p.y += (cy - p.y) * 0.006
      }

      // Clamp to bounds
      const margin = 30
      for (const p of pos) {
        p.x = Math.max(margin, Math.min(W - margin, p.x))
        p.y = Math.max(margin, Math.min(H - margin, p.y))
      }

      positionsRef.current = pos
      tickCount++

      // Update React state every few ticks for smooth animation,
      // and always on the final tick
      if (tickCount % 4 === 0 || tickCount >= maxTicks) {
        setNodePositions([...pos])
      }

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)

    return () => {
      if (animRef.current !== null) {
        cancelAnimationFrame(animRef.current)
        animRef.current = null
      }
    }
  }, [filteredNodes, visibleEdges, view])

  // ── Helpers ──────────────────────────────────────────────────────────

  const getPos = useCallback(
    (id: string) => nodePositions.find((p) => p.id === id) ?? null,
    [nodePositions],
  )

  const nodeRadius = (size: number) => Math.max(7, Math.min(size / 3.5, 22))

  // ── Render ───────────────────────────────────────────────────────────
  return (
    <div>
      <PageHeader
        title="Brain & Wiki"
        subtitle="3D knowledge graph + document library. Vectorized in Supabase with semantic search for all agents."
      />

      {/* Venture source (2026-08-14) — 'Fleet Memory' is the original generic
          agent_memory view; each real venture below is that brand's actual
          graphify graph + mempalace knowledge (migration 120), not a mock. */}
      {ventureOptions.length > 0 && (
        <div className="mb-3 flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] text-on-surface-variant/50 uppercase tracking-wider mr-1">Source</span>
          <button
            onClick={() => setVentureFilter('fleet')}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
              ventureFilter === 'fleet'
                ? 'border-white/20 bg-white/10 text-on-surface'
                : 'border-white/5 bg-transparent text-on-surface-variant hover:border-white/10 hover:bg-white/5'
            }`}
          >
            Fleet Memory
          </button>
          {ventureOptions.map((v) => (
            <button
              key={v.slug}
              onClick={() => setVentureFilter(v.slug)}
              className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
                ventureFilter === v.slug
                  ? 'border-white/20 bg-white/10 text-on-surface'
                  : 'border-white/5 bg-transparent text-on-surface-variant hover:border-white/10 hover:bg-white/5'
              }`}
            >
              {v.name}
            </button>
          ))}
        </div>
      )}

      {/* Stats + filters */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone="muted">
          {data?.topicsCount ?? 0} {ventureFilter === 'fleet' ? 'topics' : 'code nodes'}
        </StatusBadge>
        <StatusBadge tone="muted">
          {data?.documentsCount ?? 0} {ventureFilter === 'fleet' ? 'docs' : 'knowledge entries'}
        </StatusBadge>
        <div className="flex-1" />
        <button
          onClick={() => setView('graphMemory')}
          className={`btn-ghost !py-1.5 !text-xs ${view === 'graphMemory' ? '!bg-white/10' : ''}`}
        >
          Graph Memory
        </button>
        <button
          onClick={() => setView('graph')}
          className={`btn-ghost !py-1.5 !text-xs ${view === 'graph' ? '!bg-white/10' : ''}`}
        >
          Knowledge Graph
        </button>
        <button
          onClick={() => setView('library')}
          className={`btn-ghost !py-1.5 !text-xs ${view === 'library' ? '!bg-white/10' : ''}`}
        >
          Library
        </button>
        {/* TS-030: pipeline structure tabs — where CAOS/CIE/RAG/Context/Input
            Analysis visuals will live (visuals work deferred) */}
        {([['caos', 'CAOS'], ['cie', 'CIE'], ['rag', 'RAG'], ['context', 'Context'], ['input', 'Input Analysis']] as const).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={`btn-ghost !py-1.5 !text-xs ${view === id ? '!bg-white/10' : ''}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Visibility filter chips ─────────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setVisibilityFilter(opt.value)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
              visibilityFilter === opt.value
                ? 'border-white/20 bg-white/10 text-on-surface'
                : 'border-white/5 bg-transparent text-on-surface-variant hover:border-white/10 hover:bg-white/5'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {view === 'graphMemory' ? (
        /* ── Graph Memory — the real YvonGraph orb viewer, boxed in a viewport
            (embedded) with an expand button that opens it full-screen in a new
            tab (/brain renders it fixed). ── */
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c]" style={{ height: '70vh' }}>
          <YvonGraph embedded />
          {/* Expand — opens the full-screen graph in a new tab */}
          <a
            href="/brain"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute right-3 top-3 z-50 flex items-center gap-1.5 rounded-lg bg-white/10 px-3 py-1.5 text-[12px] text-white backdrop-blur transition hover:bg-white/20"
          >
            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
            Expand
          </a>
        </div>
      ) : view === 'graph' ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
          {/* ── Force-directed graph ────────────────────────────────── */}
          <Card className="p-4 min-h-[400px] overflow-hidden">
            {filteredNodes.length === 0 ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <span className="material-symbols-outlined text-[64px] text-on-surface-variant/30 mb-3 block">
                    hub
                  </span>
                  <p className="text-sm text-on-surface-variant">
                    No nodes match the selected filter
                  </p>
                  <p className="text-[11px] text-on-surface-variant/60 mt-1">
                    Try &ldquo;All areas&rdquo; or a different visibility
                  </p>
                </div>
              </div>
            ) : (
              <svg
                viewBox="0 0 640 380"
                className="h-full w-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* Edge lines */}
                {visibleEdges.map((e) => {
                  const sp = getPos(e.source)
                  const tp = getPos(e.target)
                  if (!sp || !tp) return null
                  return (
                    <line
                      key={`${e.source}-${e.target}`}
                      x1={sp.x}
                      y1={sp.y}
                      x2={tp.x}
                      y2={tp.y}
                      stroke="rgb(255 255 255 / 0.08)"
                      strokeWidth={Math.max(0.5, e.weight * 1.5)}
                    />
                  )
                })}

                {/* Node circles */}
                {filteredNodes.map((n) => {
                  const pos = getPos(n.id)
                  if (!pos) return null
                  const r = nodeRadius(n.size)
                  const isSel = selNode?.id === n.id
                  return (
                    <g
                      key={n.id}
                      className="cursor-pointer"
                      onClick={() => setSelNode(isSel ? null : n)}
                    >
                      {/* Glow ring when selected */}
                      {isSel && (
                        <circle
                          cx={pos.x}
                          cy={pos.y}
                          r={r + 6}
                          fill="none"
                          stroke="rgb(255 255 255 / 0.25)"
                          strokeWidth={2}
                        />
                      )}
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={r}
                        fill={`${n.color}30`}
                        stroke={n.color}
                        strokeWidth={isSel ? 2 : 1}
                        className="transition-all duration-200"
                      />
                      <text
                        x={pos.x}
                        y={pos.y + r + 13}
                        textAnchor="middle"
                        fill={isSel ? 'rgb(255 255 255 / 0.9)' : 'rgb(255 255 255 / 0.55)'}
                        fontSize={10}
                        fontFamily="Inter, system-ui, sans-serif"
                        className="pointer-events-none transition-colors duration-200"
                      >
                        {n.label}
                      </text>
                    </g>
                  )
                })}
              </svg>
            )}
            {/* Node count and hint */}
            <p className="mt-2 text-center text-[11px] text-on-surface-variant/60">
              {filteredNodes.length} node{filteredNodes.length !== 1 ? 's' : ''}{' '}
              · color-coded by workspace · click to inspect
            </p>
          </Card>

          {/* Right rail: gaps */}
          <div className="space-y-3">
            <Card className="p-4">
              <h4 className="text-sm font-semibold text-on-surface mb-3">
                What agents don&apos;t know
              </h4>
              {[
                { text: 'No TikTok Shop fee data', action: 'Fix' },
                { text: 'Missing competitor thumbnail analysis', action: 'Research' },
                { text: 'Hourbour churn reasons incomplete', action: 'Add' },
              ].map((g) => (
                <div
                  key={g.text}
                  className="flex items-center justify-between py-1.5 border-b border-white/5 text-[12px] text-on-surface-variant"
                >
                  <span>{g.text}</span>
                  <button className="btn-ghost !py-1 !px-2 !text-[10px]">
                    {g.action}
                  </button>
                </div>
              ))}
            </Card>

            {/* Selected node detail */}
            {selNode && (
              <Card className="p-4">
                <h4 className="text-sm font-semibold text-on-surface mb-2">
                  {selNode.label}
                </h4>
                <div className="flex gap-2 mb-2">
                  <StatusBadge tone="muted">{selNode.visibility}</StatusBadge>
                  <StatusBadge tone="muted">{selNode.workspace}</StatusBadge>
                </div>
                <p className="text-[12px] text-on-surface-variant">
                  Connected to {selNode.connections.length} topics
                </p>
              </Card>
            )}
          </div>
        </div>
      ) : view === 'library' ? (
        /* ── Library view ───────────────────────────────────────────── */
        <div className="space-y-2">
          {filteredDocs.map((d) => (
            <div
              key={d.id}
              className="glass-card glass-card-hover p-4 cursor-pointer"
              onClick={() => setSelDoc(d)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-on-surface">
                    {d.title}
                  </h4>
                  <div className="mt-1 flex gap-2">
                    <StatusBadge tone="muted">{d.category}</StatusBadge>
                    <StatusBadge tone="muted">{d.visibility}</StatusBadge>
                  </div>
                  <p className="mt-2 text-[12px] text-on-surface-variant">
                    {d.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state for library */}
          {filteredDocs.length === 0 && (
            <div className="glass-card p-6 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2 block">
                description
              </span>
              <p className="text-sm text-on-surface-variant">
                No documents match the selected filter
              </p>
            </div>
          )}

          {selDoc && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
              onClick={() => setSelDoc(null)}
            >
              <div
                className="glass-card p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-lg font-bold text-on-surface mb-2">
                  {selDoc.title}
                </h3>
                <StatusBadge tone="muted">{selDoc.category}</StatusBadge>
                <p className="mt-3 text-sm text-on-surface-variant">
                  <strong>Answer:</strong> {selDoc.answer}
                </p>
                {selDoc.findings && (
                  <p className="mt-2 text-sm text-on-surface-variant">
                    <strong>Findings:</strong> {selDoc.findings}
                  </p>
                )}
                <button
                  className="btn-accent mt-4"
                  onClick={() => setSelDoc(null)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* ── Pipeline structure view (CAOS / CIE / RAG / Context / Input) ──
            TS-030: these are the home for the pipeline visualizations.
            Full visuals are deferred (F1/F2 in handout) — for now show a
            structural summary of each stage. */
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-on-surface mb-3">
            {view === 'caos' ? 'CAOS — Context-Aware Orchestration System' :
             view === 'cie' ? 'CIE — Context Intelligence Engine' :
             view === 'rag' ? 'RAG — Retrieval-Augmented Generation' :
             view === 'context' ? 'Context Injection' :
             'Input Analysis'}
          </h3>
          <p className="text-[13px] text-on-surface-variant">
            {view === 'caos' && 'CLASSIFY → RESOLVE → RETRIEVE → GATE, then the 5-gate harness, strategy routing, LLM trio, and post-hoc verification.'}
            {view === 'cie' && 'Classification, progressive disclosure, cache-augmented generation, and graph resolution feeding the agent.'}
            {view === 'rag' && 'Query rewrite → hybrid retrieval → cross-encoder re-rank → harness gates → injection with citations.'}
            {view === 'context' && 'Agent skills (yvon-os) + venture memory (other ventures) injected into the turn.'}
            {view === 'input' && 'Message analysis — tier (generic/info/build) + relation (venture/general) + dynamic fields.'}
          </p>
          <p className="mt-3 text-[12px] text-on-surface-variant/60">
            Full visualization of this stage will be built with the visuals work (handout F1/F2).
          </p>
        </div>
      )}
    </div>
  )
}
