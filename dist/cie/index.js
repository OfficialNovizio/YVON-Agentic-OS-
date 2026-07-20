"use strict";
// lib/cie/index.ts — CIE v3 — Context Intelligence Engine
//
// Complete rewrite. Bridges TypeScript CIE into Python RAG + Shared OS + Graph.
//
// Flow: classify → resolve graph → RAG Bridge (Python subprocess)
//       → {injection + computed formulas + trace} → inject → LLM
//
// v3 improvements:
//   - RAG retrieval replaces source-level fetch (chunk-level semantic)
//   - Shared OS formula execution at query time (no more hallucinated math)
//   - Graph-based agent dependency resolution
//   - LRU context cache (Zipf-optimized)
//   - Lasswell-compliant audit trail on every call
//   - Feedback loop closes after execution
//
// ADAPTIVE INJECTION: Context scales with task COMPLEXITY, not length.
//   - Quick check (<6 words, no complex keywords) → 1,200 chars
//   - Standard review (typical agent queries) → 2,500 chars
//   - Deep analysis (strategic/high-stakes) → 4,000 chars
//   - Governance gate (board review) → 2,500 chars, tier-1 only
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.invalidateAll = exports.invalidateAgent = exports.cacheStats = exports.setCached = exports.getCached = exports.ragToCieInjection = exports.callRagFormulas = exports.callRagBridge = exports.evaluateGate = exports.resolveExecutionGraph = exports.buildInjection = exports.getSourcesUsed = exports.rankContext = exports.retrieveContext = exports.classifyTask = void 0;
exports.buildCieContext = buildCieContext;
exports.logFeedback = logFeedback;
const classifier_1 = require("./classifier");
const ranker_1 = require("./ranker");
const builder_1 = require("./builder");
const config_1 = require("../adapters/config");
const rag_bridge_1 = require("./rag-bridge");
const graph_resolver_1 = require("./graph-resolver");
const cache_1 = require("./cache");
/**
 * Build CIE context for an agent call. v3 — RAG-powered.
 *
 * Uses RAG Bridge (Python subprocess) for semantic chunk retrieval,
 * Shared OS formula execution, and computed fact injection.
 *
 * Falls back to v2 source-level retrieval if RAG bridge is unavailable.
 */
