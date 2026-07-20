export interface RagRetrieveParams {
    query: string;
    agentId: string;
    dept?: string;
    topK?: number;
    retrievalMode?: 'standard' | 'agentic' | 'graph';
}
export interface RagRetrieveResult {
    success: boolean;
    timing_ms: number;
    query: string;
    agent_id: string;
    profile?: string;
    chunks?: number;
    chars?: number;
    budget?: number;
    adversary?: boolean;
    rewritten_queries?: string[];
    injection_text: string;
    trace?: Record<string, unknown>;
    selected_chunks?: Array<{
        chunk_id: string;
        source_file: string;
        section: string;
        priority_tier: number;
        adversary: boolean;
        chars: number;
    }>;
    computed_formulas?: Array<{
        script: string;
        function: string;
        result?: {
            value: unknown;
            type: string;
        };
        citation?: string;
        computed: boolean;
        error?: string;
    }>;
}
export interface RagFeedbackParams {
    trace: Record<string, unknown>;
    outcome: 'accepted' | 'revised' | 'rejected' | 'pending';
    notes?: string;
}
export interface RagFormulaParams {
    formulas: Array<{
        script: string;
        function: string;
        args: unknown[];
    }>;
}
/**
 * Retrieve RAG context for a query.
 * This replaces CIE's old retrieveContext() step.
 */
export declare function callRagBridge(params: RagRetrieveParams): Promise<RagRetrieveResult>;
/**
 * Send feedback for a completed agent call.
 */
export declare function callRagFeedback(params: RagFeedbackParams): Promise<{
    success: boolean;
    event_id: string;
}>;
/**
 * Execute Shared OS formulas directly (no retrieval).
 */
export declare function callRagFormulas(params: RagFormulaParams): Promise<{
    success: boolean;
    results: RagRetrieveResult['computed_formulas'];
}>;
/**
 * Convert RAG bridge result to CIE's injection format.
 * Bridges the gap between RAG's injection_text and CIE's systemExtension + dataBlock.
 */
export declare function ragToCieInjection(bridgeResult: RagRetrieveResult): {
    systemExtension: string;
    dataBlock: string;
    trace: Record<string, unknown>;
};
//# sourceMappingURL=rag-bridge.d.ts.map