// /office — YVON OS isometric office floor plan.
// 7 real departments as rooms (from Teams/), all 46 real agents from lib/fleet.ts.
// Live status + co-agent halos from /api/office. Click any agent → info drawer.
//
// Owner: mia · TS-010 WI-1, WI-3, WI-5
'use client'

import {
  useRef,
  useState,
  useMemo,
  useEffect,
  type PointerEvent as RPointerEvent,
} from 'react'
import { PageHeader, StatusBadge } from '@/components/ui'
import { RotateCcw, Users, Activity } from 'lucide-react'
import { useLiveData } from '@/lib/use-live-data'
import { FLEET, FLEET_DEPARTMENTS } from '@/lib/fleet'
import type { FleetDepartment } from '@/lib/fleet'
import { OfficeDrawer } from './OfficeDrawer'
import type { OfficeResponse, OfficeAgent, AgentStatus } from '@/app/api/office/route'

// ── Isometric projection ────────────────────────────────────────────────────
const TW = 34      // tile width
const TH = 17      // tile height
const OX = 700     // origin x (centered in viewBox)
const OY = 120     // origin y
const PLAT = 18    // room platform height
const VW = 1400    // viewBox width
const VH = 900     // viewBox height
const CX = VW / 2  // zoom pivot x (center of viewBox)
const CY = VH / 2  // zoom pivot y

type P = { x: number; y: number }
const pt = (gx: number, gy: number, gz = 0): P => ({
  x: OX + (gx - gy) * TW,
  y: OY + (gx + gy) * TH - gz,
})
const poly = (pts: P[]) => pts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')

// ── Department layout — grid coordinates in the isometric plane ─────────────
// Rooms are sized by headcount. All 7 real departments visible.
interface RoomLayout {
  department: FleetDepartment
  x0: number; y0: number; x1: number; y1: number
  cols: number    // agent grid columns inside the room
  accent: string
}

const ROOMS: RoomLayout[] = [
  // Top row
  { department: 'Executive Office', x0: 0,   y0: 0,   x1: 3,   y1: 2.5, cols: 3, accent: '#F59E0B' },
  { department: 'Governance',       x0: 3.4, y0: 0,   x1: 6.4, y1: 2.5, cols: 3, accent: '#8B5CF6' },
  { department: 'AI & Agents',      x0: 6.8, y0: 0,   x1: 11,  y1: 2.5, cols: 4, accent: '#06B6D4' },
  // Middle row (the two biggest)
  { department: 'Engineering',      x0: 0,   y0: 2.9, x1: 5,   y1: 6.5, cols: 4, accent: '#3B82F6' },
  { department: 'Brand Studio',     x0: 5.4, y0: 2.9, x1: 11,  y1: 6.5, cols: 4, accent: '#EC4899' },
  // Bottom row
  { department: 'Cybersecurity',    x0: 0,   y0: 6.9, x1: 4,   y1: 9,   cols: 3, accent: '#EF4444' },
  { department: 'Product',          x0: 4.4, y0: 6.9, x1: 8.5, y1: 9,   cols: 3, accent: '#10B981' },
]

// ── Compute per-agent isometric grid coordinates inside its room ────────────
// Fixed positions so agents don't jitter between refreshes.
type Placement = { gx: number; gy: number; room: RoomLayout }
const PLACEMENTS = new Map<string, Placement>()
for (const room of ROOMS) {
  const members = FLEET.filter((a) => a.department === room.department)
  const padX = 0.4
  const padY = 0.5  // extra top pad for label
  const availW = room.x1 - room.x0 - padX * 2
  const availH = room.y1 - room.y0 - padY - padX
  const cols = room.cols
  const rows = Math.ceil(members.length / cols)
  const cellW = availW / cols
  const cellH = rows > 1 ? availH / rows : availH
  members.forEach((agent, i) => {
    const col = i % cols
    const row = Math.floor(i / cols)
    PLACEMENTS.set(agent.id, {
      gx: room.x0 + padX + cellW * (col + 0.5),
      gy: room.y0 + padY + cellH * (row + 0.5),
      room,
    })
  })
}

