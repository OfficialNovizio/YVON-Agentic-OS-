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
// sourceFile/fileType/community carried through (2026-08-15) so the detail
// panel can render an honest "code node" view instead of pretending a file
// is a YVON agent — see YvonGraph.tsx's AgentDetailPanel, codeGraphMode branch.
export interface CodeGraphAgent {
  id: string; name: string; tag: string
  sourceFile?: string; fileType?: string; community?: string | number
  // Real node ids this card aggregates (2026-08-30). In venture Code Graph
  // mode a card IS one real node, so memberIds is [id]. In the fleet-wide
  // module view (modulesToDepartments) a card is a whole Leiden community —
  // up to hundreds of real nodes folded into one dominant-label card — so
  // memberIds carries every underlying node id. This is what makes
  // connectionsFor() below work at either granularity without the caller
  // needing to know which mode it's in.
  memberIds?: string[]
}
export interface CodeGraphDept {
  id: string
  name: string
  metric: string
  metricLabel: string
  agents: CodeGraphAgent[]
}

/** One resolved edge into/out of the selected card, aggregated across every
 *  member id and every distinct (otherLabel, relation, direction) triple —
 *  see connectionsFor(). */
export interface CodeGraphConnection {
  otherId: string
  otherLabel: string
  otherSourceFile?: string
  relation: string
  direction: 'out' | 'in'
  count: number
}

/** Up to the first two path segments of source_file, sans filename when
 *  there's real directory nesting (`app/about/page.jsx` -> `app/about`),
 *  or the bare filename for root-level files (`package.json` -> `package.json`). */
