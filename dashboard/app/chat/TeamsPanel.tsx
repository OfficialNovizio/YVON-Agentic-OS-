// TeamsPanel — the roster, ALWAYS visible on desktop (TS-021).
//
// Focus-reactive: clicking a department in the dock shows THAT department's
// agents here; clicking Workforce shows everything. Search filters the
// visible set. Real data only: FLEET, /api/fleet/skills, /api/agent-status.
//
// Restyled 2026-08-17 (Adora): a floating white card with a 28px radius
// instead of an inset dark rail. The search field is a stadium pill; agent
// rows recess into soft concrete on hover; live dots read against paper.
'use client'

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { Search, X, ChevronLeft, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { FLEET, FLEET_DEPARTMENTS, type FleetAgent } from '@/lib/fleet'
import { deptTint } from '@/lib/chat-theme'
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
  /** TS-030: the PAGE owns collapsed state so it can shrink the container and
   * let the chat expand to fill the freed space (no blank gap). */
  collapsed?: boolean
  onToggleCollapsed?: (next: boolean) => void
}

const TOTAL_AGENTS = FLEET.length
const TOTAL_DEPTS = FLEET_DEPARTMENTS.length

export function TeamsPanel({ focus, onFocus, onClose, variant = 'sidebar', visible = true, live, collapsed = false, onToggleCollapsed }: TeamsPanelProps) {
  // TS-030: collapsed is owned by the page (so it can shrink the container).
  // Local persistence kept here for the initial state + to notify the page.
  const [localCollapsed, setLocalCollapsed] = useState(false)

  // Workforce grid — pops the fleet avatars in when the overview comes back
  // into view (fresh mount, or returning from a department/search filter).
  // Re-renders from the live-status poll don't replay it.
  const workforceGridRef = useRef<HTMLDivElement | null>(null)
  const workforceAnimatedFor = useRef<string>('')
  useEffect(() => {
    try {
      if (localStorage.getItem('teams-panel-collapsed') === '1') {
        setLocalCollapsed(true)
        onToggleCollapsed?.(true)
      }
    } catch {
      // localStorage unavailable — defaults stand
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const isCollapsed = collapsed || localCollapsed
  const setCollapsed = (v: boolean) => {
    setLocalCollapsed(v)
    onToggleCollapsed?.(v)
    try {
      localStorage.setItem('teams-panel-collapsed', v ? '1' : '0')
    } catch {}
  }

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
  const scopeTint = scopeDept ? deptTint(scopeDept as never) : '#592eff'

  const visibleAgents = useMemo(() => {
    const base = scopeDept ? FLEET.filter((a) => a.department === scopeDept) : FLEET
    const q = query.trim().toLowerCase()
    if (!q) return base
    return base.filter(
      (a) => a.id.includes(q) || a.name.toLowerCase().includes(q) || a.role.toLowerCase().includes(q),
    )
  }, [scopeDept, query])

  const liveCount = useMemo(
    () => visibleAgents.filter((a) => live[a.id] === 'active').length,
    [visibleAgents, live],
  )

  useLayoutEffect(() => {
    if (scopeDept || query) return // overview grid isn't mounted in these branches
    const el = workforceGridRef.current
    if (!el || el.children.length === 0) return
    const tag = `overview:${FLEET.length}`
    if (workforceAnimatedFor.current === tag) return
    workforceAnimatedFor.current = tag
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      gsap.set(el.children, { opacity: 1, scale: 1 })
      return
    }
    gsap.fromTo(
      el.children,
      { opacity: 0, scale: 0.6 },
      { opacity: 1, scale: 1, duration: 0.36, ease: 'back.out(1.7)', stagger: { each: 0.012, from: 'start' } },
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
      ? 'flex h-full w-full flex-col overflow-hidden rounded-[28px] border border-[var(--chat-hairline)] bg-white'
      : `absolute inset-0 z-40 flex flex-col overflow-hidden rounded-[28px] border border-[var(--chat-hairline)] bg-white shadow-[0_28px_70px_-40px_rgba(33,22,76,0.8)] transition-opacity ${
          visible ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`

  // Collapsed → a thin white rail; the expand button sits at the TOP, aligned
  // with where the hide button was (TS-030).
  if (isCollapsed && variant === 'sidebar') {
    return (
      <div className="flex h-full w-full flex-col items-center rounded-[200px] border border-[var(--chat-hairline)] bg-white py-3">
        <button
          onClick={() => setCollapsed(false)}
          title="Expand teams"
          aria-label="Expand teams"
          className="chat-ghost-btn h-9 w-9"
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    )
  }

  return (
    <div className={wrapperClass}>
      {/* Header */}
      <div className="border-b border-[var(--chat-hairline-soft)] px-4 pb-3 pt-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            {scopeDept && (
              <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: scopeTint }} />
            )}
            <div className="min-w-0">
              <div className="adora-display truncate text-[15px]">{headerTitle}</div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[var(--chat-text-dim)]">
                <span className="truncate">{headerSub}</span>
                {liveCount > 0 && (
                  <span className="inline-flex shrink-0 items-center gap-1" style={{ color: '#587000' }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: '#a2ea13' }} />
                    {liveCount}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            {scopeDept && (
              <button
                onClick={() => onFocus({ kind: 'workforce' })}
                aria-label="Show all teams"
                title="Show all (Workforce)"
                className="chat-ghost-btn h-7 w-7"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            )}
            {variant === 'sidebar' ? (
              <button
                onClick={() => setCollapsed(true)}
                aria-label="Collapse teams"
                title="Collapse to rail"
                className="chat-ghost-btn h-7 w-7"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
            ) : (
              <button onClick={onClose} aria-label="Close teams" className="chat-ghost-btn h-7 w-7">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-[200px] border border-[var(--chat-hairline)] bg-[var(--chat-surface-strong)] px-3 py-2 transition focus-within:border-[rgba(89,46,255,0.4)] focus-within:bg-white">
          <Search className="h-3.5 w-3.5 shrink-0 text-[var(--chat-text-faint)]" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search ${scopeDept ?? 'all'} agents…`}
            className="w-full bg-transparent text-[12.5px] text-[var(--chat-text)] placeholder:text-[var(--chat-text-faint)] focus:outline-none"
          />
          {query && (
            <button onClick={() => setQuery('')} aria-label="Clear search" className="chat-ghost-btn h-5 w-5">
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Scroll body */}
      <div className="chat-scroll flex-1 overflow-y-auto px-2.5 py-3">
        {query ? (
          <div className="space-y-0.5">
            {visibleAgents.map((a) => (
              <AgentRow key={a.id} agent={a} skills={skills[a.id] ?? []} showSkills={hasSkills} live={live[a.id]} onClick={() => goToAgent(a.id)} active={focus.kind === 'agent' && focus.agentId === a.id} />
            ))}
            {visibleAgents.length === 0 && (
              <div className="px-3 py-8 text-center text-[12.5px] text-[var(--chat-text-faint)]">
                No agents match “{query}”
              </div>
            )}
          </div>
        ) : scopeDept ? (
          <div className="space-y-0.5">
            {visibleAgents.map((a) => (
              <AgentRow key={a.id} agent={a} skills={skills[a.id] ?? []} showSkills={hasSkills} live={live[a.id]} onClick={() => goToAgent(a.id)} active={focus.kind === 'agent' && focus.agentId === a.id} />
            ))}
          </div>
        ) : (
          <div className="space-y-5">
            {/* Workforce grid — the whole fleet at a glance */}
            <section>
              <SectionLabel text="Workforce" tint="#592eff" count={FLEET.length} />
              <div ref={workforceGridRef} className="mt-2.5 grid grid-cols-6 gap-1">
                {FLEET.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => goToAgent(a.id)}
                    title={`${a.name} · ${a.role}`}
                    className="group relative flex items-center justify-center rounded-[12px] p-1 transition hover:bg-[var(--chat-surface-strong)]"
                  >
                    <AgentAvatar id={a.id} name={a.name} size={32} />
                    {live[a.id] === 'active' && (
                      <span
                        className="absolute bottom-1 right-1 h-2 w-2 rounded-full ring-2 ring-white"
                        style={{ background: '#a2ea13' }}
                      />
                    )}
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
                    className="group flex w-full items-center gap-2 rounded-[10px] px-1.5 py-1 transition hover:bg-[var(--chat-surface-strong)]"
                    onClick={() => onFocus({ kind: 'department', department: dept })}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: deptTint(dept as never) }} />
                    <span className="truncate text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-dim)] group-hover:text-[var(--chat-text)]">
                      {dept}
                    </span>
                    <span className="chat-mono ml-auto shrink-0 text-[var(--chat-text-faint)]">{agents.length}</span>
                  </button>
                  <div className="mt-1 space-y-0.5">
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
    <div className="flex items-center gap-2 px-1.5">
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: tint }} />
      <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--chat-text-dim)]">{text}</span>
      {count != null && <span className="chat-mono ml-auto text-[var(--chat-text-faint)]">{count}</span>}
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
      className={`flex w-full items-center gap-2.5 rounded-[14px] px-2 py-1.5 text-left transition ${
        active
          ? 'bg-[rgba(89,46,255,0.07)]'
          : 'hover:bg-[var(--chat-surface-strong)]'
      }`}
    >
      <span className="relative shrink-0">
        <AgentAvatar id={agent.id} name={agent.name} size={34} />
        {live && (
          <span
            className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white"
            style={{ background: live === 'active' ? '#a2ea13' : '#d4d4cd' }}
          />
        )}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-1.5">
          <span
            className={`truncate text-[12.5px] font-semibold ${active ? 'text-[var(--chat-accent)]' : 'text-[var(--chat-text)]'}`}
          >
            {agent.name}
          </span>
          <span className="chat-mono shrink-0 text-[var(--chat-text-faint)]">@{agent.id}</span>
        </span>
        {agent.role && (
          <span className="block truncate text-[11px] text-[var(--chat-text-dim)]">{agent.role}</span>
        )}
        {showSkills && skills.length > 0 && (
          <span className="mt-1 flex flex-wrap gap-1">
            {skills.slice(0, 3).map((s) => (
              <span
                key={s}
                className="rounded-[200px] border border-[var(--chat-hairline)] px-1.5 py-px font-mono text-[9px] text-[var(--chat-text-faint)]"
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
