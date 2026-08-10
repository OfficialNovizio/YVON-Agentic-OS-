// lib/cie/sources/graphify.ts — Code structure knowledge graph source
import { readFileSync, existsSync, statSync } from 'fs'
import { getConfig } from '../../adapters/config'

export interface GraphifyCommunity { name: string; cohesion: number; nodes: string[] }

let cachedCommunities: GraphifyCommunity[] | null = null
let cachedMtime: number = 0

export function getGraphifyReport(): { communities: GraphifyCommunity[] } {
  const config = getConfig()
  const path = config.graphifyReport
  if (!existsSync(path)) return { communities: [] }
  
  const mtime = statSync(path).mtimeMs
  if (cachedCommunities && cachedMtime === mtime) return { communities: cachedCommunities }
  
  const content = readFileSync(path, 'utf-8')
  const communities = parseCommunities(content)
  cachedCommunities = communities
  cachedMtime = mtime
  return { communities }
}

function parseCommunities(content: string): GraphifyCommunity[] {
  const communities: GraphifyCommunity[] = []
  const sections = content.split(/### Community \d+ - /)
  for (const section of sections.slice(1)) {
    const nameMatch = section.match(/^"([^"]+)"/)
    const cohesionMatch = section.match(/Cohesion:\s*([\d.]+)/)
    const nodesMatch = section.match(/Nodes\s*\((\d+)\):\s*(.+)/)
    if (nameMatch && cohesionMatch && nodesMatch) {
      const nodes = nodesMatch[2].split(',').map(n => n.trim().replace(/\(.*\)/, ''))
      communities.push({ name: nameMatch[1], cohesion: parseFloat(cohesionMatch[1]), nodes })
    }
  }
  return communities
}

export function queryGraphify(keywords: string[]): string {
  const { communities } = getGraphifyReport()
  const scored = communities
    .filter(c => c.cohesion > 0.05 && c.nodes.length > 0)
    .map(c => {
      const hits = c.nodes.filter(n => keywords.some(k => n.toLowerCase().includes(k.toLowerCase())))
      return { ...c, score: hits.length }
    })
    .filter(c => c.score > 0)
    .sort((a, b) => b.score - a.score)
  
  return scored.slice(0, 3).map(c => `G|${c.name}|${c.cohesion}|${c.nodes.slice(0,5).join(',')}`).join('\n')
}

export function invalidateGraphifyCache(): void {
  cachedCommunities = null
  cachedGraphData = null
}

// ---------------------------------------------------------------------------
// Real graph-query primitives — operate on graph.json (NetworkX node-link
// format), not the markdown report above. Added 2026-08-09 to back CLASSIFY
// Layer 1.1 (entity resolution) and 1.2 (impact radius).
//
// IMPORTANT — verified against the live graph.json (2026-08-09): graphify's
// generated edges are AST-derived only (calls, contains, imports,
// imports_from, references, indirect_call, re_exports, method, extends,
// uses, defines, inherits, rationale_for). There is NO "consumes",
// "produces", "handoff", or "belongs_to" edge type anywhere in the data —
// those are YVON's own workflow-semantic vocabulary, not something graphify
// (a generic AST tool) infers on its own. Callers asking for those literal
// edge_types will get zero results, correctly — do not silently substitute
// a different edge type without saying so (§0.5, no invented values).
// getImpactRadius() below documents the practical mapping it actually uses.
// ---------------------------------------------------------------------------

export interface GraphNode {
  id: string
  label: string
  file_type?: string
  source_file?: string
  source_location?: string
  community?: number
  community_name?: string
  metadata?: Record<string, unknown>
}

export interface GraphEdge {
  source: string
  target: string
  relation: string
  confidence?: string
  confidence_score?: number
  weight?: number
  source_file?: string
  source_location?: string
}

interface GraphData {
  nodes: GraphNode[]
  links: GraphEdge[]
  nodeById: Map<string, GraphNode>
  outEdges: Map<string, GraphEdge[]>
  inEdges: Map<string, GraphEdge[]>
}

let cachedGraphData: GraphData | null = null
let cachedGraphDataMtime = 0

function getGraphData(): GraphData | null {
  const config = getConfig()
  const path = config.graphifyGraphJson
  if (!existsSync(path)) return null

  const mtime = statSync(path).mtimeMs
  if (cachedGraphData && cachedGraphDataMtime === mtime) return cachedGraphData

  let parsed: { nodes: GraphNode[]; links: GraphEdge[] }
  try {
    parsed = JSON.parse(readFileSync(path, 'utf-8'))
  } catch {
    return null
  }

  const nodeById = new Map<string, GraphNode>()
  const outEdges = new Map<string, GraphEdge[]>()
  const inEdges = new Map<string, GraphEdge[]>()

  for (const node of parsed.nodes) nodeById.set(node.id, node)
  for (const edge of parsed.links) {
    const out = outEdges.get(edge.source) ?? []
    out.push(edge)
    outEdges.set(edge.source, out)
    const inn = inEdges.get(edge.target) ?? []
    inn.push(edge)
    inEdges.set(edge.target, inn)
  }

  cachedGraphData = { nodes: parsed.nodes, links: parsed.links, nodeById, outEdges, inEdges }
  cachedGraphDataMtime = mtime
  return cachedGraphData
}

export interface QueryGraphResult {
  /** Exact id or exact (case-insensitive) label matches — "confident unique" per §8.1 if length===1. */
  exact: GraphNode[]
  /** Label-substring matches, only populated when exact is empty — fuzzy, never "confident." */
  fuzzy: GraphNode[]
}

