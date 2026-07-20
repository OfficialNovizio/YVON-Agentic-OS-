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
//# sourceMappingURL=index.d.ts.map