// ── Status colors ───────────────────────────────────────────────────────────
const STATUS_COLOR: Record<AgentStatus, string> = {
  working: '#4ade80',
  'in-council': '#5ee0ff',
  idle: '#6b7280',
  errored: '#f87171',
}

// ── Room shell (floor + platform + label) ───────────────────────────────────
function RoomShell({ room, active, dim }: { room: RoomLayout; active: number; dim: boolean }) {
  const i = 0.12
  const A = pt(room.x0 + i, room.y0 + i, PLAT)
  const B = pt(room.x1 - i, room.y0 + i, PLAT)
  const C = pt(room.x1 - i, room.y1 - i, PLAT)
  const D = pt(room.x0 + i, room.y1 - i, PLAT)
  const C0 = pt(room.x1 - i, room.y1 - i, 0)
  const B0 = pt(room.x1 - i, room.y0 + i, 0)
  const D0 = pt(room.x0 + i, room.y1 - i, 0)
  const label = pt(room.x0 + i + 0.3, room.y0 + i + 0.3, PLAT)
  const total = FLEET.filter((a) => a.department === room.department).length
  return (
    <g style={{ opacity: dim ? 0.35 : 1, transition: 'opacity 200ms ease' }}>
      {/* Side walls (3D depth) */}
      <polygon points={poly([B, C, C0, B0])} fill="#0c0c0f" opacity={0.85} />
      <polygon points={poly([D, C, C0, D0])} fill="#161620" opacity={0.9} />
      {/* Floor */}
      <polygon
        points={poly([A, B, C, D])}
        fill={room.accent}
        fillOpacity={0.1}
        stroke={room.accent}
        strokeOpacity={0.55}
        strokeWidth={1}
      />
      {/* Room label + counter */}
      <text
        x={label.x}
        y={label.y}
        fontSize={11}
        letterSpacing={1.2}
        fill={room.accent}
        fillOpacity={0.85}
        fontWeight={700}
      >
        {room.department.toUpperCase()}
      </text>
      <text
        x={label.x}
        y={label.y + 13}
        fontSize={9}
        fill={room.accent}
        fillOpacity={0.55}
        fontFamily="ui-monospace, monospace"
      >
        {active}/{total} active
      </text>
    </g>
  )
}

// ── Agent avatar on floor ───────────────────────────────────────────────────
function AgentAvatar({
  agent,
  placement,
  isSelected,
  onClick,
}: {
  agent: OfficeAgent
  placement: Placement
  isSelected: boolean
  onClick: (e: React.MouseEvent) => void
}) {
  const base = pt(placement.gx, placement.gy, PLAT + 2)
  const ringColor = STATUS_COLOR[agent.status]
  const isActive = agent.status === 'working' || agent.status === 'in-council'
  const initial = agent.name.slice(0, 1).toUpperCase()
  // Subtle bob only for active agents so idle floor stays quiet — not messy.
  const bobClass = isActive ? 'office-bob' : ''

  return (
    <g onClick={onClick} className="office-agent" style={{ cursor: 'pointer' }}>
      {/* Shadow (does NOT bob — stays anchored) */}
      <ellipse cx={base.x} cy={base.y + 8} rx={11} ry={4} fill="#000" fillOpacity={0.35} />
      {/* Bobbing body group */}
      <g className={bobClass} style={{ transformBox: 'fill-box', transformOrigin: 'center' }}>
        {/* Status ring */}
        <circle
          cx={base.x}
          cy={base.y}
          r={13}
          fill="none"
          stroke={ringColor}
          strokeWidth={isActive ? 2 : 1.5}
          opacity={isActive ? 0.95 : 0.5}
        />
        {/* Avatar body */}
        <circle
          cx={base.x}
          cy={base.y}
          r={10}
          fill={agent.color}
          stroke={isSelected ? '#fff' : 'transparent'}
          strokeWidth={isSelected ? 2 : 0}
        />
        {/* Initial */}
        <text
          x={base.x}
          y={base.y + 3.5}
          textAnchor="middle"
          fontSize={10}
          fontWeight={800}
          fill="#06121f"
          pointerEvents="none"
        >
          {initial}
        </text>
      </g>
      {/* Name label (doesn't bob) */}
      <text
        x={base.x}
        y={base.y + 24}
        textAnchor="middle"
        fontSize={8}
        fill="#e5e7eb"
        fillOpacity={0.75}
        pointerEvents="none"
      >
        {agent.name}
      </text>
      {/* Hover hit-box */}
      <circle cx={base.x} cy={base.y} r={22} fill="transparent" />
    </g>
  )
}

