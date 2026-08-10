// lib/events — the live activity seam.
//
// The dashboard is on Vercel, which CANNOT hold a live connection (serverless
// timeouts — architecture §10.1). So the browser subscribes DIRECTLY to Supabase
// Realtime and Vercel is never in the live path; the VPS only writes outbound.
//
//   VPS (Hermes) --insert--> Supabase --realtime--> browser
//   Vercel ----------------serves the page--------> browser
//
// Everything is behind one interface so the transport can change (SSE from the
// VPS, polling, a different broker) without touching any component.

/** A run lifecycle event, flattened from the `events` table (architecture §5.4). */
export interface RunEvent {
  /** agent id — slug(dept)-name, e.g. 'engineering-mia'. Matches structure.json. */
  actor: string
  /** 'yvon-os' | any Settings-added venture (§12.1). */
  contextId: string
  /** which runtime produced it: 'hermes' | 'claude-code' | 'yvon'. */
  source: string
  kind: 'run.started' | 'run.completed' | 'run.failed' | string
  ts: number
  payload?: Record<string, unknown>
}

export interface EventSource {
  /** Returns an unsubscribe function. */
  subscribe(cb: (e: RunEvent) => void): () => void
}

export type Status = 'idle' | 'active' | 'error'

/** How long a completed run keeps glowing before fading (§12.2 — decay, not on/off). */
export const DECAY_MS = 12_000

/**
 * Fold an event into a status map. Keyed by agent id; the caller bubbles up to
 * departments (§12.2 — a collapsed department inherits the max of its children).
 */
export function applyEvent(prev: Record<string, Status>, e: RunEvent): Record<string, Status> {
  if (!e.actor) return prev
  if (e.kind === 'run.started') return { ...prev, [e.actor]: 'active' }
  if (e.kind === 'run.failed') return { ...prev, [e.actor]: 'error' }
  // run.completed keeps 'active' — the caller schedules the fade to idle after DECAY_MS
  return prev
}

/** Department status = the strongest state among its agents (error > active > idle). */
export function bubbleUp(
  status: Record<string, Status>,
  departments: { id: string; agents: { id: string }[] }[],
): Record<string, Status> {
  const out = { ...status }
  for (const d of departments) {
    let s: Status = 'idle'
    for (const a of d.agents) {
      const as = status[a.id]
      if (as === 'error') { s = 'error'; break }
      if (as === 'active') s = 'active'
    }
    out[d.id] = s
  }
  return out
}
