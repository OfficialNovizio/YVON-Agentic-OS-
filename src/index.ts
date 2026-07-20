// YVON Engine — AI Agent OS Kernel
//
// One npm install. Full 46-agent team across 7 departments.
//
// @yvon/engine provides:
//   - CIE v3: Context Intelligence Engine (classify → graph → RAG Bridge → inject)
//   - RAG: Retrieval-Augmented Generation with dynamic profiles
//   - Shared OS: Formula execution at query time (hallucination prevention)
//   - TOON: Token-Optimized Object Notation (84.5% token savings)
//   - Agents: 46 AI agent personalities from the department framework
//   - Algorithms: Bloom, MinHash, TF-IDF, BFS, PriorityQueue
//   - Adapters: Config resolver, MCP client, Hermes sync
//
// Agent personality is DERIVED from department framework files, not
// hardcoded — see src/agents/personalities.ts for the full registry.
//
// Usage:
//   import { createEngine, buildCieContext } from '@yvon/engine'
//   const cie = buildCieContext({ agentId: 'marcus', task: 'quarterly strategy review', venture: 'myproject' })

// ─── Main engine ──────────────────────────────────────────────────────────────

export { buildCieContext, classifyTask } from './cie'
export type { CieContext, CieParams, TaskProfile, TaskType } from './cie'

// ─── TOON compression ─────────────────────────────────────────────────────────

export { toon } from './toon/toon'
export { compress, buildDictionary, dictToLine } from './toon/compressor'
export { getOrCreateState, computeDelta } from './toon/delta'

// ─── Algorithms ───────────────────────────────────────────────────────────────

export { BloomFilter, TfidfIndex, ContextPriorityQueue, blastRadius, minhashSignature, jaccardEstimate } from './cie/algorithms'

// ─── Config ───────────────────────────────────────────────────────────────────

export { getConfig, invalidateConfig } from './adapters/config'
export type { EngineConfig } from './adapters/config'

// ─── MCP ──────────────────────────────────────────────────────────────────────

export { createMCPClient } from './adapters/mcp-client'
export type { MCPClient } from './adapters/mcp-client'

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export { startDashboard } from './dashboard'

// ─── Hermes ────────────────────────────────────────────────────────────────────

export { syncWithHermes, pushToHermes } from './adapters/hermes-sync'

// ─── Agent Registry (46 agents, 7 departments) ────────────────────────────────

export {
  AGENT_REGISTRY, AGENT_COUNT, DEPARTMENT_COUNT,
  getAgentProfile, getDepartmentAgents, getDepartmentLeader,
  getLeaders, getDepartments, getAgentContext,
} from './agents/personalities'
export type { AgentProfile } from './agents/personalities'

// ─── Pipelines ─────────────────────────────────────────────────────────────────

export {
  executeContentPipeline,
  isContentPipelineAgent,
  getNextContentStage,
} from './pipelines/content-pipeline'
export type { PipelineStage, ContentPipelineResult } from './pipelines/content-pipeline'

export {
  executeGovernanceReview,
  requiresGovernanceReview,
} from './pipelines/governance-gate'
export type { GateResult, GovernanceReview } from './pipelines/governance-gate'

// ─── Shared OS Connector ───────────────────────────────────────────────────────

export {
  getSharedOsContext,
  getAllAgentScriptMappings,
} from './cie/sources/shared-os-logical'

// ─── Engine creator ───────────────────────────────────────────────────────────

export interface EngineOptions {
  projectRoot?: string
  configPath?: string
  agents?: string[]
  provider?: string
}

export function createEngine(options: EngineOptions = {}) {
  const config = require('./adapters/config').getConfig()

  return {
    config,
    cie: {
      buildContext: (params: { agentId: string; task: string; venture?: string }) =>
        require('./cie').buildCieContext(params),
    },
    toon: {
      dense: require('./toon/toon').toon.dense,
      compress: require('./toon/compressor').compress,
      delta: require('./toon/delta').createDeltaTracker,
    },
    agents: {
      getProfile: (id: string) => require('./agents/personalities').getAgentProfile(id),
      getContext: (id: string) => require('./agents/personalities').getAgentContext(id),
      count: require('./agents/personalities').AGENT_COUNT,
      departments: require('./agents/personalities').getDepartments(),
    },
    version: '1.0.0',
  }
}
