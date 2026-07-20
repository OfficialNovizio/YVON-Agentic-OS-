// lib/cie/retriever.ts — Parallel context retrieval from all knowledge sources
//
// All knowledge sources are synchronous (read from cached files).
// Fetches context from graphify, codegraph, agent memory, Hermes memory,
// and project docs. Applies source mapping based on task type.

import type { TaskProfile, KnowledgeSource, SourceMap, ContextItem } from './types'
import { extractKeywords, extractFilePaths } from './algorithms'
import { queryGraphify } from './sources/graphify'
import { queryCodegraph } from './sources/codegraph'
import { getAgentMemoryRules, getCrossAgentRules } from './sources/agent-memory'
import { getHermesUserContext, getHermesMemoryContext, getHermesStandards } from './sources/hermes-memory'
import { getProjectArchitecture, getProjectRules, getVentureContext } from './sources/project-docs'

// ─── Source Map ──────────────────────────────────────────────────────────────

const SOURCE_MAP: Record<string, SourceMap> = {
  engineering:      { primary: ['codegraph','agent_memory','hermes_memory'], secondary: ['graphify','project_docs'], exclude: ['venture_context'] },
  strategy:         { primary: ['agent_memory','hermes_memory','venture_context','project_docs'], secondary: [], exclude: ['graphify','codegraph'] },
  governance:       { primary: ['project_docs','agent_memory','hermes_memory'], secondary: [], exclude: ['graphify','codegraph','venture_context'] },
  brand_marketing:  { primary: ['agent_memory','venture_context','hermes_memory'], secondary: ['project_docs'], exclude: ['graphify','codegraph'] },
  cybersecurity:    { primary: ['agent_memory','hermes_memory','project_docs'], secondary: ['codegraph'], exclude: ['graphify','venture_context'] },
  product_analytics:{ primary: ['project_docs','agent_memory','hermes_memory'], secondary: ['venture_context'], exclude: ['graphify','codegraph'] },
  ai_agents:        { primary: ['agent_memory','hermes_memory','project_docs'], secondary: ['graphify'], exclude: ['codegraph','venture_context'] },
  general:          { primary: ['agent_memory','hermes_memory','project_docs'], secondary: ['graphify','codegraph','venture_context'], exclude: [] },
}

const SOURCE_PRIORITY: Record<string, number> = {
  agent_memory: 10, shared_os_logical: 9, hermes_memory: 8,
  project_docs: 7, team_workflows: 7, codegraph: 6,
  venture_context: 5, graphify: 4, session_state: 3, toon_context: 8,
}

// ─── Fetch one source ────────────────────────────────────────────────────────

function fetchSource(source: KnowledgeSource, profile: TaskProfile, keywords: string[]): ContextItem[] {
  const items: ContextItem[] = []
  const add = (content: string, offset: number = 0) => {
    if (!content || content.trim().length === 0) return
    items.push({
      content, source,
      priority: SOURCE_PRIORITY[source] - offset * 0.5,
      relevance: 1.0, chars: content.length,
      id: `${source}:${content.slice(0, 40)}`,
    })
  }

  switch (source) {
    case 'codegraph': {
      const paths = extractFilePaths(profile.venture + ' ' + keywords.join(' '))
      add(queryCodegraph(paths.length > 0 ? paths : ['lib/types.ts']))
      break
    }
    case 'graphify':
      add(queryGraphify(keywords))
      break
    case 'agent_memory': {
      const rules = getAgentMemoryRules(profile.agentId)
      const cross = getCrossAgentRules(profile.type, profile.agentId)
      rules.architectureLocks.forEach((r, i) => add(`[ARCH LOCK] ${r}`, i))
      rules.neverAgain.forEach((r, i) => add(`[NEVER AGAIN] ${r}`, i))
      cross.forEach((r, i) => add(`[CROSS-AGENT] ${r}`, i))
      break
    }
    case 'hermes_memory': {
      const user = getHermesUserContext()
      const standards = getHermesStandards()
      const mem = getHermesMemoryContext(keywords)
      add(user, 0)
      standards.forEach((s, i) => add(`[STANDARD] ${s}`, i + 0.5))
      if (mem) add(mem, 3)
      break
    }
    case 'project_docs': {
      const arch = getProjectArchitecture()
      const rules = getProjectRules()
      add(arch, 0)
      rules.forEach((r, i) => add(`[RULE] ${r}`, i + 0.5))
      break
    }
    case 'venture_context':
      add(getVentureContext(profile.venture))
      break
  }
  return items
}

// ─── Main retrieval ──────────────────────────────────────────────────────────

import { getSharedOsContext } from './sources/shared-os-logical'
import { getConfig } from '../adapters/config'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'

export function retrieveContext(profile: TaskProfile): ContextItem[] {
  const sources = SOURCE_MAP[profile.type]
  const keywords = profile.keywords.length > 0 ? profile.keywords : extractKeywords(profile.venture + ' task', 5)

  // Primary sources
  let items = sources.primary
    .filter(s => !sources.exclude.includes(s))
    .flatMap(s => fetchSource(s, profile, keywords))

  // Secondary sources if primary returned few items
  if (items.length < 3) {
    const alreadyFetched = new Set(items.map(i => i.source))
    const secondaryItems = sources.secondary
      .filter(s => !alreadyFetched.has(s) && !sources.exclude.includes(s))
      .flatMap(s => fetchSource(s, profile, keywords))
      .map(i => ({ ...i, relevance: 0.5 }))
    items = [...items, ...secondaryItems]
  }

  // ─── Always-fetched sources (P0 fix) ──────────────────────────────────────

  // Shared OS logical scripts — every agent gets its formulas
  try {
    const sharedItems = getSharedOsContext(profile.agentId, profile.type, profile.venture)
    if (sharedItems.length > 0) {
      items.push(...sharedItems)
    }
  } catch { /* non-blocking */ }

  // TOON-compressed context — prefer .toon over raw .md
  try {
    const config = getConfig()
    if (config.toonEnabled) {
      const teamsDir = config.teamsPath || join(config.projectRoot, 'Teams')
      const depts = ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
        'Product', 'AI & Agents', 'Brand Studio']
      for (const dept of depts) {
        const agentDir = join(teamsDir, dept, profile.agentId)
        if (!existsSync(agentDir)) continue
        // Check for .toon files in agent's directory
        const walkDir = (dir: string) => {
          try {
            for (const entry of require('fs').readdirSync(dir)) {
              const full = join(dir, entry)
              if (entry.endsWith('.toon')) {
                try {
                  const toonContent = readFileSync(full, 'utf-8')
                  const lines = toonContent.split(' · ').slice(0, 4).join(' · ')
                  if (lines.length > 0) {
                    items.push({
                      content: `[TOON:${profile.agentId}] ${lines}`,
                      source: 'toon_context' as any,
                      priority: 5, relevance: 0.8,
                      chars: lines.length,
                      id: `toon:${entry.replace('.toon','')}`,
                    })
                  }
                } catch { /* skip broken .toon */ }
              } else if (require('fs').statSync(full).isDirectory() && !entry.startsWith('.')) {
                walkDir(full)
              }
            }
          } catch { /* skip unreadable dirs */ }
        }
        walkDir(agentDir)
        break // Found the agent — stop searching
      }
    }
  } catch { /* non-blocking */ }

  return items
}