function pathLabel(sourceFile: string | undefined): string {
  if (!sourceFile) return 'other'
  const parts = sourceFile.split('/')
  if (parts.length <= 1) return parts[0] ?? 'other'
  // 3 segments, not 2 (2026-08-30) — two segments alone ("Teams/Shared OS")
  // collapsed dozens of distinct clusters onto the same headline in the
  // Brain & Wiki orbit view (operator: "why does each card say Teams/Shared
  // OS"), since Shared OS's own subtree is large enough that most of this
  // repo's communities pull their majority-path from somewhere inside it.
  // Note honestly: some communities are still genuinely monocultures of one
  // heavily-shared file's callers even at 3 segments — that's a real
  // property of graphify's clustering, not something a label format fixes.
  return parts.slice(0, 3).join('/')
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
  // file_type is almost never useful as a headline subtitle — graphify only
  // emits 4 values total ('code'/'rationale'/'document'/'concept') and real
  // repo nodes are ~all 'code', so every card said the same thing. The file's
  // own basename is what actually tells two same-named symbols apart (e.g.
  // two different files each with a `Props` interface) — 2026-08-30.
  if (n.source_file) {
    const base = n.source_file.split('/').pop()
    if (base) return base
  }
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
        sourceFile: n.source_file,
        fileType: n.file_type,
        community: n.community,
        memberIds: [n.id],
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

/** id -> node lookup, built once per fetched graph (venture graph_data already
 *  carries this; the fleet-wide graph pairs its nodes file with a separately
 *  fetched links file — see buildFleetLinksIndex below — but resolving an
 *  edge's *other* endpoint back to a label/source_file always needs this same
 *  map, so it's shared between both paths). */
export function buildNodesById(nodes: CodeGraphNode[] | undefined): Map<string, CodeGraphNode> {
  const m = new Map<string, CodeGraphNode>()
  for (const n of nodes ?? []) m.set(n.id, n)
  return m
}

/**
 * Real "who does this connect to" for the detail panel (2026-08-30) — the ask
 * behind AgentDetailPanel's Connects To section. Resolves every link touching
 * ANY of the card's memberIds (one real node in venture Code Graph mode; up
 * to hundreds of nodes for a fleet-wide community card) to the OTHER
 * endpoint's real label/source_file, aggregating duplicate (other node,
 * relation, direction) triples into a count rather than listing them one by
 * one — a community card can have thousands of raw edges to the same
 * external file. Internal edges (both endpoints inside the same member set)
 * are dropped: they don't answer "connects to *others*". Sorted by count
 * descending and capped so the panel stays scannable; callers show a
 * "+N more" note using the discarded tail if they need it.
 */
export function connectionsFor(
  links: CodeGraphLink[] | undefined,
  nodesById: Map<string, CodeGraphNode>,
  memberIds: string[],
  limit = 20,
): CodeGraphConnection[] {
  if (!links?.length || !memberIds.length) return []
  const memberSet = new Set(memberIds)
  const agg = new Map<string, CodeGraphConnection>()
  for (const l of links) {
    const srcIn = memberSet.has(l.source)
    const tgtIn = memberSet.has(l.target)
    if (!srcIn && !tgtIn) continue
    if (srcIn && tgtIn) continue // internal — not an "other" connection
    const direction: 'out' | 'in' = srcIn ? 'out' : 'in'
    const otherId = srcIn ? l.target : l.source
    const relation = l.relation || 'related'
    const key = `${otherId}::${relation}::${direction}`
    const existing = agg.get(key)
    if (existing) { existing.count += 1; continue }
    const other = nodesById.get(otherId)
    agg.set(key, {
      otherId,
      otherLabel: other?.label ?? otherId,
      otherSourceFile: other?.source_file,
      relation,
      direction,
      count: 1,
    })
  }
  return Array.from(agg.values()).sort((a, b) => b.count - a.count).slice(0, limit)
}

/* ── Fleet-wide complete graph (2026-08-27) ─────────────────────────────
   The YVON OS repo graph (graphify-out/graph.json, emitted to
   /yvon-graph.json by scripts/build-code-graph.mjs) covers EVERY top-level
   module — Teams, dashboard, docs, rag, cli, … — where the org chart only
   shows the Teams/ tree. This groups it as:

     L1 module   = first path segment of source_file (`Teams`, `dashboard`, …),
                   long tail (<100 nodes) folded into one `other` module
     L2 cluster  = that module's Leiden communities (top 30 + `other clusters`),
                   reusing the same Dept/Agent shapes so buildLayout() and
                   DetailView() render them unchanged.

   Community pseudo-nodes are named by their dominant path (dominantLabel,
   same naming satellites use) with the node count as tag; id is prefixed
   with the module slug so the deptOf map stays 1:1 across modules. */

const MODULE_MIN_NODES = 100;
const MODULE_MAX_CLUSTERS = 30;

function moduleOf(n: CodeGraphNode): string {
  const top = (n.source_file ?? '').split('/')[0];
  return top || 'other';
}

/** Most frequent file_type among a community's nodes ('' when none set). */
function dominantFileType(nodes: CodeGraphNode[]): string {
  const counts = new Map<string, number>();
  for (const n of nodes) {
    if (!n.file_type) continue;
    counts.set(n.file_type, (counts.get(n.file_type) ?? 0) + 1);
  }
  let best = '';
  let bestCount = -1;
  for (const [ft, count] of counts) {
    if (count > bestCount) { best = ft; bestCount = count }
  }
  return best;
}

export function modulesToDepartments(graphData: RawGraphData | null | undefined): CodeGraphDept[] {
  if (!graphData?.nodes?.length) return []

  const byModule = new Map<string, CodeGraphNode[]>();
  for (const n of graphData.nodes) {
    const m = moduleOf(n);
    const arr = byModule.get(m);
    if (arr) arr.push(n);
    else byModule.set(m, [n]);
  }

  // Long tail folds into `other` so the L1 ring stays scannable while every
  // node stays reachable one click away (mirrors cli/graph-lens.py's rule).
  const entries = Array.from(byModule.entries()).sort((a, b) => b[1].length - a[1].length);
  const modules: { name: string; nodes: CodeGraphNode[] }[] = [];
  let tail: CodeGraphNode[] = [];
  for (const [name, nodes] of entries) {
    if (nodes.length >= MODULE_MIN_NODES) modules.push({ name, nodes });
    else tail = tail.concat(nodes);
  }
  if (tail.length) modules.push({ name: 'other', nodes: tail });

  return modules.map(({ name, nodes }) => {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'other';

    const byCommunity = new Map<string, CodeGraphNode[]>();
    for (const n of nodes) {
      const key = String(n.community ?? 'unclustered');
      const arr = byCommunity.get(key);
      if (arr) arr.push(n);
      else byCommunity.set(key, [n]);
    }
    const communities = Array.from(byCommunity.entries()).sort((a, b) => b[1].length - a[1].length);
    const top = communities.slice(0, MODULE_MAX_CLUSTERS);
    const rest = communities.slice(MODULE_MAX_CLUSTERS);

    const toAgent = (community: string, members: CodeGraphNode[]): CodeGraphAgent => ({
      id: `community-${slug}-${community}`,
      name: dominantLabel(members),
      // Cluster id in the tag (2026-08-30) — several communities can share
      // the same dominant path headline (see pathLabel above), so this is
      // what still tells two identical-looking orbit cards apart at a glance.
      tag: `Cluster ${community} · ${members.length} ${members.length === 1 ? 'node' : 'nodes'}`,
      sourceFile: dominantLabel(members),
      fileType: dominantFileType(members),
      community,
      memberIds: members.map((m) => m.id),
    });
    const agents = top.map(([community, members]) => toAgent(community, members));
    if (rest.length) {
      const restNodes = rest.flatMap(([, members]) => members);
      agents.push(toAgent('other', restNodes));
      agents[agents.length - 1].name = 'other clusters';
    }

    return {
      id: `module-${slug}`,
      name,
      metric: String(nodes.length),
      metricLabel: nodes.length === 1 ? 'FILE NODE' : 'FILE NODES',
      agents,
    };
  });
}
