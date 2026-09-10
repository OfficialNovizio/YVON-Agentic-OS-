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

/** Gate 3 - brand-studio suggestions (2026-09-07). The agent proposes; the
 * user adopts via the card; adopted ones land in design.md + the PRD. */
export interface BrandSuggestion {
  title: string
  text: string
  why: string
  adopted?: boolean
}

/** Measured facts from the stealth-browser capture relay - written from the
 * wrapper's capture.done frame. Measured by the capture, never estimated. */
export interface CaptureFacts {
  url: string
  out: string
  previewUrl?: string
  reportUrl?: string
  seconds?: number
  summary?: Record<string, string | number>
  capturedAt: string
}

/** One design-system fact with where it came from — the design.md analysis
 * sections render these verbatim, so a value without a source must never
 * reach them (facts-first discipline, same as the CaptureFacts above). */
export interface DesignSystemFact {
  text: string
  source: string
}

/** Measured design-system analysis of the REFERENCE (2026-09-08) — the
 * design.md document the user asked for: palette / typography / motion /
 * components extracted from the captured evidence, not from vibes. Every
 * entry carries its source; sections the capture couldn't measure are simply
 * absent and design.md says so in Known Gaps. */
export interface DesignSystemFacts {
  /** Frontmatter `colors:` map — kebab-case token → measured value. */
  colorTokens?: Record<string, string>
  /** Frontmatter `typography:` map — role → the measured 5-key object
   * (getdesign DESIGN.md shape: fontFamily/fontSize/fontWeight/lineHeight/
   * letterSpacing). Only roles the capture could actually read. */
  typographyRoles?: Record<
    string,
    { fontFamily?: string; fontSize?: string; fontWeight?: number; lineHeight?: string | number; letterSpacing?: string | number }
  >
  palette?: Array<{ value: string; usage: string; source?: string; group?: string }>
  typography?: DesignSystemFact[]
  motion?: DesignSystemFact[]
  components?: Array<{ name: string; evidence: string }>
  /** Frontmatter `rounded:` map — token → measured radius value. */
  rounded?: Record<string, string>
  /** Frontmatter `spacing:` map — token → measured spacing value (Layout
   * section: container, gutters, section rhythm). Format spec:
   * docs/design-md-format.md. */
  spacing?: Record<string, string>
  /** Frontmatter `elevation:` map — token → measured box-shadow value. */
  elevation?: Record<string, string>
  /** Measured layout-grammar facts (grid, container width, section rhythm). */
  layout?: DesignSystemFact[]
  /** Frontmatter `components:` map — component name → token-ref object
   * ({colors.x} / {typography.role} refs, getdesign shape). */
  componentTokens?: Record<string, Record<string, string>>
  /** Measured prescriptive behavior, each derived 1:1 from a measured fact. */
  dos?: string[]
  donts?: string[]
  /** Measured responsive breakpoints (name/width/key changes + source). */
  responsive?: Array<{ name: string; width: string; changes: string; source?: string }>
  /** Build/iteration guidance for this design, from the measured system. */
  iteration?: string[]
  /** Honest gaps the measurement could NOT answer (part of the format). */
  gaps?: string[]
  /** Where the facts were pulled from (artifact URLs / stylesheet URLs). */
  sources?: string[]
  measuredAt?: string
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
  /** Gate 3 - the agent's brand suggestions and the user's adoptions. */
  suggestions?: BrandSuggestion[]
  /** Stealth-browser capture relay facts (capture.done frame). */
  capture?: CaptureFacts
  /** Measured design-system analysis of the reference (see DesignSystemFacts) —
   * rendered as the design.md body by renderDesignMd. */
  designSystem?: DesignSystemFacts
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
    suggestions?: BrandSuggestion[]
    capture?: CaptureFacts
    designSystem?: DesignSystemFacts
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
      suggestions: patch.suggestions ?? session.suggestions,
      capture: patch.capture ?? session.capture,
      designSystem: patch.designSystem ?? session.designSystem,
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

// ── getdesign DESIGN.md renderer (2026-09-08) ────────────────────────────────
// The design.md document follows the public getdesign-catalog DESIGN.md shape
// (format verified against the upstream analysis files, 2026-09-08): YAML
// frontmatter (version/name/description/colors/typography/rounded/spacing/
// components) + body sections in the catalog's order, NO H1, token refs like
// {colors.x}, and a candor section (Known Gaps) as the analysis's last
// section. Deviation from the catalog, disclosed: after Known Gaps this
// document appends a Session Appendix carrying the pipeline record (capture /
// intent / motion decision / recipe / history) that the PRD generator and the
// builder consume — the analysis part stays format-faithful.
//
// Honesty rules (§0.5): a section renders ONLY what the session's measured
// designSystem facts contain; anything the capture couldn't measure is listed
// under Known Gaps, never filled from vibes. The old renderDesignMd content
// is preserved verbatim as the appendix.

/** YAML double-quoted scalar — JSON string escaping is a valid YAML subset. */
function yq(s: string): string {
  return JSON.stringify(s)
}

/** Plain YAML scalar when the value is unit-like (1.5, 22px, -1.92px, .2rem),
 * quoted otherwise — matches the catalog's bare numeric typography values. */
function yv(s: string): string {
  return /^-?[\w./%+]+$/.test(s) ? s : yq(s)
}

/** Hostname labels → "Detroit-Paris" style display name (no hardcoded sites). */
function referenceDisplayName(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, '')
    return host
      .split('.')
      .filter(Boolean)
      .map((l) => l.charAt(0).toUpperCase() + l.slice(1))
      .join('-')
  } catch {
    return 'Reference'
  }
}

