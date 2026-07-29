// OfficeDrawer — right-side info drawer for a selected office agent.
// Shows real fields where present, honest empty states otherwise (no fake data).
//
// Owner: mia + spark · TS-010 WI-4
'use client'

import { useEffect } from 'react'
import { X, Users, Building2, GitBranch, Clock, Activity, User } from 'lucide-react'
import { StatusBadge, Chip } from '@/components/ui'
import type { OfficeAgent, AgentStatus, WorkspaceKey } from '@/app/api/office/route'

// Workspace accent lookup (mirrors lib/workspaces.ts)
const WORKSPACE_ACCENT: Record<WorkspaceKey, string> = {
  'yvon-os': '#6366F1',
  novizio: '#E94560',
  hourbour: '#3B82F6',
  agentx: '#5ee0ff',
}

const STATUS_TONE: Record<AgentStatus, 'green' | 'blue' | 'muted' | 'red'> = {
  working: 'green',
  'in-council': 'blue',
  idle: 'muted',
  errored: 'red',
}

function timeAgo(iso: string | undefined): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

interface OfficeDrawerProps {
  agent: OfficeAgent | null
  agentsById: Record<string, OfficeAgent>
  onClose: () => void
  onSelectAgent: (agent: OfficeAgent) => void
}

export function OfficeDrawer({ agent, agentsById, onClose, onSelectAgent }: OfficeDrawerProps) {
  // Esc closes
  useEffect(() => {
    if (!agent) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [agent, onClose])

  if (!agent) return null

  const wsAccent = agent.workspace ? WORKSPACE_ACCENT[agent.workspace] : undefined
  const isActive = agent.status === 'working' || agent.status === 'in-council'

  return (
    <>
      {/* click-outside backdrop */}
      <button
        aria-label="Close"
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition"
      />

      <aside
        role="dialog"
        aria-labelledby="office-drawer-title"
        className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-white/10 bg-surface-container shadow-2xl no-scrollbar"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-white/[0.06] p-5">
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-[#06121f]"
              style={{ background: agent.color }}
            >
              {agent.name.slice(0, 1).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 id="office-drawer-title" className="truncate text-base font-semibold text-on-surface">
                {agent.name}
              </h2>
              <div className="mt-0.5 text-[12px] text-on-surface-variant">
                {agent.role || 'Role not set'} · {agent.department}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
            aria-label="Close drawer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Status row */}
        <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-5 py-3">
          <StatusBadge tone={STATUS_TONE[agent.status]}>
            {agent.status}
          </StatusBadge>
          {agent.startedAt && isActive && (
            <span className="inline-flex items-center gap-1 text-[11px] text-on-surface-variant">
              <Clock className="h-3 w-3" /> {timeAgo(agent.startedAt)}
            </span>
          )}
          {agent.workspace && (
            <Chip>
              <span
                className="mr-1.5 inline-block h-2 w-2 rounded-full"
                style={{ background: wsAccent }}
              />
              {agent.workspace}
            </Chip>
          )}
        </div>

        {/* Task */}
        <Section icon={<Activity className="h-3.5 w-3.5" />} label="Current task">
          {agent.currentTask ? (
            <p className="text-[13px] leading-relaxed text-on-surface">{agent.currentTask}</p>
          ) : (
            <Empty>No active task.</Empty>
          )}
        </Section>

        {/* Co-agents */}
        <Section icon={<Users className="h-3.5 w-3.5" />} label="Working with">
          {agent.coAgents && agent.coAgents.length > 0 ? (
            <ul className="flex flex-wrap gap-2">
              {agent.coAgents.map((id) => {
                const peer = agentsById[id]
                return (
                  <li key={id}>
                    <button
                      onClick={() => peer && onSelectAgent(peer)}
                      disabled={!peer}
                      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-[12px] text-on-surface transition hover:border-white/20 hover:bg-white/[0.06] disabled:opacity-40"
                    >
                      {peer && (
                        <span
                          className="inline-block h-2 w-2 rounded-full"
                          style={{ background: peer.color }}
                        />
                      )}
                      {peer?.name ?? id}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : (
            <Empty>Working solo.</Empty>
          )}
        </Section>

        {/* Workspace / brand */}
        <Section icon={<Building2 className="h-3.5 w-3.5" />} label="For">
          {agent.workspace ? (
            <div className="flex items-center gap-2 text-[13px] text-on-surface">
              <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: wsAccent }} />
              <span className="capitalize">{agent.workspace.replace('-', ' ')}</span>
            </div>
          ) : (
            <Empty>Not assigned to a workspace.</Empty>
          )}
        </Section>

        {/* TASK-SPEC + progress */}
        <Section icon={<GitBranch className="h-3.5 w-3.5" />} label="Why (TASK-SPEC)">
          {agent.taskSpec ? (
            <div className="space-y-2">
              <a
                href={`/tasks#${agent.taskSpec}`}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.03] px-2 py-1 font-mono text-[12px] text-on-surface transition hover:border-white/20 hover:bg-white/[0.06]"
              >
                {agent.taskSpec}
                {agent.taskSpecWorkItem && (
                  <span className="text-on-surface-variant">· {agent.taskSpecWorkItem}</span>
                )}
              </a>
              {typeof agent.progress === 'number' && (
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-on-surface-variant">
                    <span>Progress</span>
                    <span className="font-mono text-on-surface">{Math.round(agent.progress)}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.05]">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.max(0, Math.min(100, agent.progress))}%`,
                        background: agent.color,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <Empty>Not currently on a TASK-SPEC.</Empty>
          )}
        </Section>

        {/* Identity footer */}
        <div className="mt-auto border-t border-white/[0.06] p-5 text-[11px] text-on-surface-variant/70">
          <div className="flex items-center gap-2">
            <User className="h-3 w-3" />
            <span className="font-mono">{agent.id}</span>
          </div>
        </div>
      </aside>
    </>
  )
}

// ─── small helpers ─────────────────────────────────────────────────────────
function Section({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-white/[0.06] p-5">
      <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
        {icon}
        {label}
      </div>
      {children}
    </section>
  )
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] italic text-on-surface-variant/60">{children}</p>
}
