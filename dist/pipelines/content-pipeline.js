"use strict";
// src/pipelines/content-pipeline.ts — Brand Studio Content Pipeline Orchestrator
//
// Implements the DEFINER → CREATOR → GATE chain defined in
// Brand Studio/DEPARTMENT-WORKFLOW.md.
//
// Every creative asset flows through:
//   MUSE → WEAVE → LENA → PIXEL → SPARK(gate) → DISTRIBUTION
//
// No agent ships directly. Gate is blocking. Pipeline is sequential.
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeContentPipeline = executeContentPipeline;
exports.isContentPipelineAgent = isContentPipelineAgent;
exports.getNextContentStage = getNextContentStage;
const cie_1 = require("../cie");
// ─── Pipeline definition ──────────────────────────────────────────
const CONTENT_PIPELINE = [
    { agentId: 'muse', stage: 'IDEATION — generate + dedupe vs registry', required: true, output: null },
    { agentId: 'weave', stage: 'STRUCTURE — chapter positioning, continuity ledger', required: true, output: null },
    { agentId: 'lena', stage: 'VOICE — structure by formula, voice by guide, humanic pass ALWAYS last', required: true, output: null },
    { agentId: 'pixel', stage: 'PRODUCTION — shot lists, per-asset QA vs kit', required: true, output: null },
    { agentId: 'spark', stage: 'GATE — coherence-qa + art-direction-critique', required: true, output: null },
];
/**
 * Execute the full Brand Studio content pipeline.
 * Each stage calls the agent with cumulative context from prior stages.
 *
 * @param initialTask - The creative task to process
 * @param venture - Venture context
 * @returns PipelineResult with pass/fail, stage outputs, and timing
 */
async function executeContentPipeline(initialTask, venture = 'default') {
    const t0 = Date.now();
    const failures = [];
    const results = [];
    for (const stage of CONTENT_PIPELINE) {
        const stageStart = Date.now();
        try {
            // Build CIE context for this agent with cumulative task context
            const cieParams = {
                agentId: stage.agentId,
                task: initialTask,
                venture,
            };
            const cie = (0, cie_1.buildCieContext)(cieParams);
            // In production, this would call the LLM. For now, mark ready.
            const resolved = await cie;
            const stageResult = {
                ...stage,
                output: `[${stage.stage}] — CIE context ready (${resolved.itemsInjected} items, ${resolved.totalChars} chars, ${Date.now() - stageStart}ms)`,
            };
            results.push(stageResult);
            // If this is Spark's gate, check for rejection
            if (stage.agentId === 'spark' && stageResult.output) {
                // Spark's gate is the final quality check
                // In production: LLM response parsed for APPROVE/REVISE/REJECT
                // For now: pipeline reports which agents were invoked
            }
        }
        catch (err) {
            const msg = err instanceof Error ? err.message : String(err);
            failures.push(`${stage.agentId}: ${msg}`);
            results.push({ ...stage, output: `ERROR: ${msg}` });
            // If a required stage fails, stop the pipeline
            if (stage.required) {
                return {
                    stages: results,
                    passed: false,
                    finalOutput: null,
                    failures,
                    duration: Date.now() - t0,
                };
            }
        }
    }
    // Pipeline complete — all 5 stages passed
    const sparkStage = results.find(r => r.agentId === 'spark');
    const passed = !failures.length && !!sparkStage?.output;
    return {
        stages: results,
        passed,
        finalOutput: passed
            ? `Content pipeline: MUSE → WEAVE → LENA → PIXEL → SPARK(gate) — ${Date.now() - t0}ms`
            : null,
        failures,
        duration: Date.now() - t0,
    };
}
/**
 * Check if an agent is part of the content pipeline.
 */
function isContentPipelineAgent(agentId) {
    return CONTENT_PIPELINE.some(s => s.agentId === agentId);
}
/**
 * Get the next stage after a given agent.
 * Returns null if this is the last stage.
 */
function getNextContentStage(agentId) {
    const idx = CONTENT_PIPELINE.findIndex(s => s.agentId === agentId);
    if (idx < 0 || idx >= CONTENT_PIPELINE.length - 1)
        return null;
    return CONTENT_PIPELINE[idx + 1];
}
//# sourceMappingURL=content-pipeline.js.map