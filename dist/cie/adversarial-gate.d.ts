import type { RagRetrieveResult } from './rag-bridge';
import { type ToolBindingResult } from './tool-binding';
export interface AdversarialGateResult {
    passed: boolean;
    findingChunkIds: string[];
    needsCoverageCheck: boolean;
    reason: string;
    toolBinding: ToolBindingResult;
}
/**
 * evaluateAdversarialGate — Archetype 7's inverted pass/fail rule. `department` is passed through
 * to resolveToolBinding so the caller gets both baseline dept tools and strix (task-specific for
 * this archetype) in one call.
 */
export declare function evaluateAdversarialGate(ragResult: RagRetrieveResult, department: string): AdversarialGateResult;
//# sourceMappingURL=adversarial-gate.d.ts.map