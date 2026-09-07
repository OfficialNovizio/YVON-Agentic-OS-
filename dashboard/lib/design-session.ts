// design-session.ts — the reference-build design session (re-engineer
// Phase 2, 2026-09-05). The record that carries a reference turn through the
// re-engineered pipeline: reference motion profile → user intent (clone vs
// adapt) → motion decision → build recipe → design.md → handoff to a task.
//
// Records live in store/design-sessions/{uuid}.json alongside cli/design.py's
// screenshot-to-code sessions (dir exists, gitignored, README documents the
// convention). design.py is NOT touched by this flow — its `kind` field is
// absent on its records; reference-build records always carry
// kind: "reference-build" so any reader can tell the two families apart.
// /api/design-preview validates uuid4 ids before building paths, so sharing
// the directory is safe.
//
// Disk-backed, prd-pending.ts pattern (this codebase's preference for real
// files over client state). States:
//   captured   — session created from a reference URL (motion probe pending/
//                running on the VPS; motionProfileUrl lands when the artifact
//                SSE frame flows back)
//   intent     — the user answered the clone-vs-adapt gate
//   motion     — the user picked a motion technique from the Options Brief
//   briefed    — design.md written
//   abandoned  — terminal
//
// Owner: dev · design-to-product re-engineer, 2026-09-05

import { randomUUID } from 'crypto'
import fs from 'fs'
import path from 'path'

const REPO_ROOT = path.resolve(process.cwd(), '..')
const SESSIONS_DIR = path.join(REPO_ROOT, 'store', 'design-sessions')

export type DesignSessionStatus =
  | 'captured'
  | 'intent'
  | 'motion'
  | 'briefed'
  | 'abandoned'

/** Reference taxonomy from the wrapper's motion probe (motion_probe.py). */
export type ReferenceTaxonomy =
  | 'static-editorial'
  | 'motion-marketing'
  | 'video-led'
  | 'immersive-3d'
  | 'dashboard'
  | 'unknown'

export interface ReferenceProfile {
  url: string
  taxonomy: ReferenceTaxonomy
  /** One-line why, from the probe's classifier. */
  taxonomyWhy?: string
  /** Published URL of motion-profile.md (hermes.yvon.in/artifacts/...) — set
   * when the artifact SSE frame flows back through the stream route. */
  motionProfileUrl?: string
  /** The probe's inline summary the agent saw (short, from the fence). */
  motionSummary?: string
}

export interface DesignIntent {
  /** identical = clone structure with our content · adapt = reinterpret. */
  mode: 'identical' | 'adapt'
  /** What the user wants changed (required when mode === 'adapt'). */
  changes?: string
  decidedAt: string
}

export interface MotionDecision {
  /** reference = reuse the reference's own motion assets (hybrid swap later)
   * · code = CSS/JS + GSAP/Lottie · video = scroll-scrubbed AI video ·
   * mixed = code motion + a video scrub for the hero/scroll narrative. */
  decision: 'reference' | 'code' | 'video' | 'mixed'
  notes?: string
  decidedAt: string
}

export interface DesignSession {
  id: string
  kind: 'reference-build'
  status: DesignSessionStatus
  createdAt: string
  updatedAt: string
  roomId: string
  venture?: string
  correlation?: string
  reference: ReferenceProfile
  intent?: DesignIntent
  motion?: MotionDecision
  /** Phase 4 — build recipe from lib/build-recipe.ts. Shape owned there. */
  recipe?: Record<string, unknown>
  /** Phase 4 — written by writeDesignMd below. */
  designMd?: { path: string }
  /** Append-only audit trail, task.py convention. */
  history: Array<{ at: string; event: string; detail?: string }>
}

function sessionPath(id: string): string {
  // ids are always our own randomUUID() output — never user input — but keep
  // the same discipline as prd-pending.ts anyway.
  if (!/^[a-f0-9-]{36}$/i.test(id)) throw new Error('invalid design session id')
  return path.join(SESSIONS_DIR, `${id}.json`)
}

function appendHistory(
  session: DesignSession,
  event: string,
  detail?: string,
): DesignSession {
  const entry: { at: string; event: string; detail?: string } = {
    at: new Date().toISOString(),
    event,
  }
  if (detail) entry.detail = detail
  return { ...session, history: [...session.history, entry] }
}

export async function createDesignSession(input: {
  roomId: string
  referenceUrl: string
  venture?: string
  correlation?: string
}): Promise<DesignSession> {
  await fs.promises.mkdir(SESSIONS_DIR, { recursive: true })
  const now = new Date().toISOString()
  const session: DesignSession = {
    id: randomUUID(),
    kind: 'reference-build',
    status: 'captured',
    createdAt: now,
    updatedAt: now,
    roomId: input.roomId,
    ...(input.venture ? { venture: input.venture } : {}),
    ...(input.correlation ? { correlation: input.correlation } : {}),
    reference: { url: input.referenceUrl, taxonomy: 'unknown' },
    history: [],
  }
  const withHistory = appendHistory(session, 'session_captured', input.referenceUrl)
  await fs.promises.writeFile(
    sessionPath(withHistory.id),
    JSON.stringify(withHistory, null, 2),
  )
  return withHistory
}

export async function readDesignSession(id: string): Promise<DesignSession | null> {
  try {
    const text = await fs.promises.readFile(sessionPath(id), 'utf-8')
    const parsed = JSON.parse(text) as DesignSession
    // Not ours — design.py's screenshot-to-code records share the directory.
    if (parsed?.kind !== 'reference-build') return null
    return parsed
  } catch {
    return null
  }
}

