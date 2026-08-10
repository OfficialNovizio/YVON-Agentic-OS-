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
exports.checkPremortemRisk = exports.checkNoveltyRepetition = exports.checkBrandVoiceConformance = exports.gatherCreativeContext = exports.getLooseNeighbors = exports.bridgeCrossScopeQuery = exports.invalidateVenturesCache = exports.listVentures = exports.materializeToolContext = exports.resolveRetrievalShape = exports.mineIntoMemPalace = exports.SESSION_WING = exports.persistToMemPalace = exports.listSessions = exports.resumeSession = exports.converge = exports.addExploreRound = exports.loadSession = exports.startSession = exports.SCRAPING_ESCALATION_CHAIN = exports.invalidateToolRegistryCache = exports.resolveOnDemandService = exports.checkRunningServices = exports.resolveToolBinding = exports.resolveToolLocation = exports.DEPARTMENT_ARCHETYPES = exports.ARCHETYPE_TABLE = exports.classifyArchetype = exports.resolveOwnerFromPath = exports.resolveTeam = exports.searchMemPalace = exports.getImpactRadius = exports.getNeighbors = exports.queryGraph = exports.resolveEntity = exports.invalidateAll = exports.invalidateAgent = exports.cacheStats = exports.setCached = exports.getCached = exports.ragToCieInjection = exports.callRagFormulas = exports.callRagBridge = exports.evaluateGate = exports.resolveExecutionGraph = exports.buildInjection = exports.getSourcesUsed = exports.rankContext = exports.retrieveContext = exports.classifyTask = void 0;
exports.getRealAgentRoster = exports.syncVentureAgents = exports.DECISION_WING = exports.captureDiscussion = exports.evaluateAdversarialGate = exports.recordCreativeOutcome = exports.checkPredictedPerformance = void 0;
exports.buildCieContext = buildCieContext;
exports.logFeedback = logFeedback;
const classifier_1 = require("./classifier");
const ranker_1 = require("./ranker");
const builder_1 = require("./builder");
const config_1 = require("../adapters/config");
const rag_bridge_1 = require("./rag-bridge");
const graph_resolver_1 = require("./graph-resolver");
const cache_1 = require("./cache");
const archetype_1 = require("./archetype");
const retrieval_shape_1 = require("./retrieval-shape");
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
    // ── Step 2: Resolve execution graph + task archetype (§14, wired 2026-08-09) ──
    const dept = resolveAgentDepartment(params.agentId);
    const graph = (0, graph_resolver_1.resolveExecutionGraph)(dept, params.task, params.agentId);
    const classifiedArchetype = (0, archetype_1.classifyArchetype)(params.task, dept);
    const retrievalShape = (0, retrieval_shape_1.resolveRetrievalShape)(classifiedArchetype.archetype);
    // ── Step 3: RAG Bridge (the P0 bridge) ──
    let ragResult = null;
    try {
        if (config.pipelineOrchestration) {
            ragResult = await (0, rag_bridge_1.callRagBridge)({
                query: params.task,
                agentId: params.agentId,
                dept,
                // Archetype-derived shape (§14.1/retrieval-shape.ts) is the primary signal now — an
                // explicit params.retrievalMode still wins if the caller set one. The old
                // graph.stages.length>3 heuristic is kept as a tertiary fallback only for the edge case
                // where archetype resolution somehow yields a shape retrievalMode of 'standard' but the
                // execution graph is unusually deep — archetype classification takes priority.
                retrievalMode: params.retrievalMode ?? retrievalShape.retrievalMode,
                topK: retrievalShape.topK,
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
            archetype: classifiedArchetype.archetype,
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
    context.archetype = classifiedArchetype.archetype;
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
var entity_resolution_1 = require("./entity-resolution");
Object.defineProperty(exports, "resolveEntity", { enumerable: true, get: function () { return entity_resolution_1.resolveEntity; } });
var graphify_1 = require("./sources/graphify");
Object.defineProperty(exports, "queryGraph", { enumerable: true, get: function () { return graphify_1.queryGraph; } });
Object.defineProperty(exports, "getNeighbors", { enumerable: true, get: function () { return graphify_1.getNeighbors; } });
Object.defineProperty(exports, "getImpactRadius", { enumerable: true, get: function () { return graphify_1.getImpactRadius; } });
var mempalace_1 = require("./sources/mempalace");
Object.defineProperty(exports, "searchMemPalace", { enumerable: true, get: function () { return mempalace_1.searchMemPalace; } });
var team_assignment_1 = require("./team-assignment");
Object.defineProperty(exports, "resolveTeam", { enumerable: true, get: function () { return team_assignment_1.resolveTeam; } });
Object.defineProperty(exports, "resolveOwnerFromPath", { enumerable: true, get: function () { return team_assignment_1.resolveOwnerFromPath; } });
var archetype_2 = require("./archetype");
Object.defineProperty(exports, "classifyArchetype", { enumerable: true, get: function () { return archetype_2.classifyArchetype; } });
Object.defineProperty(exports, "ARCHETYPE_TABLE", { enumerable: true, get: function () { return archetype_2.ARCHETYPE_TABLE; } });
Object.defineProperty(exports, "DEPARTMENT_ARCHETYPES", { enumerable: true, get: function () { return archetype_2.DEPARTMENT_ARCHETYPES; } });
var tool_binding_1 = require("./tool-binding");
Object.defineProperty(exports, "resolveToolLocation", { enumerable: true, get: function () { return tool_binding_1.resolveToolLocation; } });
Object.defineProperty(exports, "resolveToolBinding", { enumerable: true, get: function () { return tool_binding_1.resolveToolBinding; } });
Object.defineProperty(exports, "checkRunningServices", { enumerable: true, get: function () { return tool_binding_1.checkRunningServices; } });
Object.defineProperty(exports, "resolveOnDemandService", { enumerable: true, get: function () { return tool_binding_1.resolveOnDemandService; } });
Object.defineProperty(exports, "invalidateToolRegistryCache", { enumerable: true, get: function () { return tool_binding_1.invalidateToolRegistryCache; } });
Object.defineProperty(exports, "SCRAPING_ESCALATION_CHAIN", { enumerable: true, get: function () { return tool_binding_1.SCRAPING_ESCALATION_CHAIN; } });
var session_memory_1 = require("./session-memory");
Object.defineProperty(exports, "startSession", { enumerable: true, get: function () { return session_memory_1.startSession; } });
Object.defineProperty(exports, "loadSession", { enumerable: true, get: function () { return session_memory_1.loadSession; } });
Object.defineProperty(exports, "addExploreRound", { enumerable: true, get: function () { return session_memory_1.addExploreRound; } });
Object.defineProperty(exports, "converge", { enumerable: true, get: function () { return session_memory_1.converge; } });
Object.defineProperty(exports, "resumeSession", { enumerable: true, get: function () { return session_memory_1.resumeSession; } });
Object.defineProperty(exports, "listSessions", { enumerable: true, get: function () { return session_memory_1.listSessions; } });
Object.defineProperty(exports, "persistToMemPalace", { enumerable: true, get: function () { return session_memory_1.persistToMemPalace; } });
Object.defineProperty(exports, "SESSION_WING", { enumerable: true, get: function () { return session_memory_1.SESSION_WING; } });
var mempalace_2 = require("./sources/mempalace");
Object.defineProperty(exports, "mineIntoMemPalace", { enumerable: true, get: function () { return mempalace_2.mineIntoMemPalace; } });
var retrieval_shape_2 = require("./retrieval-shape");
Object.defineProperty(exports, "resolveRetrievalShape", { enumerable: true, get: function () { return retrieval_shape_2.resolveRetrievalShape; } });
var tool_context_1 = require("./tool-context");
Object.defineProperty(exports, "materializeToolContext", { enumerable: true, get: function () { return tool_context_1.materializeToolContext; } });
var ventures_1 = require("./sources/ventures");
Object.defineProperty(exports, "listVentures", { enumerable: true, get: function () { return ventures_1.listVentures; } });
Object.defineProperty(exports, "invalidateVenturesCache", { enumerable: true, get: function () { return ventures_1.invalidateVenturesCache; } });
var cross_scope_bridge_1 = require("./cross-scope-bridge");
Object.defineProperty(exports, "bridgeCrossScopeQuery", { enumerable: true, get: function () { return cross_scope_bridge_1.bridgeCrossScopeQuery; } });
var graphify_2 = require("./sources/graphify");
Object.defineProperty(exports, "getLooseNeighbors", { enumerable: true, get: function () { return graphify_2.getLooseNeighbors; } });
var creative_retrieval_1 = require("./creative-retrieval");
Object.defineProperty(exports, "gatherCreativeContext", { enumerable: true, get: function () { return creative_retrieval_1.gatherCreativeContext; } });
var creative_gate_chain_1 = require("./creative-gate-chain");
Object.defineProperty(exports, "checkBrandVoiceConformance", { enumerable: true, get: function () { return creative_gate_chain_1.checkBrandVoiceConformance; } });
Object.defineProperty(exports, "checkNoveltyRepetition", { enumerable: true, get: function () { return creative_gate_chain_1.checkNoveltyRepetition; } });
Object.defineProperty(exports, "checkPremortemRisk", { enumerable: true, get: function () { return creative_gate_chain_1.checkPremortemRisk; } });
Object.defineProperty(exports, "checkPredictedPerformance", { enumerable: true, get: function () { return creative_gate_chain_1.checkPredictedPerformance; } });
Object.defineProperty(exports, "recordCreativeOutcome", { enumerable: true, get: function () { return creative_gate_chain_1.recordCreativeOutcome; } });
var adversarial_gate_1 = require("./adversarial-gate");
Object.defineProperty(exports, "evaluateAdversarialGate", { enumerable: true, get: function () { return adversarial_gate_1.evaluateAdversarialGate; } });
var discussion_capture_1 = require("./discussion-capture");
Object.defineProperty(exports, "captureDiscussion", { enumerable: true, get: function () { return discussion_capture_1.captureDiscussion; } });
Object.defineProperty(exports, "DECISION_WING", { enumerable: true, get: function () { return discussion_capture_1.DECISION_WING; } });
var venture_agents_1 = require("./sources/venture-agents");
Object.defineProperty(exports, "syncVentureAgents", { enumerable: true, get: function () { return venture_agents_1.syncVentureAgents; } });
Object.defineProperty(exports, "getRealAgentRoster", { enumerable: true, get: function () { return venture_agents_1.getRealAgentRoster; } });
//# sourceMappingURL=index.js.map