// PipelineBoard — the pipeline selector + kanban board for /software-pipeline (TS-030 · design C).
// The FLOW strip on top is a CLICKABLE pipeline switcher: Input Analysis ·
// Context Injection · CAOS · RAG · Master. Clicking one swaps the board below
// to that pipeline's stages as kanban columns — the same visual language as
// the software-factory board (colored dot + title + count, glass cards).
//
// Input Analysis is fed by the latest turn's persisted input.analysis event
// (rooms → latest message correlation → events → stageFromEventRow). The other
// pipelines have no recorded events yet, so their boards show the honest
// structural flow with "waiting for a turn…" — nothing fabricated.
'use client'

import { Fragment, useEffect, useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { stageFromEventRow, type PipelineStage } from '@/lib/pipeline'
import type { TurnEvent } from '@/app/api/chat/events/route'

// ── The five pipelines, and each one's stages ─────────────────────────────
const PIPELINES = [
  { key: 'input', title: 'Input Analysis', dot: '#4c9aff' },
  { key: 'context', title: 'Context Injection', dot: '#abc7ff' },
  { key: 'caos', title: 'CAOS', dot: '#4ade80' },
  { key: 'rag', title: 'RAG', dot: '#ffd93d' },
  { key: 'master', title: 'Master', dot: '#c678dd' },
] as const
type PipelineKey = (typeof PIPELINES)[number]['key']

/** Each pipeline's stages — shown as columns in the board below. */
const PIPELINE_STAGES: Record<PipelineKey, { title: string; dot: string }[]> = {
  input: [
    { title: 'Classify', dot: '#ffb693' },
    { title: 'Relation', dot: '#abc7ff' },
    { title: 'Extract', dot: '#4ade80' },
    { title: 'Route', dot: '#ffd93d' },
    { title: 'Must-haves', dot: '#c678dd' },
  ],
  context: [
    { title: 'Agent skills', dot: '#abc7ff' },
    { title: 'Venture memory', dot: '#4c9aff' },
    { title: 'Inject', dot: '#4ade80' },
  ],
  caos: [
    { title: 'Classify', dot: '#ffb693' },
    { title: 'Resolve', dot: '#abc7ff' },
    { title: 'Retrieve', dot: '#4ade80' },
    { title: 'Gate', dot: '#ffd93d' },
  ],
  rag: [
    { title: 'Rewrite', dot: '#ffb693' },
    { title: 'Retrieve', dot: '#4ade80' },
    { title: 'Re-rank', dot: '#ffd93d' },
    { title: 'Harness', dot: '#c678dd' },
  ],
  master: [
    { title: 'Input', dot: '#4c9aff' },
    { title: 'Context', dot: '#abc7ff' },
    { title: 'CAOS', dot: '#4ade80' },
    { title: 'RAG', dot: '#ffd93d' },
    { title: 'Execution', dot: '#ffb693' },
    { title: 'Recording', dot: '#c678dd' },
  ],
}

function Chip({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={`rounded-full border px-2 py-px font-mono text-[10px] uppercase tracking-widest ${
        accent
          ? 'border-[var(--ws-accent)]/40 bg-[var(--ws-accent)]/10 text-[var(--ws-accent)]'
          : 'border-white/15 bg-white/[0.03] text-on-surface-variant'
      }`}
    >
      {children}
    </span>
  )
}

function FieldCard({ k, children }: { k: string; children?: React.ReactNode }) {
  return (
    <div className="kanban-card">
      <div className="font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/50">{k}</div>
      {children && <div className="mt-1.5">{children}</div>}
    </div>
  )
}

function WaitingCard() {
  return (
    <div className="kanban-card opacity-50">
      <p className="py-1 text-center text-[12px] italic text-on-surface-variant">waiting for a turn…</p>
    </div>
  )
}

export function PipelineBoard() {
  const [stages, setStages] = useState<PipelineStage[]>([])
  const [hasData, setHasData] = useState(false)
  const [selected, setSelected] = useState<PipelineKey>('input')

  // Fetch the latest turn's pipeline stages — rooms → latest message with a
  // correlation → that turn's events → normalize (same shape as the chat HUD).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const roomsRes = await fetch('/api/chat/rooms')
        if (!roomsRes.ok) return
        const rooms = (await roomsRes.json()) as { rooms?: { id: string }[] }
        const roomId = rooms.rooms?.[0]?.id
        if (!roomId) return
        const msgsRes = await fetch(`/api/chat/messages?roomId=${roomId}`)
        if (!msgsRes.ok) return
        const msgs = (await msgsRes.json()) as { messages?: { correlation: string | null; createdAt: string }[] }
        const latest = (msgs.messages ?? [])
          .filter((m) => m.correlation)
          .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))[0]
        if (!latest?.correlation) return
        const evRes = await fetch(`/api/chat/events?correlation=${latest.correlation}`)
        if (!evRes.ok) return
        const d = (await evRes.json()) as { events: TurnEvent[] }
        const mapped = (d.events ?? [])
          .map((e) => stageFromEventRow(e))
          .filter((s): s is PipelineStage => s !== null)
        if (!cancelled && mapped.length > 0) {
          setStages(mapped)
          setHasData(true)
        }
      } catch {
        // no recorded turn — boards show the honest waiting state
      }
    })()
    return () => { cancelled = true }
  }, [])

  // The analyze stage carries the structured input-analysis payload (TS-030).
  const analysis = stages.find((s) => s.kind === 'analyze')?.analysis

  const fields =
    analysis && (analysis.tier === 'info'
      ? ([
          ['type', analysis.type],
          ['subject', analysis.subject],
          ['scope', analysis.scope],
          ['expected', analysis.expected],
          ['format', analysis.format],
        ] as const)
      : ([
          ['what', analysis.what],
          ['why', analysis.why],
          ['how', analysis.how],
          ['end result', analysis.endResult],
          ['desired output', analysis.desiredOutput],
        ] as const))
  const shownFields = fields ? fields.filter(([, v]) => v && v !== 'not specified') : []

  // Render one column's cards for the currently selected pipeline.
  const columnCards = (stageTitle: string): { cards: React.ReactNode; count: number } => {
    // Input Analysis — the one pipeline with real recorded data.
    if (selected === 'input' && analysis) {
      switch (stageTitle.toLowerCase()) {
        case 'classify':
          return {
            count: 1,
            cards: (
              <FieldCard k="Tier">
                <Chip accent={analysis.tier === 'build'}>{analysis.tier}</Chip>
              </FieldCard>
            ),
          }
        case 'relation':
          return {
            count: 1,
            cards: (
              <FieldCard k="Relation">
                <Chip accent={analysis.relation === 'venture'}>{analysis.relation}</Chip>
              </FieldCard>
            ),
          }
        case 'extract':
          return shownFields.length > 0
            ? {
                count: shownFields.length,
                cards: shownFields.map(([k, v]) => (
                  <FieldCard key={k} k={k}>
                    <p className="text-[12px] leading-snug text-on-surface">{String(v)}</p>
                  </FieldCard>
                )),
              }
            : { count: 0, cards: <FieldCard k="Fields"><p className="text-[11px] italic text-on-surface-variant">not specified</p></FieldCard> }
        case 'route':
          return analysis.targetAgents
            ? {
                count: 1,
                cards: (
                  <div className="space-y-2.5">
                    <FieldCard k="Primary agent">
                      <Chip accent>{analysis.targetAgents.primary}</Chip>
                    </FieldCard>
                    <FieldCard k="Team">
                      <span className="flex flex-wrap gap-1">
                        {analysis.targetAgents.team.map((t) => (
                          <Chip key={t}>{t}</Chip>
                        ))}
                      </span>
                    </FieldCard>
                    {analysis.targetAgents.reason && (
                      <p className="px-1 text-[11px] leading-snug text-on-surface-variant/80">{analysis.targetAgents.reason}</p>
                    )}
                  </div>
                ),
              }
            : { count: 0, cards: <FieldCard k="Plan"><p className="text-[11px] italic text-on-surface-variant">no agent plan</p></FieldCard> }
        case 'must-haves':
        case 'musthaves':
          return analysis.mustHaves && analysis.mustHaves.length > 0
            ? {
                count: analysis.mustHaves.length,
                cards: (
                  <div className="kanban-card space-y-1.5">
                    {analysis.mustHaves.map((mh, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        <span className="text-[12px] leading-snug text-on-surface">{mh}</span>
                      </div>
                    ))}
                  </div>
                ),
              }
            : { count: 0, cards: <FieldCard k="Checklist"><p className="text-[11px] italic text-on-surface-variant">—</p></FieldCard> }
      }
    }
    // Other pipelines — no recorded events yet: honest waiting state.
    return { cards: <WaitingCard />, count: 0 }
  }

  const stagesForSelected = PIPELINE_STAGES[selected]

  return (
    <div className="mb-5">
      {/* Section header — last-run summary (honest when nothing recorded yet) */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-on-surface">Software Pipelines</h3>
        {hasData && selected === 'input' && analysis ? (
          <span className="font-mono text-[10px] text-on-surface-variant/60">
            last turn — {analysis.tier} · {analysis.relation}
            {analysis.what ? ` · "${analysis.what.slice(0, 44)}${analysis.what.length > 44 ? '…' : ''}"` : ''}
          </span>
        ) : (
          <span className="font-mono text-[10px] text-on-surface-variant/60">
            {hasData ? 'latest turn' : 'waiting for a turn…'}
          </span>
        )}
      </div>

      {/* FLOW strip — CLICKABLE pipeline selector (selects which board shows) */}
      <div>
        <div className="mb-1.5 font-mono text-[9px] uppercase tracking-widest text-on-surface-variant/50">Flow</div>
        <div className="flex flex-wrap items-center gap-1.5">
          {PIPELINES.map((p, i) => {
            const active = selected === p.key
            return (
              <Fragment key={p.key}>
                <button
                  onClick={() => setSelected(p.key)}
                  className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] transition ${
                    active
                      ? 'border-[var(--ws-accent)]/50 bg-[var(--ws-accent)]/15 text-[var(--ws-accent)]'
                      : 'border-white/10 bg-white/[0.02] text-on-surface-variant/60 hover:border-white/20 hover:text-on-surface'
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-[var(--ws-accent)]' : 'bg-white/20'}`} />
                  {p.title}
                </button>
                {i < PIPELINES.length - 1 && <ChevronRight size={12} className="shrink-0 text-on-surface-variant/30" />}
              </Fragment>
            )
          })}
        </div>
      </div>

      {/* Kanban columns — the SELECTED pipeline's stages */}
      <div className="scroll-x mt-4 flex gap-3 overflow-x-auto pb-2">
        {stagesForSelected.map((s, i) => {
          const { cards, count } = columnCards(s.title)
          return (
            <div key={s.title} className="kanban-col">
              <div className="mb-2.5 flex items-center justify-between px-1">
                <span className="flex items-center gap-2 text-[13px] font-semibold text-on-surface">
                  <span className="h-2 w-2 rounded-full" style={{ background: s.dot }} />
                  {`0${i + 1} · ${s.title}`}
                </span>
                <span className="text-[11px] text-on-surface-variant">{count}</span>
              </div>
              <div className="space-y-2.5">{cards}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