/** Newest LIVE reference-build session for a room, or null. The PRD-generation
 * step uses this to fold design.md facts into the summary automatically.
 * Live-E2E fix (2026-09-06): abandoned sessions are skipped — the user dismissed
 * that reference build, and the dismiss write itself bumps updatedAt, so without
 * this the dead record would keep shadowing the room's real session. */
export async function findLatestSessionByRoom(roomId: string): Promise<DesignSession | null> {
  let files: string[]
  try {
    files = await fs.promises.readdir(SESSIONS_DIR)
  } catch {
    return null
  }
  let latest: DesignSession | null = null
  for (const f of files) {
    if (!f.endsWith('.json')) continue
    try {
      const text = await fs.promises.readFile(path.join(SESSIONS_DIR, f), 'utf-8')
      const parsed = JSON.parse(text) as DesignSession
      if (parsed?.kind !== 'reference-build' || parsed.roomId !== roomId) continue
      if (parsed.status === 'abandoned') continue
      if (!latest || parsed.updatedAt > latest.updatedAt) latest = parsed
    } catch {
      continue // unreadable/foreign record — skip, never fail the scan
    }
  }
  return latest
}

// Live-E2E fix (2026-09-06): every writer here does read-modify-write of the
// WHOLE record, and several call sites are fire-and-forget (the stream
// route's gate/artifact writers). Two overlapping writes used to lose the
// later patch — observed live: the card's motion decision was clobbered by a
// still-in-flight motion_gate_emitted write (history kept the event, the
// motion field went null). Serialize per session id so each read-modify-write
// is atomic within this process.
const updateLocks = new Map<string, Promise<unknown>>()

export async function updateDesignSession(
  id: string,
  patch: {
    reference?: Partial<ReferenceProfile>
    intent?: DesignIntent
    motion?: MotionDecision
    recipe?: Record<string, unknown>
    designMd?: { path: string }
    status?: DesignSessionStatus
  },
  historyEvent?: string,
  historyDetail?: string,
): Promise<DesignSession | null> {
  const previous = updateLocks.get(id) ?? Promise.resolve()
  const run = previous.catch(() => {}).then(async () => {
    const session = await readDesignSession(id)
    if (!session) return null
    const next: DesignSession = {
      ...session,
      reference: patch.reference ? { ...session.reference, ...patch.reference } : session.reference,
      intent: patch.intent ?? session.intent,
      motion: patch.motion ?? session.motion,
      recipe: patch.recipe ?? session.recipe,
      designMd: patch.designMd ?? session.designMd,
      status: patch.status ?? session.status,
      updatedAt: new Date().toISOString(),
    }
    const withHistory = historyEvent
      ? appendHistory(next, historyEvent, historyDetail)
      : next
    await fs.promises.writeFile(sessionPath(id), JSON.stringify(withHistory, null, 2))
    return withHistory
  })
  updateLocks.set(
    id,
    run.catch(() => {}),
  )
  return run
}

// ── design.md writer (Phase 4, lives here because it renders THIS record) ───
// Facts-first discipline, same as cli/design.py's cmd_draft: the document
// states what the evidence shows, never what we hope. Every section is
// grounded in a probe/intent/motion field — nothing invented.

export function renderDesignMd(session: DesignSession): string {
  const r = session.reference
  const lines: string[] = []
  lines.push(`# Design spec — reference-build session ${session.id}`)
  lines.push('')
  lines.push(`- Room: ${session.roomId}${session.venture ? ` · Venture: ${session.venture}` : ''}`)
  lines.push(`- Created: ${session.createdAt} · Status: ${session.status}`)
  lines.push('')
  lines.push('## Reference')
  lines.push(`- URL: ${r.url}`)
  lines.push(`- Taxonomy: ${r.taxonomy}${r.taxonomyWhy ? ` — ${r.taxonomyWhy}` : ''}`)
  if (r.motionProfileUrl) lines.push(`- Motion profile (probe evidence): ${r.motionProfileUrl}`)
  if (r.motionSummary) lines.push(`- Motion summary: ${r.motionSummary}`)
  lines.push('')
  lines.push('## User intent (clone or adapt — the user decided)')
  if (session.intent) {
    lines.push(`- Mode: **${session.intent.mode}**`)
    if (session.intent.changes) lines.push(`- Changes requested: ${session.intent.changes}`)
    lines.push(`- Decided: ${session.intent.decidedAt}`)
  } else {
    lines.push('- NOT YET DECIDED — do not build past this point.')
  }
  lines.push('')
  lines.push('## Motion decision (video vs code — the user decided)')
  if (session.motion) {
    lines.push(`- Decision: **${session.motion.decision}**`)
    if (session.motion.notes) lines.push(`- Notes: ${session.motion.notes}`)
    lines.push(`- Decided: ${session.motion.decidedAt}`)
  } else {
    lines.push('- NOT YET DECIDED — do not build past this point.')
  }
  lines.push('')
  lines.push('## Build recipe')
  if (session.recipe) {
    lines.push('```json')
    lines.push(JSON.stringify(session.recipe, null, 2))
    lines.push('```')
  } else {
    lines.push('- NOT YET ROUTED — the recipe router has not run.')
  }
  lines.push('')
  lines.push('## History')
  for (const h of session.history) {
    lines.push(`- ${h.at} · ${h.event}${h.detail ? ` · ${h.detail}` : ''}`)
  }
  return lines.join('\n')
}

export async function writeDesignMd(session: DesignSession): Promise<string> {
  const md = renderDesignMd(session)
  const mdPath = path.join(SESSIONS_DIR, `${session.id}-design.md`)
  await fs.promises.writeFile(mdPath, md)
  return mdPath
}
