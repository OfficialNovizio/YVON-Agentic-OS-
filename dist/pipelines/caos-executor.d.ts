import type { GraphStage, ExecutionPlan, GateResult } from '../cie/graph-resolver';
export interface AgentCall {
    agentId: string;
    stage: GraphStage;
    systemPrompt: string;
    ragContext: string;
    upstreamOutputs: string[];
    computedFacts: string;
}
export interface AgentResult {
    agentId: string;
    output: string;
    gateResult?: GateResult;
    timingMs: number;
    chunksInjected: number;
    computedFormulas: number;
}
export interface CaosExecutionResult {
    plan: ExecutionPlan;
    calls: AgentCall[];
    results: AgentResult[];
    finalOutput: string;
    gateBlocked: boolean;
    blockerReason?: string;
    totalTimingMs: number;
    trace: {
        graph: string;
        retrievalMode: string;
        cacheHits: number;
        feedbackLogged: boolean;
        citationsPresent: boolean;
    };
}
export declare function executeCaosPipeline(task: string, agentId: string, venture?: string, retrievalMode?: string, skipCache?: boolean): Promise<CaosExecutionResult>;
export type { GraphStage, ExecutionPlan, GateResult };
//# sourceMappingURL=caos-executor.d.ts.map