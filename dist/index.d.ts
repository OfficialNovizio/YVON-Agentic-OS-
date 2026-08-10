export { buildCieContext, classifyTask } from './cie';
export type { CieContext, CieParams, TaskProfile, TaskType } from './cie';
export { toon } from './toon/toon';
export { compress, buildDictionary, dictToLine } from './toon/compressor';
export { getOrCreateState, computeDelta } from './toon/delta';
export { BloomFilter, TfidfIndex, ContextPriorityQueue, blastRadius, minhashSignature, jaccardEstimate } from './cie/algorithms';
export { getConfig, invalidateConfig } from './adapters/config';
export type { EngineConfig } from './adapters/config';
export { createMCPClient } from './adapters/mcp-client';
export type { MCPClient } from './adapters/mcp-client';
export { startDashboard } from './dashboard';
export { syncWithHermes, pushToHermes, reconcileWithHermes } from './adapters/hermes-sync';
export { mergeMemorySections, parseMemorySections } from './cie/sources/hermes-memory';
export { AGENT_REGISTRY, AGENT_COUNT, DEPARTMENT_COUNT, getAgentProfile, getDepartmentAgents, getDepartmentLeader, getLeaders, getDepartments, getAgentContext, } from './agents/personalities';
export type { AgentProfile } from './agents/personalities';
export { executeContentPipeline, isContentPipelineAgent, getNextContentStage, } from './pipelines/content-pipeline';
export type { PipelineStage, ContentPipelineResult } from './pipelines/content-pipeline';
export { executeGovernanceReview, requiresGovernanceReview, } from './pipelines/governance-gate';
export type { GateResult, GovernanceReview } from './pipelines/governance-gate';
export { getSharedOsContext, getAllAgentScriptMappings, } from './cie/sources/shared-os-logical';
export interface EngineOptions {
    projectRoot?: string;
    configPath?: string;
    agents?: string[];
    provider?: string;
}
export declare function createEngine(options?: EngineOptions): {
    config: any;
    cie: {
        buildContext: (params: {
            agentId: string;
            task: string;
            venture?: string;
        }) => any;
    };
    toon: {
        dense: any;
        compress: any;
        delta: any;
    };
    agents: {
        getProfile: (id: string) => any;
        getContext: (id: string) => any;
        count: any;
        departments: any;
    };
    version: string;
};
//# sourceMappingURL=index.d.ts.map