// lib/cie/sources/graphify.ts — real Graphify keyword-graph reader (TS-018 WI-13).
// Parses the code-structure knowledge graph (graphify-out/GRAPH_REPORT.md
// "### Community N" sections) into communities, scores them by keyword hits,
// and returns the top matches as compact 'G|' lines for retrieval.
//
// This is the dashboard-side port of src/cie/sources/graphify.ts, with the
// §8.6 cache fix: the cache is PATH-KEYED (resolved path + mtime), so switching
// projects can never serve the previous project's graph. If the report isn't
// present, it degrades to '' (retriever falls through to other sources).
//
// Path resolution: GRAPHIFY_REPORT env, else walk up from cwd for
// graphify-out/GRAPH_REPORT.md (dashboard cwd differs by deployment).
import { readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'

export interface GraphifyCommunity {
  name: string
  cohesion: number
  nodes: string[]
}

function resolveReportPath(): string | null {
  const fromEnv = process.env.GRAPHIFY_REPORT?.trim()
  if (fromEnv) return fromEnv
  const cwd = process.cwd()
  const candidates = [
    join(cwd, 'graphify-out', 'GRAPH_REPORT.md'),
    join(cwd, '..', 'graphify-out', 'GRAPH_REPORT.md'),
    join(cwd, '..', '..', 'graphify-out', 'GRAPH_REPORT.md'),
  ]
  for (const c of candidates) if (existsSync(c)) return c
  return null
}

// Path-keyed cache — { [path]: { mtime, communities } }. Never module-scope-only
// (YVON-CHAT §8.6: a stale cache from the previous project must not be served).
const cache = new Map<string, { mtime: number; communities: GraphifyCommunity[] }>()

export function getGraphifyReport(): { communities: GraphifyCommunity[]; path: string | null } {
  const path = resolveReportPath()
  if (!path) return { communities: [], path: null }
  let mtime: number
  try {
    mtime = statSync(path).mtimeMs
  } catch {
    return { communities: [], path }
  }
  const hit = cache.get(path)
  if (hit && hit.mtime === mtime) return { communities: hit.communities, path }

  let content: string
  try {
    content = readFileSync(path, 'utf-8')
  } catch {
    return { communities: [], path }
  }
  const communities = parseCommunities(content)
  cache.set(path, { mtime, communities })
  return { communities, path }
}

function parseCommunities(content: string): GraphifyCommunity[] {
  const communities: GraphifyCommunity[] = []
  const sections = content.split(/### Community \d+ - /)
  for (const section of sections.slice(1)) {
    const nameMatch = section.match(/^"([^"]+)"/)
    const cohesionMatch = section.match(/Cohesion:\s*([\d.]+)/)
    const nodesMatch = section.match(/Nodes\s*\((\d+)\):\s*(.+)/)
    if (nameMatch && cohesionMatch && nodesMatch) {
      const nodes = nodesMatch[2].split(',').map((n) => n.trim().replace(/\(.*\)/, ''))
      communities.push({ name: nameMatch[1], cohesion: parseFloat(cohesionMatch[1]), nodes })
    }
  }
  return communities
}

export function queryGraphify(keywords: string[]): string {
  const { communities } = getGraphifyReport()
  if (communities.length === 0) return ''
  const scored = communities
    .filter((c) => c.cohesion > 0.05 && c.nodes.length > 0)
    .map((c) => {
      const hits = c.nodes.filter((n) =>
        keywords.some((k) => n.toLowerCase().includes(k.toLowerCase())),
      )
      return { ...c, score: hits.length }
    })
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)

  return scored
    .slice(0, 3)
    .map((c) => `G|${c.name}|${c.cohesion}|${c.nodes.slice(0, 5).join(',')}`)
    .join('\n')
}

export function invalidateGraphifyCache(): void {
  cache.clear()
}
