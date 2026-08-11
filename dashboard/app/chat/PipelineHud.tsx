// PipelineHud — the full, real-time, expandable CAOS pipeline (TS-028 ·
// MASTER-PLAN P3). Only CAOS exists in this panel now (2026-08-11, per
// operator direction) — the previously-separate Input Analysis, Context
// Injection, Execution, and Recording sections were removed and their real
// data folded directly into the CAOS phase it actually belongs to, so
// nothing is lost, it's just no longer shown as a sibling of CAOS:
//   - Input Analysis (tier/relation/must-haves/routing)  → phase 01 CLASSIFY
//   - Context Injection (agent skills, venture memory)   → phase 03 RESOLVE
//     (its CAG-cache sub-step — docs/MASTER.md §6.2 — is what context
//     injection actually is)
//   - Execution (tool calls, working agent avatars)       → phase 09 GENERATION
//   - Recording (events · graph · memory writes)           → phase 11 FEEDBACK LOOP
//
// CAOS itself is the full 12-phase breakdown (lib/caos-phases.ts, content
// sourced verbatim from docs/MASTER.md §6.2 + PART 2). Every phase carries
// two dropdowns — Process (static reference: what it does / how it decides)
// and Decision (the phase's real output where a live event exists; an
// honest "not emitted yet" note where it doesn't — never a fabricated
// result). §3 (line 264) draws the CAOS boundary at CLASSIFY→RESOLVE→
// RETRIEVE→GATE (phases 01–07); phases 08–11 are the doc's own post-CAOS
// continuation, nested in this one panel per operator direction, with a
// divider marking where the doc's actual boundary sits. Phase 12 (Field
// Monitoring) is a weekly batch, not a per-turn phase — held to a static,
// non-interactive note at the bottom rather than a dropdown.
'use client'

