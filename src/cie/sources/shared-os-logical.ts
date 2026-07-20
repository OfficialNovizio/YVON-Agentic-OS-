// src/cie/sources/shared-os-logical.ts — Shared OS logical scripts knowledge source
//
// Reads each agent's book-requirements.md, resolves the script list,
// extracts relevant function signatures + citations from Shared OS/logical/*.py,
// and returns TOON-compressed context for CIE injection.
//
// This is the BRIDGE between the department framework (Python logical layer)
// and the runtime engine (TypeScript CIE).

import { readFileSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { getConfig } from '../../adapters/config'
import type { TaskType, ContextItem, KnowledgeSource } from '../types'

const scriptsDir = (() => {
  try {
    const config = getConfig()
    return config.sharedOsPath || resolve(__dirname, '..', '..', '..', 'Teams', 'Shared OS', 'logical')
  } catch {
    return resolve(__dirname, '..', '..', '..', 'Teams', 'Shared OS', 'logical')
  }
})()

// ─── Script metadata cache ─────────────────────────────────────────

interface ScriptMeta {
  source: string
  citations: string[]
  functions: { name: string; signature: string; doc: string }[]
  route: string
  assignedAgents: string[]
}

const scriptCache = new Map<string, ScriptMeta>()

// ─── Parse Python docstrings for function metadata ────────────────

function parseScriptMeta(scriptPath: string): ScriptMeta | null {
  if (!existsSync(scriptPath)) return null

  const cached = scriptCache.get(scriptPath)
  if (cached) return cached

  try {
    const content = readFileSync(scriptPath, 'utf-8')
    const lines = content.split('\n')

    const meta: ScriptMeta = {
      source: '', citations: [], functions: [], route: '', assignedAgents: []
    }

    let inDocstring = false
    let currentFunc = ''
    let docLines: string[] = []

    for (const line of lines) {
      // Extract source from module docstring
      if (line.includes('Source:') || line.includes('Sources:')) {
        meta.source = line.replace(/.*?:/, '').trim()
      }
      // Extract chapter citations
      if (line.includes('Ch.') && (line.includes('pp.') || line.includes('§'))) {
        meta.citations.push(line.trim().replace(/^[#\s*-]+/, ''))
      }
      // Detect function definitions
      if (line.trim().startsWith('def ')) {
        const name = line.trim().split('(')[0].replace('def ', '')
        if (!name.startsWith('_')) {
          meta.functions.push({ name, signature: line.trim(), doc: '' })
          currentFunc = name
        }
      }
      // Route annotation
      if (line.includes('Route:') || line.includes('Route ')) {
        meta.route = line.replace(/.*?:/, '').trim()
      }
    }

    scriptCache.set(scriptPath, meta)
    return meta
  } catch {
    return null
  }
}

// ─── Agent → Script mapping (from book-requirements.md) ───────────

function getAgentScripts(agentId: string): string[] {
  // Scan Teams/<dept>/<agent>/logical/book-requirements.md
  const teamsDir = (() => {
    try { return getConfig().teamsPath } catch { return resolve(process.cwd(), 'Teams') }
  })() || resolve(process.cwd(), 'Teams')

  // Search all departments for this agent
  const depts = ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
    'Product', 'AI & Agents', 'Brand Studio']

  for (const dept of depts) {
    const breqPath = join(teamsDir, dept, agentId, 'logical', 'book-requirements.md')
    if (existsSync(breqPath)) {
      try {
        const content = readFileSync(breqPath, 'utf-8')
        const scripts: string[] = []

        // Extract script filenames from markdown tables and lists
        const pyRe = /`([a-z_]+\.py)`/gi
        let m
        while ((m = pyRe.exec(content)) !== null) {
          if (!m[1].startsWith('_')) scripts.push(m[1])
        }

        return [...new Set(scripts)]
      } catch { return [] }
    }
  }
  return []
}

// ─── Build TOON-compressed function reference ──────────────────────

function buildFunctionReference(scripts: string[]): string {
  const parts: string[] = ['[SHARED OS FUNCTIONS]']

  for (const script of scripts) {
    const scriptPath = join(scriptsDir, script)
    const meta = parseScriptMeta(scriptPath)
    if (!meta) continue

    // TOON format: script · func=name(args) · src=chapter · cite=source
    const funcNames = meta.functions.slice(0, 8).map(f => f.name).join(',')
    const cite = meta.citations.slice(0, 2).join('; ')
    if (funcNames) {
      parts.push(`${script.replace('.py','')} · f=${funcNames} · src=${meta.source.slice(0,60)}`)
    }
  }
  return parts.join('\n')
}

// ─── Main entry point ──────────────────────────────────────────────

export function getSharedOsContext(
  agentId: string,
  taskType: TaskType,
  venture: string,
): ContextItem[] {
  const items: ContextItem[] = []
  const scripts = getAgentScripts(agentId)

  if (scripts.length === 0) return items

  // 1. Function reference (what scripts can this agent call?)
  const funcRef = buildFunctionReference(scripts)
  if (funcRef) {
    items.push({
      content: funcRef,
      source: 'shared_os_logical' as KnowledgeSource,
      priority: 3,   // High priority — formulas are load-bearing
      relevance: 1.0,
      chars: funcRef.length,
      id: `sol-${agentId}-funcs`,
    })
  }

  // 2. Citations block (what sources ground this agent?)
  const citations: string[] = []
  for (const script of scripts) {
    const meta = parseScriptMeta(join(scriptsDir, script))
    if (meta && meta.citations.length > 0) {
      citations.push(`${script}: ${meta.citations[0]}`)
    }
  }
  if (citations.length > 0) {
    const citeBlock = `[CITABLE SOURCES for ${agentId}]\n` + citations.slice(0, 5).join('\n')
    items.push({
      content: citeBlock,
      source: 'shared_os_logical' as KnowledgeSource,
      priority: 4,
      relevance: 0.9,
      chars: citeBlock.length,
      id: `sol-${agentId}-cites`,
    })
  }

  return items
}

// ─── Export all agent scripts for dashboard/resolver use ───────────

export function getAllAgentScriptMappings(): Record<string, string[]> {
  const result: Record<string, string[]> = {}
  for (const dept of ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
    'Product', 'AI & Agents', 'Brand Studio']) {
    const deptPath = join(resolve(__dirname, '..', '..', '..', 'Teams'), dept)
    if (!existsSync(deptPath)) continue
    try {
      for (const agent of require('fs').readdirSync(deptPath)) {
        const scripts = getAgentScripts(agent)
        if (scripts.length > 0) result[agent] = scripts
      }
    } catch {}
  }
  return result
}

