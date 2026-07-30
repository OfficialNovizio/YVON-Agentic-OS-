// ContextPanel — left rail. Three sections: Context, My Departments, Recent.
// The pill/breadcrumb navigation lives in PillHeader on the message pane.
// Owner: mia · TS-015 WI-3
'use client'

import { Users, Hash, AtSign, Layers } from 'lucide-react'
import { FLEET } from '@/lib/fleet'
import type { ChatRoom } from '@/app/api/chat/rooms/route'
import type { Focus } from './page'

const FLEET_BY_ID = Object.fromEntries(FLEET.map((a) => [a.id, a]))

interface ContextPanelProps {
  rooms: ChatRoom[]
  focus: Focus
  onFocus: (next: Focus) => void
  loading?: boolean
}

export function ContextPanel({ rooms, focus, onFocus, loading }: ContextPanelProps) {
  const workforce = rooms.find((r) => r.kind === 'whole_team')
  const assignedScope = rooms.find((r) => r.kind === 'assigned_scope')
  const departments = rooms.filter((r) => r.kind === 'department')
  const agentRooms = rooms.filter((r) => r.kind === 'agent').slice(0, 5)

  return (
    <div className="flex h-full flex-col overflow-y-auto no-scrollbar bg-white/[0.015]">
      {loading && (
        <div className="px-4 py-6 text-center text-[12px] text-on-surface-variant">Loading…</div>
      )}

      {/* ── Context ────────────────────────────────────────────────── */}
      <Section title="Context">
        {workforce && (
          <Row
            active={focus.kind === 'workforce'}
            icon={<Users className="h-4 w-4" />}
            label="Workforce"
            hint={`${FLEET.length} agents`}
            onClick={() => onFocus({ kind: 'workforce' })}
          />
        )}
        {assignedScope && departments.length > 1 && (
          <Row
            active={focus.kind === 'assigned_scope'}
            icon={<Layers className="h-4 w-4" />}
            label="All assigned"
            hint={`${departments.length} depts`}
            onClick={() => onFocus({ kind: 'assigned_scope' })}
          />
        )}
      </Section>

      {/* ── My Departments ─────────────────────────────────────────── */}
      {departments.length > 0 && (
        <Section title="My Departments">
          {departments.map((room) => (
            <Row
              key={room.id}
              active={focus.kind === 'department' && focus.department === room.department}
              icon={<Hash className="h-4 w-4" />}
              label={room.department ?? ''}
              onClick={() => onFocus({ kind: 'department', department: room.department ?? '' })}
            />
          ))}
        </Section>
      )}

      {/* ── Recent 1:1 chats ───────────────────────────────────────── */}
      {agentRooms.length > 0 && (
        <Section title="Recent">
          {agentRooms.map((room) => {
            const agent = room.agentId ? FLEET_BY_ID[room.agentId] : undefined
            const label = agent?.name ?? `@${room.agentId ?? 'agent'}`
            const active =
              focus.kind === 'agent' && focus.agentId === room.agentId
            return (
              <Row
                key={room.id}
                active={active}
                icon={<AtSign className="h-4 w-4" />}
                label={label}
                accent={agent?.color}
                onClick={() =>
                  onFocus({
                    kind: 'agent',
                    department: agent?.department ?? '',
                    agentId: room.agentId ?? '',
                  })
                }
              />
            )
          })}
        </Section>
      )}
    </div>
  )
}

// ── small helpers ──────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/[0.05] px-2 py-3 last:border-b-0">
      <div className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant/70">
        {title}
      </div>
      <ul className="space-y-0.5">{children}</ul>
    </section>
  )
}

function Row({
  active,
  icon,
  label,
  hint,
  accent,
  onClick,
}: {
  active: boolean
  icon: React.ReactNode
  label: string
  hint?: string
  accent?: string
  onClick: () => void
}) {
  return (
    <li>
      <button
        onClick={onClick}
        className={`relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition ${
          active
            ? 'bg-white/[0.08] text-on-surface'
            : 'text-on-surface-variant hover:bg-white/[0.04] hover:text-on-surface'
        }`}
      >
        {active && (
          <span
            className="absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-r-full"
            style={{ background: accent ?? 'var(--ws-accent, #6366F1)' }}
          />
        )}
        <span className={active ? 'text-on-surface' : 'text-on-surface-variant/80'}>{icon}</span>
        <span className="flex-1 truncate">{label}</span>
        {hint && (
          <span className="text-[10px] font-mono text-on-surface-variant/60">{hint}</span>
        )}
      </button>
    </li>
  )
}
