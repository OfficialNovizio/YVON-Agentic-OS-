// lib/cie/index.ts — CIE v3 — Context Intelligence Engine
//
// Complete rewrite. Bridges TypeScript CIE into Python RAG + Shared OS + Graph.
//
// Flow: classify → resolve graph → RAG Bridge (Python subprocess)
//       → {injection + computed formulas + trace} → inject → LLM
//
// v3 improvements:
//   - RAG retrieval replaces source-level fetch (chunk-level semantic)
//   - Shared OS formula execution at query time (no more hallucinated math)
//   - Graph-based agent dependency resolution
//   - LRU context cache (Zipf-optimized)
//   - Lasswell-compliant audit trail on every call
//   - Feedback loop closes after execution
//
// ADAPTIVE INJECTION: Context scales with task COMPLEXITY, not length.
//   - Quick check (<6 words, no complex keywords) → 1,200 chars
//   - Standard review (typical agent queries) → 2,500 chars
//   - Deep analysis (strategic/high-stakes) → 4,000 chars
//   - Governance gate (board review) → 2,500 chars, tier-1 only

import type { TaskProfile, CieContext, TaskType } from './types'
import { classifyTask } from './classifier'
import { rankContext, getSourcesUsed } from './ranker'
import { buildInjection } from './builder'
import { getConfig } from '../adapters/config'
import { callRagBridge, callRagFeedback, ragToCieInjection } from './rag-bridge'
import { resolveExecutionGraph } from './graph-resolver'
import { getCached, setCached } from './cache'
import type { RagRetrieveResult } from './rag-bridge'
import { classifyArchetype } from './archetype'
import { resolveRetrievalShape } from './retrieval-shape'

// ─── Public API ──────────────────────────────────────────────────

export interface CieParams {
  agentId: string
  task: string
  venture?: string
  charBudget?: number
  skipCache?: boolean
  retrievalMode?: 'standard' | 'agentic' | 'graph'
}

/**
 * Build CIE context for an agent call. v3 — RAG-powered.
 *
 * Uses RAG Bridge (Python subprocess) for semantic chunk retrieval,
 * Shared OS formula execution, and computed fact injection.
 *
 * Falls back to v2 source-level retrieval if RAG bridge is unavailable.
 */
