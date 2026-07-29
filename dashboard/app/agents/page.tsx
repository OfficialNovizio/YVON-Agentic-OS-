// /agents — Fleet directory. Every one of the 46 agents, searchable, filterable.
// Same data source as /office (/api/office); same drawer on click (OfficeDrawer).
//
// Rebuild reason (TS-009 WI-5, part of Push A):
// Old page checked for a per-venture "ToonGine" integration on a GitHub repo —
// a deprecated backend from the imported YVON-OS app. Every workspace showed
// "No Data" because that integration doesn't exist. Replaced with an honest,
// useful directory rooted in the real fleet + real (or empty) session data.
'use client'

import { useMemo, useState } from 'react'
import { PageHeader, StatusBadge } from '@/components/ui'
import { Search, X } from 'lucide-react'
import { useLiveData } from '@/lib/use-live-data'
import { FLEET, FLEET_DEPARTMENTS } from '@/lib/fleet'
import type { FleetDepartment } from '@/lib/fleet'
import { OfficeDrawer } from '@/app/office/OfficeDrawer'
import type { OfficeResponse, OfficeAgent, AgentStatus } from '@/app/api/office/route'

// ── Status → chip tone ──────────────────────────────────────────────────────
const STATUS_TONE: Record<AgentStatus, 'green' | 'blue' | 'muted' | 'red'> = {
  working: 'green',
  'in-council': 'blue',
  idle: 'muted',
  errored: 'red',
}

export default function AgentsDirectoryPage() {
  const { data, loading } = useLiveData<OfficeResponse>({
    url: '/api/office',
    pollIntervalMs: 15000,
  })

  // Baseline = fleet.ts (46 agents always). Live API enriches with status/task.
  const agents: OfficeAgent[] = data?.agents ?? FLEET.map((a) => ({ ...a, status: 'idle' as AgentStatus }))
  const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])

  const [query, setQuery] = useState('')
  const [deptFilter, setDeptFilter] = useState<FleetDepartment | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? agentsById[selectedId] ?? null : null

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return agents.filter((a) => {
      if (deptFilter && a.department !== deptFilter) return false
      if (!q) return true
      return (
        a.name.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        (a.role ?? '').toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q)
      )
    })
  }, [agents, query, deptFilter])

  const totals = useMemo(() => {
    let working = 0, inCouncil = 0
    for (const a of agents) {
      if (a.status === 'working') working++
      else if (a.status === 'in-council') inCouncil++
    }
    return { working, inCouncil, total: agents.length }
  }, [agents])

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Agents"
        subtitle={`${totals.total} agents across ${FLEET_DEPARTMENTS.length} departments. Click any card to open details.`}
        actions={
          <StatusBadge tone={data?.supabaseConnected ? 'green' : 'muted'}>
            {data?.supabaseConnected
              ? `${totals.working} working · ${totals.inCouncil} in council`
              : loading
              ? 'Loading fleet…'
              : 'No live sessions'}
          </StatusBadge>
        }
      />

      {/* Search + department chips */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, role, department, id…"
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-9 text-[13px] text-on-surface placeholder:text-on-surface-variant/60 focus:border-white/25 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-on-surface-variant hover:bg-white/5 hover:text-on-surface"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
          <FilterChip
            active={deptFilter === null}
            onClick={() => setDeptFilter(null)}
          >
            All ({agents.length})
          </FilterChip>
          {FLEET_DEPARTMENTS.map((dept) => {
            const count = agents.filter((a) => a.department === dept).length
            return (
              <FilterChip
                key={dept}
                active={deptFilter === dept}
                onClick={() => setDeptFilter(deptFilter === dept ? null : dept)}
              >
                {dept} ({count})
              </FilterChip>
            )
          })}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-10 text-center text-[13px] text-on-surface-variant">
          No agents match{' '}
          {query && (
            <>
              &ldquo;<span className="text-on-surface">{query}</span>&rdquo;
            </>
          )}
          {query && deptFilter && ' in '}
          {deptFilter && <span className="text-on-surface">{deptFilter}</span>}.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onClick={() => setSelectedId(agent.id)}
            />
          ))}
        </div>
      )}

      {/* Drawer — same as /office */}
      <OfficeDrawer
        agent={selected}
        agentsById={agentsById}
        onClose={() => setSelectedId(null)}
        onSelectAgent={(a) => setSelectedId(a.id)}
      />
    </div>
  )
}

// ── Filter chip ─────────────────────────────────────────────────────────────
function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-2.5 py-1 transition ${
        active
          ? 'border-white/30 bg-white/10 text-on-surface'
          : 'border-white/10 bg-white/[0.03] text-on-surface-variant hover:border-white/20'
      }`}
    >
      {children}
    </button>
  )
}

// ── Agent card ──────────────────────────────────────────────────────────────
function AgentCard({ agent, onClick }: { agent: OfficeAgent; onClick: () => void }) {
  const isActive = agent.status === 'working' || agent.status === 'in-council'
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-left transition hover:border-white/15 hover:bg-white/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
    >
      {/* Avatar */}
      <div
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-[#06121f]"
        style={{ background: agent.color }}
      >
        {agent.name.slice(0, 1).toUpperCase()}
        {isActive && (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-[#0a0a0f]"
            style={{
              background: agent.status === 'working' ? '#4ade80' : '#5ee0ff',
            }}
          />
        )}
      </div>

      {/* Text */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3 className="truncate text-[14px] font-semibold text-on-surface">{agent.name}</h3>
          <StatusBadge tone={STATUS_TONE[agent.status]}>{agent.status}</StatusBadge>
        </div>
        <p className="mt-0.5 truncate text-[12px] text-on-surface-variant">
          {agent.role || 'Role not set'}
        </p>
        <p className="mt-1 truncate text-[11px] text-on-surface-variant/70">{agent.department}</p>
        {agent.currentTask && (
          <p className="mt-1.5 line-clamp-2 text-[11px] italic text-on-surface-variant/80">
            {agent.currentTask}
          </p>
        )}
      </div>
    </button>
  )
}
