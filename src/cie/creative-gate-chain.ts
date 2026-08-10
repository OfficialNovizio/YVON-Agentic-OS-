// lib/cie/creative-gate-chain.ts — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §13.2: Creative Gate Chain
//
// "Runs alongside, not instead of, the standard harness." Five checks, C1-C5. Verified against
// real code/config/CLI (2026-08-09) rather than assumed; each function documents what's real vs.
// approximated vs. genuinely unavailable, same posture as every other module built this session.

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { getConfig } from '../adapters/config'
import { searchMemPalace, mineIntoMemPalace } from './sources/mempalace'
import type { RagRetrieveResult } from './rag-bridge'

// ─── C1 — Brand Voice Conformance ──────────────────────────────────────────
//
// Doc: "Source: atlas (design tokens) + lena (voice guide) — graphify-deterministic."
// VERIFIED (2026-08-09): atlas has no design-token files anywhere in Teams/Brand Studio/atlas —
// only a fill-in template (assets/brand-kit-template.md) and skill docs. Per
// atlas-config.md/lena-config.md (both explicitly "template — placeholders only, no invented
// values"), the real mechanism is a per-brand `brand_kit_path`/`voice_guide_path` field, read by
// atlas's own brand-guidelines skill — currently `<FILL_IN>` for every brand, including Novizio
// (the only venture in the registry). This function reads those exact config files rather than
// re-deciding the mechanism, and reports the same "STOP — offer template" outcome
// brand-guidelines' own protocol specifies when a path is unset, rather than fabricating
// conformance data that doesn't exist.

export interface BrandVoiceResult {
  status: 'not_configured' | 'checked'
  brandKitPath?: string
  voiceGuidePath?: string
  reason: string
}

