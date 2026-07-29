// lib/cie/sources/agent-memory.ts — Per-agent memory reader (stub).
//
// TODO: wire to real agent-memory backend (store/hermes/MEMORY.md per-agent sections).
// Until then: returns empty typed shapes — retriever.ts degrades to other sources.

import type { TaskType } from '../types'

export interface AgentMemoryRules {
  architectureLocks: string[]
  neverAgain: string[]
}

/** Rules pinned by a specific agent (architecture locks, "never again" lessons). */
export function getAgentMemoryRules(_agentId: string): AgentMemoryRules {
  return { architectureLocks: [], neverAgain: [] }
}

/** Cross-agent rules relevant to the given task type, excluding rules from the requesting agent. */
export function getCrossAgentRules(_type: TaskType, _agentId: string): string[] {
  return []
}
