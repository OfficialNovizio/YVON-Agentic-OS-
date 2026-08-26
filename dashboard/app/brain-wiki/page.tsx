'use client'

import { useState } from 'react'
import { PageHeader, StatusBadge } from '@/components/ui'
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

// 2026-08-26: Brain & Wiki — Graph Memory viewer only. Library + pipeline
// tabs removed per operator; Source chips, stats badges, and the visibility
// filter chips were restored after the operator flagged they'd been removed
// beyond the highlighted buttons.
export default function BrainWikiPage() {
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

      {/* Stats (kept per operator) */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <StatusBadge tone="muted">
          {data?.topicsCount ?? 0} {ventureFilter === 'fleet' ? 'topics' : 'code nodes'}
        </StatusBadge>
        <StatusBadge tone="muted">
          {data?.documentsCount ?? 0} {ventureFilter === 'fleet' ? 'docs' : 'knowledge entries'}
        </StatusBadge>
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
    </div>
  )
}
