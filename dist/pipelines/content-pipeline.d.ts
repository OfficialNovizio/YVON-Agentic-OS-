export interface PipelineStage {
    agentId: string;
    stage: string;
    required: boolean;
    output: string | null;
}
export interface ContentPipelineResult {
    stages: PipelineStage[];
    passed: boolean;
    finalOutput: string | null;
    failures: string[];
    duration: number;
}
/**
 * Execute the full Brand Studio content pipeline.
 * Each stage calls the agent with cumulative context from prior stages.
 *
 * @param initialTask - The creative task to process
 * @param venture - Venture context
 * @returns PipelineResult with pass/fail, stage outputs, and timing
 */
export declare function executeContentPipeline(initialTask: string, venture?: string): Promise<ContentPipelineResult>;
/**
 * Check if an agent is part of the content pipeline.
 */
export declare function isContentPipelineAgent(agentId: string): boolean;
/**
 * Get the next stage after a given agent.
 * Returns null if this is the last stage.
 */
export declare function getNextContentStage(agentId: string): PipelineStage | null;
//# sourceMappingURL=content-pipeline.d.ts.map