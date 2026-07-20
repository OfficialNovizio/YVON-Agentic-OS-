// lib/cie/sources/agent-memory.ts — Agent memory knowledge source
import { readFileSync, existsSync, statSync } from 'fs'
import { join } from 'path'
import { getConfig } from '../../adapters/config'
import type { TaskType } from '../types'

export interface AgentMemoryRules {
  neverAgain: string[]
  architectureLocks: string[]
  rejectedPatterns: string[]
  personality: string
}

const cache = new Map<string, { content: string; mtime: number }>()

// Agent memory paths — each agent's memory lives under <department>/<shortId>/
// Derived from the 46-agent department framework registry.
// Unknown agents fall back to `Technical/<agentId>`.
const AGENT_DEPT_MAP: Record<string, string> = {
  // Executive Office
  marcus:'Executive Office/marcus', echo:'Executive Office/echo', vista:'Executive Office/vista',
  // Governance
  board:'Governance/board', precedent:'Governance/precedent', sentinel:'Governance/sentinel',
  // Engineering
  dev:'Engineering/dev', ops:'Engineering/ops', cypher:'Engineering/cypher',
  aegis:'Engineering/aegis', axiom:'Engineering/axiom', rank:'Engineering/rank',
  quinn:'Engineering/quinn', dana:'Engineering/dana', raj:'Engineering/raj',
  mia:'Engineering/mia', nova:'Engineering/nova',
  // Cybersecurity
  warden:'Cybersecurity/warden', keyring:'Cybersecurity/keyring', bastion:'Cybersecurity/bastion',
  cortex:'Cybersecurity/cortex', veil:'Cybersecurity/veil',
  // Product
  spec:'Product/spec', metric:'Product/metric', ux:'Product/ux', loom:'Product/loom', price:'Product/price',
  // AI & Agents
  meta:'AI & Agents/meta', relay:'AI & Agents/relay', gauge:'AI & Agents/gauge',
  anneal:'AI & Agents/anneal', forge:'AI & Agents/forge', scout:'AI & Agents/scout',
  proto:'AI & Agents/proto', edge:'AI & Agents/edge',
  // Brand Studio
  spark:'Brand Studio/spark', atlas:'Brand Studio/atlas', lena:'Brand Studio/lena',
  weave:'Brand Studio/weave', muse:'Brand Studio/muse', pixel:'Brand Studio/pixel',
  pulse:'Brand Studio/pulse', rio:'Brand Studio/rio', nate:'Brand Studio/nate',
  kai:'Brand Studio/kai', tempo:'Brand Studio/tempo',
}

function getMemoryPath(agentId: string): string {
  const config = getConfig()
  const agentPath = AGENT_DEPT_MAP[agentId.toLowerCase()] ?? `Technical/${agentId}`
  return join(config.agentMemoryDir, agentPath, 'MEMORY.md')
}

function readCached(path: string): string {
  if (!existsSync(path)) return ''
  const mtime = statSync(path).mtimeMs
  const cached = cache.get(path)
  if (cached && cached.mtime === mtime) return cached.content
  const content = readFileSync(path, 'utf-8')
  cache.set(path, { content, mtime })
  return content
}

export function getAgentMemoryRules(agentId: string): AgentMemoryRules {
  const path = getMemoryPath(agentId)
  const content = readCached(path)
  if (!content) return { neverAgain: [], architectureLocks: [], rejectedPatterns: [], personality: '' }
  
  return {
    neverAgain: extractBullets(content, '## Never Again'),
    architectureLocks: extractBullets(content, '## Architecture Decisions'),
    rejectedPatterns: extractBullets(content, '## Rejected Patterns'),
    personality: extractSectionText(content, '## Personality Baseline') || extractSectionText(content, '## Default Behaviors'),
  }
}

export function getCrossAgentRules(taskType: TaskType, currentAgentId: string): string[] {
  const rules: string[] = []
  const seen = new Set<string>()

  // Strategy tasks → pull from Executive Office (marcus + echo + vista)
  if (taskType === 'strategy') {
    for (const agent of ['marcus', 'echo', 'vista']) {
      for (const rule of getAgentMemoryRules(agent).neverAgain) {
        if (!seen.has(rule)) { rules.push(`[${agent}] ${rule}`); seen.add(rule) }
      }
    }
  }
  // Engineering tasks → pull from dev + ops + aegis
  if (['engineering', 'cybersecurity'].includes(taskType)) {
    for (const agent of ['dev', 'ops', 'aegis', 'cypher']) {
      for (const rule of getAgentMemoryRules(agent).neverAgain) {
        if (!seen.has(rule)) { rules.push(`[${agent}] ${rule}`); seen.add(rule) }
      }
    }
  }
  // Governance tasks → pull from board + precedent + sentinel
  if (taskType === 'governance') {
    for (const agent of ['board', 'precedent', 'sentinel']) {
      for (const rule of getAgentMemoryRules(agent).neverAgain) {
        if (!seen.has(rule)) { rules.push(`[${agent}] ${rule}`); seen.add(rule) }
      }
    }
  }
  // Brand / marketing tasks → pull from spark + lena + kai
  if (['brand_marketing', 'product_analytics'].includes(taskType)) {
    for (const agent of ['spark', 'lena', 'kai', 'nate']) {
      for (const rule of getAgentMemoryRules(agent).neverAgain) {
        if (!seen.has(rule)) { rules.push(`[${agent}] ${rule}`); seen.add(rule) }
      }
    }
  }
  return rules
}

export function getAllAgentMemoryStatus(): { agentId: string; rulesCount: number }[] {
  return Object.keys(AGENT_DEPT_MAP)
    .map(id => ({ agentId: id, rulesCount: getAgentMemoryRules(id).neverAgain.length }))
}

function extractBullets(content: string, sectionName: string): string[] {
  const section = extractSectionText(content, sectionName)
  if (!section) return []
  return section.split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .map(line => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean)
}

function extractSectionText(content: string, heading: string): string {
  const lines = content.split('\n')
  let inSection = false
  const sectionLines: string[] = []
  for (const line of lines) {
    if (line.trim().startsWith('## ') && line.includes(heading.replace('## ', ''))) {
      inSection = true
      continue
    }
    if (inSection && line.trim().startsWith('## ')) break
    if (inSection) sectionLines.push(line)
  }
  return sectionLines.join('\n').trim()
}
