// lib/cie/cross-scope-bridge.ts — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §8.3: Cross-scope bridge query
//
// "session scoped to brand X → RESOLVE grants READ-ONLY authorization into every other owned
// sibling wing, standing for the session... pull the specific relevant pattern only... result is
// explicitly attributed to its source wing, never presented as native history of the querying
// brand's own wing... optionally logged as a new drawer in the querying brand's own wing."
//
// Bridge eligibility follows the doc's 2026-08-09 resolution ("always on between owned siblings,
// Master-mediated for anything touching a client/tenant wing per Principle 1") using
// `ventures.kind`:
//   - core/venture ventures bridge to every OTHER core/venture venture, always on — no per-query
//     trigger condition to detect a cross-brand mention in the text
//   - client ventures are NOT bridged here — §0 Principle 1 keeps client isolation stricter than
//     sibling-brand isolation; a client's wing is never pulled into another brand's query by this
//     function, and a client venture querying out is refused too (eligible:false)
//
// "The specific relevant pattern" = each sibling's own MemPalace episodic search, scoped to that
// sibling's wing (`--wing <slug>`, sources/mempalace.ts). Code-graph (graphify) bridging is
// explicitly NOT built here: graphify.ts's graph.json is fixed to this process's own
// `projectRoot` at config-resolution time — bridging into a sibling's own code graph would mean
// running a second graphify instance against that sibling's `repo_url`/`local_repo_path`, which
// is out of scope for this pass (tracked, not silently assumed). This function bridges the one
// store that's genuinely cross-brand-queryable today: MemPalace, via `--wing`.
//
// The doc's "optionally logged as a new drawer in the querying brand's own wing" step (so a
// repeat query becomes local recall) is also not implemented here — it's a write, and this
// module only reads; left for whoever wires this into a real session flow to decide when a
// bridge result is worth persisting.

import { listVentures, type VentureRow } from './sources/ventures'
import { searchMemPalace, type MemPalaceSearchResult } from './sources/mempalace'

export interface BridgeHit {
  sourceVentureSlug: string
  sourceVentureName: string
  result: MemPalaceSearchResult
}

export interface CrossScopeBridgeResult {
  eligible: boolean
  reason: string
  hits: BridgeHit[]
}

const BRIDGE_ELIGIBLE_KINDS: VentureRow['kind'][] = ['core', 'venture']

/**
 * bridgeCrossScopeQuery — §8.3's mechanism. Given the venture slug the session is scoped to and
 * a query, searches every OTHER owned-sibling venture's MemPalace wing and returns results
 * explicitly attributed to their source venture — callers must not merge these into the
 * requesting brand's own results without that attribution, per the doc's isolation requirement.
 */
export async function bridgeCrossScopeQuery(
  sourceSlug: string,
  query: string,
  opts: { skipCache?: boolean; results?: number } = {},
): Promise<CrossScopeBridgeResult> {
  const ventures = await listVentures({ skipCache: opts.skipCache })
  if (ventures.length === 0) {
    return {
      eligible: false,
      reason: 'ventures registry unavailable (SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY not set, or the request failed)',
      hits: [],
    }
  }

  const source = ventures.find((v) => v.slug === sourceSlug)
  if (!source) {
    return { eligible: false, reason: `unknown venture slug "${sourceSlug}"`, hits: [] }
  }
  if (!BRIDGE_ELIGIBLE_KINDS.includes(source.kind)) {
    return {
      eligible: false,
      reason: `"${sourceSlug}" is kind="${source.kind}" — client ventures are Master-mediated only (§0 Principle 1), not bridged directly`,
      hits: [],
    }
  }

  const siblings = ventures.filter(
    (v) => v.slug !== sourceSlug && BRIDGE_ELIGIBLE_KINDS.includes(v.kind) && v.status === 'active',
  )

  if (siblings.length === 0) {
    return {
      eligible: true,
      reason: 'no other active owned-sibling ventures exist yet',
      hits: [],
    }
  }

  const hits: BridgeHit[] = []
  for (const sibling of siblings) {
    const result = searchMemPalace(query, { wing: sibling.slug, results: opts.results ?? 5 })
    if (result.available && result.hits.length > 0) {
      hits.push({ sourceVentureSlug: sibling.slug, sourceVentureName: sibling.name, result })
    }
  }

  return { eligible: true, reason: `bridged ${siblings.length} owned sibling venture(s)`, hits }
}
