// PipelineHud — the full, real-time, expandable CAOS pipeline (TS-028 ·
// MASTER-PLAN P3). Only CAOS exists in this panel now (2026-08-11, per
// operator direction) — the previously-separate Input Analysis, Context
// Injection, Execution, and Recording sections were removed and their real
// data folded directly into the CAOS phase it actually belongs to, so
// nothing is lost, it's just no longer shown as a sibling of CAOS:
//   - Input Analysis (tier/relation/must-haves/routing)  → phase 01 CLASSIFY
//   - Context Injection, split 2026-08-11 once each half was actually
//     checked against real code (docs/MASTER.md's CAG-cache/graph-tier
//     story for this step turned out to be real code that's never wired
//     into chat — see phase 03's own comment in caos-phases.ts):
//       agent skills  → phase 02 SKILL DISCLOSURE (real matching, wired)
//       venture memory → phase 03 RESOLVE (a plain DB lookup, wired;
//                        graph-tier/CAG/MemPalace is NOT what runs here)
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
import { useWorkspace } from '@/lib/WorkspaceContext'

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

  // Bug fix (2026-08-12): the 'relates to' chip hardcoded the generic label
  // 'this project' regardless of which venture was actually active. Reads
  // the yvon_active_venture cookie against the live `ventures` list — same
  // pattern RepoModeToggle.tsx uses on this same page, and deliberately NOT
  // useWorkspace().workspace: VentureSelector.tsx writes the cookie directly
  // via /api/set-venture + a full page reload, it never calls this context's
  // setWorkspace(), so `workspace` itself never reflects a real venture pick
  // (WORKSPACE_MAP only has a static 'yvon-os' entry to begin with).
  const { ventures } = useWorkspace()
  const activeVentureSlugRaw = typeof document !== 'undefined'
    ? document.cookie.match(/(?:^|;\s*)yvon_active_venture=([^;]+)/)?.[1]
    : undefined
  const activeVentureSlug = activeVentureSlugRaw ? decodeURIComponent(activeVentureSlugRaw) : undefined
  const activeVenture = ventures.find((v) => v.slug === activeVentureSlug)
  const ventureLabel = activeVenture?.name ?? 'this project'

  const analysis = stages.find((s) => s.kind === 'analyze')
  const disclosureStage = stages.find((s) => s.kind === 'disclosure')
  const phaseStages = (p: string) => stages.filter((s) => s.kind === p)
  const toolStages = stages.filter((s) => s.kind === 'tool')
  const recordStages = stages.filter((s) => s.kind === 'record')
  const agentRows = agents.map((id) => FLEET.find((a) => a.id === id)).filter(Boolean).slice(0, 3)

  // ── Decision trail (2026-08-12, per direct request) ─────────────────────
  // Each phase's real decision feeds forward into every phase after it — like
  // a prompt building up turn by turn. Replaces the three one-off preview
  // blocks that used to live on classify/disclosure/resolve individually
  // (each only showing its own single predecessor) with one accumulating
  // list, shown above Reference on every phase pill. Phases with no live
  // signal of their own (04 onward — none of those are wired to real data
  // yet, see file header) just carry the same trail forward unchanged rather
  // than showing nothing new, which is an honest reflection of what's
  // actually live vs. still a placeholder.
  const CAOS_TRAIL_ORDER = [
    'classify', 'disclosure', 'resolve', 'retrieve', 'formula', 'optimizer',
    'gate', 'strategy-routing', 'generation', 'post-hoc-verification', 'feedback-loop',
  ]
  const trailEntries: { sourcePhase: string; text: string; isQuote?: boolean }[] = []
  if (analysis?.analysis?.what) {
    trailEntries.push({ sourcePhase: 'classify', text: analysis.analysis.what, isQuote: true })
  }
  if (disclosureStage?.disclosure) {
    const agentId = analysis?.analysis?.targetAgents?.primary ?? 'the agent'
    const skillNames = disclosureStage.disclosure.active.map((a) => a.name)
    trailEntries.push({
      sourcePhase: 'disclosure',
      text: skillNames.length > 0 ? `${agentId} uses ${skillNames.join(', ')}` : `${agentId} — no matched skill`,
    })
  }
  const resolveTrailStage = phaseStages('resolve').find((s) => s.id === 'venture-context')
  if (resolveTrailStage) {
    trailEntries.push({
      sourcePhase: 'resolve',
      text: resolveTrailStage.detail ? `${resolveTrailStage.label} · ${resolveTrailStage.detail}` : resolveTrailStage.label,
    })
  }
  function trailFor(phaseId: string) {
    const idx = CAOS_TRAIL_ORDER.indexOf(phaseId)
    if (idx === -1) return []
    return trailEntries.filter((e) => CAOS_TRAIL_ORDER.indexOf(e.sourcePhase) <= idx)
  }

  // Folds the old standalone sections' real stages into the CAOS phase they
  // actually belong to (see file header). Phases not listed here have no
  // extra live source beyond their own `kind`. RESOLVE used to fold in a
  // separate 'context' kind here — retired 2026-08-11: that event bundled
  // agent-skills data (now phase 02's own signal) with venture-memory data;
  // venture memory now emits directly as kind:'resolve' (venture.context in
  // stream/route.ts), so it needs no folding — phaseStages('resolve') finds
  // it on its own, same as any other phase's live stage.
  const extraForPhase: Record<string, PipelineStage[]> = {
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
      <span className={`shrink-0 rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest ${cls}`}>
        {children}
      </span>
    )
  }

  // ── Flow row (numbered stage + trailing chip) — reused for phase 01's ────
  // rich input-analysis breakdown (tier/relation/route/must-haves).
  function FlowRow({ n, label, chip, children }: { n: string; label: string; chip?: React.ReactNode; children?: React.ReactNode }) {
    return (
      <div>
        <div className="flex items-center gap-2 text-[11.5px]">
          <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-400/80" />
          <span className="font-mono text-[10px] text-[var(--chat-text-faint)]">{n}</span>
          <span className="text-[var(--chat-text-dim)]">{label}</span>
          {chip && <span className="ml-auto">{chip}</span>}
        </div>
        {children && <div className="ml-[20px] mt-1 space-y-1 border-l border-[var(--chat-hairline-soft)] pl-3">{children}</div>}
      </div>
    )
  }

  // ── Reference lines — renders a phase/gate's static process[] array.
  // Lines that are a concrete illustrative example (start with a quote
  // mark, e.g. '"acquire + $2M" → strategic_analysis → marcus') are styled
  // distinctly from the abstract mechanism description, so reference copy
  // can never be mistaken for this turn's real output (see Decision below,
  // which is the only section fed by live events). ───────────────────────
  function ReferenceLines({ lines, size = 'md' }: { lines: string[]; size?: 'md' | 'sm' }) {
    const base = size === 'sm' ? 'text-[10.5px]' : 'text-[11.5px]'
    // Examples render a size step down and indented, so they read as a
    // caption nested under the mechanism line above them, not a second
    // heading of equal weight.
    const sub = size === 'sm' ? 'text-[9px]' : 'text-[10px]'
    return (
      <>
        {lines.map((line, i) => {
          const t = line.trim()
          // Two conventions exist in the data: a quoted example ('"acquire +
          // $2M" → …', the older phases) or a line already spelled out
          // starting with "e.g." (phase 01, written 2026-08-11). The old
          // check only matched the first, so phase 01's e.g. lines fell
          // through to the mechanism-line branch and rendered identically
          // bold/full-size — that's the bug the DOM inspection caught.
          const hasEgPrefix = /^e\.g\.\s*/i.test(t)
          const isExample = hasEgPrefix || t.startsWith('"')
          const display = hasEgPrefix ? t : isExample ? `e.g. ${t}` : line
          return (
            <div
              key={i}
              className={
                isExample
                  ? `${sub} ml-2 leading-snug italic font-normal text-[var(--chat-text-faint)] opacity-60`
                  : `${base} leading-snug font-semibold text-[var(--chat-text-dim)]`
              }
            >
              {display}
            </div>
          )
        })}
      </>
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
    defaultOpen,
    children,
  }: {
    id: string
    isLive: boolean
    n: string
    title: string
    file?: string
    /** Opens this pill before the user has clicked it, if true (e.g. it has
     * live data). An explicit user toggle always overrides this afterward. */
    defaultOpen?: boolean
    children: React.ReactNode
  }) {
    const open = expanded[id] ?? defaultOpen ?? false
    return (
      <div
        className={`overflow-hidden border border-[var(--chat-hairline-soft)] transition-[border-radius] duration-200 ${
          open ? 'rounded-xl' : 'rounded-full'
        }`}
      >
        <button onClick={() => toggle(id)} className="flex w-full items-center gap-2 px-3.5 py-2 text-left">
          <span className={`h-2 w-2 shrink-0 rounded-full ${isLive ? 'bg-emerald-400/80' : 'bg-white/20'}`} />
          <span className="font-mono text-[10px] text-[var(--chat-text-faint)]">{n}</span>
          <span className="truncate text-[12.5px] font-semibold text-[var(--chat-text-dim)]">{title}</span>
          <span className="ml-auto flex shrink-0 items-center gap-2">
            {open && file && <span className="hidden truncate font-mono text-[9.5px] text-[var(--chat-text-faint)] sm:inline">{file}</span>}
            {open ? (
              <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--chat-text-faint)]" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-[var(--chat-text-faint)]" />
            )}
          </span>
        </button>
        <div className={`grid transition-[grid-template-rows] duration-200 ease-out ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
          <div className="overflow-hidden">
            <div className="space-y-2.5 px-3.5 pb-3 pt-1">{children}</div>
          </div>
        </div>
      </div>
    )
  }

  // ── Sub — the always-visible Process / Decision label once a pill is open */
  function Sub({ label, children }: { label: string; children: React.ReactNode }) {
    return (
      <div>
        <div className="text-[10px] font-semibold uppercase tracking-wider text-[var(--chat-text-faint)]">{label}</div>
        <div className="mt-1 space-y-1 border-l border-[var(--chat-hairline-soft)] pl-2.5">{children}</div>
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
    const hasRichDisclosure = phase.id === 'disclosure' && !!disclosureStage?.disclosure
    const isLive = hasRichClassify || hasRichDisclosure || sorted.length > 0

    return (
      <PillExpand id={`caos-phase-${phase.id}`} isLive={isLive} defaultOpen={isLive} n={phase.n} title={phase.title} file={phase.file}>
        {/* Decision trail — every real decision from this phase and every
            phase before it, so Reference never floats disconnected from
            what actually happened upstream (2026-08-12, see trailFor()). */}
        {(() => {
          const trail = trailFor(phase.id)
          if (trail.length === 0) return null
          return (
            <div className="mb-2 space-y-1 rounded-r-md border-l-2 border-[var(--chat-accent)]/40 bg-[var(--chat-accent)]/[0.06] py-1.5 pl-2.5 pr-2">
              {trail.map((e, i) => (
                <div key={i} className="truncate text-[10px] leading-snug text-[var(--chat-text-faint)]">
                  {e.isQuote ? (
                    <span className="italic text-[var(--chat-text-dim)]">&quot;{e.text}&quot;</span>
                  ) : (
                    <>
                      <span className="text-[var(--chat-text-faint)]">→ </span>
                      {e.text}
                    </>
                  )}
                </div>
              ))}
            </div>
          )
        })()}

        <Sub label="Reference">
          <ReferenceLines lines={phase.process} />
        </Sub>

        <Sub label="Decision">
          {hasRichDisclosure ? (
            (() => {
              // Which agent this disclosure ran for — same targetAgents.primary
              // CLASSIFY's 'handled by' chip already shows (phase 02 always
              // matches skills against the one agent phase 01 routed to, see
              // effectiveAgentId in stream/route.ts). Not carried on the
              // disclosure payload itself, so read it off the shared analyze
              // stage — both stages describe the same turn.
              const agentId = analysis?.analysis?.targetAgents?.primary ?? 'the agent'
              const skillNames = disclosureStage!.disclosure!.active.map((a) => a.name)
              return (
                <div className="space-y-2">
                  <FlowRow n="a" label="agent" chip={<Chip tone="accent">{agentId}</Chip>} />
                  <FlowRow
                    n="b"
                    label="active skills"
                    chip={
                      disclosureStage!.disclosure!.active.length === 0 ? (
                        <Chip tone="neutral">none matched</Chip>
                      ) : undefined
                    }
                  >
                    {disclosureStage!.disclosure!.active.length > 0 && (
                      <div className="space-y-1.5">
                        {disclosureStage!.disclosure!.active.map((a) => (
                          <div key={a.name}>
                            <span className="text-[11.5px] font-medium text-[var(--chat-text-dim)]">{a.name}</span>
                            <div className="text-[10px] leading-snug text-[var(--chat-text-faint)]">{a.reason}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </FlowRow>
                  <FlowRow
                    n="c"
                    label="stayed summary-only"
                    chip={<Chip tone="neutral">{disclosureStage!.disclosure!.inactiveCount} of {disclosureStage!.disclosure!.totalSkills}</Chip>}
                  />
                  {/* Outcome — the actual decision, named: which agent, which
                      skill(s), so this isn't just an abstract savings stat
                      (2026-08-12 per direct request). */}
                  <div className="border-t border-[var(--chat-hairline-soft)] pt-2 text-[11.5px] leading-snug text-[var(--chat-text-dim)]">
                    <span className="text-[var(--chat-text-faint)]">→ </span>
                    {disclosureStage!.disclosure!.totalSkills === 0
                      ? `${agentId} has no skills defined yet — answers from general knowledge.`
                      : skillNames.length === 0
                        ? `${agentId} had no matching skill for this message — answers from general knowledge, ${disclosureStage!.disclosure!.savingsPct}% context saved.`
                        : `${agentId} uses ${skillNames.join(', ')} to handle this — ${disclosureStage!.disclosure!.savingsPct}% context saved, only ${disclosureStage!.disclosure!.active.length} of ${disclosureStage!.disclosure!.totalSkills} skills loaded full.`}
                  </div>
                </div>
              )
            })()
          ) : hasRichClassify ? (
            <div className="space-y-2">
              <FlowRow
                n="a"
                label="message type"
                chip={<Chip tone={analysis!.analysis!.tier === 'build' ? 'accent' : 'neutral'}>{analysis!.analysis!.tier}</Chip>}
              />
              <FlowRow
                n="b"
                label="relates to"
                chip={<Chip tone={analysis!.analysis!.relation === 'venture' ? 'accent' : 'neutral'}>{analysis!.analysis!.relation === 'venture' ? ventureLabel : 'general'}</Chip>}
              />
              {analysis!.analysis!.targetAgents && (() => {
                const { primary, team, reason } = analysis!.analysis!.targetAgents!
                // team always includes primary (see routing.ts) — only show
                // teammates that add information beyond the primary chip,
                // instead of rendering the same agent twice (e.g. "META META").
                const extraTeam = team.filter((t) => t !== primary)
                return (
                  <FlowRow
                    n="c"
                    label="handled by"
                    chip={
                      <span className="flex items-center gap-1">
                        <Chip tone="accent">{primary}</Chip>
                        {extraTeam.map((t) => (
                          <Chip key={t} tone="neutral">{t}</Chip>
                        ))}
                      </span>
                    }
                  >
                    {reason && <div className="text-[10.5px] leading-snug text-[var(--chat-text-faint)]">{reason}</div>}
                  </FlowRow>
                )
              })()}
              {/* d — the actual input-analysis output for this message: the
                  tier-specific fields analyzeMessage() extracted (info →
                  type/subject/scope/expected/format, build → why/how/end
                  result/desired output), not just the a/b/c summary chips
                  above. 'what' is already shown as the italic preview at the
                  top, so it's excluded here to avoid repeating it. Added
                  2026-08-12 per direct request — this data always existed
                  (it's what gets sent to Hermes as inputAnalysis context)
                  but was never surfaced in the HUD before. */}
              {(() => {
                const a = analysis!.analysis!
                const rows: [string, string | undefined][] =
                  a.tier === 'build'
                    ? [['why', a.why], ['how', a.how], ['end result', a.endResult], ['desired output', a.desiredOutput]]
                    : a.tier === 'info'
                      ? [['type', a.type], ['subject', a.subject], ['scope', a.scope], ['expected', a.expected], ['format', a.format]]
                      : []
                const filled = rows.filter(([, v]) => v && v !== 'not specified')
                if (filled.length === 0) return null
                return (
                  <FlowRow n="d" label="input-analysis output">
                    <div className="space-y-1">
                      {filled.map(([k, v]) => (
                        <div key={k} className="text-[10.5px] leading-snug">
                          <span className="text-[var(--chat-text-faint)]">{k}: </span>
                          <span className="text-[var(--chat-text-dim)]">{v}</span>
                        </div>
                      ))}
                    </div>
                  </FlowRow>
                )
              })()}
              {analysis!.analysis!.mustHaves && analysis!.analysis!.mustHaves!.length > 0 && (
                <FlowRow n="e" label="success checklist">
                  {analysis!.analysis!.mustHaves!.map((mh, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11.5px]">
                      <Check className="mt-px h-3 w-3 shrink-0 text-emerald-400" />
                      <span className="text-[var(--chat-text-dim)]">{mh}</span>
                    </div>
                  ))}
                </FlowRow>
              )}

              {/* Outcome — the phase's actual verdict, in one line. Without
                  this the block just trails off after "handled by X" and
                  the reader has to infer what a/b/c actually add up to. */}
              <div className="border-t border-[var(--chat-hairline-soft)] pt-2 text-[11.5px] leading-snug text-[var(--chat-text-dim)]">
                <span className="text-[var(--chat-text-faint)]">→ </span>
                {analysis!.analysis!.tier === 'generic'
                  ? 'small talk / acknowledgment, answered directly, no pipeline run.'
                  : analysis!.analysis!.tier === 'info'
                    ? `info request, ${analysis!.analysis!.targetAgents?.primary ?? 'the agent'} answers directly, no build work item created.`
                    : `build request, routed to ${analysis!.analysis!.targetAgents?.primary ?? 'the agent'}, the checklist above defines done.`}
              </div>
            </div>
          ) : sorted.length > 0 ? (
            <div className="space-y-1.5">
              {sorted.map((s, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[11.5px]">
                  <span
                    className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                      s.status === 'error' ? 'bg-red-400/90' : s.status === 'active' ? 'animate-pulse bg-[var(--chat-accent)]' : 'bg-emerald-400/80'
                    }`}
                  />
                  <span className="text-[var(--chat-text-dim)]">{s.label}</span>
                  {s.detail && <span className="ml-auto truncate text-[10px] text-[var(--chat-text-faint)]">{s.detail}</span>}
                </div>
              ))}
              {phase.id === 'generation' && agentRows.length > 0 && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex -space-x-1.5">
                    {agentRows.map((a) => (
                      <span key={a!.id} className="rounded-full border border-[#0a0a0f]" title={a!.name}>
                        <AgentAvatar id={a!.id} name={a!.name} size={20} />
                      </span>
                    ))}
                  </div>
                  <span className="text-[10.5px] italic text-[var(--chat-text-dim)]">{thinking ?? 'working'}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-[11.5px] italic leading-snug text-[var(--chat-text-faint)]">{phase.decisionFallback}</div>
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
                <PillExpand key={g.id} id={`caos-gate-${g.id}`} isLive={!!gLive} defaultOpen={!!gLive} n={String(g.n)} title={g.title}>
                  <Sub label="Reference">
                    <ReferenceLines lines={g.process} size="sm" />
                  </Sub>
                  <Sub label="Decision">
                    <div className={`text-[10.5px] leading-snug ${gLive ? 'text-[var(--chat-text-dim)]' : 'italic text-[var(--chat-text-faint)]'}`}>
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
      <div className="border-b border-[var(--chat-hairline-soft)] px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <span className="text-[11.5px] font-semibold uppercase tracking-widest text-[var(--chat-text-dim)]">CAOS</span>
          {!disabled && (
            <span className="rounded-full border border-[var(--chat-hairline-soft)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-[var(--chat-text-faint)]">{source}</span>
          )}
        </div>
        <div className="mt-1 text-[10.5px] italic text-[var(--chat-text-faint)]">Context-Aware Orchestration System</div>
      </div>

      <div className="chat-scroll flex-1 space-y-2 overflow-y-auto px-3 py-3.5">
        {/* Structure is always visible, turn or no turn — each phase's own
            Decision dropdown already says "awaiting …" / "not emitted yet"
            when there's nothing live, so a separate blocking placeholder
            that hid all 12 phases was a bug, not a feature (2026-08-11). */}
        {disabled && (
          <div className="pb-1.5 text-center">
            <div className="text-[11.5px] text-[var(--chat-text-faint)]">Waiting for a task, send a message to start</div>
          </div>
        )}

        <div className="space-y-2">
          {CAOS_PHASES.slice(0, 7).map((phase) => (
            <CaosPhaseBlock key={phase.id} phase={phase} />
          ))}

          <div className="my-1.5 flex items-center gap-2 px-0.5">
            <div className="h-px flex-1 bg-[var(--chat-hairline-soft)]" />
            <span className="text-[9px] uppercase tracking-widest text-[var(--chat-text-faint)]">CAOS boundary · §3</span>
            <div className="h-px flex-1 bg-[var(--chat-hairline-soft)]" />
          </div>

          {CAOS_PHASES.slice(7).map((phase) => (
            <CaosPhaseBlock key={phase.id} phase={phase} />
          ))}

          {/* Phase 12 — held, static bottom view only (not per-turn, so it
              never expands — no click target, unlike every other pill above,
              but same resting pill shape for visual consistency). */}
          <div className="overflow-hidden rounded-full border border-dashed border-[var(--chat-hairline-soft)] px-3.5 py-2 opacity-70">
            <div className="flex items-center gap-2 text-[12px]">
              <span className="font-mono text-[10px] text-[var(--chat-text-faint)]">{CAOS_FIELD_MONITORING.n}</span>
              <span className="truncate font-semibold text-[var(--chat-text-dim)]">{CAOS_FIELD_MONITORING.title}</span>
            </div>
            <div className="mt-1 text-[10.5px] italic leading-snug text-[var(--chat-text-faint)]">{CAOS_FIELD_MONITORING.note}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
