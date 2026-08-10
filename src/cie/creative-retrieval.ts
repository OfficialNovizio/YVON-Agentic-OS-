// lib/cie/creative-retrieval.ts — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §13.1: Creative Retrieval Mode
//
// "Standard retrieval (§8) optimizes for precision... Creative work needs the opposite in
// places: deliberately wide, loose, and tolerant of low-similarity material." Four named
// sources; verified against real code/CLI (2026-08-09) rather than assumed:
//
//   graphify AMBIGUOUS edges  -> getLooseNeighbors() (sources/graphify.ts). Real confidence
//                                values are EXTRACTED/INFERRED, not "AMBIGUOUS" — INFERRED used
//                                as the closest equivalent, documented there, not silently
//                                substituted.
//   MemPalace SCOPED           -> searchMemPalace(query, {wing, room}) — real, existing flags.
//   MemPalace DISTANT          -> searchMemPalace(query, {}) with wing/room omitted. `mempalace
//                                search --help` (checked 2026-08-09) has no similarity-threshold
//                                flag — "lower-similarity-threshold recall" isn't literally
//                                controllable. Omitting the wing/room filter is the closest real
//                                mechanism (searches across all wings/rooms instead of one) —
//                                an approximation of "distant," not a tunable threshold.
//   kai historical performance -> NOT AVAILABLE. kai (Teams/Brand Studio/kai) is a prompt-only
//                                agent definition — no model, no scored-performance dataset
//                                exists in code anywhere in this repo. Returns null with a
//                                reason string rather than fabricating a score.

import { getLooseNeighbors, type GraphNode, type GraphEdge } from './sources/graphify'
import { searchMemPalace, type MemPalaceSearchResult } from './sources/mempalace'

export interface CreativeRetrievalResult {
  looseGraphEdges: { node: GraphNode; edge: GraphEdge }[]
  scoped: MemPalaceSearchResult
  distant: MemPalaceSearchResult
  kaiPerformance: null
  kaiUnavailableReason: string
}

/**
 * gatherCreativeContext — §13.1's four-source pull. entityId is the graphify node the loose-edge
 * walk starts from (e.g. the brand/campaign entity being worked on) — pass '' to skip it.
 */
export function gatherCreativeContext(
  query: string,
  opts: { entityId?: string; wing?: string; room?: string; results?: number } = {},
): CreativeRetrievalResult {
  const looseGraphEdges = opts.entityId ? getLooseNeighbors(opts.entityId) : []

  const scoped = searchMemPalace(query, { wing: opts.wing, room: opts.room, results: opts.results ?? 5 })
  const distant = searchMemPalace(query, { results: opts.results ?? 5 })

  return {
    looseGraphEdges,
    scoped,
    distant,
    kaiPerformance: null,
    kaiUnavailableReason:
      'kai (Teams/Brand Studio/kai) is a prompt-only agent definition — no scored historical ' +
      'performance model or dataset exists in code (verified 2026-08-09)',
  }
}
