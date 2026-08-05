// TeamsPanel — the teams panel, ALWAYS visible on desktop (TS-021).
// Focus-reactive: clicking a department in the dock shows THAT department's
// agents here; clicking Workforce shows everything. Search filters the
// visible set. Real data only: FLEET, /api/fleet/skills, /api/agent-status.
'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, X, ChevronLeft } from 'lucide-react'
import { FLEET, FLEET_DEPARTMENTS, type FleetAgent } from '@/lib/fleet'
import { deptTint } from '@/lib/chat-theme'
import { agentColor } from '@/lib/avatar'
import { AgentAvatar } from './AgentAvatar'
import type { Focus } from './page'

interface TeamsPanelProps {
  focus: Focus
  onFocus: (next: Focus) => void
  onClose: () => void
  /** 'sidebar' = permanent secondary sidebar (desktop, in-flow) · 'overlay' = mobile drawer */
  variant?: 'sidebar' | 'overlay'
  visible?: boolean
  /** live agent status — owned by the page (single poll), TS-023 review */
  live: Record<string, 'active' | 'idle' | 'offline'>
}

const TOTAL_AGENTS = FLEET.length
const TOTAL_DEPTS = FLEET_DEPARTMENTS.length

export function TeamsPanel({ focus, onFocus, onClose, variant = 'sidebar', visible = true, live }: TeamsPanelProps) {
  const [query, setQuery] = useState('')
  const [skills, setSkills] = useState<Record<string, string[]>>({})
  const [hasSkills, setHasSkills] = useState(false)

  // Reset search when the scope changes (department switch / workforce).
  useEffect(() => setQuery(''), [focus.kind, focus.kind === 'department' ? focus.department : ''])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/fleet/skills')
        if (!res.ok) return
        const data = (await res.json()) as { skills: Record<string, string[]>; hasTeams: boolean }
        if (cancelled) return
        setSkills(data.skills)
        setHasSkills(data.hasTeams)
      } catch {
        // no chips — never invent
      }
    })()
    return () => { cancelled = true }
  }, [])

  // ── Scope: department → that dept only; workforce/agent → everything ──
  const scopeDept = focus.kind === 'department' ? focus.department : null
  const scopeTint = scopeDept ? deptTint(scopeDept as never) : '#6366f1'

  const visibleAgents = useMemo(() => {
    const base = scopeDept ? FLEET.filter((a) => a.department === scopeDept) : FLEET
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter(
      (a) => a.id.includes(q) || a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
    )
  }, [scopeDept, query])

  const goToAgent = (agentId: string) => {
    onFocus({ kind: 'agent', department: FLEET.find((a) => a.id === agentId)?.department ?? '', agentId })
  }

  const headerTitle = scopeDept ?? 'Teams'
  const headerSub = scopeDept
    ? `${visibleAgents.length} agents`
    : `${TOTAL_AGENTS} agents · ${TOTAL_DEPTS} departments`

  const wrapperClass =
    variant === 'sidebar'
      ? 'flex h-full w-full flex-col overflow-hidden border-r border-[var(--chat-hairline-soft)] bg-white/[0.015]'
      : `chat-glass absolute left-14 top-3 bottom-3 z-40 flex w-[320px] flex-col overflow-hidden transition-opacity ${
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="border-b border-[var(--chat-hairline-soft)] px-4 pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {scopeDept ? (
              <>
                <span className="h-2 w-2 rounded-full" style={{ background: scopeTint }} />
                <div>
                  <div className="text-[13px] font-semibold text-[var(--chat-text)]">{headerTitle}</div>
                  <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--chat-text-faint)]">
                    {headerSub}
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className="text-[13px] font-semibold text-[var(--chat-text)]">{headerTitle}</div>
                <div className="mt-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--chat-text-faint)]">
                  {headerSub}
                </div>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            {scopeDept && (
              <button
                onClick={() => onFocus({ kind: 'workforce' })}
                aria-label="Show all teams"
                title="Show all (Workforce)"
                className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--chat-text-dim)] hover:bg-white/[0.06] hover:text-[var(--chat-text)]"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close teams"
              className="flex h-7 w-7 items-center justify-center rounded-md text-[var(--chat-text-dim)] hover:bg-white/[0.06] hover:text-[var(--chat-text)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
        <div className="mt-2.5 flex items-center gap-2 rounded-lg border border-[var(--chat-hairline-soft)] bg-white/[0.03] px-2.5 py-1.5">
          <Search className="h-3.5 w-3.5 text-[var(--chat-text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${scopeDept ?? 'all'} agents…`}
            className="w-full bg-transparent text-[12px] text-[var(--chat-text)] placeholder:text-[var(--chat-text-faint)] focus:outline-none"
          />
        </div>
      </div>

      {/* Scroll body */}
      <div className="chat-scroll flex-1 overflow-y-auto px-3 py-3">
        {query ? (
          <div className="space-y-1">
            {visibleAgents.map((a) => (
              <AgentRow key={a.id} agent={a} skills={skills[a.id] ?? []} showSkills={hasSkills} live={live[a.id]} onClick={() => goToAgent(a.id)} active={focus.kind === 'agent' && focus.agentId === a.id} />
            ))}
            {visibleAgents.length === 0 && (
              <div className="px-2 py-6 text-center text-[12px] text-[var(--chat-text-faint)]">
                No agents match “{query}”
              </div>
            )}
          </div>
        ) : scopeDept ? (
          <div className="space-y-1">
            {visibleAgents.map((a) => (
              <AgentRow key={a.id} agent={a} skills={skills[a.id] ?? []} showSkills={hasSkills} live={live[a.id]} onClick={() => goToAgent(a.id)} active={focus.kind === 'agent' && focus.agentId === a.id} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Workforce grid */}
            <section>
              <SectionLabel text="Workforce" tint="#6366f1" />
              <div className="mt-2 grid grid-cols-5 gap-1.5">
                {FLEET.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => goToAgent(a.id)}
                    title={a.name}
                    className="flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 hover:bg-white/[0.05]"
                  >
                    <AgentAvatar id={a.id} name={a.name} size={30} />
                    <span className="max-w-full truncate text-[9px] text-[var(--chat-text-dim)]">{a.name}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Per-department sections */}
            {FLEET_DEPARTMENTS.map((dept) => {
              const agents = FLEET.filter((a) => a.department === dept)
              return (
                <section key={dept}>
                  <button
                    className="flex w-full items-center gap-2 px-1"
                    onClick={() => onFocus({ kind: 'department', department: dept })}
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: deptTint(dept as never) }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">{dept}</span>
                    <span className="font-mono text-[9px] text-[var(--chat-text-faint)]">{agents.length}</span>
                  </button>
                  <div className="mt-1.5 space-y-0.5">
                    {agents.map((a) => (
                      <AgentRow key={a.id} agent={a} skills={skills[a.id] ?? []} showSkills={hasSkills} live={live[a.id]} onClick={() => goToAgent(a.id)} active={focus.kind === 'agent' && focus.agentId === a.id} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function SectionLabel({ text, tint, count }: { text: string; tint: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">{text}</span>
      {count != null && <span className="font-mono text-[9px] text-[var(--chat-text-faint)]">{count}</span>}
    </div>
  )
}

function AgentRow({
  agent,
  skills,
  showSkills,
  live,
  onClick,
  active,
}: {
  agent: FleetAgent
  skills: string[]
  showSkills: boolean
  live?: 'active' | 'idle' | 'offline'
  onClick: () => void
  active: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition ${
        active ? 'bg-white/[0.07]' : 'hover:bg-white/[0.04]'
      }`}
    >
      <span className="relative">
        <AgentAvatar id={agent.id} name={agent.name} size={32} />
        {live && (
          <span
            className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0a0a0f] ${
              live === 'active' ? 'animate-pulse bg-emerald-400' : 'bg-white/30'
            }`}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span className="text-[12px] font-semibold text-[var(--chat-text)]">{agent.name}</span>
          <span className="font-mono text-[9px] text-[var(--chat-text-faint)]">@{agent.id}</span>
        </span>
        {agent.role && (
          <span className="block truncate text-[10.5px] text-[var(--chat-text-dim)]">{agent.role}</span>
        )}
        {showSkills && skills.length > 0 && (
          <span className="mt-0.5 flex flex-wrap gap-1">
            {skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-full border border-[var(--chat-hairline-soft)] bg-white/[0.03] px-1.5 py-px font-mono text-[8.5px] text-[var(--chat-text-faint)]"
              >
                {s}
              </span>
            ))}
          </span>
        )}
      </span>
    </button>
  )
}
