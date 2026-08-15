#!/usr/bin/env node
/**
 * build-agent-details.mjs — brain-wiki's agent detail panel, built-time source.
 *
 * Sibling to build-structure.mjs (same Teams/ walk, same id scheme: slug(dept)+"-"+dirname),
 * but goes deeper per agent: parses agent.md's real sections (Purpose, Skill Roster,
 * Operational Layer, Logical Layer) and inlines the actual file content each row points
 * at — so the frontend can render a real skills tree + "show full skill" reader without
 * any runtime filesystem access (2026-08-15, dashboard user request: "show all skills in
 * a tree and when i click on skill card show of that skill full").
 *
 * Runs as part of `dev`/`prebuild`, right after build-structure.mjs, same reasoning:
 * regenerated from the repo on every deploy, never hand-edited, never invented — a
 * section that doesn't parse is left empty rather than guessed at.
 */
import { readdirSync, readFileSync, statSync, mkdirSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const TEAMS = join(ROOT, 'Teams')
const OUT = join(ROOT, 'dashboard', 'public', 'agent-details.json')

const slug = s => s.toLowerCase().replace(/&/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

function readIfExists(p) {
  return existsSync(p) ? readFileSync(p, 'utf8').trim() : null
}

// Pull the text of one "## Heading" section (up to the next "## " or end of file).
function section(md, heading) {
  // Some agent.md files suffix a count, e.g. "## Skill Roster (5)" — match the
  // heading as a prefix of the line, not the whole line, so those still hit.
  const re = new RegExp(`^##\\s+${heading}\\b.*$`, 'mi')
  const m = re.exec(md)
  if (!m) return null
  const rest = md.slice(m.index + m[0].length)
  const next = rest.search(/^##\s+/m)
  return (next === -1 ? rest : rest.slice(0, next)).trim()
}

// Parse a markdown table "| a | b | c |" (skips the header + separator row).
function table(text) {
  if (!text) return []
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.startsWith('|'))
  const rows = lines.filter(l => !/^\|[\s:|-]+\|$/.test(l))
  if (rows.length < 2) return []
  const cells = l => l.slice(1, -1).split('|').map(c => c.trim())
  return rows.slice(1).map(cells) // drop header row
}

function stripMd(s) {
  return (s ?? '').replace(/`/g, '')
}

// Resolve a Skill Roster row's "Location" cell to real file content.
function resolveSkillContent(agentDir, skillName, locationRaw) {
  const loc = stripMd(locationRaw)
  const sharedMatch = loc.match(/Teams\/Shared OS\/skills\/([a-z0-9-]+)/i)
  if (sharedMatch) {
    const p = join(TEAMS, 'Shared OS', 'skills', sharedMatch[1], 'SKILL.md')
    return { kind: 'shared', path: `Teams/Shared OS/skills/${sharedMatch[1]}/SKILL.md`, content: readIfExists(p) }
  }
  const ownMatch = loc.match(/^(custom|marketplace)\/?/)
  if (ownMatch) {
    const p = join(agentDir, ownMatch[1], skillName, 'SKILL.md')
    return { kind: 'own', path: null, content: readIfExists(p) }
  }
  return { kind: 'unresolved', path: null, content: null }
}

// Third real template variant, found 2026-08-15 in the Client Success / Comms
// & PR / Global Expansion / Growth & Partnerships / Risk & ESG batch: no
// "## Skill Roster" or "## Operational Layer" tables at all — skills appear as
// "## Skills (N)" with optional "### n. `skill-name`" prose subheadings, and
// the real, authoritative file list lives in a "## File Layout" ASCII tree
// instead. Parsed by probing the filesystem directly (custom/ then
// marketplace/ for each `<name>/SKILL.md` the tree mentions, operational/<sub>/
// <file> for each operational entry) rather than trusting free-text — the
// tree can be incomplete prose, the filesystem can't lie.
function parseSkillsFromDescriptions(md) {
  const m = md.match(/^##\s+Skills\s*\(\d+\)\s*$/mi)
  if (!m) return new Map()
  const rest = md.slice(m.index + m[0].length)
  const end = rest.search(/^##\s+/m)
  const block = end === -1 ? rest : rest.slice(0, end)
  const out = new Map()
  const re = /^###\s+\d+\.\s+`([a-z0-9-]+)`\s*$/gim
  let hit
  const heads = []
  while ((hit = re.exec(block))) heads.push({ name: hit[1], at: hit.index + hit[0].length })
  for (let i = 0; i < heads.length; i++) {
    const stop = i + 1 < heads.length ? block.indexOf('###', heads[i].at) : block.length
    out.set(heads[i].name, block.slice(heads[i].at, stop === -1 ? block.length : stop).trim())
  }
  return out
}

function parseFileLayoutFallback(md, agentDir) {
  const layout = section(md, 'File Layout')
  if (!layout) return { skillRoster: [], operationalLayer: [] }
  const descriptions = parseSkillsFromDescriptions(md)

  const skillNames = [...new Set([...layout.matchAll(/([a-z0-9-]+)\/SKILL\.md/gi)].map((m) => m[1]))]
  const skillRoster = skillNames.map((skill) => {
    const customContent = readIfExists(join(agentDir, 'custom', skill, 'SKILL.md'))
    const marketContent = customContent === null ? readIfExists(join(agentDir, 'marketplace', skill, 'SKILL.md')) : null
    return {
      skill, location: customContent !== null ? 'custom/' : marketContent !== null ? 'marketplace/' : '',
      purpose: descriptions.get(skill) ?? '', kind: 'own', path: null, content: customContent ?? marketContent,
    }
  })

  const opMatches = [...layout.matchAll(/\b(skill|commands|principles|agent|tool)\/([a-z0-9_-]+\.md)/gi)]
  const seen = new Set()
  const operationalLayer = []
  for (const [, subfolder, file] of opMatches) {
    const key = `${subfolder}/${file}`
    if (seen.has(key)) continue
    seen.add(key)
    operationalLayer.push({ subfolder, file, summary: '', content: readIfExists(join(agentDir, 'operational', subfolder, file)) })
  }
  return { skillRoster, operationalLayer }
}

function parseAgent(agentDir, id) {
  const mdPath = join(agentDir, 'agent.md')
  const md = readIfExists(mdPath)
  if (!md) return { id, purpose: '', skillRoster: [], skillChain: '', operationalLayer: [], logicalLayer: null }

  const purpose = section(md, 'Purpose') ?? section(md, 'Identity & Scope') ?? ''
  const skillChain = section(md, 'Skill Chain \\(summary\\)') ?? section(md, 'Skill Chain') ?? ''

  // Three real template variants in the fleet (2026-08-15 finding): most agents
  // use "| Skill | Location | One-line purpose |" (3 cols); a handful (AI &
  // Agents, Cybersecurity depts) use "| Skill | Folder | Status | Notes |" (4
  // cols); a third batch (Client Success, Comms & PR, Global Expansion, Growth
  // & Partnerships, Risk & ESG) has no table at all — see parseFileLayoutFallback.
  let skillRoster = table(section(md, 'Skill Roster')).map(([skill, location, ...rest]) => {
    const resolved = resolveSkillContent(agentDir, skill, location)
    return { skill, location: stripMd(location), purpose: rest.filter(Boolean).join(' — '), ...resolved }
  })

  let operationalLayer = table(section(md, 'Operational Layer')).map(([subfolder, file, summary]) => {
    const fileName = stripMd(file)
    const p = join(agentDir, 'operational', subfolder, fileName)
    return { subfolder, file: fileName, summary: summary ?? '', content: readIfExists(p) }
  })

  if (skillRoster.length === 0 && operationalLayer.length === 0) {
    const fallback = parseFileLayoutFallback(md, agentDir)
    skillRoster = fallback.skillRoster
    operationalLayer = fallback.operationalLayer
  }

  const logicalRaw = section(md, 'Logical Layer')
  let logicalLayer = null
  if (logicalRaw) {
    const pathMatch = logicalRaw.match(/`([^`]+\.md)`/)
    const relPath = pathMatch ? pathMatch[1] : 'logical/book-requirements.md'
    logicalLayer = { summary: logicalRaw, content: readIfExists(join(agentDir, relPath)) }
  }

  return { id, purpose, skillRoster, skillChain, operationalLayer, logicalLayer }
}

const details = {}
let agentCount = 0
for (const deptName of readdirSync(TEAMS).sort()) {
  const deptDir = join(TEAMS, deptName)
  if (!statSync(deptDir).isDirectory() || deptName.startsWith('.')) continue

  for (const name of readdirSync(deptDir).sort()) {
    const dir = join(deptDir, name)
    if (name.startsWith('.') || !statSync(dir).isDirectory()) continue
    if (!existsSync(join(dir, 'agent.md')) && !existsSync(join(dir, 'agent.toon'))) continue
    const id = `${slug(deptName)}-${name}`
    try {
      details[id] = parseAgent(dir, id)
      agentCount++
    } catch (err) {
      console.warn(`  ! failed to parse ${id}: ${err.message}`)
      details[id] = { id, purpose: '', skillRoster: [], skillChain: '', operationalLayer: [], logicalLayer: null }
    }
  }
}

mkdirSync(dirname(OUT), { recursive: true })
writeFileSync(OUT, JSON.stringify({ version: Date.now(), agents: details }, null, 0))
console.log(`✓ agent-details.json — ${agentCount} agents parsed`)
