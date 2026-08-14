// dashboard/lib/graph/venture-code-graph.ts — maps a venture's graphify output
// (venture_graphs.graph_data, migration 120) onto the same Dept[]/Agent[] shape
// YvonGraph.tsx already renders for the org chart, so the satellite "Code Graph"
// mode reuses buildLayout()/DetailView() as-is instead of a second render path.
//
// Real shape confirmed live against Novizio-Web (2026-08-14) — graphify emits
// networkx's node_link_data() JSON: top-level {graph, nodes, links, directed,
// multigraph, hyperedges, built_at_commit}. Fields actually used below:
//   node:  { id, label, community, file_type, source_file, source_location }
//   link:  { source, target, weight, relation, confidence }
// community is a plain integer — graphify's Leiden clustering, not folder
// structure — but in practice tracks it closely (AST edges mostly stay within
// a file/module), which is what makes it a legible "department" grouping.

export interface CodeGraphNode {
  id: string
  label?: string
  community?: number | string
  file_type?: string
  source_file?: string
  source_location?: string
  [key: string]: unknown
}

export interface CodeGraphLink {
  source: string
  target: string
  weight?: number
  relation?: string
  confidence?: string
  [key: string]: unknown
}

export interface RawGraphData {
  nodes?: CodeGraphNode[]
  links?: CodeGraphLink[]
  [key: string]: unknown
}

// Same shapes YvonGraph.tsx's Dept/Agent interfaces use — duplicated here
// (not imported) because that file's interfaces aren't exported; the fields
// consumed by buildLayout/DetailView are stable and small enough that a
// structural match is fine.
export interface CodeGraphAgent { id: string; name: string; tag: string }
export interface CodeGraphDept {
  id: string
  name: string
  metric: string
  metricLabel: string
  agents: CodeGraphAgent[]
}

/** Up to the first two path segments of source_file, sans filename when
 *  there's real directory nesting (`app/about/page.jsx` -> `app/about`),
 *  or the bare filename for root-level files (`package.json` -> `package.json`). */
function pathLabel(sourceFile: string | undefined): string {
  if (!sourceFile) return 'other'
  const parts = sourceFile.split('/')
  if (parts.length <= 1) return parts[0] ?? 'other'
  return parts.slice(0, 2).join('/')
}

/** Most frequent pathLabel among a community's nodes — the community's display name. */
function dominantLabel(nodes: CodeGraphNode[]): string {
  const counts = new Map<string, number>()
  for (const n of nodes) {
    const l = pathLabel(n.source_file)
    counts.set(l, (counts.get(l) ?? 0) + 1)
  }
  let best = 'other'
  let bestCount = -1
  for (const [label, count] of counts) {
    if (count > bestCount) { best = label; bestCount = count }
  }
  return best
}

/** file_type (or, failing that, the source_location line ref) as the short tag
 *  shown under each node's name in the DetailView fan-out — mirrors how the
 *  org chart shows an agent's role tag. */
function nodeTag(n: CodeGraphNode): string {
  if (n.file_type) return n.file_type
  if (n.source_location) return n.source_location
  return ''
}

/**
 * Groups graph_data.nodes by `community` into Dept-shaped clusters, sorted by
 * size descending (biggest cluster first — mirrors the org chart's real
 * department sizes driving ring order via buildLayout's stable-id sort,
 * except here "stable" just needs to be deterministic per rebuild, which
 * community-id sort already gives us).
 */
export function graphDataToDepartments(graphData: RawGraphData | null | undefined): CodeGraphDept[] {
  if (!graphData?.nodes?.length) return []

  const byCommunity = new Map<string, CodeGraphNode[]>()
  for (const n of graphData.nodes) {
    const key = String(n.community ?? 'unclustered')
    const arr = byCommunity.get(key)
    if (arr) arr.push(n)
    else byCommunity.set(key, [n])
  }

  return Array.from(byCommunity.entries())
    .sort((a, b) => b[1].length - a[1].length)
    .map(([community, nodes]) => ({
      id: `community-${community}`,
      name: dominantLabel(nodes),
      metric: String(nodes.length),
      metricLabel: nodes.length === 1 ? 'FILE NODE' : 'FILE NODES',
      agents: nodes.map((n) => ({
        id: n.id,
        name: n.label ?? n.id,
        tag: nodeTag(n),
      })),
    }))
}

/** Links whose endpoints are both inside the same community — used to draw
 *  the DetailView fan-out edges when a code-graph "department" is opened,
 *  same role graphify's own `relation`/`confidence` edges play in the raw graph. */
export function linksWithinCommunity(
  graphData: RawGraphData | null | undefined,
  nodeIds: Set<string>,
): CodeGraphLink[] {
  if (!graphData?.links?.length) return []
  return graphData.links.filter((l) => nodeIds.has(l.source) && nodeIds.has(l.target))
}
