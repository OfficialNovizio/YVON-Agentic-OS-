// PillHeader — top of the message pane.
// Shows breadcrumb + pill navigator. Contextual to the current Focus.
// Owner: mia · TS-015 WI-3
'use client'

import { ChevronRight, ChevronLeft, Users, Layers } from 'lucide-react'
import { FLEET, FLEET_DEPARTMENTS, fleetByDepartment } from '@/lib/fleet'
import type { FleetDepartment } from '@/lib/fleet'
import type { Focus } from './page'

interface PillHeaderProps {
  focus: Focus
  visibleDepartments: FleetDepartment[]  // depts the caller can chat in
  hasAssignedScope: boolean               // whether the "All assigned" pill should show
  onFocus: (next: Focus) => void
}

export function PillHeader({ focus, visibleDepartments, hasAssignedScope, onFocus }: PillHeaderProps) {
  return (
    <div className="border-b border-white/[0.06] bg-black/20 px-5 py-3">
      {/* Breadcrumb */}
      <div className="mb-2 flex items-center gap-1.5 text-[12px] text-on-surface-variant/80">
        {focus.kind === 'workforce' && (
          <>
            <Users className="h-3.5 w-3.5" />
            <span className="text-on-surface">Workforce</span>
          </>
        )}
        {focus.kind === 'assigned_scope' && (
          <>
            <Layers className="h-3.5 w-3.5" />
            <span className="text-on-surface">All assigned</span>
          </>
        )}
        {focus.kind === 'department' && (
          <>
            <button
              onClick={() => onFocus({ kind: 'workforce' })}
              className="inline-flex items-center gap-1 hover:text-on-surface"
            >
              <Users className="h-3.5 w-3.5" /> Workforce
            </button>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-on-surface"># {focus.department}</span>
          </>
        )}
        {focus.kind === 'agent' && (
          <>
            <button
              onClick={() => onFocus({ kind: 'workforce' })}
              className="inline-flex items-center gap-1 hover:text-on-surface"
            >
              <Users className="h-3.5 w-3.5" /> Workforce
            </button>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <button
              onClick={() => onFocus({ kind: 'department', department: focus.department })}
              className="hover:text-on-surface"
            >
              # {focus.department}
            </button>
            <ChevronRight className="h-3 w-3 opacity-60" />
            <span className="text-on-surface">@{focus.agentId}</span>
          </>
        )}
      </div>

      {/* Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        {focus.kind === 'workforce' && (
          <>
            {FLEET_DEPARTMENTS.map((dept) => (
              <Pill
                key={dept}
                label={dept}
                count={fleetByDepartment(dept).length}
                disabled={!visibleDepartments.includes(dept)}
                onClick={() => onFocus({ kind: 'department', department: dept })}
              />
            ))}
            {hasAssignedScope && (
              <Pill
                label="+ All assigned"
                accent
                onClick={() => onFocus({ kind: 'assigned_scope' })}
              />
            )}
          </>
        )}

        {focus.kind === 'department' && (
          <>
            <BackPill onClick={() => onFocus({ kind: 'workforce' })} label="Workforce" />
            {fleetByDepartment(focus.department as FleetDepartment).map((agent) => (
              <Pill
                key={agent.id}
                label={agent.name}
                color={agent.color}
                onClick={() =>
                  onFocus({ kind: 'agent', department: focus.department, agentId: agent.id })
                }
              />
            ))}
          </>
        )}

        {focus.kind === 'agent' && (
          <>
            <BackPill
              onClick={() => onFocus({ kind: 'department', department: focus.department })}
              label={focus.department}
            />
            {(() => {
              const agent = FLEET.find((a) => a.id === focus.agentId)
              if (!agent) return null
              return (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/[0.15] bg-white/[0.06] px-3 py-1 text-[11px]">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: agent.color }}
                  />
                  {agent.name}
                  <span className="text-on-surface-variant/70">· {agent.role}</span>
                </span>
              )
            })()}
          </>
        )}

        {focus.kind === 'assigned_scope' && (
          <>
            <BackPill onClick={() => onFocus({ kind: 'workforce' })} label="Workforce" />
            {visibleDepartments.map((dept) => (
              <Pill
                key={dept}
                label={dept}
                onClick={() => onFocus({ kind: 'department', department: dept })}
              />
            ))}
          </>
        )}
      </div>
    </div>
  )
}

// ── Pill primitives ────────────────────────────────────────────────
function Pill({
  label,
  count,
  color,
  accent,
  disabled,
  onClick,
}: {
  label: string
  count?: number
  color?: string
  accent?: boolean
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] transition ${
        accent
          ? 'border-primary/40 bg-primary/10 text-primary hover:border-primary/60'
          : 'border-white/[0.10] bg-white/[0.03] text-on-surface hover:border-white/25 hover:bg-white/[0.06]'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      {color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: color }} />}
      <span className="truncate">{label}</span>
      {typeof count === 'number' && (
        <span className="font-mono text-[10px] text-on-surface-variant/70">{count}</span>
      )}
    </button>
  )
}

function BackPill({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-full border border-white/[0.08] bg-white/[0.02] px-2.5 py-1 text-[11px] text-on-surface-variant transition hover:border-white/20 hover:text-on-surface"
    >
      <ChevronLeft className="h-3 w-3" />
      <span className="truncate">{label}</span>
    </button>
  )
}
