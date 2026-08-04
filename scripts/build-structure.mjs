#!/usr/bin/env node
/**
 * build-structure.mjs — the org chart IS the directory tree.
 *
 * Walks Teams/, emits dashboard/public/structure.json for the graph viewer.
 * Runs as `prebuild` so every Vercel deploy regenerates it from the repo.
 *
 * Rules (per the dashboard brief §3.1):
 *  - a directory under Teams/<Dept>/ is an AGENT iff it contains agent.md or agent.toon
 *  - non-agent dirs (Shared OS, Books) and files (README, FLEET-CHARTER, …) are skipped
 *  - agent id = slug(dept) + "-" + dirname  — STABLE + DETERMINISTIC.
 *    This id is the contract with the event pipeline. If it drifts, nothing lights up.
 *
 * Role/tag is read from agent.md: YAML frontmatter `role:` if present, else the
 * H1 form `# name — Role (Dept…)`. Never invented — falls back to "" .
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEAMS = join(ROOT, 'Teams')
const OUT = join(ROOT, 'dashboard', 'public', 'structure.json')

const slug = s => s.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function roleOf(dir) {
  const md = join(dir, 'agent.md')
  if (!existsSync(md)) return ''
  const t = readFileSync(md, 'utf8')
  // 1) YAML frontmatter: role: Frontend Web
  const fm = t.startsWith('---') ? t.slice(3, t.indexOf('\n---', 3)) : ''
  const mRole = fm.match(/^role:\s*(.+)$/m)
  if (mRole) return mRole[1].trim()
  // 2) H1: "# spec — Product Manager (Product, department leader)"
  const h1 = t.match(/^#\s+\S+\s+[—-]\s+([^(\n]+)/m)
  return h1 ? h1[1].trim() : ''
}

const departments = []
for (const deptName of readdirSync(TEAMS).sort()) {
  const deptDir = join(TEAMS, deptName)
  if (!statSync(deptDir).isDirectory() || deptName.startsWith('.')) continue

  const agents = readdirSync(deptDir).sort()
    .map(name => ({ name, dir: join(deptDir, name) }))
    .filter(({ name, dir }) =>
      !name.startsWith('.') && statSync(dir).isDirectory() &&
      (existsSync(join(dir, 'agent.md')) || existsSync(join(dir, 'agent.toon'))))
    .map(({ name, dir }) => ({
      id: `${slug(deptName)}-${name}`,   // stable contract id
      name,
      tag: roleOf(dir),
    }))

  if (!agents.length) continue          // Shared OS / Books hold no agents
  departments.push({
    id: slug(deptName),
    name: deptName,
    metric: String(agents.length).padStart(2, '0'),
    metricLabel: 'Agents',
    agents,
  })
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ version: Date.now(), departments }, null, 0))

// Alias map: bare agent name → stable id (mia → engineering-mia). All 46 names are
// unique, so this is 1:1. The Hermes wrapper loads it to resolve `mentions` into
// the ids the graph keys on — generated, so the contract can never drift by hand.
const alias = Object.fromEntries(departments.flatMap(d => d.agents.map(a => [a.name, a.id])))
const ALIAS_OUT = join(ROOT, 'vps-scripts', 'yvon-hermes-http', 'agent-alias.json')
writeFileSync(ALIAS_OUT, JSON.stringify(alias, null, 0))
if (Object.keys(alias).length !== departments.reduce((n, d) => n + d.agents.length, 0))
  throw new Error('agent name collision — bare-name → id mapping is not 1:1')

const total = departments.reduce((n, d) => n + d.agents.length, 0)
console.log(`✓ structure.json — ${departments.length} departments, ${total} agents`)
for (const d of departments) console.log(`    ${d.name.padEnd(18)} ${String(d.agents.length).padStart(2)}  ${d.agents.map(a => a.name).join(', ')}`)
