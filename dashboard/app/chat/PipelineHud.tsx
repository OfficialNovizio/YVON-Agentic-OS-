// PipelineHud — the floating pipeline HUD (TS-020 · YVON-CHAT §5.3).
// Renders the REAL turn pipeline from pipeline state (derived from SSE events
// for the live turn, or the events table for past turns). Every node, tool,
// count and timing is real event data — nothing is fabricated. When the data
// source is 'none', the HUD renders nothing (it only mounts on demand).
'use client'

import { Check, X } from 'lucide-react'
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

  // Current phase: the first stage that isn't done → its phase kind, else none.
  const activeStage = stages.find((s) => s.status === 'active')
  const activePhase = activeStage?.kind && (PHASES as readonly string[]).includes(activeStage.kind)
    ? (activeStage.kind as (typeof PHASES)[number])
    : null

  const stageKind = (s: PipelineStage): (typeof PHASES)[number] | null =>
    (PHASES as readonly string[]).includes(s.kind) ? (s.kind as (typeof PHASES)[number]) : null

  const toolStages = stages.filter((s) => s.kind === 'tool')

  // Context counts — ONLY from a real phase.retrieve detail (hidden otherwise).
  const retrieve = stages.find((s) => s.kind === 'retrieve')
  const retrieveDetail = retrieve?.detail ?? null

  const agentRows = agents
    .map((id) => FLEET.find((a) => a.id === id))
    .filter((a): a is NonNullable<typeof a> => Boolean(a))
    .slice(0, 3)

  return (
    <div
      className={`flex h-full w-full flex-col overflow-hidden border-l border-[var(--chat-hairline-soft)] bg-white/[0.015] ${
        disabled ? 'opacity-60' : ''
      }`}
    >
      {/* Header — fixed CAOS card, no close icon (TS-023) */}
      <div className="flex items-center gap-1.5 border-b border-[var(--chat-hairline-soft)] px-4 pb-2.5 pt-3.5">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">
          pipeline
        </span>
        {!disabled && (
          <span className="rounded-full border border-[var(--chat-hairline-soft)] px-1.5 py-px font-mono text-[8.5px] uppercase tracking-widest text-[var(--chat-text-faint)]">
            {source}
          </span>
        )}
      </div>

      <div className="chat-scroll flex-1 overflow-y-auto px-4 py-3.5">
        {/* ── Disabled state (no turn yet) — the CAOS card, waiting ── */}
        {disabled && (
          <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
            <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--chat-text-faint)]">
              classify → resolve → retrieve → gate
            </div>
            <div className="text-[11px] text-[var(--chat-text-faint)]">
              Waiting for a task — send a message to start the pipeline
            </div>
            <div className="flex gap-1.5">
              {(['classify', 'resolve', 'retrieve', 'gate'] as const).map((p) => (
                <span key={p} className="h-1.5 w-8 rounded-full bg-white/[0.06]" />
              ))}
            </div>
          </div>
        )}

        {/* ── CAOS phases (design-match: gradient ring on active, per-stage
             real mono timings from event timestamps) ──────────────── */}
        <div className="space-y-0">
          {PHASES.map((phase, i) => {
            const isActive = phase === activePhase
            const done = stages.some((s) => s.kind === phase && s.status === 'done')
            const hasStage = stages.some((s) => s.kind === phase)
            // Real phase timing: delta between this phase's event and the
            // previous phase's event (ms) — only when both timestamps exist.
            const phaseStages = stages.filter((s) => s.kind === phase).sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))
            const thisTs = phaseStages[0]?.ts
            const prevTs = (() => {
              for (let j = i - 1; j >= 0; j--) {
                const prev = stages.filter((s) => s.kind === PHASES[j]).sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))[0]
                if (prev?.ts) return prev.ts
              }
              return undefined
            })()
            const ms = thisTs && prevTs ? Math.max(0, thisTs - prevTs) : undefined
            return (
              <div key={phase} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {isActive ? (
                    // Indigo→violet gradient ring + breathing pulse (design)
                    <span className="chat-breathe flex h-5 w-5 items-center justify-center rounded-full bg-[conic-gradient(from_180deg,#6366f1,#8b5cf6,#6366f1)] p-[2px]">
                      <span className="flex h-full w-full items-center justify-center rounded-full bg-[#12121a]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--chat-accent)]" />
                      </span>
                    </span>
                  ) : (
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border transition ${
                        done ? 'border-emerald-400/40 bg-emerald-400/10' : 'border-white/10 bg-white/[0.02]'
                      }`}
                    >
                      {done ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <span className="h-1 w-1 rounded-full bg-white/15" />
                      )}
                    </span>
                  )}
                  {i < PHASES.length - 1 && (
                    <span
                      className={`my-0.5 w-px flex-1 ${
                        stages.some((s) => stageKind(s) === PHASES[i + 1])
                          ? 'bg-white/10'
                          : 'bg-white/[0.04]'
                      }`}
                      style={{ minHeight: 10 }}
                    />
                  )}
                </div>
                <div className="pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-mono text-[10.5px] font-semibold uppercase tracking-widest ${
                        isActive ? 'text-[var(--chat-accent)]' : done ? 'text-emerald-300/80' : 'text-[var(--chat-text-faint)]'
                      }`}
                    >
                      {phase}
                    </span>
                    {ms != null && (
                      <span className="font-mono text-[8.5px] text-[var(--chat-text-faint)]">{ms}ms</span>
                    )}
                  </div>
                  {hasStage && (
                    <div className="mt-0.5 max-w-[220px] truncate text-[10px] text-[var(--chat-text-faint)]">
                      {stages
                        .filter((s) => s.kind === phase)
                        .map((s) => s.detail ?? s.label)
                        .filter(Boolean)
                        .join(' · ') || '…'}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── Context (real counts only) ──────────────────────────── */}
        {retrieveDetail && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-[var(--chat-hairline-soft)] bg-white/[0.03] px-2 py-0.5 font-mono text-[9px] text-[var(--chat-text-dim)]">
              {retrieveDetail}
            </span>
          </div>
        )}

        {/* ── Tools (real names, status, ms) ──────────────────────── */}
        {toolStages.length > 0 && (
          <div className="mt-3">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-[var(--chat-text-faint)]">
              tools
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {toolStages.map((t, i) => (
                <span
                  key={`${t.id}-${i}`}
                  className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[9.5px] ${
                    t.status === 'done'
                      ? 'border-emerald-400/25 bg-emerald-400/5 text-emerald-300/80'
                      : t.status === 'error'
                        ? 'border-red-400/25 bg-red-400/5 text-red-300/80'
                        : 'chat-breathe border-[var(--chat-accent)]/30 bg-[var(--chat-accent)]/5 text-[var(--chat-accent)]'
                  }`}
                >
                  {t.status === 'done' ? <Check className="h-2.5 w-2.5" /> : t.status === 'error' ? <X className="h-2.5 w-2.5" /> : <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                  {t.label}
                  {t.detail && <span className="text-[8.5px] opacity-70">{t.detail}</span>}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ── Agents involved ─────────────────────────────────────── */}
        {agentRows.length > 0 && (
          <div className="mt-3.5 border-t border-[var(--chat-hairline-soft)] pt-3">
            <div className="text-[9px] font-semibold uppercase tracking-widest text-[var(--chat-text-faint)]">
              agents involved
            </div>
            <div className="mt-2 flex items-start gap-2.5">
              <div className="flex -space-x-1.5">
                {agentRows.map((a) => (
                  <span key={a.id} className="rounded-full border border-[#0a0a0f]" title={a.name}>
                    <AgentAvatar id={a.id} name={a.name} size={24} />
                  </span>
                ))}
              </div>
              <span className="min-w-0 flex-1 text-[10.5px] italic leading-snug text-[var(--chat-text-dim)]">
                {thinking ?? 'working'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
