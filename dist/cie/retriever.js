"use strict";
// lib/cie/retriever.ts — Parallel context retrieval from all knowledge sources
//
// All knowledge sources are synchronous (read from cached files).
// Fetches context from graphify, codegraph, agent memory, Hermes memory,
// and project docs. Applies source mapping based on task type.
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveContext = retrieveContext;
const algorithms_1 = require("./algorithms");
const graphify_1 = require("./sources/graphify");
const codegraph_1 = require("./sources/codegraph");
const agent_memory_1 = require("./sources/agent-memory");
const hermes_memory_1 = require("./sources/hermes-memory");
const project_docs_1 = require("./sources/project-docs");
// ─── Source Map ──────────────────────────────────────────────────────────────
const SOURCE_MAP = {
    engineering: { primary: ['codegraph', 'agent_memory', 'hermes_memory'], secondary: ['graphify', 'project_docs'], exclude: ['venture_context'] },
    strategy: { primary: ['agent_memory', 'hermes_memory', 'venture_context', 'project_docs'], secondary: [], exclude: ['graphify', 'codegraph'] },
    governance: { primary: ['project_docs', 'agent_memory', 'hermes_memory'], secondary: [], exclude: ['graphify', 'codegraph', 'venture_context'] },
    brand_marketing: { primary: ['agent_memory', 'venture_context', 'hermes_memory'], secondary: ['project_docs'], exclude: ['graphify', 'codegraph'] },
    cybersecurity: { primary: ['agent_memory', 'hermes_memory', 'project_docs'], secondary: ['codegraph'], exclude: ['graphify', 'venture_context'] },
    product_analytics: { primary: ['project_docs', 'agent_memory', 'hermes_memory'], secondary: ['venture_context'], exclude: ['graphify', 'codegraph'] },
    ai_agents: { primary: ['agent_memory', 'hermes_memory', 'project_docs'], secondary: ['graphify'], exclude: ['codegraph', 'venture_context'] },
    general: { primary: ['agent_memory', 'hermes_memory', 'project_docs'], secondary: ['graphify', 'codegraph', 'venture_context'], exclude: [] },
};
const SOURCE_PRIORITY = {
    agent_memory: 10, shared_os_logical: 9, hermes_memory: 8,
    project_docs: 7, team_workflows: 7, codegraph: 6,
    venture_context: 5, graphify: 4, session_state: 3, toon_context: 8,
};
// ─── Fetch one source ────────────────────────────────────────────────────────
function fetchSource(source, profile, keywords) {
    const items = [];
    const add = (content, offset = 0) => {
        if (!content || content.trim().length === 0)
            return;
        items.push({
            content, source,
            priority: SOURCE_PRIORITY[source] - offset * 0.5,
            relevance: 1.0, chars: content.length,
            id: `${source}:${content.slice(0, 40)}`,
        });
    };
    switch (source) {
        case 'codegraph': {
            const paths = (0, algorithms_1.extractFilePaths)(profile.venture + ' ' + keywords.join(' '));
            add((0, codegraph_1.queryCodegraph)(paths.length > 0 ? paths : ['lib/types.ts']));
            break;
        }
        case 'graphify':
            add((0, graphify_1.queryGraphify)(keywords));
            break;
        case 'agent_memory': {
            const rules = (0, agent_memory_1.getAgentMemoryRules)(profile.agentId);
            const cross = (0, agent_memory_1.getCrossAgentRules)(profile.type, profile.agentId);
            rules.architectureLocks.forEach((r, i) => add(`[ARCH LOCK] ${r}`, i));
            rules.neverAgain.forEach((r, i) => add(`[NEVER AGAIN] ${r}`, i));
            cross.forEach((r, i) => add(`[CROSS-AGENT] ${r}`, i));
            break;
        }
        case 'hermes_memory': {
            const user = (0, hermes_memory_1.getHermesUserContext)();
            const standards = (0, hermes_memory_1.getHermesStandards)();
            const mem = (0, hermes_memory_1.getHermesMemoryContext)(keywords);
            add(user, 0);
            standards.forEach((s, i) => add(`[STANDARD] ${s}`, i + 0.5));
            if (mem)
                add(mem, 3);
            break;
        }
        case 'project_docs': {
            const arch = (0, project_docs_1.getProjectArchitecture)();
            const rules = (0, project_docs_1.getProjectRules)();
            add(arch, 0);
            rules.forEach((r, i) => add(`[RULE] ${r}`, i + 0.5));
            break;
        }
        case 'venture_context':
            add((0, project_docs_1.getVentureContext)(profile.venture));
            break;
    }
    return items;
}
// ─── Main retrieval ──────────────────────────────────────────────────────────
const shared_os_logical_1 = require("./sources/shared-os-logical");
const config_1 = require("../adapters/config");
const fs_1 = require("fs");
const path_1 = require("path");
function retrieveContext(profile) {
    const sources = SOURCE_MAP[profile.type];
    const keywords = profile.keywords.length > 0 ? profile.keywords : (0, algorithms_1.extractKeywords)(profile.venture + ' task', 5);
    // Primary sources
    let items = sources.primary
        .filter(s => !sources.exclude.includes(s))
        .flatMap(s => fetchSource(s, profile, keywords));
    // Secondary sources if primary returned few items
    if (items.length < 3) {
        const alreadyFetched = new Set(items.map(i => i.source));
        const secondaryItems = sources.secondary
            .filter(s => !alreadyFetched.has(s) && !sources.exclude.includes(s))
            .flatMap(s => fetchSource(s, profile, keywords))
            .map(i => ({ ...i, relevance: 0.5 }));
        items = [...items, ...secondaryItems];
    }
    // ─── Always-fetched sources (P0 fix) ──────────────────────────────────────
    // Shared OS logical scripts — every agent gets its formulas
    try {
        const sharedItems = (0, shared_os_logical_1.getSharedOsContext)(profile.agentId, profile.type, profile.venture);
        if (sharedItems.length > 0) {
            items.push(...sharedItems);
        }
    }
    catch { /* non-blocking */ }
    // TOON-compressed context — prefer .toon over raw .md
    try {
        const config = (0, config_1.getConfig)();
        if (config.toonEnabled) {
            const teamsDir = config.teamsPath || (0, path_1.join)(config.projectRoot, 'Teams');
            const depts = ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
                'Product', 'AI & Agents', 'Brand Studio'];
            for (const dept of depts) {
                const agentDir = (0, path_1.join)(teamsDir, dept, profile.agentId);
                if (!(0, fs_1.existsSync)(agentDir))
                    continue;
                // Check for .toon files in agent's directory
                const walkDir = (dir) => {
                    try {
                        for (const entry of require('fs').readdirSync(dir)) {
                            const full = (0, path_1.join)(dir, entry);
                            if (entry.endsWith('.toon')) {
                                try {
                                    const toonContent = (0, fs_1.readFileSync)(full, 'utf-8');
                                    const lines = toonContent.split(' · ').slice(0, 4).join(' · ');
                                    if (lines.length > 0) {
                                        items.push({
                                            content: `[TOON:${profile.agentId}] ${lines}`,
                                            source: 'toon_context',
                                            priority: 5, relevance: 0.8,
                                            chars: lines.length,
                                            id: `toon:${entry.replace('.toon', '')}`,
                                        });
                                    }
                                }
                                catch { /* skip broken .toon */ }
                            }
                            else if (require('fs').statSync(full).isDirectory() && !entry.startsWith('.')) {
                                walkDir(full);
                            }
                        }
                    }
                    catch { /* skip unreadable dirs */ }
                };
                walkDir(agentDir);
                break; // Found the agent — stop searching
            }
        }
    }
    catch { /* non-blocking */ }
    return items;
}
//# sourceMappingURL=retriever.js.map