export async function buildCieContext(params: CieParams): Promise<CieContext> {
  const t0 = Date.now()
  const config = getConfig()

  // ── Step 0: Check cache (Zipf-optimized — repeated queries skip RAG) ──
  if (!params.skipCache && config.cieEnabled) {
    const fp = `${params.agentId}:${params.task.toLowerCase().trim().slice(0, 200)}`
    const cached = getCached(fp)
    if (cached) {
      // Fast path: cached context. Return immediately.
      const timeMs = Date.now() - t0
      return {
        systemExtension: cached.result.injection_text,
        dataBlock: '',
        sourcesUsed: ['shared_os_logical', 'agent_memory'],
        totalChars: cached.result.injection_text.length,
        itemsInjected: cached.result.chunks ?? 1,
        itemsFiltered: 0,
        timeMs,
      }
    }
  }

  // ── Step 1: Classify (regex, zero tokens) ──
  const profile = classifyTask(
    params.agentId,
    params.task,
    params.venture ?? 'yvon-dashboard',
  )

  // ── Step 2: Resolve execution graph + task archetype (§14, wired 2026-08-09) ──
  const dept = resolveAgentDepartment(params.agentId)
  const graph = resolveExecutionGraph(dept, params.task, params.agentId)
  const classifiedArchetype = classifyArchetype(params.task, dept)
  const retrievalShape = resolveRetrievalShape(classifiedArchetype.archetype)

  // ── Step 3: RAG Bridge (the P0 bridge) ──
  let ragResult: RagRetrieveResult | null = null

  try {
    if (config.pipelineOrchestration) {
      ragResult = await callRagBridge({
        query: params.task,
        agentId: params.agentId,
        dept,
        // Archetype-derived shape (§14.1/retrieval-shape.ts) is the primary signal now — an
        // explicit params.retrievalMode still wins if the caller set one. The old
        // graph.stages.length>3 heuristic is kept as a tertiary fallback only for the edge case
        // where archetype resolution somehow yields a shape retrievalMode of 'standard' but the
        // execution graph is unusually deep — archetype classification takes priority.
        retrievalMode: params.retrievalMode ?? retrievalShape.retrievalMode,
        topK: retrievalShape.topK,
      })
    }
  } catch {
    // RAG bridge unavailable — fall back to v2 source-level retrieval
    console.warn('[CIE v3] RAG bridge unavailable — falling back to source-level retrieval')
  }

  // ── Step 4: Build final injection ──
  const timeMs = Date.now() - t0

  if (ragResult && ragResult.success) {
    // RAG path: use RAG's optimized injection
    const { systemExtension, dataBlock, trace } = ragToCieInjection(ragResult)

    // Cache the successful result (Zipf-optimized)
    if (config.cieEnabled) {
      setCached(params.task, params.agentId, {
        injection_text: systemExtension,
        trace,
        profile: ragResult.profile,
        chunks: ragResult.chunks,
        computed_formulas: ragResult.computed_formulas,
      })
    }

    return {
      systemExtension,
      dataBlock,
      sourcesUsed: ['shared_os_logical', 'rag_bridge'],
      totalChars: ragResult.chars ?? systemExtension.length,
      itemsInjected: ragResult.chunks ?? 1,
      itemsFiltered: 0,
      timeMs,
      archetype: classifiedArchetype.archetype,
    }
  }

  // Fallback: v2 source-level retrieval
  const { retrieveContext } = await import('./retriever')
  const items = retrieveContext(profile)

  // Adaptive budget based on graph complexity (replaces old length-based)
  const graphComplexity = graph.stages.length
  let charBudget: number
  let maxItems: number

  if (graphComplexity > 3) {
    charBudget = params.charBudget ?? 4000
    maxItems = 20
  } else if (graphComplexity > 1) {
    charBudget = params.charBudget ?? 2500
    maxItems = 10
  } else {
    charBudget = params.charBudget ?? 1200
    maxItems = 5
  }

  const cappedItems = items.slice(0, maxItems)
  const { selected, filtered } = rankContext(cappedItems, {
    charBudget,
    dedupSimilarity: 0.85,
  })

  const context = buildInjection(selected, filtered, timeMs)
  context.archetype = classifiedArchetype.archetype

  // Add graph metadata
  if (graph.stages.length > 1) {
    const graphInfo = graph.stages
      .map(s => `${s.isGate ? '🚪GATE' : '  '} ${s.agentId}${s.dependencies.length ? ' ← ' + s.dependencies.join(',') : ''}`)
      .join('\n')
    context.systemExtension += `\n\n[EXECUTION GRAPH — ${dept}]\n${graphInfo}\n`
  }

  return context
}

// ─── Agent → Department resolver ────────────────────────────────

function resolveAgentDepartment(agentId: string): string {
  const deptMap: Record<string, string> = {
    marcus: 'Executive Office', echo: 'Executive Office', vista: 'Executive Office',
    board: 'Governance', precedent: 'Governance', sentinel: 'Governance',
    dev: 'Engineering', ops: 'Engineering', cypher: 'Engineering', aegis: 'Engineering',
    axiom: 'Engineering', rank: 'Engineering', quinn: 'Engineering', dana: 'Engineering',
    raj: 'Engineering', mia: 'Engineering', nova: 'Engineering',
    warden: 'Cybersecurity', keyring: 'Cybersecurity', bastion: 'Cybersecurity',
    cortex: 'Cybersecurity', veil: 'Cybersecurity',
    spec: 'Product', metric: 'Product', ux: 'Product', loom: 'Product', price: 'Product',
    meta: 'AI & Agents', relay: 'AI & Agents', gauge: 'AI & Agents', anneal: 'AI & Agents',
    forge: 'AI & Agents', scout: 'AI & Agents', proto: 'AI & Agents', edge: 'AI & Agents',
    spark: 'Brand Studio', atlas: 'Brand Studio', lena: 'Brand Studio', weave: 'Brand Studio',
    muse: 'Brand Studio', pixel: 'Brand Studio', pulse: 'Brand Studio', rio: 'Brand Studio',
    nate: 'Brand Studio', kai: 'Brand Studio', tempo: 'Brand Studio',
  }
  return deptMap[agentId.toLowerCase()] || 'Executive Office'
}

