// lib/cie/builder.ts — Format context into injection blocks with citation preservation
//
// v2.0 — citation-aware. Every injected rule carries provenance [source, chapter, page].
// TOON-preferred: reads .toon files first, falls back to .md.

import type { ContextItem, CieContext, KnowledgeSource } from './types'

function buildSystemExtension(items: ContextItem[]): string {
  if (items.length === 0) return ''
  const proseItems = items.filter(i => i.priority >= 6)
  if (proseItems.length === 0) return ''

  const lines = ['[YVON CIE v2 — Auto-Injected Context]', '']
  const bySource = new Map<string, ContextItem[]>()
  for (const item of proseItems) {
    const existing = bySource.get(item.source) ?? []
    existing.push(item)
    bySource.set(item.source, existing)
  }
  for (const [source, sourceItems] of bySource) {
    const label = sourceLabel(source)
    lines.push(`── ${label} ──`)
    for (const item of sourceItems) {
      // Preserve citations from shared_os_logical
      const citeTag = (item as any).citation ? ` [${(item as any).citation}]` : ''
      lines.push(`  ${item.content}${citeTag}`)
    }
    lines.push('')
  }
  lines.push('[End CIE — decisions MUST cite sources above when applicable]')
  return lines.join('\n')
}

function buildDataBlock(items: ContextItem[]): string {
  const dataItems = items.filter(i => i.priority < 6)
  if (dataItems.length === 0) return ''
  return dataItems.map(i => i.content).join('\n')
}

function sourceLabel(source: string): string {
  const labels: Record<string, string> = {
    agent_memory:      'AGENT MEMORY',
    shared_os_logical: 'SHARED OS FORMULAS (verifiable, self-tested)',
    hermes_memory:     'HERMES STANDARDS',
    project_docs:      'PROJECT RULES',
    team_workflows:    'DEPARTMENT WORKFLOW',
    codegraph:         'CODE DEPENDENCIES',
    venture_context:   'VENTURE CONTEXT',
    graphify:          'CODE STRUCTURE',
    session_state:     'SESSION STATE',
    toon_context:      'TOON COMPRESSED',
  }
  return labels[source] ?? source.toUpperCase()
}

export function buildInjection(
  selected: ContextItem[],
  filtered: ContextItem[],
  timeMs: number,
): CieContext {
  const systemExtension = buildSystemExtension(selected)
  const dataBlock = buildDataBlock(selected)
  const sourcesUsed = [...new Set(selected.map(i => i.source))] as KnowledgeSource[]
  const totalChars = selected.reduce((sum, i) => sum + i.chars, 0)

  return { systemExtension, dataBlock, sourcesUsed, totalChars,
    itemsInjected: selected.length, itemsFiltered: filtered.length, timeMs }
}