/**
 * queryGraph — canonical/deterministic entity lookup, Layer 1.1 step 1.
 * Exact id/label matches and substring matches are returned separately so
 * callers can implement §8.1's actual rule ("confident unique match →
 * resolved") without re-deriving exactness themselves: exact.length === 1
 * is the only case that's confident; anything else (0 exact, or >1 exact
 * homonyms) falls through to the caller's next step.
 */
export function queryGraph(entity: string, scope?: string): QueryGraphResult {
  const data = getGraphData()
  if (!data) return { exact: [], fuzzy: [] }

  const needle = entity.toLowerCase().trim()
  const scoped = scope
    ? data.nodes.filter((n) => (n.source_file ?? '').toLowerCase().includes(scope.toLowerCase()))
    : data.nodes

  const exactId = scoped.filter((n) => n.id === entity)
  if (exactId.length > 0) return { exact: exactId, fuzzy: [] }

  const exactLabel = scoped.filter((n) => n.label.toLowerCase() === needle)
  if (exactLabel.length > 0) return { exact: exactLabel, fuzzy: [] }

  return { exact: [], fuzzy: scoped.filter((n) => n.label.toLowerCase().includes(needle)) }
}

/**
 * getNeighbors — Layer 1.2/1.3's underlying primitive. edgeTypes filters by
 * the `relation` field; omit to get all real edge types. direction controls
 * whether we walk outgoing edges (this node → others), incoming (others →
 * this node), or both. hops=2 only for explicitly requested high-fanout
 * cases per §8.2 — default is 1-hop. confidence filters by the `confidence`
 * field (real live values, verified 2026-08-09: 'EXTRACTED' | 'INFERRED' —
 * omit for both).
 */
export function getNeighbors(
  entityId: string,
  edgeTypes?: string[],
  opts: { direction?: 'out' | 'in' | 'both'; hops?: 1 | 2; confidence?: string[] } = {},
): { node: GraphNode; edge: GraphEdge }[] {
  const data = getGraphData()
  if (!data) return []

  const direction = opts.direction ?? 'both'
  const hops = opts.hops ?? 1
  const typeSet = edgeTypes ? new Set(edgeTypes) : null
  const confSet = opts.confidence ? new Set(opts.confidence) : null

  const walk = (id: string): { node: GraphNode; edge: GraphEdge }[] => {
    const results: { node: GraphNode; edge: GraphEdge }[] = []
    const edges: GraphEdge[] = []
    if (direction === 'out' || direction === 'both') edges.push(...(data.outEdges.get(id) ?? []))
    if (direction === 'in' || direction === 'both') edges.push(...(data.inEdges.get(id) ?? []))
    for (const edge of edges) {
      if (typeSet && !typeSet.has(edge.relation)) continue
      if (confSet && !confSet.has(edge.confidence ?? '')) continue
      const neighborId = edge.source === id ? edge.target : edge.source
      const node = data.nodeById.get(neighborId)
      if (node) results.push({ node, edge })
    }
    return results
  }

  const first = walk(entityId)
  if (hops === 1) return first

  const seen = new Set(first.map((r) => r.node.id))
  const second = first.flatMap((r) => walk(r.node.id)).filter((r) => !seen.has(r.node.id))
  return [...first, ...second]
}

/**
 * getLooseNeighbors — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §13.1's "graphify: include
 * AMBIGUOUS-confidence edges (normally excluded from precision retrieval)".
 * VERIFIED CORRECTION (2026-08-09): there is no 'AMBIGUOUS' confidence value
 * anywhere in the live graph.json — real values are only 'EXTRACTED'
 * (15436 edges) and 'INFERRED' (421 edges). 'INFERRED' is the closest real
 * equivalent (lower-certainty than a directly-parsed AST edge) and is what
 * this function returns. Also worth noting: getImpactRadius() (§8.2,
 * precision retrieval) does NOT currently filter by confidence at all — it
 * includes both EXTRACTED and INFERRED edges today. So this function's real
 * contribution isn't "the complement of a precision filter that already
 * excludes these" (no such filter exists yet) — it's "explicitly surface
 * the lower-confidence edges creative work wants," which precision callers
 * simply don't ask for.
 */
export function getLooseNeighbors(
  entityId: string,
  opts: { direction?: 'out' | 'in' | 'both'; hops?: 1 | 2 } = {},
): { node: GraphNode; edge: GraphEdge }[] {
  return getNeighbors(entityId, undefined, { ...opts, confidence: ['INFERRED'] })
}

/**
 * getImpactRadius — Layer 1.2's practical implementation. The doc's
 * pseudocode names edge_types=["consumes","produces","handoff"], which do
 * not exist in graphify's AST-derived graph (see module comment above).
 * The real, closest-available equivalent for "who breaks if I change this
 * code entity" is graphify's actual dependency edges: imports/imports_from
 * (module-level), calls/indirect_call (function-level), references/uses
 * (looser coupling). re_exports and extends/inherits are included because
 * they're also load-bearing for downstream behavior. This function is the
 * one place that mapping lives — change it here, not by guessing edge names
 * at call sites.
 */
const IMPACT_RADIUS_EDGE_TYPES = [
  'imports', 'imports_from', 'calls', 'indirect_call',
  'references', 'uses', 're_exports', 'extends', 'inherits',
]

export function getImpactRadius(
  entityId: string,
  opts: { hops?: 1 | 2 } = {},
): { node: GraphNode; edge: GraphEdge }[] {
  // Impact radius asks "who consumes this" — walk incoming edges (others →
  // this entity means they depend on it), not outgoing.
  return getNeighbors(entityId, IMPACT_RADIUS_EDGE_TYPES, { direction: 'in', hops: opts.hops ?? 1 })
}
