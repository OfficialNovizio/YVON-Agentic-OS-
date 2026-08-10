"use strict";
// lib/cie/adversarial-gate.ts — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §15.1: Adversarial Gate Logic (Archetype 7)
//
// "Standard gate logic treats 'nothing flagged' as a pass. Adversarial Testing inverts this —
// the goal is finding breaks, not confirming correctness." Three real, verified building blocks:
//
//   1. "A pass means a vulnerability WAS found and reported" — a finding is a chunk from
//      standard retrieval flagged `adversary: true` (rag/harness/gates.py's P5_ADVERSARY,
//      already surfaced on RagRetrieveResult, same mechanism reused by
//      creative-gate-chain.ts's C3). This function inverts the interpretation: >=1 adversary
//      chunk = pass; zero = NOT a pass by default.
//   2. "Findings still route through Gate 1" — already true by construction: any chunk in
//      `ragResult.selected_chunks` already passed gate_authenticate() (source_file existence)
//      before reaching this function, since it came out of callRagBridge. Nothing new to
//      enforce here — documented, not re-implemented.
//   3. "Tools... strix" — resolved via the real, live tool registry (tool-binding.ts's
//      `resolveToolBinding`, which already maps ADVERSARIAL_TESTING -> strix and confirms its
//      registered location).
//
// NOT built: the "coverage-completeness check" itself (did the scan actually reach everything,
// or fail to try hard enough) — no coverage instrumentation exists anywhere in this repo (no
// line/path/endpoint coverage tracking for a security scan). This function correctly flags WHEN
// that check is needed (zero findings) but cannot compute it — returns `needsCoverageCheck: true`
// with that gap stated, not a fabricated coverage percentage.
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateAdversarialGate = evaluateAdversarialGate;
const tool_binding_1 = require("./tool-binding");
/**
 * evaluateAdversarialGate — Archetype 7's inverted pass/fail rule. `department` is passed through
 * to resolveToolBinding so the caller gets both baseline dept tools and strix (task-specific for
 * this archetype) in one call.
 */
function evaluateAdversarialGate(ragResult, department) {
    const findings = (ragResult.selected_chunks ?? []).filter((c) => c.adversary);
    const toolBinding = (0, tool_binding_1.resolveToolBinding)(department, 'ADVERSARIAL_TESTING');
    if (findings.length > 0) {
        return {
            passed: true,
            findingChunkIds: findings.map((f) => f.chunk_id),
            needsCoverageCheck: false,
            reason: `${findings.length} vulnerability/weakness chunk(s) found and reported — each already passed Gate 1 (source_file verified to exist) as part of standard retrieval`,
            toolBinding,
        };
    }
    return {
        passed: false,
        findingChunkIds: [],
        needsCoverageCheck: true,
        reason: 'no adversary-flagged findings — per the inversion, silence is NOT automatically a pass. ' +
            'A coverage-completeness check is needed (did the scan reach everything, or just fail to ' +
            'try hard enough?) — no coverage instrumentation exists in this repo to answer that ' +
            'automatically; a human/agent review of scan scope is required before treating this as clean',
        toolBinding,
    };
}
//# sourceMappingURL=adversarial-gate.js.map