async function buildCieContext(params) {
    const t0 = Date.now();
    const config = (0, config_1.getConfig)();
    // ── Step 0: Check cache (Zipf-optimized — repeated queries skip RAG) ──
    if (!params.skipCache && config.cieEnabled) {
        const fp = `${params.agentId}:${params.task.toLowerCase().trim().slice(0, 200)}`;
        const cached = (0, cache_1.getCached)(fp);
        if (cached) {
            // Fast path: cached context. Return immediately.
            const timeMs = Date.now() - t0;
            return {
                systemExtension: cached.result.injection_text,
                dataBlock: '',
                sourcesUsed: ['shared_os_logical', 'agent_memory'],
                totalChars: cached.result.injection_text.length,
                itemsInjected: cached.result.chunks ?? 1,
                itemsFiltered: 0,
                timeMs,
            };
        }
    }
    // ── Step 1: Classify (regex, zero tokens) ──
    const profile = (0, classifier_1.classifyTask)(params.agentId, params.task, params.venture ?? 'yvon-dashboard');
    // ── Step 2: Resolve execution graph ──
    const dept = resolveAgentDepartment(params.agentId);
    const graph = (0, graph_resolver_1.resolveExecutionGraph)(dept, params.task, params.agentId);
    // ── Step 3: RAG Bridge (the P0 bridge) ──
    let ragResult = null;
    try {
        if (config.pipelineOrchestration) {
            ragResult = await (0, rag_bridge_1.callRagBridge)({
                query: params.task,
                agentId: params.agentId,
                dept,
                retrievalMode: params.retrievalMode ?? (graph.stages.length > 3 ? 'agentic' : 'standard'),
            });
        }
    }
    catch {
        // RAG bridge unavailable — fall back to v2 source-level retrieval
        console.warn('[CIE v3] RAG bridge unavailable — falling back to source-level retrieval');
    }
    // ── Step 4: Build final injection ──
    const timeMs = Date.now() - t0;
    if (ragResult && ragResult.success) {
        // RAG path: use RAG's optimized injection
        const { systemExtension, dataBlock, trace } = (0, rag_bridge_1.ragToCieInjection)(ragResult);
        // Cache the successful result (Zipf-optimized)
        if (config.cieEnabled) {
            (0, cache_1.setCached)(params.task, params.agentId, {
                injection_text: systemExtension,
                trace,
                profile: ragResult.profile,
                chunks: ragResult.chunks,
                computed_formulas: ragResult.computed_formulas,
            });
        }
        return {
            systemExtension,
            dataBlock,
            sourcesUsed: ['shared_os_logical', 'rag_bridge'],
            totalChars: ragResult.chars ?? systemExtension.length,
            itemsInjected: ragResult.chunks ?? 1,
            itemsFiltered: 0,
            timeMs,
        };
    }
    // Fallback: v2 source-level retrieval
    const { retrieveContext } = await Promise.resolve().then(() => __importStar(require('./retriever')));
    const items = retrieveContext(profile);
    // Adaptive budget based on graph complexity (replaces old length-based)
    const graphComplexity = graph.stages.length;
    let charBudget;
    let maxItems;
    if (graphComplexity > 3) {
        charBudget = params.charBudget ?? 4000;
        maxItems = 20;
    }
    else if (graphComplexity > 1) {
        charBudget = params.charBudget ?? 2500;
        maxItems = 10;
    }
    else {
        charBudget = params.charBudget ?? 1200;
        maxItems = 5;
    }
    const cappedItems = items.slice(0, maxItems);
    const { selected, filtered } = (0, ranker_1.rankContext)(cappedItems, {
        charBudget,
        dedupSimilarity: 0.85,
    });
    const context = (0, builder_1.buildInjection)(selected, filtered, timeMs);
    // Add graph metadata
    if (graph.stages.length > 1) {
        const graphInfo = graph.stages
            .map(s => `${s.isGate ? '🚪GATE' : '  '} ${s.agentId}${s.dependencies.length ? ' ← ' + s.dependencies.join(',') : ''}`)
            .join('\n');
        context.systemExtension += `\n\n[EXECUTION GRAPH — ${dept}]\n${graphInfo}\n`;
    }
    return context;
}
// ─── Agent → Department resolver ────────────────────────────────
function resolveAgentDepartment(agentId) {
    const deptMap = {
        marcus: 'Executive Office', echo: 'Executive Office', vista: 'Executive Office',
        board: 'Governance', precedent: 'Governance', sentinel: 'Governance',
        dev: 'Engineering', ops: 'Engineering', cypher: 'Engineering', aegis: 'Engineering',
        axiom: 'Engineering', rank: 'Engineering', quinn: 'Engineering', dana: 'Engineering',
        raj: 'Engineering', mia: 'Engineering', nova: 'Engineering',
        warden: 'Cybersecurity', keyring: 'Cybersecurity', bastion: 'Cybersecurity',
        cortex: 'Cybersecurity', veil: 'Cybersecurity',
        spec: 'Product', metric: 'Product', ux: 'Product', loom: 'Product', price: 'Product',
        meta: 'AI & Agents', relay: 'AI & Agents', gauge: 'AI & Agents', anneal: 'AI & Agents',
        forge: 'AI & Agents', scout: 'AI & Agents', proto: 'AI & Agents', edge: 'AI & Agents',
        spark: 'Brand Studio', atlas: 'Brand Studio', lena: 'Brand Studio', weave: 'Brand Studio',
        muse: 'Brand Studio', pixel: 'Brand Studio', pulse: 'Brand Studio', rio: 'Brand Studio',
        nate: 'Brand Studio', kai: 'Brand Studio', tempo: 'Brand Studio',
    };
    return deptMap[agentId.toLowerCase()] || 'Executive Office';
}
// ─── Feedback logger ──────────────────────────────────────────────
async function logFeedback(trace, outcome, notes) {
    try {
        await (0, rag_bridge_1.callRagFeedback)({ trace, outcome, notes });
    }
    catch {
        // Non-blocking — feedback failure shouldn't break the agent
    }
}
var classifier_2 = require("./classifier");
Object.defineProperty(exports, "classifyTask", { enumerable: true, get: function () { return classifier_2.classifyTask; } });
var retriever_1 = require("./retriever");
Object.defineProperty(exports, "retrieveContext", { enumerable: true, get: function () { return retriever_1.retrieveContext; } });
var ranker_2 = require("./ranker");
Object.defineProperty(exports, "rankContext", { enumerable: true, get: function () { return ranker_2.rankContext; } });
Object.defineProperty(exports, "getSourcesUsed", { enumerable: true, get: function () { return ranker_2.getSourcesUsed; } });
var builder_2 = require("./builder");
Object.defineProperty(exports, "buildInjection", { enumerable: true, get: function () { return builder_2.buildInjection; } });
var graph_resolver_2 = require("./graph-resolver");
Object.defineProperty(exports, "resolveExecutionGraph", { enumerable: true, get: function () { return graph_resolver_2.resolveExecutionGraph; } });
Object.defineProperty(exports, "evaluateGate", { enumerable: true, get: function () { return graph_resolver_2.evaluateGate; } });
var rag_bridge_2 = require("./rag-bridge");
Object.defineProperty(exports, "callRagBridge", { enumerable: true, get: function () { return rag_bridge_2.callRagBridge; } });
Object.defineProperty(exports, "callRagFormulas", { enumerable: true, get: function () { return rag_bridge_2.callRagFormulas; } });
Object.defineProperty(exports, "ragToCieInjection", { enumerable: true, get: function () { return rag_bridge_2.ragToCieInjection; } });
var cache_2 = require("./cache");
Object.defineProperty(exports, "getCached", { enumerable: true, get: function () { return cache_2.getCached; } });
Object.defineProperty(exports, "setCached", { enumerable: true, get: function () { return cache_2.setCached; } });
Object.defineProperty(exports, "cacheStats", { enumerable: true, get: function () { return cache_2.cacheStats; } });
Object.defineProperty(exports, "invalidateAgent", { enumerable: true, get: function () { return cache_2.invalidateAgent; } });
Object.defineProperty(exports, "invalidateAll", { enumerable: true, get: function () { return cache_2.invalidateAll; } });
//# sourceMappingURL=index.js.map