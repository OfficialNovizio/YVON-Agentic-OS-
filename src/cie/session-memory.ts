// lib/cie/session-memory.ts — CLASSIFY Layer 2 / system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §14.2: Session Memory
// (Deep Exploration only)
//
// §14.2's flow:
//   CLASSIFY detects archetype = DEEP EXPLORATION -> spins up a SESSION (not just working memory)
//   EXPLORE PHASE (multiple retrieval rounds, generate N candidates, repeat until diminishing
//     returns or budget hit)
//   CONVERGE PHASE (cluster/dedupe -> score -> shortlist 3-5, not 1)
//   OUTPUT: options + reasoning, not a single answer
//   Session state persisted as a MemPalace session-drawer, so "go deeper on #2" resumes with
//     that branch's context already loaded, no cold restart
//
// Local persistence (store/sessions/<id>.json) is the real, fully-tested source of truth here —
// it's what resumeSession() actually reads. persistToMemPalace() additionally files the same
// state into MemPalace via `mempalace mine` (sources/mempalace.ts) so it becomes searchable
// episodic memory too, per the doc — but per that module's own flags, MemPalace has no literal
// "session-drawer" type, only a `--wing` scope, used here as the closest real approximation
// (SESSION_WING). Treat persistToMemPalace as best-effort filing, not the source of truth: if it
// fails (no `mempalace` on PATH, network-blocked, etc.) the local JSON file is still there and
// resumeSession() still works — same fail-soft posture as every other MemPalace touchpoint this
// session (entity-resolution.ts, team-assignment.ts's episodic branch).

import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { getConfig } from '../adapters/config'
import { mineIntoMemPalace } from './sources/mempalace'

export const SESSION_WING = 'session-memory'

export interface ExploreRound {
  round: number
  query: string
  candidates: string[]
  timestamp: string
}

export interface ShortlistItem {
  candidate: string
  score: number
  reasoning: string
}

export type SessionStatus = 'exploring' | 'converged'

export interface SessionState {
  sessionId: string
  archetype: 'DEEP_EXPLORATION'
  topic: string
  status: SessionStatus
  createdAt: string
  updatedAt: string
  rounds: ExploreRound[]
  shortlist?: ShortlistItem[]
}

function sessionPath(sessionId: string): string {
  return join(getConfig().sessionMemoryDir, `${sessionId}.json`)
}

function ensureDir(): void {
  const dir = getConfig().sessionMemoryDir
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
}

function save(state: SessionState): SessionState {
  ensureDir()
  state.updatedAt = new Date().toISOString()
  writeFileSync(sessionPath(state.sessionId), JSON.stringify(state, null, 2), 'utf-8')
  return state
}

function newSessionId(topic: string): string {
  const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40)
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `${stamp}-${slug || 'session'}`
}

/** startSession — Layer 2's "spins up a SESSION" step. */
export function startSession(topic: string): SessionState {
  const state: SessionState = {
    sessionId: newSessionId(topic),
    archetype: 'DEEP_EXPLORATION',
    topic,
    status: 'exploring',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    rounds: [],
  }
  return save(state)
}

/** loadSession — the resume path's data source. Returns null if the session doesn't exist. */
export function loadSession(sessionId: string): SessionState | null {
  const path = sessionPath(sessionId)
  if (!existsSync(path)) return null
  try {
    return JSON.parse(readFileSync(path, 'utf-8')) as SessionState
  } catch {
    return null
  }
}

/**
 * addExploreRound — EXPLORE PHASE. One round = one retrieval pass generating N candidate
 * directions (not one answer, per §14.2). Caller decides when "diminishing returns or budget
 * hit" — this function just records what happened, it doesn't decide when to stop.
 */
export function addExploreRound(sessionId: string, query: string, candidates: string[]): SessionState | null {
  const state = loadSession(sessionId)
  if (!state) return null
  if (state.status !== 'exploring') {
    throw new Error(`Session ${sessionId} is already ${state.status} — cannot add explore rounds after convergence.`)
  }
  state.rounds.push({
    round: state.rounds.length + 1,
    query,
    candidates,
    timestamp: new Date().toISOString(),
  })
  return save(state)
}

/**
 * converge — CONVERGE PHASE. Caller supplies the already-clustered/scored shortlist (3-5 items
 * per §14.2) — this function doesn't do the clustering/scoring itself, that's a
 * retrieval/generation concern outside this module's scope (it's state management, not the
 * scoring algorithm).
 */
export function converge(sessionId: string, shortlist: ShortlistItem[]): SessionState | null {
  const state = loadSession(sessionId)
  if (!state) return null
  if (shortlist.length === 0) {
    throw new Error('Cannot converge with an empty shortlist — §14.2 requires 3-5 options, not zero.')
  }
  state.status = 'converged'
  state.shortlist = shortlist
  return save(state)
}

export interface PersistResult {
  localSaved: true // local JSON is always the source of truth and always succeeds if this is reached
  memPalace: { available: boolean; filed: boolean; error?: string }
}

/**
 * persistToMemPalace — best-effort filing into MemPalace as episodic memory (the doc's
 * "session-drawer"). Writes the session JSON to its own file (already done by save()) then mines
 * that single file via `mempalace mine`, scoped to SESSION_WING. Safe to call repeatedly —
 * mempalace mine is documented as idempotent per-file upsert.
 */
export function persistToMemPalace(sessionId: string): PersistResult | null {
  const state = loadSession(sessionId)
  if (!state) return null
  const result = mineIntoMemPalace(sessionPath(sessionId), { wing: SESSION_WING })
  return { localSaved: true, memPalace: result }
}

/**
 * resumeSession — "go deeper on #2" per §14.2: load the persisted state so the caller has the
 * full round/candidate/shortlist history without re-deriving it. Local file is authoritative;
 * MemPalace is not re-queried here (that's entity-resolution.ts's job if the caller wants
 * cross-session recall too — this function only resumes the one named session).
 */
export function resumeSession(sessionId: string): SessionState | null {
  return loadSession(sessionId)
}

/** listSessions — every session-memory JSON file on disk, most recent first. */
export function listSessions(): { sessionId: string; topic: string; status: SessionStatus; updatedAt: string }[] {
  const dir = getConfig().sessionMemoryDir
  if (!existsSync(dir)) return []
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'))
  const summaries = files
    .map((f) => loadSession(f.replace(/\.json$/, '')))
    .filter((s): s is SessionState => s !== null)
    .map((s) => ({ sessionId: s.sessionId, topic: s.topic, status: s.status, updatedAt: s.updatedAt }))
  return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}
