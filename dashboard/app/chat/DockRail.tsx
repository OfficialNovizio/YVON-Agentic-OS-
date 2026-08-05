// DockRail — the far-left icon dock (TS-020).
// Workforce orb + 7 department glyphs, each tinted its real fleet color.
// Live dots: an agent-active count per department from /api/agent-status —
// pulsing when > 0, hidden when none. Zero invented activity.
'use client'

import { useMemo } from 'react'
import { Landmark, Terminal, Sparkles, Shield, Package, Scale, Bot, Orbit } from 'lucide-react'
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

  const activeDot = (dept: FleetDepartment) => (activeByDept[dept] ?? 0) > 0

  return (
    <div className="chat-glass-soft flex h-full w-[52px] shrink-0 flex-col items-center gap-1 border-y-0 border-l-0 rounded-none py-3">
      {/* Workforce orb */}
      <button
        onClick={() => onFocus({ kind: 'workforce' })}
        aria-label="Workforce"
        title="Workforce"
        className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
          focus.kind === 'workforce' ? 'chat-active-ring bg-white/[0.07]' : 'hover:bg-white/[0.05]'
        }`}
      >
        <Orbit className="h-5 w-5" style={{ color: '#6366f1' }} />
      </button>

      <div className="my-1 h-px w-6 bg-white/[0.08]" />

      {FLEET_DEPARTMENTS.map((dept) => {
        const Icon = ICON[dept]
        const tint = deptTint(dept)
        const active = focus.kind === 'department' && focus.department === dept
        const live = activeDot(dept)
        return (
          <button
            key={dept}
            onClick={() => onFocus({ kind: 'department', department: dept })}
            aria-label={dept}
            title={dept}
            className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition ${
              active ? 'chat-active-ring bg-white/[0.07]' : 'hover:bg-white/[0.05]'
            }`}
          >
            <Icon className="h-5 w-5" style={{ color: tint }} />
            {live && (
              <span className="absolute right-1 top-1 flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: tint }} />
                <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: tint }} />
              </span>
            )}
          </button>
        )
      })}

      <div className="mt-auto" />

      {/* Teams slide-over toggle */}
      <button
        onClick={onOpenTeams}
        aria-label="Teams"
        title="Teams (⌘T)"
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition ${
          teamsOpen ? 'chat-active-ring bg-white/[0.07]' : 'hover:bg-white/[0.05]'
        }`}
      >
        <span className="text-[15px] font-semibold text-[var(--chat-text-dim)]">⌘T</span>
      </button>
    </div>
  )
}
