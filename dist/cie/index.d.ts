import type { TaskProfile, CieContext, TaskType } from './types';
export interface CieParams {
    agentId: string;
    task: string;
    venture?: string;
    charBudget?: number;
    skipCache?: boolean;
    retrievalMode?: 'standard' | 'agentic' | 'graph';
}
/**
 * Build CIE context for an agent call. v3 — RAG-powered.
 *
 * Uses RAG Bridge (Python subprocess) for semantic chunk retrieval,
 * Shared OS formula execution, and computed fact injection.
 *
 * Falls back to v2 source-level retrieval if RAG bridge is unavailable.
 */
export declare function buildCieContext(params: CieParams): Promise<CieContext>;
export declare function logFeedback(trace: Record<string, unknown>, outcome: 'accepted' | 'revised' | 'rejected' | 'pending', notes?: string): Promise<void>;
export type { TaskProfile, CieContext, TaskType };
export { classifyTask } from './classifier';
export { retrieveContext } from './retriever';
export { rankContext, getSourcesUsed } from './ranker';
export { buildInjection } from './builder';
export { resolveExecutionGraph, evaluateGate } from './graph-resolver';
export type { GraphStage, ExecutionPlan, GateResult } from './graph-resolver';
export { callRagBridge, callRagFormulas, ragToCieInjection } from './rag-bridge';
export type { RagRetrieveResult } from './rag-bridge';
export { getCached, setCached, cacheStats, invalidateAgent, invalidateAll } from './cache';
export { resolveEntity } from './entity-resolution';
export type { EntityResolutionResult, EntityResolutionStatus } from './entity-resolution';
export { queryGraph, getNeighbors, getImpactRadius } from './sources/graphify';
export type { GraphNode, GraphEdge, QueryGraphResult } from './sources/graphify';
export { searchMemPalace } from './sources/mempalace';
export type { MemPalaceHit, MemPalaceSearchResult } from './sources/mempalace';
export { resolveTeam, resolveOwnerFromPath } from './team-assignment';
export type { TeamAssignmentResult, TeamAssignmentStatus, OwnerInfo } from './team-assignment';
export { classifyArchetype, ARCHETYPE_TABLE, DEPARTMENT_ARCHETYPES } from './archetype';
export type { Archetype, ArchetypeInfo, ClassifiedArchetype } from './archetype';
export { resolveToolLocation, resolveToolBinding, checkRunningServices, resolveOnDemandService, invalidateToolRegistryCache, SCRAPING_ESCALATION_CHAIN, } from './tool-binding';
export type { ToolLocation, ToolBindingResult, ServiceStatusResult } from './tool-binding';
export { startSession, loadSession, addExploreRound, converge, resumeSession, listSessions, persistToMemPalace, SESSION_WING, } from './session-memory';
export type { SessionState, SessionStatus, ExploreRound, ShortlistItem, PersistResult } from './session-memory';
export { mineIntoMemPalace } from './sources/mempalace';
export type { MemPalaceMineResult } from './sources/mempalace';
export { resolveRetrievalShape } from './retrieval-shape';
export type { RetrievalShape } from './retrieval-shape';
export { materializeToolContext } from './tool-context';
export type { ToolContextChunk } from './tool-context';
export { listVentures, invalidateVenturesCache } from './sources/ventures';
export type { VentureRow } from './sources/ventures';
export { bridgeCrossScopeQuery } from './cross-scope-bridge';
export type { BridgeHit, CrossScopeBridgeResult } from './cross-scope-bridge';
export { getLooseNeighbors } from './sources/graphify';
export { gatherCreativeContext } from './creative-retrieval';
export type { CreativeRetrievalResult } from './creative-retrieval';
export { checkBrandVoiceConformance, checkNoveltyRepetition, checkPremortemRisk, checkPredictedPerformance, recordCreativeOutcome, } from './creative-gate-chain';
export type { BrandVoiceResult, NoveltyResult, NoveltyFlag, PremortemResult, PredictedPerformanceResult, CreativeOutcome, } from './creative-gate-chain';
export { evaluateAdversarialGate } from './adversarial-gate';
export type { AdversarialGateResult } from './adversarial-gate';
export { captureDiscussion, DECISION_WING } from './discussion-capture';
export type { DecisionNodeInput, CaptureDiscussionResult } from './discussion-capture';
export { syncVentureAgents, getRealAgentRoster } from './sources/venture-agents';
export type { SyncResult, StructureAgent, VentureAgentRow } from './sources/venture-agents';
//# sourceMappingURL=index.d.ts.map