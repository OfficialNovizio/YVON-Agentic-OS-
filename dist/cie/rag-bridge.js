"use strict";
// src/cie/rag-bridge.ts — RAG Bridge: CIE → Python RAG subprocess
//
// Spawns `python3 rag/bridge.py` as a child process, sends JSON via stdin,
// reads structured context + computed formulas from stdout.
//
// This is THE bridge between the TypeScript CIE engine and the Python
// RAG + Shared OS + Graph systems.
//
// Usage:
//   const context = await callRagBridge({ query, agentId, dept, mode: 'standard' })
//   // context.injection_text → ready for LLM system prompt
//   // context.computed_formulas → executable formula results
//   // context.trace → Lasswell-compliant audit trail
//
//   await callRagBridge({ trace, outcome: 'accepted' }, 'feedback')
Object.defineProperty(exports, "__esModule", { value: true });
exports.callRagBridge = callRagBridge;
exports.callRagFeedback = callRagFeedback;
exports.callRagFormulas = callRagFormulas;
exports.ragToCieInjection = ragToCieInjection;
const child_process_1 = require("child_process");
const path_1 = require("path");
const config_1 = require("../adapters/config");
// ─── Bridge call ────────────────────────────────────────────────
function getBridgePath() {
    try {
        const config = (0, config_1.getConfig)();
        return (0, path_1.join)(config.projectRoot, 'rag', 'bridge.py');
    }
    catch {
        return (0, path_1.resolve)(__dirname, '..', '..', 'rag', 'bridge.py');
    }
}
function callBridge(mode, input) {
    return new Promise((resolve, reject) => {
        const bridgePath = getBridgePath();
        const child = (0, child_process_1.spawn)('python3', [bridgePath, `--mode=${mode}`], {
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        let stdout = '';
        let stderr = '';
        child.stdout.on('data', (data) => { stdout += data.toString(); });
        child.stderr.on('data', (data) => { stderr += data.toString(); });
        child.on('close', (code) => {
            if (code !== 0) {
                reject(new Error(`Bridge exited with code ${code}: ${stderr.slice(0, 200)}`));
                return;
            }
            try {
                const result = JSON.parse(stdout.trim());
                resolve(result);
            }
            catch (e) {
                reject(new Error(`Failed to parse bridge output: ${stdout.slice(0, 200)}`));
            }
        });
        child.on('error', (err) => {
            reject(new Error(`Bridge spawn failed: ${err.message}`));
        });
        // Send input
        child.stdin.write(JSON.stringify(input));
        child.stdin.end();
    });
}
// ─── Public API ──────────────────────────────────────────────────
/**
 * Retrieve RAG context for a query.
 * This replaces CIE's old retrieveContext() step.
 */
async function callRagBridge(params) {
    const input = {
        query: params.query,
        agent_id: params.agentId,
        dept: params.dept || '',
        top_k: params.topK ?? 40,
        retrieval_mode: params.retrievalMode ?? 'standard',
    };
    const raw = await callBridge('retrieve', input);
    return raw;
}
/**
 * Send feedback for a completed agent call.
 */
async function callRagFeedback(params) {
    const raw = await callBridge('feedback', {
        trace: params.trace,
        outcome: params.outcome,
        notes: params.notes ?? '',
    });
    return raw;
}
/**
 * Execute Shared OS formulas directly (no retrieval).
 */
async function callRagFormulas(params) {
    const raw = await callBridge('formula', {
        formulas: params.formulas,
    });
    return raw;
}
/**
 * Convert RAG bridge result to CIE's injection format.
 * Bridges the gap between RAG's injection_text and CIE's systemExtension + dataBlock.
 */
function ragToCieInjection(bridgeResult) {
    const injectionParts = [];
    // 1. Computed formulas (highest priority)
    if (bridgeResult.computed_formulas && bridgeResult.computed_formulas.length > 0) {
        const computedFacts = bridgeResult.computed_formulas
            .filter(f => f.computed && f.result)
            .map(f => {
            const val = typeof f.result?.value === 'object'
                ? JSON.stringify(f.result?.value)
                : String(f.result?.value ?? '');
            return `  ${f.function}() = ${val}  [${f.citation || f.script}]`;
        });
        if (computedFacts.length > 0) {
            injectionParts.push('[COMPUTED FACTS — Shared OS scripts]');
            computedFacts.forEach(f => injectionParts.push(f));
            injectionParts.push('[End Computed Facts]\n');
        }
    }
    // 2. RAG retrieval injection
    if (bridgeResult.injection_text) {
        injectionParts.push(bridgeResult.injection_text);
    }
    return {
        systemExtension: injectionParts.join('\n'),
        dataBlock: '', // RAG bridge already formats compact context
        trace: bridgeResult.trace || {},
    };
}
//# sourceMappingURL=rag-bridge.js.map