function readFillInField(configPath: string, brandId: string, field: string): string | undefined {
  if (!existsSync(configPath)) return undefined
  const text = readFileSync(configPath, 'utf-8')
  // Config templates are one YAML fenced block, `brands:` list of `{brand_id, <field>}`. A real
  // YAML parser would be overkill for a two-key-per-entry template file — line-scoped regex
  // matches the documented shape (brand_id: <val> immediately followed by the field line).
  const blockMatch = text.match(/```yaml([\s\S]*?)```/)
  if (!blockMatch) return undefined
  const lines = blockMatch[1].split('\n')
  for (let i = 0; i < lines.length; i++) {
    const idMatch = lines[i].match(/brand_id:\s*(.+?)\s*(?:#|$)/)
    if (idMatch && idMatch[1].trim() === brandId) {
      for (let j = i + 1; j < lines.length && j < i + 4; j++) {
        const fieldMatch = lines[j].match(new RegExp(`${field}:\\s*(.+?)\\s*(?:#|$)`))
        if (fieldMatch) return fieldMatch[1].trim()
      }
    }
  }
  return undefined
}

export function checkBrandVoiceConformance(brandId: string): BrandVoiceResult {
  const config = getConfig()
  const atlasConfigPath = join(config.teamsPath, 'Brand Studio', 'atlas', 'operational', 'agent', 'atlas-config.md')
  const lenaConfigPath = join(config.teamsPath, 'Brand Studio', 'lena', 'operational', 'agent', 'lena-config.md')

  const brandKitPath = readFillInField(atlasConfigPath, brandId, 'brand_kit_path')
  const voiceGuidePath = readFillInField(lenaConfigPath, brandId, 'voice_guide_path')

  const kitUnset = !brandKitPath || brandKitPath === '<FILL_IN>'
  const voiceUnset = !voiceGuidePath || voiceGuidePath === '<FILL_IN>'

  if (kitUnset || voiceUnset) {
    return {
      status: 'not_configured',
      brandKitPath: kitUnset ? undefined : brandKitPath,
      voiceGuidePath: voiceUnset ? undefined : voiceGuidePath,
      reason:
        `brand_kit_path/voice_guide_path unset for brand_id="${brandId}" — per atlas's own ` +
        `brand-guidelines protocol, STOP and offer assets/brand-kit-template.md (or ` +
        `voice-guide-template.md), not audit against remembered/inferred rules`,
    }
  }

  // Both paths configured — read them if they exist on disk. This function does not implement
  // the element-by-element audit itself (logo/color/type/imagery rules) — that's
  // brand-guidelines' own multi-phase protocol, agent-executed, not a deterministic function.
  // This confirms whether there's something real to audit against.
  const kitExists = existsSync(brandKitPath!)
  const voiceExists = existsSync(voiceGuidePath!)
  return {
    status: 'checked',
    brandKitPath,
    voiceGuidePath,
    reason: kitExists && voiceExists
      ? 'both files configured and present on disk — ready for atlas/lena to audit'
      : `configured but missing on disk (kit exists: ${kitExists}, voice guide exists: ${voiceExists})`,
  }
}

// ─── C2 — Novelty / Repetition Score ───────────────────────────────────────
//
// Doc: "MemPalace similarity search vs. last N posts... Too similar -> flagged repetitive...
// too dissimilar -> flagged brand drift." VERIFIED (2026-08-09): `mempalace search --help` has
// no numeric similarity score in its output contract (MemPalaceHit is `{raw: string}` — human-
// formatted stdout, not JSON, per sources/mempalace.ts's own flag) — there's nothing to threshold
// a graduated "score" against. This function reports hit-count-based signal (present/absent),
// NOT a similarity score — the doc's "score" framing is not literally achievable with the real
// CLI contract available today.

export type NoveltyFlag = 'repetitive' | 'brand_drift_check' | 'unscored'

export interface NoveltyResult {
  flag: NoveltyFlag
  hitCount: number
  available: boolean
  note: string
}

export function checkNoveltyRepetition(
  draftSummary: string,
  wing: string,
  opts: { room?: string; recentN?: number } = {},
): NoveltyResult {
  const result = searchMemPalace(draftSummary, { wing, room: opts.room, results: opts.recentN ?? 5 })
  if (!result.available) {
    return { flag: 'unscored', hitCount: 0, available: false, note: result.error ?? 'MemPalace unavailable' }
  }
  // No similarity score to threshold — "too similar" (>=3 hits on a draft summary search) vs.
  // "no comparable history" (0 hits) is the only real signal the CLI contract supports.
  // Mid-range hit counts are reported as unscored rather than guessed at as "fine."
  if (result.hits.length >= 3) {
    return { flag: 'repetitive', hitCount: result.hits.length, available: true, note: 'multiple similar past posts found in this wing/room' }
  }
  if (result.hits.length === 0) {
    return { flag: 'brand_drift_check', hitCount: 0, available: true, note: 'no comparable history in this wing/room — could be novel or off-brand, needs atlas/spark review either way' }
  }
  return { flag: 'unscored', hitCount: result.hits.length, available: true, note: `${result.hits.length} hit(s) — not enough signal to call repetitive or drift without a real similarity score` }
}

// ─── C3 — Premortem / Risk Check ───────────────────────────────────────────
//
// Doc: "Adversarial pass (reuses the existing adversarial-chunk mechanism from §standard
// retrieval, repurposed for creative context)." VERIFIED (2026-08-09): this mechanism is real —
// rag/harness/gates.py's P5_ADVERSARY includes up to one chunk flagged `adversary: true` in
// every standard retrieval pass; rag-bridge.ts's RagRetrieveResult already surfaces this
// (`adversary`, `selected_chunks[].adversary`). This function doesn't re-implement retrieval —
// it takes an already-fetched RagRetrieveResult (from callRagBridge, called with the creative
// draft as the query) and interprets it through a creative-risk lens, genuinely reusing the
// mechanism rather than approximating it.

export interface PremortemResult {
  hasAdversaryChunk: boolean
  adversaryChunkIds: string[]
  note: string
}

export function checkPremortemRisk(ragResult: RagRetrieveResult): PremortemResult {
  const adversaryChunks = (ragResult.selected_chunks ?? []).filter((c) => c.adversary)
  return {
    hasAdversaryChunk: adversaryChunks.length > 0,
    adversaryChunkIds: adversaryChunks.map((c) => c.chunk_id),
    note: adversaryChunks.length > 0
      ? 'standard retrieval surfaced a counter-evidence/risk chunk for this draft — spark should review before publish'
      : 'no adversary chunk surfaced by standard retrieval — does not mean risk-free, only that P5 found nothing to flag',
  }
}

// ─── C4 — Predicted Performance ────────────────────────────────────────────
//
// Doc: "kai's model scores expected engagement... trained on this brand's historical MemPalace
// performance drawers." VERIFIED (2026-08-09): kai (Teams/Brand Studio/kai) is a prompt-only
// agent definition — no model, no training pipeline, no scored dataset exists anywhere in this
// repo's code. Genuinely not buildable without either fabricating a model or scope-creeping into
// building kai's entire prediction system, neither appropriate here.

export interface PredictedPerformanceResult {
  available: false
  reason: string
}

export function checkPredictedPerformance(): PredictedPerformanceResult {
  return {
    available: false,
    reason: 'kai has no code model or scored performance dataset in this repo — agent-only, not implementable as a deterministic function without building an entire prediction system out of scope here',
  }
}

// ─── C5 — Real-World Outcome Capture ───────────────────────────────────────
//
// Doc: "Actual engagement... written back as a MemPalace drawer — the actual self-improving
// signal." Buildable as a write, same pattern as session-memory.ts's persistToMemPalace: writes
// the outcome to a real file, then mines it into MemPalace scoped to the creative wing. No real
// engagement data exists yet to test this against (Novizio has no shipped/measured creative in
// this repo) — the mechanism is real, exercising it end-to-end awaits real production content.

export interface CreativeOutcome {
  postId: string
  wing: string
  likes?: number
  saves?: number
  shares?: number
  clickThroughRate?: number
  publishedAt: string
  measuredAt: string
}

export function recordCreativeOutcome(outcome: CreativeOutcome): { filed: boolean; error?: string } {
  const dir = join(getConfig().projectRoot, 'store', 'creative-outcomes')
  mkdirSync(dir, { recursive: true })
  const path = join(dir, `${outcome.postId}.json`)
  writeFileSync(path, JSON.stringify(outcome, null, 2), 'utf-8')
  const result = mineIntoMemPalace(path, { wing: outcome.wing })
  return { filed: result.filed, error: result.error }
}
