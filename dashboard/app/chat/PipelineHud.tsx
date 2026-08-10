// PipelineHud — the full, real-time, expandable pipeline (TS-028 · MASTER-PLAN P3).
// Sections: Input Analysis · Context · CAOS · RAG · Execution · Recording.
// Each is a real-time status row (active glow / done check / error) with an
// expand chevron revealing that stage's steps + details. All from real events.
'use client'

import { useState } from 'react'
import { Check, X, ChevronDown, ChevronRight } from 'lucide-react'
import type { PipelineStage } from '@/lib/pipeline'
import { FLEET } from '@/lib/fleet'
import { AgentAvatar } from './AgentAvatar'

const PHASES = ['classify', 'resolve', 'retrieve', 'gate'] as const

interface PipelineHudProps {
  stages: PipelineStage[]
  source: 'live' | 'past' | 'none'
  agents: string[]
  thinking: string | null
}

export function PipelineHud({ stages, source, agents, thinking }: PipelineHudProps) {
  const disabled = source === 'none'
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  const activePhase =
    stages.find((s) => s.status === 'active')?.kind && (PHASES as readonly string[]).includes(
      stages.find((s) => s.status === 'active')?.kind ?? '',
    )
      ? (stages.find((s) => s.status === 'active')?.kind as (typeof PHASES)[number])
      : null

  const analysis = stages.find((s) => s.kind === 'analyze')
  const contextStages = stages.filter((s) => s.kind === 'context')
  const phaseStages = (p: string) => stages.filter((s) => s.kind === p)
  const toolStages = stages.filter((s) => s.kind === 'tool')
  const recordStages = stages.filter((s) => s.kind === 'record')
  const retrieve = stages.find((s) => s.kind === 'retrieve')
  const agentRows = agents.map((id) => FLEET.find((a) => a.id === id)).filter(Boolean).slice(0, 3)

  // Real per-phase timing (delta between phase events)
  const phaseMs = (phase: string): number | undefined => {
    const idx = PHASES.indexOf(phase as (typeof PHASES)[number])
    const thisTs = phaseStages(phase).sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))[0]?.ts
    if (!thisTs) return undefined
    for (let j = idx - 1; j >= 0; j--) {
      const prev = phaseStages(PHASES[j]).sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))[0]?.ts
      if (prev) return Math.max(0, thisTs - prev)
    }
    return undefined
  }

  // ── Section row ─────────────────────────────────────────────────────────
  function Section({
    id,
    icon,
    title,
    status,
    detail,
    children,
  }: {
    id: string
    icon?: string
    title: string
    status: 'active' | 'done' | 'error' | 'pending' | 'waiting'
    detail?: string
    children?: React.ReactNode
  }) {
    const open = !!expanded[id]
    const StatusIcon = status === 'done' ? Check : status === 'error' ? X : null
    return (
      <div
        className={`rounded-lg border px-3 py-2 transition ${
          status === 'active'
            ? 'chat-breathe border-[var(--chat-accent)]/40 bg-[var(--chat-accent)]/5'
            : status === 'error'
              ? 'border-red-400/30 bg-red-400/5'
              : status === 'done'
                ? 'border-emerald-400/20 bg-emerald-400/[0.03]'
                : 'border-[var(--chat-hairline-soft)] bg-white/[0.015]'
        }`}
      >
        <button onClick={() => toggle(id)} className="flex w-full items-center gap-2 text-left">
          <span
            className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
              status === 'active'
                ? 'bg-[var(--chat-accent)]/20'
                : status === 'done'
                  ? 'bg-emerald-400/15'
                  : status === 'error'
                    ? 'bg-red-400/15'
                    : 'bg-white/[0.04]'
            }`}
          >
            {status === 'active' ? (
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--chat-accent)]" />
            ) : StatusIcon ? (
              <StatusIcon className={`h-2.5 w-2.5 ${status === 'done' ? 'text-emerald-400' : 'text-red-400'}`} />
            ) : (
              <span className="h-1 w-1 rounded-full bg-white/20" />
            )}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">
            {title}
          </span>
          {detail && (
            <span className="ml-auto truncate font-mono text-[8.5px] text-[var(--chat-text-faint)]">{detail}</span>
          )}
          {open ? (
            <ChevronDown className="h-3 w-3 shrink-0 text-[var(--chat-text-faint)]" />
          ) : (
            <ChevronRight className="h-3 w-3 shrink-0 text-[var(--chat-text-faint)]" />
          )}
        </button>
        {open && children && <div className="mt-2 space-y-1 border-t border-[var(--chat-hairline-soft)] pt-2">{children}</div>}
      </div>
    )
  }

  // ── Step row (inside a section) ─────────────────────────────────────────
  function Step({ label, detail, status }: { label: string; detail?: string; status: 'done' | 'error' | 'active' | 'pending' }) {
    return (
      <div className="flex items-start gap-2 text-[10px]">
        <span
          className={`mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full ${
            status === 'done' ? 'bg-emerald-400/80' : status === 'error' ? 'bg-red-400/90' : status === 'active' ? 'animate-pulse bg-[var(--chat-accent)]' : 'bg-white/20'
          }`}
        />
        <span className="text-[var(--chat-text-dim)]">{label}</span>
        {detail && <span className="ml-auto truncate text-[8.5px] text-[var(--chat-text-faint)]">{detail}</span>}
      </div>
    )
  }

  // ── Chip (small mono tag — tier, relation, agent) ───────────────────────
  function Chip({ children, tone }: { children: React.ReactNode; tone: 'accent' | 'neutral' }) {
    const cls =
      tone === 'accent'
        ? 'border-[var(--chat-accent)]/40 bg-[var(--chat-accent)]/10 text-[var(--chat-accent)]'
        : 'border-[var(--chat-hairline)] bg-white/[0.03] text-[var(--chat-text-dim)]'
    return (
      <span className={`shrink-0 rounded-full border px-1.5 py-px font-mono text-[8.5px] uppercase tracking-widest ${cls}`}>
        {children}
      </span>
    )
  }

  // ── Flow row (numbered stage + trailing chip) ───────────────────────────
  function FlowRow({ n, label, chip, children }: { n: string; label: string; chip?: React.ReactNode; children?: React.ReactNode }) {
    return (
      <div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400/80" />
          <span className="font-mono text-[8.5px] text-[var(--chat-text-faint)]">{n}</span>
          <span className="text-[var(--chat-text-dim)]">{label}</span>
          {chip && <span className="ml-auto">{chip}</span>}
        </div>
        {children && <div className="ml-[18px] mt-0.5 space-y-0.5 border-l border-[var(--chat-hairline-soft)] pl-2.5">{children}</div>}
      </div>
    )
  }

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden border-l border-[var(--chat-hairline-soft)] bg-white/[0.015] ${disabled ? 'opacity-60' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-1.5 border-b border-[var(--chat-hairline-soft)] px-4 pb-2.5 pt-3.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">pipeline</span>
        {!disabled && (
          <span className="rounded-full border border-[var(--chat-hairline-soft)] px-1.5 py-px font-mono text-[8.5px] uppercase tracking-widest text-[var(--chat-text-faint)]">{source}</span>
        )}
      </div>

      <div className="chat-scroll flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {disabled && (
          <div className="py-8 text-center">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--chat-text-faint)]">classify → resolve → retrieve → gate</div>
            <div className="mt-1 text-[11px] text-[var(--chat-text-faint)]">Waiting for a task — send a message to start</div>
          </div>
        )}

        {/* ── 1 · Input Analysis — TS-030: 5-stage flow ──────────── */}
        <Section
          id="input-analysis"
          title="Input Analysis"
          status={analysis ? 'done' : disabled ? 'waiting' : 'pending'}
          detail={analysis ? analysis.detail?.split('\n')[0]?.slice(0, 30) : undefined}
        >
          {analysis?.analysis ? (
            <div className="space-y-1.5">
              {/* 01 · classify — the tier decision */}
              <FlowRow
                n="01"
                label="classify"
                chip={<Chip tone={analysis.analysis.tier === 'build' ? 'accent' : 'neutral'}>{analysis.analysis.tier}</Chip>}
              />
              {/* 02 · relation — venture vs general */}
              <FlowRow
                n="02"
                label="relation"
                chip={<Chip tone={analysis.analysis.relation === 'venture' ? 'accent' : 'neutral'}>{analysis.analysis.relation}</Chip>}
              />
              {/* 03 · extract — the parsed fields (info vs build) */}
              {(() => {
                const a = analysis.analysis
                const fields =
                  a.tier === 'info'
                    ? ([
                        ['type', a.type],
                        ['subject', a.subject],
                        ['scope', a.scope],
                        ['expected', a.expected],
                        ['format', a.format],
                      ] as const)
                    : ([
                        ['what', a.what],
                        ['why', a.why],
                        ['how', a.how],
                        ['end result', a.endResult],
                        ['desired output', a.desiredOutput],
                      ] as const)
                const shown = fields.filter(([, v]) => v && v !== 'not specified')
                return (
                  <FlowRow n="03" label="extract">
                    {shown.length > 0 ? (
                      shown.map(([k, v]) => (
                        <div key={k} className="text-[10px]">
                          <span className="font-mono text-[8.5px] uppercase tracking-widest text-[var(--chat-text-faint)]">{k}</span>
                          <span className="ml-1 text-[var(--chat-text-dim)]">{String(v)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[9px] text-[var(--chat-text-faint)]">not specified</div>
                    )}
                  </FlowRow>
                )
              })()}
              {/* 04 · route — the agent routing plan */}
              {analysis.analysis.targetAgents ? (
                <FlowRow
                  n="04"
                  label="route"
                  chip={
                    <span className="flex items-center gap-1">
                      <Chip tone="accent">{analysis.analysis.targetAgents.primary}</Chip>
                      {analysis.analysis.targetAgents.team.map((t) => (
                        <Chip key={t} tone="neutral">{t}</Chip>
                      ))}
                    </span>
                  }
                >
                  {analysis.analysis.targetAgents.reason && (
                    <div className="text-[9px] leading-snug text-[var(--chat-text-faint)]">{analysis.analysis.targetAgents.reason}</div>
                  )}
                </FlowRow>
              ) : (
                <FlowRow n="04" label="route">
                  <div className="text-[9px] text-[var(--chat-text-faint)]">no agent plan</div>
                </FlowRow>
              )}
              {/* 05 · must-haves — the checklist that defines "done" */}
              <FlowRow n="05" label="must-haves">
                {analysis.analysis.mustHaves && analysis.analysis.mustHaves.length > 0 ? (
                  analysis.analysis.mustHaves.map((mh, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px]">
                      <Check className="mt-px h-2.5 w-2.5 shrink-0 text-emerald-400" />
                      <span className="text-[var(--chat-text-dim)]">{mh}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-[9px] text-[var(--chat-text-faint)]">—</div>
                )}
              </FlowRow>
            </div>
          ) : analysis ? (
            <>
              {/* Fallback — flat detail lines (older rows / legacy sources) */}
              {analysis.detail
                ?.split('\n')
                .filter(Boolean)
                .map((line, i) => {
                  const [k, ...rest] = line.split(':')
                  return (
                    <Step
                      key={i}
                      label={k ?? ''}
                      detail={rest.join(':')?.trim() || '—'}
                      status="done"
                    />
                  )
                })}
            </>
          ) : (
            <Step label="waiting for a message…" status="pending" />
          )}
        </Section>

        {/* ── 2 · Context Injection ─────────────────────────────── */}
        <Section
          id="context"
          title="Context Injection"
          status={contextStages.some((s) => s.status === 'active') ? 'active' : contextStages.some((s) => s.status === 'done') ? 'done' : disabled ? 'waiting' : 'pending'}
          detail={contextStages.some((s) => s.status === 'done') ? 'agent skills · venture memory' : undefined}
        >
          {contextStages.length > 0 ? (
            contextStages.map((s, i) => <Step key={i} label={s.label} detail={s.detail} status={s.status === 'active' ? 'active' : s.status === 'error' ? 'error' : 'done'} />)
          ) : (
            <Step label="injected with the turn" status="done" />
          )}
        </Section>

        {/* ── 3 · CAOS ──────────────────────────────────────────── */}
        <Section
          id="caos"
          title="CAOS"
          status={
            phaseStages('gate').some((s) => s.status === 'error') ? 'error'
              : activePhase ? 'active'
              : phaseStages('classify').length > 0 ? 'done'
              : disabled ? 'waiting' : 'pending'
          }
          detail={activePhase ? activePhase : phaseStages('classify').length > 0 ? 'complete' : undefined}
        >
          {PHASES.map((p) => {
            const stages = phaseStages(p)
            const st = stages.some((s) => s.status === 'error') ? 'error' : activePhase === p ? 'active' : stages.some((s) => s.status === 'done') ? 'done' : 'pending'
            return (
              <Step
                key={p}
                label={p}
                detail={stages.map((s) => s.detail).filter(Boolean).join(' · ') || phaseMs(p) !== undefined ? `${phaseMs(p) ?? ''}ms` : undefined}
                status={st}
              />
            )
          })}
        </Section>

        {/* ── 4 · RAG ───────────────────────────────────────────── */}
        <Section
          id="rag"
          title="RAG"
          status={retrieve ? (retrieve.status === 'error' ? 'error' : 'done') : disabled ? 'waiting' : 'pending'}
          detail={retrieve?.detail}
        >
          {retrieve ? (
            <Step label="retrieval" detail={retrieve.detail} status={retrieve.status === 'error' ? 'error' : 'done'} />
          ) : (
            <Step label="no retrieval needed (info tier)" status="pending" />
          )}
        </Section>

        {/* ── 5 · Execution ─────────────────────────────────────── */}
        <Section
          id="execution"
          title="Execution"
          status={toolStages.some((s) => s.status === 'error') ? 'error' : toolStages.some((s) => s.status === 'active') ? 'active' : toolStages.length > 0 ? 'done' : disabled ? 'waiting' : 'pending'}
          detail={toolStages.some((s) => s.status === 'active') ? 'running' : toolStages.length > 0 ? `${toolStages.length} tool(s)` : undefined}
        >
          {toolStages.length > 0 ? (
            toolStages.map((t, i) => (
              <Step key={i} label={t.label} detail={t.detail} status={t.status === 'error' ? 'error' : t.status === 'active' ? 'active' : 'done'} />
            ))
          ) : (
            <Step label="no tools called (info tier)" status="pending" />
          )}
          {agentRows.length > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {agentRows.map((a) => (
                  <span key={a!.id} className="rounded-full border border-[#0a0a0f]" title={a!.name}>
                    <AgentAvatar id={a!.id} name={a!.name} size={20} />
                  </span>
                ))}
              </div>
              <span className="text-[9.5px] italic text-[var(--chat-text-dim)]">{thinking ?? 'working'}</span>
            </div>
          )}
        </Section>

        {/* ── 6 · Recording ─────────────────────────────────────── */}
        <Section
          id="recording"
          title="Recording"
          status={recordStages.some((s) => s.status === 'error') ? 'error' : recordStages.some((s) => s.status === 'done') ? 'done' : disabled ? 'waiting' : 'pending'}
          detail={recordStages.length > 0 ? `${recordStages.length} saved` : undefined}
        >
          {recordStages.length > 0 ? (
            recordStages.map((s, i) => <Step key={i} label={s.label} detail={s.detail} status={s.status === 'error' ? 'error' : 'done'} />)
          ) : (
            <Step label="every message records to events · graph · memory" status="done" />
          )}
        </Section>
      </div>
    </div>
  )
}
