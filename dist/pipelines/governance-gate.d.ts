export interface GateResult {
    gate: string;
    status: 'PASS' | 'VIOLATION' | 'VETO' | 'REJECT' | 'HOLD' | 'WARNING' | 'UNCLEAR';
    ruling: string;
    article?: string;
    timestamp: number;
}
export interface GovernanceReview {
    decisionId: string;
    gates: GateResult[];
    finalVerdict: 'APPROVED' | 'CONDITIONAL' | 'REJECTED' | 'BLOCKED';
    escalationPath: string | null;
    duration: number;
    log: string[];
}
/**
 * Execute the full governance 4-gate review.
 * Early exits: VIOLATION or VETO stop the review immediately.
 *
 * In production, each gate calls the LLM with CIE context and parses the response.
 * For now, returns the structured review pipeline that CIEs will use.
 */
export declare function executeGovernanceReview(decisionId: string, decisionDescription: string, venture?: string): Promise<GovernanceReview>;
/**
 * Check if a decision requires governance review based on thresholds.
 * Returns the gate entry point or null if no review needed.
 */
export declare function requiresGovernanceReview(spendAmount: number, gateThreshold: number, touchesConstitution?: boolean, touchesLockedCommitment?: boolean): boolean;
//# sourceMappingURL=governance-gate.d.ts.map