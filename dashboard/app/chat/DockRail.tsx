// DockRail — the far-left icon dock, rebuilt as a floating white pill (Adora).
//
// Workforce orb + one glyph per department, each tinted its real fleet color.
// Live dots come from the shared /api/agent-status poll — pulsing when a
// department actually has an active agent, absent otherwise. Zero invented
// activity, same as before; only the shape changed.
//
// Adora notes: the rail never becomes a full-bleed bar — it's a white pill
// with a hairline border and a 200px radius, floating on the paper canvas.
// The active item is the one filled violet surface in the column.
'use client'

import { useMemo } from 'react'
import { Landmark, Terminal, Sparkles, Shield, Package, Scale, Bot, Orbit, HeartHandshake, Megaphone, Globe2, TrendingUp, Users, ShieldAlert, PanelRight, ClipboardList, History } from 'lucide-react'
import { FLEET, FLEET_DEPARTMENTS, type FleetDepartment } from '@/lib/fleet'
import { deptTint } from '@/lib/chat-theme'
import type { ChatRoom } from '@/app/api/chat/rooms/route'
import type { Focus } from './page'

const ICON: Record<FleetDepartment, typeof Terminal> = {
  'Executive Office': Landmark,
  Engineering: Terminal,
  'Brand Studio': Sparkles,
  Cybersecurity: Shield,
  Product: Package,
  Governance: Scale,
  'AI & Agents': Bot,
  // 2026-08-15 — 6 new departments, icons matched to lib/chat-theme.ts's deptIcon().
  'Client Success': HeartHandshake,
  'Comms & PR': Megaphone,
  'Global Expansion': Globe2,
  'Growth & Partnerships': TrendingUp,
  'People & Culture': Users,
  'Risk & ESG': ShieldAlert,
}

interface DockRailProps {
  rooms: ChatRoom[]
  focus: Focus
  onFocus: (next: Focus) => void
  onOpenTeams: () => void
  teamsOpen: boolean
  /** live agent status — owned by the page (single poll), TS-023 review */
  agentLive: Record<string, string>
}

export function DockRail({ rooms, focus, onFocus, onOpenTeams, teamsOpen, agentLive }: DockRailProps) {
  // Active counts per department, derived from the shared live map (no extra
  // network calls — was a duplicated 20s poll here).
  const activeByDept = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const a of FLEET) {
      if (agentLive[a.id] === 'active') counts[a.department] = (counts[a.department] ?? 0) + 1
    }
    return counts
  }, [agentLive])

  const liveTotal = useMemo(
    () => Object.values(activeByDept).reduce((n, c) => n + c, 0),
    [activeByDept],
  )

  return (
    <div className="relative z-10 flex shrink-0 py-3 pl-3">
      <nav
        aria-label="Departments"
        className="chat-scroll flex w-[62px] flex-col items-center gap-1 overflow-y-auto rounded-[200px] border border-[var(--chat-hairline)] bg-white py-3"
      >
        {/* Workforce */}
        <DockButton
          label="Workforce"
          tint="#592eff"
          active={focus.kind === 'workforce'}
          live={liveTotal > 0}
          liveCount={liveTotal}
          onClick={() => onFocus({ kind: 'workforce' })}
        >
          <Orbit className="h-[19px] w-[19px]" strokeWidth={1.5} />
        </DockButton>

        {/* Tasks — the task section living inside chat (2026-08-18) */}
        <DockButton
          label="Tasks"
          tint="#592eff"
          active={focus.kind === 'tasks'}
          onClick={() => onFocus({ kind: 'tasks' })}
        >
          <ClipboardList className="h-[19px] w-[19px]" strokeWidth={1.5} />
        </DockButton>

        {/* History — previous chats (2026-08-21). Sits directly under Tasks
            by request; opens HistoryPanel in the same sidebar slot. Note the
            `focus.kind === 'room'` case: reopening a past chat from History
            switches focus to that room, and the icon should stay lit so the
            list you navigated from is still on screen and still highlighted. */}
        <DockButton
          label="History"
          tint="#592eff"
          active={focus.kind === 'history' || focus.kind === 'room'}
          onClick={() => onFocus({ kind: 'history' })}
        >
          <History className="h-[19px] w-[19px]" strokeWidth={1.5} />
        </DockButton>

        <span className="my-1.5 h-px w-6 bg-[var(--chat-hairline)]" />

        {FLEET_DEPARTMENTS.map((dept) => {
          const Icon = ICON[dept]
          const tint = deptTint(dept)
          const count = activeByDept[dept] ?? 0
          return (
            <DockButton
              key={dept}
              label={dept}
              tint={tint}
              active={focus.kind === 'department' && focus.department === dept}
              live={count > 0}
              liveCount={count}
              onClick={() => onFocus({ kind: 'department', department: dept })}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={1.5} />
            </DockButton>
          )
        })}

        <span className="my-1.5 h-px w-6 bg-[var(--chat-hairline)]" />

        {/* Teams slide-over toggle (mobile) */}
        <DockButton
          label="Teams · ⌘T"
          tint="#5f5f69"
          active={teamsOpen}
          onClick={onOpenTeams}
        >
          <PanelRight className="h-[19px] w-[19px]" strokeWidth={1.5} />
        </DockButton>
      </nav>
    </div>
  )
}

function DockButton({
  label,
  tint,
  active,
  live,
  liveCount,
  onClick,
  children,
}: {
  label: string
  tint: string
  active: boolean
  live?: boolean
  liveCount?: number
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={live && liveCount ? `${label} · ${liveCount} live` : label}
      aria-current={active ? 'true' : undefined}
      className="group relative flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] transition-all duration-200"
      style={{
        background: active ? tint : 'transparent',
        color: active ? '#ffffff' : '#353241',
        boxShadow: active ? `0 8px 20px -10px ${tint}` : 'none',
      }}
    >
      <span
        className="pointer-events-none absolute inset-0 rounded-[14px] transition-colors duration-200 group-hover:bg-[var(--chat-surface-strong)]"
        style={{ background: active ? 'transparent' : undefined }}
        aria-hidden
      />
      <span className="relative">{children}</span>

      {live && !active && (
        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
          <span
            className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70"
            style={{ background: tint }}
          />
          <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: tint }} />
        </span>
      )}

      {/* Gallery label — a floating white pill, not a tooltip box. */}
      <span className="pointer-events-none absolute left-full z-40 ml-2 hidden whitespace-nowrap rounded-[200px] border border-[var(--chat-hairline)] bg-white px-3 py-1 text-[11.5px] font-medium text-[var(--chat-text)] opacity-0 shadow-[0_12px_28px_-20px_rgba(33,22,76,0.7)] transition-opacity duration-150 group-hover:opacity-100 md:block">
        {label}
      </span>
    </button>
  )
}
