'use client'

import { useState } from 'react'
import { PageHeader, StatusBadge, Card } from '@/components/ui'
import { useLiveData } from '@/lib/use-live-data'
import { useWorkspace } from '@/lib/WorkspaceContext'
import YvonGraph from '@/components/YvonGraph'
import type { LibraryDoc } from '@/app/api/knowledge-graph/route'

type VisibilityFilter = 'all' | 'private' | 'team' | 'workspace' | 'cross-workspace'

const FILTER_OPTIONS: { label: string; value: VisibilityFilter }[] = [
  { label: 'All areas', value: 'all' },
  { label: 'Private', value: 'private' },
  { label: 'Team', value: 'team' },
  { label: 'Workspace', value: 'workspace' },
  { label: 'Cross-WS', value: 'cross-workspace' },
]

// 2026-08-26: Graph Memory only, Library removed per operator. Restored
// 2026-08-30 (operator: "bring it back") — the /api/knowledge-graph route's
// ventureKnowledgeGraph() was never actually touched by that removal; it has
// been reading real mempalace output (venture_repo_knowledge.entries) into
// LibraryDoc[] the whole time, just with no UI ever rendering `data.docs`.
// Confirmed live via SQL before restoring this: Novizio has 118 real mined
// entries sitting in that table with nothing showing them anywhere.
export default function BrainWikiPage() {
  const [tab, setTab] = useState<'graph' | 'library'>('graph')
  const [selDoc, setSelDoc] = useState<LibraryDoc | null>(null)
  const [visibilityFilter, setVisibilityFilter] = useState<VisibilityFilter>('all')
  const { ventures } = useWorkspace()
  const [ventureFilter, setVentureFilter] = useState<string>('fleet')
  const ventureOptions = ventures.filter((v) => v.kind !== 'core')

  const knowledgeGraphUrl =
    ventureFilter === 'fleet'
      ? '/api/knowledge-graph'
      : `/api/knowledge-graph?venture=${encodeURIComponent(ventureFilter)}`

  const { data } = useLiveData<{
    docs: LibraryDoc[]
    topicsCount: number
    documentsCount: number
  }>({
    url: knowledgeGraphUrl,
    pollIntervalMs: 60000,
  })

  const docs = data?.docs ?? []
  const filteredDocs = visibilityFilter === 'all' ? docs : docs.filter((d) => d.visibility === visibilityFilter)

  return (
    <div>
      <PageHeader
        title="Brain & Wiki"
        subtitle="Graph memory — the live YVON graph: departments, agents, and venture satellites."
      />

      {/* Source — venture selector (kept per operator) */}
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

      {/* Stats + tabs */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone="muted">
          {data?.topicsCount ?? 0} {ventureFilter === 'fleet' ? 'topics' : 'code nodes'}
        </StatusBadge>
        <StatusBadge tone="muted">
          {data?.documentsCount ?? 0} {ventureFilter === 'fleet' ? 'docs' : 'knowledge entries'}
        </StatusBadge>
        <div className="flex-1" />
        <button
          onClick={() => setTab('graph')}
          className={`btn-ghost !py-1.5 !text-xs ${tab === 'graph' ? '!bg-white/10' : ''}`}
        >
          Graph Memory
        </button>
        <button
          onClick={() => setTab('library')}
          className={`btn-ghost !py-1.5 !text-xs ${tab === 'library' ? '!bg-white/10' : ''}`}
        >
          Library
        </button>
      </div>

      {/* Visibility filter (kept per operator) */}
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

      {tab === 'graph' ? (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0c]" style={{ height: '70vh' }}>
          <YvonGraph embedded />
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
      ) : (
        /* ── Library — real mempalace entries (venture_repo_knowledge),
            mapped to LibraryDoc by /api/knowledge-graph's
            ventureKnowledgeGraph(). Restored 2026-08-30. ── */
        <div className="space-y-2">
          {filteredDocs.map((d) => (
            <div
              key={d.id}
              className="glass-card glass-card-hover p-4 cursor-pointer"
              onClick={() => setSelDoc(d)}
            >
              <h4 className="text-sm font-semibold text-on-surface">{d.title}</h4>
              <div className="mt-1 flex gap-2">
                <StatusBadge tone="muted">{d.category}</StatusBadge>
                <StatusBadge tone="muted">{d.visibility}</StatusBadge>
              </div>
              <p className="mt-2 text-[12px] text-on-surface-variant">{d.answer}</p>
            </div>
          ))}

          {filteredDocs.length === 0 && (
            <Card className="p-6 text-center">
              <span className="material-symbols-outlined text-[48px] text-on-surface-variant/30 mb-2 block">
                description
              </span>
              <p className="text-sm text-on-surface-variant">
                {ventureFilter === 'fleet'
                  ? 'No documents match the selected filter'
                  : `No mempalace entries for ${ventureOptions.find((v) => v.slug === ventureFilter)?.name ?? ventureFilter} yet`}
              </p>
            </Card>
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
                <h3 className="text-lg font-bold text-on-surface mb-2">{selDoc.title}</h3>
                <StatusBadge tone="muted">{selDoc.category}</StatusBadge>
                <p className="mt-3 text-sm text-on-surface-variant">
                  <strong>Answer:</strong> {selDoc.answer}
                </p>
                {selDoc.findings && (
                  <p className="mt-2 text-sm text-on-surface-variant">
                    <strong>Findings:</strong> {selDoc.findings}
                  </p>
                )}
                <button className="btn-accent mt-4" onClick={() => setSelDoc(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
