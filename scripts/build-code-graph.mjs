#!/usr/bin/env node
/**
 * build-code-graph.mjs — the COMPLETE YVON graph for the Brain & Wiki viewer.
 *
 * graphify-out/graph.json covers every module of this repo (Teams, dashboard,
 * docs, rag, cli, … — 24k+ nodes) where structure.json only walks Teams/.
 * This trims it to the fields the viewer's Code Graph mode consumes
 * (id, label, community, file_type, source_file) and emits
 * dashboard/public/yvon-graph.json, fetched by YvonGraph's fleet
 * "Code Graph" tab.
 *
 * Links (2026-08-30) are emitted SEPARATELY to dashboard/public/yvon-graph-links.json
 * (source, target, relation only — confidence/context/weight dropped) rather
 * than inlined into yvon-graph.json: nodes alone are ~5MB and are needed on
 * every Brain & Wiki load, where the ~5.5MB of links is only needed the first
 * time someone opens a code-graph detail panel (YvonGraph.tsx lazy-fetches it
 * there, same pattern as agent-details.json). This keeps the always-loaded
 * payload the same size while still making the full edge set available —
 * no data is dropped, it's just deferred.
 *
 * Runs as `prebuild` (next to build-structure.mjs) and from graph-sync.sh
 * after the nightly graph build. If graphify-out/graph.json is absent
 * (fresh clone / deploy), it leaves any existing output files untouched
 * and exits 0 — the viewer shows its empty-state note instead.
 */
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'graphify-out', 'graph.json')
const OUT = join(ROOT, 'dashboard', 'public', 'yvon-graph.json')
const OUT_LINKS = join(ROOT, 'dashboard', 'public', 'yvon-graph-links.json')

if (!existsSync(SRC)) {
  console.log('ⓘ graphify-out/graph.json not present — keeping existing yvon-graph.json (if any)')
  process.exit(0)
}

const g = JSON.parse(readFileSync(SRC, 'utf8'))
const nodes = (g.nodes ?? []).map((n) => ({
  id: n.id,
  label: n.label ?? n.id,
  community: n.community ?? 'unclustered',
  file_type: n.file_type ?? '',
  source_file: n.source_file ?? '',
}))
const links = (g.links ?? []).map((l) => ({
  source: l.source,
  target: l.target,
  relation: l.relation ?? '',
}))

const out = {
  version: statSync(SRC).mtimeMs,
  built_at_commit: g.built_at_commit ?? null,
  nodes,
}
mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify(out))
writeFileSync(OUT_LINKS, JSON.stringify({ version: out.version, links }))
const mb = (statSync(OUT).size / 1e6).toFixed(1)
const linksMb = (statSync(OUT_LINKS).size / 1e6).toFixed(1)
console.log(`✓ yvon-graph.json — ${nodes.length} nodes (${mb} MB) from graphify-out/graph.json @ ${out.built_at_commit}`)
console.log(`✓ yvon-graph-links.json — ${links.length} links (${linksMb} MB)`)