import { useState } from 'react'
import { Check, ChevronDown, ChevronRight } from 'lucide-react'
import type { PipelineStage } from '@/lib/pipeline'
import { FLEET } from '@/lib/fleet'
import { AgentAvatar } from './AgentAvatar'
import { CAOS_PHASES, CAOS_FIELD_MONITORING, type CaosPhase } from '@/lib/caos-phases'

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

  const analysis = stages.find((s) => s.kind === 'analyze')
  const phaseStages = (p: string) => stages.filter((s) => s.kind === p)
  const contextStages = stages.filter((s) => s.kind === 'context')
  const toolStages = stages.filter((s) => s.kind === 'tool')
  const recordStages = stages.filter((s) => s.kind === 'record')
  const agentRows = agents.map((id) => FLEET.find((a) => a.id === id)).filter(Boolean).slice(0, 3)

  // Folds the old standalone sections' real stages into the CAOS phase they
  // actually belong to (see file header). Phases not listed here have no
  // extra live source beyond their own `kind`.
  const extraForPhase: Record<string, PipelineStage[]> = {
    resolve: contextStages,
    generation: toolStages,
    'feedback-loop': recordStages,
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

  // ── Flow row (numbered stage + trailing chip) — reused for phase 01's ────
  // rich input-analysis breakdown (tier/relation/route/must-haves).
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

  // ── Pill / expand — every phase (and every gate) is a pill-shaped
  // container; one click on the pill expands it into a card holding its
  // Process + Decision sections, height animating via the CSS grid-rows
  // trick (0fr → 1fr) rather than a hard show/hide — no extra library. ────
  function PillExpand({
    id,
    isLive,
    n,
    title,
    file,
    children,
  }: {
    id: string
    isLive: boolean
    n: string
    title: string
    file?: string
    children: React.ReactNode
  }) {
    const open = !!expanded[id]
    return (
      <div
        className={`overflow-hidden border border-[var(--chat-hairline-soft)] transition-[border-radius] duration-200 ${
          open ? 'rounded-xl' : 'rounded-full'
        }`}
      >
        <button onClick={() => toggle(id)} className="flex w-full items-center gap-1.5 px-3 py-1.5 text-left">
          <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${isLive ? 'bg-emerald-400/80' : 'bg-white/20'}`} />
          <span className="font-mono text-[8.5px] text-[var(--chat-text-faint)]">{n}</span>
          <span className="truncate text-[10px] font-semibold text-[var(--chat-text-dim)]">{title}</span>
          <span className="ml-auto flex shrink-0 items-center gap-1.5">
            {open && file && <span className="hidden truncate font-mono text-[8px] text-[var(--chat-text-faint)] sm:inline">{file}</span>}
            {open ? (
              <ChevronDown className="h-3 w-3 shrink-0 text-[var(--chat-text-faint)]" />
            ) : (
              <ChevronRight className="h-3 w-3 shrink-0 text-[var(--chat-text-faint)]" />
            )}
          </span>
        </button>
        <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="space-y-2 px-3 pb-2.5 pt-0.5">{children}</div>
          </div>
        </div>
      </div>
    )
  }

  // ── Sub — the always-visible Process / Decision label once a pill is open */
  function Sub({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <div className="text-[8.5px] font-semibold uppercase tracking-wider text-[var(--chat-text-faint)]">{label}</div>
        <div className="mt-0.5 space-y-0.5 border-l border-[var(--chat-hairline-soft)] pl-2">{children}</div>
      </div>
    )
  }

  // ── CAOS phase block — number, title, file path, Process + Decision ──────
  // Decision lists every real live stage for phase.kind (+ any folded-in
  // extra kind from extraForPhase), oldest first. Phase 01 gets a special
  // richer render using the real input-analysis payload when present.
  // Empty → the phase's honest decisionFallback text, never a fabricated one.
  function CaosPhaseBlock({ phase }: { phase: CaosPhase }) {
    const own = phase.kind ? phaseStages(phase.kind) : []
    const extra = extraForPhase[phase.id] ?? []
    const sorted = [...own, ...extra]
      .filter((s) => s.detail || s.label)
      .sort((a, b) => (a.ts ?? 0) - (b.ts ?? 0))

    const hasRichClassify = phase.id === 'classify' && !!analysis?.analysis
    const isLive = hasRichClassify || sorted.length > 0

    return (
      <PillExpand id={`caos-phase-${phase.id}`} isLive={isLive} n={phase.n} title={phase.title} file={phase.file}>
        <Sub label="Process">
          {phase.process.map((line, i) => (
            <div key={i} className="text-[9px] leading-snug text-[var(--chat-text-faint)]">
              {line}
            </div>
          ))}
        </Sub>

        <Sub label="Decision">
          {hasRichClassify ? (
            <div className="space-y-1.5">
              <FlowRow
                n="a"
                label="classify"
                chip={<Chip tone={analysis!.analysis!.tier === 'build' ? 'accent' : 'neutral'}>{analysis!.analysis!.tier}</Chip>}
              />
              <FlowRow
                n="b"
                label="relation"
                chip={<Chip tone={analysis!.analysis!.relation === 'venture' ? 'accent' : 'neutral'}>{analysis!.analysis!.relation}</Chip>}
              />
              {analysis!.analysis!.targetAgents && (
                <FlowRow
                  n="c"
                  label="route"
                  chip={
                    <span className="flex items-center gap-1">
                      <Chip tone="accent">{analysis!.analysis!.targetAgents!.primary}</Chip>
                      {analysis!.analysis!.targetAgents!.team.map((t) => (
                        <Chip key={t} tone="neutral">{t}</Chip>
                      ))}
                    </span>
                  }
                >
                  {analysis!.analysis!.targetAgents!.reason && (
                    <div className="text-[9px] leading-snug text-[var(--chat-text-faint)]">{analysis!.analysis!.targetAgents!.reason}</div>
                  )}
                </FlowRow>
              )}
              {analysis!.analysis!.mustHaves && analysis!.analysis!.mustHaves!.length > 0 && (
                <FlowRow n="d" label="must-haves">
                  {analysis!.analysis!.mustHaves!.map((mh, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[10px]">
                      <Check className="mt-px h-2.5 w-2.5 shrink-0 text-emerald-400" />
                      <span className="text-[var(--chat-text-dim)]">{mh}</span>
                    </div>
                  ))}
                </FlowRow>
              )}
            </div>
          ) : sorted.length > 0 ? (
            <div className="space-y-1">
              {sorted.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[9.5px]">
                  <span
                    className={`mt-0.5 h-1 w-1 shrink-0 rounded-full ${
                      s.status === 'error' ? 'bg-red-400/90' : s.status === 'active' ? 'animate-pulse bg-[var(--chat-accent)]' : 'bg-emerald-400/80'
                    }`}
                  />
                  <span className="text-[var(--chat-text-dim)]">{s.label}</span>
                  {s.detail && <span className="ml-auto truncate text-[8.5px] text-[var(--chat-text-faint)]">{s.detail}</span>}
                </div>
              ))}
              {phase.id === 'generation' && agentRows.length > 0 && (
                <div className="mt-1 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {agentRows.map((a) => (
                      <span key={a!.id} className="rounded-full border border-[#0a0a0f]" title={a!.name}>
                        <AgentAvatar id={a!.id} name={a!.name} size={18} />
                      </span>
                    ))}
                  </div>
                  <span className="text-[9px] italic text-[var(--chat-text-dim)]">{thinking ?? 'working'}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[9.5px] italic leading-snug text-[var(--chat-text-faint)]">{phase.decisionFallback}</div>
          )}
        </Sub>

        {/* Gate sub-items — phase 07 only, each its own nested pill. Best-
            effort keyword match against a real gate event's label/detail
            (docs/YVON-CHAT.md: hermes-agent doesn't emit gate.passed/blocked
            yet, so this is forward-compat, not a guaranteed contract — see
            caos-phases.ts). */}
        {phase.gates && (
          <div className="space-y-1.5 border-t border-[var(--chat-hairline-soft)] pt-1.5">
            {phase.gates.map((g) => {
              const gLive = phaseStages('gate').find(
                (s) =>
                  (s.detail ?? '').toLowerCase().includes(g.matchKeyword) ||
                  (s.label ?? '').toLowerCase().includes(g.matchKeyword),
              )
              return (
                <PillExpand key={g.id} id={`caos-gate-${g.id}`} isLive={!!gLive} n={String(g.n)} title={g.title}>
                  <Sub label="Process">
                    {g.process.map((line, i) => (
                      <div key={i} className="text-[8.5px] leading-snug text-[var(--chat-text-faint)]">
                        {line}
                      </div>
                    ))}
                  </Sub>
                  <Sub label="Decision">
                    <div className={`text-[9px] leading-snug ${gLive ? 'text-[var(--chat-text-dim)]' : 'italic text-[var(--chat-text-faint)]'}`}>
                      {gLive ? (gLive.status === 'error' ? `blocked · ${gLive.detail ?? ''}` : gLive.detail ?? 'passed') : g.decisionFallback}
                    </div>
                  </Sub>
                </PillExpand>
              )
            })}
          </div>
        )}
      </PillExpand>
    )
  }

  return (
    <div className={`flex h-full w-full flex-col overflow-hidden border-l border-[var(--chat-hairline-soft)] bg-white/[0.015] ${disabled ? 'opacity-60' : ''}`}>
      {/* Header — CAOS + full form. Only CAOS exists in this panel. */}
      <div className="border-b border-[var(--chat-hairline-soft)] px-4 pb-2.5 pt-3.5">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">CAOS</span>
          {!disabled && (
            <span className="rounded-full border border-[var(--chat-hairline-soft)] px-1.5 py-px font-mono text-[8.5px] uppercase tracking-widest text-[var(--chat-text-faint)]">{source}</span>
          )}
        </div>
        <div className="mt-0.5 text-[9px] italic text-[var(--chat-text-faint)]">Context-Aware Orchestration System</div>
      </div>

      <div className="chat-scroll flex-1 space-y-1.5 overflow-y-auto px-3 py-3">
        {/* Structure is always visible, turn or no turn — each phase's own
            Decision dropdown already says "awaiting …" / "not emitted yet"
            when there's nothing live, so a separate blocking placeholder
            that hid all 12 phases was a bug, not a feature (2026-08-11). */}
        {disabled && (
          <div className="pb-1 text-center">
            <div className="text-[10px] text-[var(--chat-text-faint)]">Waiting for a task — send a message to start</div>
          </div>
        )}

        <div className="space-y-1.5">
          {CAOS_PHASES.slice(0, 7).map((phase) => (
            <CaosPhaseBlock key={phase.id} phase={phase} />
          ))}

          <div className="my-1 flex items-center gap-2 px-0.5">
            <div className="h-px flex-1 bg-[var(--chat-hairline-soft)]" />
            <span className="text-[7.5px] uppercase tracking-widest text-[var(--chat-text-faint)]">CAOS boundary · §3</span>
            <div className="h-px flex-1 bg-[var(--chat-hairline-soft)]" />
          </div>

          {CAOS_PHASES.slice(7).map((phase) => (
            <CaosPhaseBlock key={phase.id} phase={phase} />
          ))}

          {/* Phase 12 — held, static bottom view only (not per-turn, so it
              never expands — no click target, unlike every other pill above,
              but same resting pill shape for visual consistency). */}
          <div className="overflow-hidden rounded-full border border-dashed border-[var(--chat-hairline-soft)] px-3 py-1.5 opacity-70">
            <div className="flex items-center gap-1.5 text-[10px]">
              <span className="font-mono text-[8.5px] text-[var(--chat-text-faint)]">{CAOS_FIELD_MONITORING.n}</span>
              <span className="truncate font-semibold text-[var(--chat-text-dim)]">{CAOS_FIELD_MONITORING.title}</span>
            </div>
            <div className="mt-1 text-[9px] italic leading-snug text-[var(--chat-text-faint)]">{CAOS_FIELD_MONITORING.note}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
