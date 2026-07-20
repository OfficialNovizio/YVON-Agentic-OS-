export interface GraphStage {
    agentId: string;
    agentDept: string;
    dependencies: string[];
    parallelOk: boolean;
    isGate: boolean;
    gateCondition?: string;
    required: boolean;
    description: string;
}
export interface ExecutionPlan {
    department: string;
    stages: GraphStage[];
    maxDepth: number;
    estimatedDurationMs: number;
    warnings: string[];
}
export declare function resolveExecutionGraph(department: string, task: string, agentId?: string): ExecutionPlan;
export interface GateResult {
    passed: boolean;
    gateCondition: string;
    blockingReason?: string;
}
export declare function evaluateGate(stage: GraphStage, agentOutput: string): GateResult;
//# sourceMappingURL=graph-resolver.d.ts.map