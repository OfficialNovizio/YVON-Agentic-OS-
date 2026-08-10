// PipelineCards — the real pipeline views for /software-pipeline (TS-030).
// Replaces the fake venture cards with 5 real pipeline cards:
//   Input Analysis · Context Injection · CAOS · RAG · Master (all together)
// Each shows its structural flow + live status from the most recent turn's
// events (fetched from /api/chat/events via the latest message correlation),
// expandable to details. All real — no fake progress bars.
'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface StageRow {
  id: string
  kind: string
  label: string
  detail?: string
  status: 'active' | 'done' | 'error' | 'pending'
}

const FLOWS: Record<string, { title: string; steps: string[]; desc: string }> = {
  input: {
    title: 'Input Analysis',
    steps: ['Tier', 'Relation', 'What/Why/How', 'End Result'],
    desc: 'Classifies generic/info/build + venture/general, extracts the intent fields.',
  },
  context: {
    title: 'Context Injection',
    steps: ['Agent skills', 'Venture memory', 'Inject'],
    desc: 'Agent identity + skills (yvon-os) or venture memory (other ventures) injected into the turn.',
  },
  caos: {
    title: 'CAOS',
    steps: ['Classify', 'Resolve', 'Retrieve', 'Gate'],
    desc: 'Context-Aware Orchestration: CLASSIFY → RESOLVE → RETRIEVE → GATE + the 5-gate harness.',
  },
  rag: {
    title: 'RAG',
    steps: ['Rewrite', 'Retrieve', 'Re-rank', 'Harness'],
    desc: 'Query rewrite → hybrid retrieval → cross-encoder re-rank → harness gates → injection.',
  },
  master: {
    title: 'Master Pipeline',
    steps: ['Input', 'Context', 'CAOS', 'RAG', 'Execution', 'Recording'],
    desc: 'The full pipeline — all stages working together, end to end.',
  },
}

export function PipelineCards() {
  const [stages, setStages] = useState<StageRow[]>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const [hasLive, setHasLive] = useState(false)

  // Fetch the most recent turn's pipeline stages (real data).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/chat/messages?roomId=')
        // fall back silently — real data may not be available pre-migration
      } catch {}
      try {
        const events = await fetch('/api/chat/events?correlation=latest').catch(() => null)
        if (events?.ok) {
          const d = (await events.json()) as { events: StageRow[] }
          if (!cancelled && Array.isArray(d.events)) {
            setStages(d.events)
            setHasLive(true)
          }
        }
      } catch {
        // no live data — cards still show the structural flow
      }
    })()
    return () => { cancelled = true }
  }, [])

  // Map real stages onto each card's steps (status by kind).
  const statusFor = (kind: string): 'active' | 'done' | 'error' | 'pending' => {
    const s = stages.find((x) => x.kind === kind)
    return s?.status ?? 'pending'
  }

  // Master is the centerpiece — first, and selected (system-blue) by default.
  const [selected, setSelected] = useState<string>('master')

  const card = (key: string) => {
    const f = FLOWS[key]
    const open = !!expanded[key]
    const isMaster = key === 'master'
    const isSelected = selected === key
    const liveCount = isMaster
      ? stages.filter((s) => s.status === 'done').length
      : stages.filter((s) => f.steps.some((st) => st.toLowerCase() === s.kind)).length
    return (
      // Whole card selects (persistent); a dedicated chevron toggles expand
      // (persistent) — clicking away and back keeps the expanded state.
      <div
        key={key}
        className={`cursor-pointer transition ${isSelected
          ? 'rounded-2xl border border-transparent bg-[var(--ws-accent)] p-3.5 text-white shadow-lg'
          : 'glass-card glass-card-hover rounded-2xl p-3.5'}`}
        onClick={() => setSelected(key)}
      >
        {/* Title + chevron — compact */}
        <div className="flex items-center justify-between gap-2">
          <h3 className={`truncate text-[13px] font-semibold ${isSelected ? 'text-white' : 'text-on-surface'}`}>{f.title}</h3>
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); setExpanded((p) => ({ ...p, [key]: !p[key] })) }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpanded((p) => ({ ...p, [key]: !p[key] })) } }}
            className={`shrink-0 ${isSelected ? 'text-white/70' : 'text-on-surface-variant/40'}`}
          >
            {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </span>
        </div>
        <p className={`mt-0.5 line-clamp-2 text-[10.5px] leading-snug ${isSelected ? 'text-white/80' : 'text-on-surface-variant/60'}`}>{f.desc}</p>

        {/* Step chips (structural flow) — compact, inline (not vertical bullets) */}
        <div className="mt-2 flex flex-wrap gap-1">
          {f.steps.map((s) => {
            const st = statusFor(s.toLowerCase())
            return (
              <span
                key={s}
                className={`rounded border px-1 py-px font-mono text-[9px] ${
                  isSelected
                    ? st === 'done' ? 'border-white/50 bg-white/20 text-white'
                      : st === 'active' ? 'border-white bg-white/25 text-white'
                      : st === 'error' ? 'border-white/60 bg-white/20 text-white'
                      : 'border-white/30 bg-white/10 text-white/90'
                    : st === 'done' ? 'border-emerald-400/30 bg-emerald-400/5 text-emerald-300/90'
                      : st === 'active' ? 'border-[var(--ws-accent)]/40 bg-[var(--ws-accent)]/10 text-[var(--ws-accent)]'
                      : st === 'error' ? 'border-red-400/30 bg-red-400/5 text-red-300/90'
                      : 'border-white/10 bg-white/[0.02] text-on-surface-variant/50'
                }`}
              >
                {s}
              </span>
            )
          })}
        </div>

        {hasLive && (
          <p className={`mt-1.5 text-[9.5px] ${isSelected ? 'text-white/70' : 'text-on-surface-variant/50'}`}>
            {key === 'master' ? `${liveCount} stages completed` : `${liveCount} stage(s) seen`}
          </p>
        )}

        {/* Expanded detail — COMPACT inline (status dots beside step names,
            wrapped, not a vertical bullet list) */}
        {open && (
          <div className={`mt-2 flex flex-wrap gap-x-3 gap-y-1 border-t pt-1.5 ${isSelected ? 'border-white/30' : 'border-white/10'}`}>
            {f.steps.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5 text-[10px]">
                <span className={`h-1.5 w-1.5 rounded-full ${statusFor(s.toLowerCase()) === 'done' ? 'bg-emerald-300' : statusFor(s.toLowerCase()) === 'active' ? 'animate-pulse bg-white' : statusFor(s.toLowerCase()) === 'error' ? 'bg-red-300' : isSelected ? 'bg-white/40' : 'bg-white/20'}`} />
                <span className={isSelected ? 'text-white' : 'text-on-surface-variant'}>{s}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {card('master')}
      {card('input')}
      {card('context')}
      {card('caos')}
      {card('rag')}
    </div>
  )
}