// ── Team halo: dashed link connecting co-agents in same session ─────────────
function TeamHalo({ agents }: { agents: OfficeAgent[] }) {
  if (agents.length < 2) return null
  const centers = agents.map((a) => {
    const p = PLACEMENTS.get(a.id)
    return p ? pt(p.gx, p.gy, PLAT + 2) : null
  }).filter(Boolean) as P[]
  if (centers.length < 2) return null

  // Halo color = accent of the first agent's workspace (or a neutral)
  const halo = '#a78bfa'

  return (
    <g pointerEvents="none">
      {centers.map((c, i) => {
        const next = centers[(i + 1) % centers.length]
        return (
          <line
            key={i}
            x1={c.x}
            y1={c.y}
            x2={next.x}
            y2={next.y}
            stroke={halo}
            strokeWidth={1.5}
            strokeDasharray="4 4"
            strokeOpacity={0.6}
          />
        )
      })}
      {centers.map((c, i) => (
        <circle
          key={`h${i}`}
          cx={c.x}
          cy={c.y}
          r={18}
          fill="none"
          stroke={halo}
          strokeWidth={1}
          strokeDasharray="2 3"
          strokeOpacity={0.35}
        />
      ))}
    </g>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────
export default function OfficePage() {
  const { data, loading } = useLiveData<OfficeResponse>({
    url: '/api/office',
    pollIntervalMs: 15000,
  })

  const agents: OfficeAgent[] = data?.agents ?? FLEET.map((a) => ({ ...a, status: 'idle' as AgentStatus }))
  const agentsById = useMemo(() => Object.fromEntries(agents.map((a) => [a.id, a])), [agents])

  // Selected agent (drawer)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? agentsById[selectedId] ?? null : null

  // Dept filter (click room to focus)
  const [focusDept, setFocusDept] = useState<FleetDepartment | null>(null)

  // Team-halo clusters: agents sharing a sessionId
  const teams = useMemo(() => {
    const bySession = new Map<string, OfficeAgent[]>()
    for (const a of agents) {
      if (!a.sessionId || !a.coAgents || a.coAgents.length === 0) continue
      const list = bySession.get(a.sessionId) ?? []
      list.push(a)
      bySession.set(a.sessionId, list)
    }
    return Array.from(bySession.values()).filter((list) => list.length >= 2)
  }, [agents])

  // Roll-up counts
  const totals = useMemo(() => {
    let working = 0, inCouncil = 0, idle = 0, errored = 0
    for (const a of agents) {
      if (a.status === 'working') working++
      else if (a.status === 'in-council') inCouncil++
      else if (a.status === 'errored') errored++
      else idle++
    }
    return { working, inCouncil, idle, errored }
  }, [agents])

  // ── Pan + zoom ──────────────────────────────────────────────────────────
  const [scale, setScale] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; px: number; py: number; moved: boolean } | null>(null)
  const [grabbing, setGrabbing] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const onDown = (e: RPointerEvent) => {
    drag.current = { x: pan.x, y: pan.y, px: e.clientX, py: e.clientY, moved: false }
    setGrabbing(true)
  }
  const onMove = (e: RPointerEvent) => {
    if (!drag.current) return
    const dx = e.clientX - drag.current.px
    const dy = e.clientY - drag.current.py
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.current.moved = true
    setPan({ x: drag.current.x + dx, y: drag.current.y + dy })
  }
  const onUp = () => {
    drag.current = null
    setGrabbing(false)
  }
  const reset = () => {
    setScale(1)
    setPan({ x: 0, y: 0 })
    setFocusDept(null)
  }

  // Wheel zoom — attach as native non-passive listener so we can preventDefault
  // (avoids the page scrolling while the user is zooming the canvas).
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      const factor = Math.exp(-e.deltaY * 0.0015)
      setScale((s) => Math.min(2.5, Math.max(0.5, s * factor)))
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [])

  // Focus a department: pan/zoom so its room fills the view.
  useEffect(() => {
    if (!focusDept) {
      setScale(1)
      setPan({ x: 0, y: 0 })
      return
    }
    const room = ROOMS.find((r) => r.department === focusDept)
    if (!room) return
    // Room center in isometric screen coords
    const c = pt((room.x0 + room.x1) / 2, (room.y0 + room.y1) / 2, PLAT / 2)
    const target = 1.55
    // With transform: translate(pan) translate(CX,CY) scale(s) translate(-CX,-CY),
    // a point (cx, cy) lands at (pan.x + CX + (cx - CX)*s). Solve for pan so it hits (CX, CY):
    //   pan.x = (CX - cx) * s
    setScale(target)
    setPan({ x: (CX - c.x) * target, y: (CY - c.y) * target })
  }, [focusDept])

  return (
    <div className="p-6 md:p-8">
      <PageHeader
        title="Office"
        subtitle="Live floor plan of the fleet — 46 agents across 7 departments. Click any agent for details."
        actions={
          <div className="flex items-center gap-2">
            <StatusBadge tone={data?.supabaseConnected ? 'green' : 'muted'}>
              {data?.supabaseConnected ? 'Live' : loading ? 'Loading' : 'No live data'}
            </StatusBadge>
            <button
              onClick={reset}
              className="inline-flex items-center gap-1.5 rounded-md border border-white/10 px-2.5 py-1.5 text-[12px] text-on-surface-variant transition hover:border-white/20 hover:text-on-surface"
              title="Reset pan + zoom"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Reset view
            </button>
          </div>
        }
      />

      {/* Roll-up chips */}
      <div className="mb-4 flex flex-wrap items-center gap-2 text-[12px]">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-emerald-300">
          <Activity className="h-3 w-3" />
          <span className="font-mono">{totals.working}</span> working
        </span>
        {totals.inCouncil > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-primary">
            <Users className="h-3 w-3" />
            <span className="font-mono">{totals.inCouncil}</span> in council
          </span>
        )}
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-on-surface-variant">
          <span className="font-mono">{totals.idle}</span> idle
        </span>
        {totals.errored > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-error/25 bg-error/10 px-2.5 py-1 text-error">
            <span className="font-mono">{totals.errored}</span> errored
          </span>
        )}
      </div>

      {/* Dept quick-filter row */}
      <div className="mb-4 flex flex-wrap items-center gap-1.5 text-[11px]">
        <button
          onClick={() => setFocusDept(null)}
          className={`rounded-full border px-2.5 py-1 transition ${
            focusDept === null
              ? 'border-white/30 bg-white/10 text-on-surface'
              : 'border-white/10 bg-white/[0.03] text-on-surface-variant hover:border-white/20'
          }`}
        >
          All departments
        </button>
        {ROOMS.map((r) => (
          <button
            key={r.department}
            onClick={() => setFocusDept(focusDept === r.department ? null : r.department)}
            className={`rounded-full border px-2.5 py-1 transition ${
              focusDept === r.department
                ? 'border-white/30 text-on-surface'
                : 'border-white/10 text-on-surface-variant hover:border-white/20'
            }`}
            style={
              focusDept === r.department
                ? { background: `${r.accent}20`, borderColor: `${r.accent}80` }
                : undefined
            }
          >
            {r.department}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-[#0a0a0f]"
        style={{ cursor: grabbing ? 'grabbing' : 'grab', touchAction: 'none' }}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerLeave={onUp}
      >
        <svg viewBox={`0 0 ${VW} ${VH}`} width="100%" height="auto" className="block select-none">
          <g
            transform={`translate(${pan.x} ${pan.y}) translate(${CX} ${CY}) scale(${scale}) translate(${-CX} ${-CY})`}
            style={{ transition: drag.current ? 'none' : 'transform 220ms cubic-bezier(0.22, 1, 0.36, 1)' }}
          >
            {/* Background click-catcher — click empty floor to reset focus + drawer.
                Placed first so agents/rooms sit above it. */}
            <rect
              x={0}
              y={0}
              width={VW}
              height={VH}
              fill="transparent"
              onClick={() => {
                if (drag.current?.moved) return  // ignore click after drag
                setFocusDept(null)
                setSelectedId(null)
              }}
            />

            {/* Rooms */}
            {ROOMS.map((room) => {
              const active = agents.filter(
                (a) => a.department === room.department && (a.status === 'working' || a.status === 'in-council')
              ).length
              return (
                <g
                  key={room.department}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (drag.current?.moved) return
                    // Click room floor → focus that department
                    setFocusDept((cur) => (cur === room.department ? null : room.department))
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <RoomShell
                    room={room}
                    active={active}
                    dim={focusDept !== null && focusDept !== room.department}
                  />
                </g>
              )
            })}

            {/* Team halos (drawn below avatars) */}
            {teams.map((teamAgents, i) => (
              <TeamHalo key={i} agents={teamAgents} />
            ))}

            {/* Agents */}
            {agents.map((agent) => {
              const placement = PLACEMENTS.get(agent.id)
              if (!placement) return null
              const dim = focusDept !== null && placement.room.department !== focusDept
              return (
                <g key={agent.id} style={{ opacity: dim ? 0.18 : 1, transition: 'opacity 220ms ease' }}>
                  <AgentAvatar
                    agent={agent}
                    placement={placement}
                    isSelected={selectedId === agent.id}
                    onClick={(e) => {
                      e.stopPropagation()
                      if (drag.current?.moved) return
                      setSelectedId(agent.id)
                    }}
                  />
                </g>
              )
            })}
          </g>
        </svg>

        {/* Legend */}
        <div className="pointer-events-none absolute bottom-3 right-3 flex flex-col gap-1 rounded-lg border border-white/10 bg-black/50 p-2 text-[10px] text-on-surface-variant backdrop-blur">
          <LegendDot color={STATUS_COLOR.working} label="Working" />
          <LegendDot color={STATUS_COLOR['in-council']} label="In council" />
          <LegendDot color={STATUS_COLOR.idle} label="Idle" />
          {totals.errored > 0 && <LegendDot color={STATUS_COLOR.errored} label="Errored" />}
        </div>

        {/* Zoom indicator */}
        <div className="pointer-events-none absolute bottom-3 left-3 rounded-md border border-white/10 bg-black/50 px-2 py-1 font-mono text-[10px] text-on-surface-variant backdrop-blur">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Drawer */}
      <OfficeDrawer
        agent={selected}
        agentsById={agentsById}
        onClose={() => setSelectedId(null)}
        onSelectAgent={(a) => setSelectedId(a.id)}
      />
    </div>
  )
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="inline-block h-2 w-2 rounded-full" style={{ background: color }} />
      <span>{label}</span>
    </div>
  )
}
