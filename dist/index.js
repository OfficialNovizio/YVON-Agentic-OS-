"use strict";
// YVON Engine — AI Agent OS Kernel
//
// One npm install. Full 46-agent team across 7 departments.
//
// @yvon/engine provides:
//   - CIE v3: Context Intelligence Engine (classify → graph → RAG Bridge → inject)
//   - RAG: Retrieval-Augmented Generation with dynamic profiles
//   - Shared OS: Formula execution at query time (hallucination prevention)
//   - TOON: Token-Optimized Object Notation (84.5% token savings)
//   - Agents: 46 AI agent personalities from the department framework
//   - Algorithms: Bloom, MinHash, TF-IDF, BFS, PriorityQueue
//   - Adapters: Config resolver, MCP client, Hermes sync
//
// Agent personality is DERIVED from department framework files, not
// hardcoded — see src/agents/personalities.ts for the full registry.
//
// Usage:
//   import { createEngine, buildCieContext } from '@yvon/engine'
//   const cie = buildCieContext({ agentId: 'marcus', task: 'quarterly strategy review', venture: 'myproject' })
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllAgentScriptMappings = exports.getSharedOsContext = exports.requiresGovernanceReview = exports.executeGovernanceReview = exports.getNextContentStage = exports.isContentPipelineAgent = exports.executeContentPipeline = exports.getAgentContext = exports.getDepartments = exports.getLeaders = exports.getDepartmentLeader = exports.getDepartmentAgents = exports.getAgentProfile = exports.DEPARTMENT_COUNT = exports.AGENT_COUNT = exports.AGENT_REGISTRY = exports.pushToHermes = exports.syncWithHermes = exports.startDashboard = exports.createMCPClient = exports.invalidateConfig = exports.getConfig = exports.jaccardEstimate = exports.minhashSignature = exports.blastRadius = exports.ContextPriorityQueue = exports.TfidfIndex = exports.BloomFilter = exports.computeDelta = exports.getOrCreateState = exports.dictToLine = exports.buildDictionary = exports.compress = exports.toon = exports.classifyTask = exports.buildCieContext = void 0;
exports.createEngine = createEngine;
// ─── Main engine ──────────────────────────────────────────────────────────────
var cie_1 = require("./cie");
Object.defineProperty(exports, "buildCieContext", { enumerable: true, get: function () { return cie_1.buildCieContext; } });
Object.defineProperty(exports, "classifyTask", { enumerable: true, get: function () { return cie_1.classifyTask; } });
// ─── TOON compression ─────────────────────────────────────────────────────────
var toon_1 = require("./toon/toon");
Object.defineProperty(exports, "toon", { enumerable: true, get: function () { return toon_1.toon; } });
var compressor_1 = require("./toon/compressor");
Object.defineProperty(exports, "compress", { enumerable: true, get: function () { return compressor_1.compress; } });
Object.defineProperty(exports, "buildDictionary", { enumerable: true, get: function () { return compressor_1.buildDictionary; } });
Object.defineProperty(exports, "dictToLine", { enumerable: true, get: function () { return compressor_1.dictToLine; } });
var delta_1 = require("./toon/delta");
Object.defineProperty(exports, "getOrCreateState", { enumerable: true, get: function () { return delta_1.getOrCreateState; } });
Object.defineProperty(exports, "computeDelta", { enumerable: true, get: function () { return delta_1.computeDelta; } });
// ─── Algorithms ───────────────────────────────────────────────────────────────
var algorithms_1 = require("./cie/algorithms");
Object.defineProperty(exports, "BloomFilter", { enumerable: true, get: function () { return algorithms_1.BloomFilter; } });
Object.defineProperty(exports, "TfidfIndex", { enumerable: true, get: function () { return algorithms_1.TfidfIndex; } });
Object.defineProperty(exports, "ContextPriorityQueue", { enumerable: true, get: function () { return algorithms_1.ContextPriorityQueue; } });
Object.defineProperty(exports, "blastRadius", { enumerable: true, get: function () { return algorithms_1.blastRadius; } });
Object.defineProperty(exports, "minhashSignature", { enumerable: true, get: function () { return algorithms_1.minhashSignature; } });
Object.defineProperty(exports, "jaccardEstimate", { enumerable: true, get: function () { return algorithms_1.jaccardEstimate; } });
// ─── Config ───────────────────────────────────────────────────────────────────
var config_1 = require("./adapters/config");
Object.defineProperty(exports, "getConfig", { enumerable: true, get: function () { return config_1.getConfig; } });
Object.defineProperty(exports, "invalidateConfig", { enumerable: true, get: function () { return config_1.invalidateConfig; } });
// ─── MCP ──────────────────────────────────────────────────────────────────────
var mcp_client_1 = require("./adapters/mcp-client");
Object.defineProperty(exports, "createMCPClient", { enumerable: true, get: function () { return mcp_client_1.createMCPClient; } });
// ─── Dashboard ─────────────────────────────────────────────────────────────────
var dashboard_1 = require("./dashboard");
Object.defineProperty(exports, "startDashboard", { enumerable: true, get: function () { return dashboard_1.startDashboard; } });
// ─── Hermes ────────────────────────────────────────────────────────────────────
var hermes_sync_1 = require("./adapters/hermes-sync");
Object.defineProperty(exports, "syncWithHermes", { enumerable: true, get: function () { return hermes_sync_1.syncWithHermes; } });
Object.defineProperty(exports, "pushToHermes", { enumerable: true, get: function () { return hermes_sync_1.pushToHermes; } });
// ─── Agent Registry (46 agents, 7 departments) ────────────────────────────────
var personalities_1 = require("./agents/personalities");
Object.defineProperty(exports, "AGENT_REGISTRY", { enumerable: true, get: function () { return personalities_1.AGENT_REGISTRY; } });
Object.defineProperty(exports, "AGENT_COUNT", { enumerable: true, get: function () { return personalities_1.AGENT_COUNT; } });
Object.defineProperty(exports, "DEPARTMENT_COUNT", { enumerable: true, get: function () { return personalities_1.DEPARTMENT_COUNT; } });
Object.defineProperty(exports, "getAgentProfile", { enumerable: true, get: function () { return personalities_1.getAgentProfile; } });
Object.defineProperty(exports, "getDepartmentAgents", { enumerable: true, get: function () { return personalities_1.getDepartmentAgents; } });
Object.defineProperty(exports, "getDepartmentLeader", { enumerable: true, get: function () { return personalities_1.getDepartmentLeader; } });
Object.defineProperty(exports, "getLeaders", { enumerable: true, get: function () { return personalities_1.getLeaders; } });
Object.defineProperty(exports, "getDepartments", { enumerable: true, get: function () { return personalities_1.getDepartments; } });
Object.defineProperty(exports, "getAgentContext", { enumerable: true, get: function () { return personalities_1.getAgentContext; } });
// ─── Pipelines ─────────────────────────────────────────────────────────────────
var content_pipeline_1 = require("./pipelines/content-pipeline");
Object.defineProperty(exports, "executeContentPipeline", { enumerable: true, get: function () { return content_pipeline_1.executeContentPipeline; } });
Object.defineProperty(exports, "isContentPipelineAgent", { enumerable: true, get: function () { return content_pipeline_1.isContentPipelineAgent; } });
Object.defineProperty(exports, "getNextContentStage", { enumerable: true, get: function () { return content_pipeline_1.getNextContentStage; } });
var governance_gate_1 = require("./pipelines/governance-gate");
Object.defineProperty(exports, "executeGovernanceReview", { enumerable: true, get: function () { return governance_gate_1.executeGovernanceReview; } });
Object.defineProperty(exports, "requiresGovernanceReview", { enumerable: true, get: function () { return governance_gate_1.requiresGovernanceReview; } });
// ─── Shared OS Connector ───────────────────────────────────────────────────────
var shared_os_logical_1 = require("./cie/sources/shared-os-logical");
Object.defineProperty(exports, "getSharedOsContext", { enumerable: true, get: function () { return shared_os_logical_1.getSharedOsContext; } });
Object.defineProperty(exports, "getAllAgentScriptMappings", { enumerable: true, get: function () { return shared_os_logical_1.getAllAgentScriptMappings; } });
function createEngine(options = {}) {
    const config = require('./adapters/config').getConfig();
    return {
        config,
        cie: {
            buildContext: (params) => require('./cie').buildCieContext(params),
        },
        toon: {
            dense: require('./toon/toon').toon.dense,
            compress: require('./toon/compressor').compress,
            delta: require('./toon/delta').createDeltaTracker,
        },
        agents: {
            getProfile: (id) => require('./agents/personalities').getAgentProfile(id),
            getContext: (id) => require('./agents/personalities').getAgentContext(id),
            count: require('./agents/personalities').AGENT_COUNT,
            departments: require('./agents/personalities').getDepartments(),
        },
        version: '1.0.0',
    };
}
//# sourceMappingURL=index.js.map