// ─── Feedback logger ──────────────────────────────────────────────

export async function logFeedback(
  trace: Record<string, unknown>,
  outcome: 'accepted' | 'revised' | 'rejected' | 'pending',
  notes?: string,
): Promise<void> {
  try {
    await callRagFeedback({ trace, outcome, notes })
  } catch {
    // Non-blocking — feedback failure shouldn't break the agent
  }
}

// ─── Exports for testing ─────────────────────────────────────────

export type { TaskProfile, CieContext, TaskType }
export { classifyTask } from './classifier'
export { retrieveContext } from './retriever'
export { rankContext, getSourcesUsed } from './ranker'
export { buildInjection } from './builder'
export { resolveExecutionGraph, evaluateGate } from './graph-resolver'
export type { GraphStage, ExecutionPlan, GateResult } from './graph-resolver'
export { callRagBridge, callRagFormulas, ragToCieInjection } from './rag-bridge'
export type { RagRetrieveResult } from './rag-bridge'
export { getCached, setCached, cacheStats, invalidateAgent, invalidateAll } from './cache'
export { resolveEntity } from './entity-resolution'
export type { EntityResolutionResult, EntityResolutionStatus } from './entity-resolution'
export { queryGraph, getNeighbors, getImpactRadius } from './sources/graphify'
export type { GraphNode, GraphEdge, QueryGraphResult } from './sources/graphify'
export { searchMemPalace } from './sources/mempalace'
export type { MemPalaceHit, MemPalaceSearchResult } from './sources/mempalace'
export { resolveTeam, resolveOwnerFromPath } from './team-assignment'
export type { TeamAssignmentResult, TeamAssignmentStatus, OwnerInfo } from './team-assignment'
export { classifyArchetype, ARCHETYPE_TABLE, DEPARTMENT_ARCHETYPES } from './archetype'
export type { Archetype, ArchetypeInfo, ClassifiedArchetype } from './archetype'
export {
  resolveToolLocation, resolveToolBinding, checkRunningServices, resolveOnDemandService,
  invalidateToolRegistryCache, SCRAPING_ESCALATION_CHAIN,
} from './tool-binding'
export type { ToolLocation, ToolBindingResult, ServiceStatusResult } from './tool-binding'
export {
  startSession, loadSession, addExploreRound, converge, resumeSession, listSessions,
  persistToMemPalace, SESSION_WING,
} from './session-memory'
export type { SessionState, SessionStatus, ExploreRound, ShortlistItem, PersistResult } from './session-memory'
export { mineIntoMemPalace } from './sources/mempalace'
export type { MemPalaceMineResult } from './sources/mempalace'
export { resolveRetrievalShape } from './retrieval-shape'
export type { RetrievalShape } from './retrieval-shape'
export { materializeToolContext } from './tool-context'
export type { ToolContextChunk } from './tool-context'
export { listVentures, invalidateVenturesCache } from './sources/ventures'
export type { VentureRow } from './sources/ventures'
export { bridgeCrossScopeQuery } from './cross-scope-bridge'
export type { BridgeHit, CrossScopeBridgeResult } from './cross-scope-bridge'
export { getLooseNeighbors } from './sources/graphify'
export { gatherCreativeContext } from './creative-retrieval'
export type { CreativeRetrievalResult } from './creative-retrieval'
export {
  checkBrandVoiceConformance, checkNoveltyRepetition, checkPremortemRisk,
  checkPredictedPerformance, recordCreativeOutcome,
} from './creative-gate-chain'
export type {
  BrandVoiceResult, NoveltyResult, NoveltyFlag, PremortemResult,
  PredictedPerformanceResult, CreativeOutcome,
} from './creative-gate-chain'
export { evaluateAdversarialGate } from './adversarial-gate'
export type { AdversarialGateResult } from './adversarial-gate'
export { captureDiscussion, DECISION_WING } from './discussion-capture'
export type { DecisionNodeInput, CaptureDiscussionResult } from './discussion-capture'
export { syncVentureAgents, getRealAgentRoster } from './sources/venture-agents'
export type { SyncResult, StructureAgent, VentureAgentRow } from './sources/venture-agents'