function kebab(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Reverse-lookup a kebab token for a measured color value (frontmatter map
 * first, then a sane fallback from the value itself). */
function colorTokenLabel(value: string, tokens?: Record<string, string>): string {
  if (tokens) {
    for (const [k, v] of Object.entries(tokens)) {
      if (v.toLowerCase() === value.toLowerCase()) return k
    }
  }
  return kebab(value) || value
}

const COLOR_GROUPS: Array<{ key: string; heading: string }> = [
  { key: 'brand', heading: 'Brand & Accent' },
  { key: 'surface', heading: 'Surface & Background' },
  { key: 'text', heading: 'Text & Rules' },
  { key: 'semantic', heading: 'Semantic' },
]

export function renderDesignMd(session: DesignSession): string {
  const r = session.reference
  const ds = session.designSystem
  const lines: string[] = []
  const siteName = referenceDisplayName(r.url)

  // ── frontmatter ─────────────────────────────────────────────────────────
  lines.push('---')
  lines.push('version: alpha')
  lines.push(`name: ${yq(`${siteName}-design-analysis`)}`)
  const measuredLine = ds?.measuredAt
    ? ` Design-system values measured from the YVON capture relay's artifacts (hydrated DOM + stylesheets) on ${ds.measuredAt}.`
    : ''
  lines.push(
    `description: ${yq(
      `Design-system analysis of ${r.url} produced by the YVON reference-build pipeline.${measuredLine} Every value traces to a captured source; unmeasurable areas are declared in Known Gaps.`,
    )}`,
  )
  if (ds?.colorTokens && Object.keys(ds.colorTokens).length > 0) {
    lines.push('')
    lines.push('colors:')
    for (const [k, v] of Object.entries(ds.colorTokens)) lines.push(`  ${k}: ${yq(v)}`)
  }
  if (ds?.typographyRoles && Object.keys(ds.typographyRoles).length > 0) {
    lines.push('')
    lines.push('typography:')
    for (const [role, t] of Object.entries(ds.typographyRoles)) {
      lines.push(`  ${role}:`)
      if (t.fontFamily !== undefined) lines.push(`    fontFamily: ${yq(t.fontFamily)}`)
      if (t.fontSize !== undefined) lines.push(`    fontSize: ${yv(String(t.fontSize))}`)
      if (t.fontWeight !== undefined) lines.push(`    fontWeight: ${t.fontWeight}`)
      if (t.lineHeight !== undefined) lines.push(`    lineHeight: ${yv(String(t.lineHeight))}`)
      if (t.letterSpacing !== undefined) lines.push(`    letterSpacing: ${yv(String(t.letterSpacing))}`)
    }
  }
  if (ds?.rounded && Object.keys(ds.rounded).length > 0) {
    lines.push('')
    lines.push('rounded:')
    for (const [k, v] of Object.entries(ds.rounded)) lines.push(`  ${k}: ${yv(v)}`)
  }
  if (ds?.spacing && Object.keys(ds.spacing).length > 0) {
    lines.push('')
    lines.push('spacing:')
    for (const [k, v] of Object.entries(ds.spacing)) lines.push(`  ${k}: ${yv(v)}`)
  }
  if (ds?.elevation && Object.keys(ds.elevation).length > 0) {
    lines.push('')
    lines.push('elevation:')
    for (const [k, v] of Object.entries(ds.elevation)) lines.push(`  ${k}: ${yq(v)}`)
  }
  if (ds?.componentTokens && Object.keys(ds.componentTokens).length > 0) {
    lines.push('')
    lines.push('components:')
    for (const [name, toks] of Object.entries(ds.componentTokens)) {
      lines.push(`  ${kebab(name)}:`)
      for (const [k, v] of Object.entries(toks)) lines.push(`    ${k}: ${yq(v)}`)
    }
  } else if (ds?.components && ds.components.length > 0) {
    lines.push('')
    lines.push('components:')
    for (const c of ds.components) lines.push(`  ${yq(c.name)}:`)
  }
  lines.push('---')

  // ── Overview ────────────────────────────────────────────────────────────
  lines.push('')
  lines.push('## Overview')
  lines.push(
    `${siteName} (${r.url}) — reference analysis for a YVON reference-build${session.venture ? ` targeting the "${session.venture}" venture` : ''}. Probe taxonomy: **${r.taxonomy}**${r.taxonomyWhy ? ` (${r.taxonomyWhy})` : ''}.`,
  )
  if (ds && (ds.components?.length || ds.motion?.length)) {
    lines.push('')
    lines.push('**Key Characteristics:**')
    for (const c of (ds.components ?? []).slice(0, 8)) lines.push(`- ${c.name} — measured: ${c.evidence.split(';')[0].slice(0, 160)}`)
    for (const m of (ds.motion ?? []).slice(0, 3)) lines.push(`- ${m.text.split(';')[0].slice(0, 160)}`)
  }

  // ── Colors ──────────────────────────────────────────────────────────────
  if (ds?.palette?.length) {
    lines.push('')
    lines.push('## Colors')
    const grouped = new Map<string, typeof ds.palette>()
    for (const p of ds.palette) {
      const g = p.group ?? 'other'
      if (!grouped.has(g)) grouped.set(g, [])
      grouped.get(g)!.push(p)
    }
    for (const { key, heading } of COLOR_GROUPS) {
      const rows = grouped.get(key)
      if (!rows?.length) continue
      lines.push('')
      lines.push(`### ${heading}`)
      for (const p of rows) {
        lines.push(`- **${colorTokenLabel(p.value, ds.colorTokens)}** (\`${p.value}\`): ${p.usage}`)
        if (p.source) lines.push(`  - Source: ${p.source}`)
      }
      grouped.delete(key)
    }
    const rest = [...grouped.values()].flat()
    if (rest.length) {
      lines.push('')
      lines.push('### Other measured values')
      for (const p of rest) {
        lines.push(`- **${colorTokenLabel(p.value, ds.colorTokens)}** (\`${p.value}\`): ${p.usage}`)
        if (p.source) lines.push(`  - Source: ${p.source}`)
      }
    }
  }

  // ── Typography ──────────────────────────────────────────────────────────
  const typo = ds?.typography ?? []
  if (typo.length || ds?.typographyRoles) {
    lines.push('')
    lines.push('## Typography')
    if (typo.length) {
      lines.push('')
      lines.push('### Font Family')
      lines.push(`- ${typo[0].text}`)
      lines.push(`  - Source: ${typo[0].source}`)
    }
    const roles = ds?.typographyRoles
    if (roles && Object.keys(roles).length > 0) {
      lines.push('')
      lines.push('### Hierarchy')
      lines.push('| Role | Family | Size | Weight | Line height | Tracking |')
      lines.push('|---|---|---:|---:|---:|---:|')
      for (const [role, t] of Object.entries(roles)) {
        lines.push(
          `| \`${role}\` | ${t.fontFamily ?? '—'} | ${t.fontSize ?? '—'} | ${t.fontWeight ?? '—'} | ${t.lineHeight ?? '—'} | ${t.letterSpacing ?? '—'} |`,
        )
      }
    }
    const rest = typo.slice(1)
    if (rest.length) {
      lines.push('')
      lines.push('### Principles (measured)')
      for (const t of rest) {
        lines.push(`- ${t.text}`)
        lines.push(`  - Source: ${t.source}`)
      }
    }
  }

  // ── Layout (getdesign catalog format — docs/design-md-format.md) ─────────
  if (ds?.layout?.length || (ds?.spacing && Object.keys(ds.spacing).length > 0)) {
    lines.push('')
    lines.push('## Layout')
    if (ds?.spacing && Object.keys(ds.spacing).length > 0) {
      lines.push('')
      lines.push('### Spacing Scale')
      lines.push('')
      lines.push('| Token | Value |')
      lines.push('|---|---:|')
      for (const [k, v] of Object.entries(ds.spacing)) lines.push(`| \`${k}\` | ${v} |`)
    }
    if (ds?.layout?.length) {
      lines.push('')
      lines.push('### Layout Grammar (measured)')
      for (const raw of ds.layout) {
        // deep-extract backfills store plain strings here; coerce so the
        // rendered line is the fact, not "undefined" (2026-09-09)
        const f = (typeof raw === 'string'
          ? { text: raw, source: 'captured stylesheets (assets/*.css)' }
          : raw) as DesignSystemFact
        lines.push(`- ${f.text}`)
        if (f.source) lines.push(`  - Source: ${f.source}`)
      }
    }
  }

  // ── Elevation (getdesign catalog format — docs/design-md-format.md) ──────
  if (ds?.elevation && Object.keys(ds.elevation).length > 0) {
    lines.push('')
    lines.push('## Elevation')
    lines.push('')
    lines.push('| Token | Shadow |')
    lines.push('|---|---|')
    for (const [k, v] of Object.entries(ds.elevation)) lines.push(`| \`${k}\` | ${v} |`)
  }

  // ── Motion & Interaction (YVON extension — motion is a first-class stage
  // of this pipeline, and the reference's motion behavior is measured) ─────
  if (ds?.motion?.length) {
    lines.push('')
    lines.push('## Motion & Interaction')
    lines.push('')
    lines.push('_Measured from the hydrated DOM and stylesheets. Static-probe labels are overridden by observed behavior._')
    for (const m of ds.motion) {
      lines.push(`- ${m.text}`)
      lines.push(`  - Source: ${m.source}`)
    }
  }

  // ── Shapes ──────────────────────────────────────────────────────────────
  if (ds?.rounded && Object.keys(ds.rounded).length > 0) {
    lines.push('')
    lines.push('## Shapes')
    lines.push('')
    lines.push('### Radius Scale')
    lines.push('')
    lines.push('| Token | Value |')
    lines.push('|---|---:|')
    for (const [k, v] of Object.entries(ds.rounded)) lines.push(`| \`${k}\` | ${v} |`)
  }

  // ── Components ──────────────────────────────────────────────────────────
  if (ds?.components?.length) {
    lines.push('')
    lines.push('## Components')
    for (const c of ds.components) {
      lines.push('')
      lines.push(`### **\`${kebab(c.name)}\`**`)
      lines.push('')
      lines.push(c.evidence)
    }
  }

  // ── Do's and Don'ts ─────────────────────────────────────────────────────
  if (ds?.dos?.length || ds?.donts?.length) {
    lines.push('')
    lines.push("## Do's and Don'ts")
    if (ds.dos?.length) {
      lines.push('')
      lines.push('### Do')
      for (const d of ds.dos) lines.push(`- ${d}`)
    }
    if (ds.donts?.length) {
      lines.push('')
      lines.push("### Don't")
      for (const d of ds.donts) lines.push(`- ${d}`)
    }
  }

  // ── Responsive Behavior ─────────────────────────────────────────────────
  if (ds?.responsive?.length) {
    lines.push('')
    lines.push('## Responsive Behavior')
    lines.push('')
    lines.push('### Breakpoints')
    lines.push('')
    lines.push('| Name | Width | Key Changes |')
    lines.push('|---|---|---|')
    for (const b of ds.responsive) {
      lines.push(`| ${b.name} | ${b.width} | ${b.changes} |`)
      if (b.source) lines.push('', `<sub>Source: ${b.source}</sub>`)
    }
  }

  // ── Iteration Guide ─────────────────────────────────────────────────────
  if (ds?.iteration?.length) {
    lines.push('')
    lines.push('## Iteration Guide')
    ds.iteration.forEach((step, i) => lines.push(`${i + 1}. ${step}`))
  }

  // ── Known Gaps ──────────────────────────────────────────────────────────
  lines.push('')
  lines.push('## Known Gaps')
  const autoGaps: string[] = []
  if (!ds) {
    autoGaps.push('No measured design-system analysis is attached to this session yet — the sections above are absent because nothing was measured, not because the reference lacks them.')
  } else {
    if (!ds.rounded) autoGaps.push('Radius/shape tokens were not extracted from the captured CSS.')
    if (!ds.spacing && !ds.layout?.length) autoGaps.push('Layout/spacing values (container, gutters, section rhythm) were not measured — the Layout section is absent because nothing was measured, not because the reference lacks a layout grammar.')
    if (!ds.elevation) autoGaps.push('Elevation/shadow tokens were not extracted from the captured CSS.')
    if (!ds.responsive?.length) autoGaps.push('Responsive breakpoints were not measured from media queries.')
    if (!ds.componentTokens) autoGaps.push('Frontmatter component token maps were not derived — components are documented from CSS evidence only.')
    autoGaps.push('Computed (rendered) styles were not sampled — values come from static HTML + stylesheets.')
  }
  const seenGap = new Set<string>()
  for (const g of [...(ds?.gaps ?? []), ...autoGaps]) {
    const k = g.slice(0, 80)
    if (seenGap.has(k)) continue
    seenGap.add(k)
    lines.push(`- ${g}`)
  }
  if (ds?.sources?.length) {
    lines.push('')
    lines.push('### Measurement sources')
    for (const s of ds.sources) lines.push(`- ${s}`)
  }

  // ── Session Appendix (pipeline record — consumed by PRD + builder) ──────
  lines.push('')
  lines.push('---')
  lines.push('')
  lines.push('## Session Appendix — YVON reference-build record')
  lines.push(`- Session: ${session.id} · Room: ${session.roomId}${session.venture ? ` · Venture: ${session.venture}` : ''}`)
  lines.push(`- Created: ${session.createdAt} · Status: ${session.status}`)
  lines.push('')
  lines.push('### Capture (stealth-browser relay — measured facts)')
  if (session.capture) {
    const c = session.capture
    lines.push(`- URL: ${c.url}`)
    if (c.previewUrl) lines.push(`- Preview: ${c.previewUrl}`)
    if (c.reportUrl) lines.push(`- Report: ${c.reportUrl}`)
    if (c.seconds !== undefined) lines.push(`- Round trip: ${c.seconds}s`)
    if (c.summary) {
      for (const [k, v] of Object.entries(c.summary)) lines.push(`- ${k}: ${v}`)
    }
  } else {
    lines.push('- No stealth-browser capture arrived for this reference.')
  }
  lines.push('')
  lines.push('### User intent (clone or adapt — the user decided)')
  if (session.intent) {
    lines.push(`- Mode: **${session.intent.mode}**`)
    if (session.intent.changes) lines.push(`- Changes requested: ${session.intent.changes}`)
    lines.push(`- Decided: ${session.intent.decidedAt}`)
  } else {
    lines.push('- NOT YET DECIDED — do not build past this point.')
  }
  lines.push('')
  lines.push('### Motion decision (video vs code — the user decided)')
  if (session.motion) {
    lines.push(`- Decision: **${session.motion.decision}**`)
    if (session.motion.notes) lines.push(`- Notes: ${session.motion.notes}`)
    lines.push(`- Decided: ${session.motion.decidedAt}`)
  } else {
    lines.push('- NOT YET DECIDED — do not build past this point.')
  }
  lines.push('')
  lines.push('### Brand suggestions (agent proposed, user decided)')
  if (session.suggestions && session.suggestions.length > 0) {
    for (const sug of session.suggestions) {
      lines.push(`- [${sug.adopted ? 'ADOPTED' : 'not adopted'}] ${sug.title}: ${sug.text}`)
      lines.push(`  - Why: ${sug.why}`)
    }
  } else {
    lines.push('- None offered for this reference.')
  }
  lines.push('')
  lines.push('### Build recipe')
  if (session.recipe) {
    lines.push('```json')
    lines.push(JSON.stringify(session.recipe, null, 2))
    lines.push('```')
  } else {
    lines.push('- NOT YET ROUTED — the recipe router has not run.')
  }
  lines.push('')
  lines.push('### History')
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

// ── Thin design-system extraction (2026-09-08) ──────────────────────────────
// After a capture completes, the relay's _reference-capture/inventory.json
// offers a regex-grade scrape: raw color strings (transparent/currentcolor
// included), font-family keyword soup, keyframe names, media counts. This is
// deliberately the THIN extraction — counts + names + sources only, with a
// Known Gap declaring the deep per-fact analysis hasn't run. It exists so a
// fresh session's design.md is measured-not-empty from the first write; the
// deep analysis (like TS-055's backfill) replaces it wholesale later.
const GENERIC_FONT_KEYWORDS = new Set([
  'inherit', 'initial', 'unset', 'sans-serif', 'serif', 'monospace', 'cursive',
  'fantasy', 'system-ui', '-apple-system', 'ui-sans-serif', 'ui-monospace',
  'ui-serif', 'ui-rounded', 'math', 'emoji', 'fangsong',
])

export async function extractThinDesignSystem(
  inventoryUrl: string,
  referenceUrl?: string,
): Promise<DesignSystemFacts | null> {
  try {
    const res = await fetch(inventoryUrl, { signal: AbortSignal.timeout(10_000) })
    if (!res.ok) return null
    const inv = (await res.json()) as Record<string, unknown>
    const src = `capture inventory (${inventoryUrl})`
    const facts: DesignSystemFacts = { measuredAt: new Date().toISOString(), sources: [src] }

    // Colors: keep only real color values, drop transparent/currentcolor.
    if (Array.isArray(inv.colors)) {
      const colors = [...new Set((inv.colors as unknown[]).map(String))].filter(
        (c) => c && c !== 'currentcolor' && !/^rgba?\([^)]*,\s*0\s*\)$/i.test(c),
      ).slice(0, 16)
      if (colors.length) {
        facts.palette = colors.map((c) => ({
          value: c,
          usage: 'color value present in the capture (role not attributed at thin-extraction depth)',
          source: src,
        }))
      }
    }

    // Fonts: drop generic keywords; what remains is an honest name list.
    if (Array.isArray(inv.fonts)) {
      const fonts = [...new Set((inv.fonts as unknown[]).map(String))].filter(
        (f) => f && !GENERIC_FONT_KEYWORDS.has(f.toLowerCase()),
      ).slice(0, 10)
      if (fonts.length) {
        facts.typography = [
          {
            text: `Font-family values present in the capture (thin extraction — role not attributed): ${fonts.join(', ')}`,
            source: src,
          },
        ]
      }
    }

    // Motion: keyframe names + media counts, verbatim from the inventory.
    const motion: DesignSystemFact[] = []
    if (Array.isArray(inv.keyframes) && inv.keyframes.length) {
      motion.push({ text: `@keyframes present in the capture (${(inv.keyframes as unknown[]).length}): ${(inv.keyframes as unknown[]).map(String).join(', ')}`, source: src })
    }
    const counts: string[] = []
    for (const k of ['videos', 'images', 'backgrounds', 'stylesheets', 'inlineStyleTags', 'animatedRules', 'pageHeight'] as const) {
      if (inv[k] !== undefined) counts.push(`${k}: ${String(inv[k])}`)
    }
    if (counts.length) {
      motion.push({ text: `Media/animation counts measured by the capture relay — ${counts.join(', ')}`, source: src })
    }
    if (motion.length) facts.motion = motion

    facts.gaps = [
      'Thin extraction only: this design.md was generated from the capture inventory (regex-grade counts + value lists). Roles, usages, and per-fact sources were NOT analyzed — run the deep extraction to replace this.',
    ]
    if (inv.title) facts.measuredAt = `${facts.measuredAt} (page: ${String(inv.title)})`
    return facts
  } catch {
    return null
  }
}
