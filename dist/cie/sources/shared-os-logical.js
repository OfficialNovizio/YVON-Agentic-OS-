"use strict";
// src/cie/sources/shared-os-logical.ts — Shared OS logical scripts knowledge source
//
// Reads each agent's book-requirements.md, resolves the script list,
// extracts relevant function signatures + citations from Shared OS/logical/*.py,
// and returns TOON-compressed context for CIE injection.
//
// This is the BRIDGE between the department framework (Python logical layer)
// and the runtime engine (TypeScript CIE).
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSharedOsContext = getSharedOsContext;
exports.getAllAgentScriptMappings = getAllAgentScriptMappings;
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("../../adapters/config");
const scriptsDir = (() => {
    try {
        const config = (0, config_1.getConfig)();
        return config.sharedOsPath || (0, path_1.resolve)(__dirname, '..', '..', '..', 'Teams', 'Shared OS', 'logical');
    }
    catch {
        return (0, path_1.resolve)(__dirname, '..', '..', '..', 'Teams', 'Shared OS', 'logical');
    }
})();
const scriptCache = new Map();
// ─── Parse Python docstrings for function metadata ────────────────
function parseScriptMeta(scriptPath) {
    if (!(0, fs_1.existsSync)(scriptPath))
        return null;
    const cached = scriptCache.get(scriptPath);
    if (cached)
        return cached;
    try {
        const content = (0, fs_1.readFileSync)(scriptPath, 'utf-8');
        const lines = content.split('\n');
        const meta = {
            source: '', citations: [], functions: [], route: '', assignedAgents: []
        };
        let inDocstring = false;
        let currentFunc = '';
        let docLines = [];
        for (const line of lines) {
            // Extract source from module docstring
            if (line.includes('Source:') || line.includes('Sources:')) {
                meta.source = line.replace(/.*?:/, '').trim();
            }
            // Extract chapter citations
            if (line.includes('Ch.') && (line.includes('pp.') || line.includes('§'))) {
                meta.citations.push(line.trim().replace(/^[#\s*-]+/, ''));
            }
            // Detect function definitions
            if (line.trim().startsWith('def ')) {
                const name = line.trim().split('(')[0].replace('def ', '');
                if (!name.startsWith('_')) {
                    meta.functions.push({ name, signature: line.trim(), doc: '' });
                    currentFunc = name;
                }
            }
            // Route annotation
            if (line.includes('Route:') || line.includes('Route ')) {
                meta.route = line.replace(/.*?:/, '').trim();
            }
        }
        scriptCache.set(scriptPath, meta);
        return meta;
    }
    catch {
        return null;
    }
}
// ─── Agent → Script mapping (from book-requirements.md) ───────────
function getAgentScripts(agentId) {
    // Scan Teams/<dept>/<agent>/logical/book-requirements.md
    const teamsDir = (() => {
        try {
            return (0, config_1.getConfig)().teamsPath;
        }
        catch {
            return (0, path_1.resolve)(process.cwd(), 'Teams');
        }
    })() || (0, path_1.resolve)(process.cwd(), 'Teams');
    // Search all departments for this agent
    const depts = ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
        'Product', 'AI & Agents', 'Brand Studio',
        // 2026-08-15 — 6 new departments merged in from origin.
        'Client Success', 'Comms & PR', 'Global Expansion',
        'Growth & Partnerships', 'People & Culture', 'Risk & ESG'];
    for (const dept of depts) {
        const breqPath = (0, path_1.join)(teamsDir, dept, agentId, 'logical', 'book-requirements.md');
        if ((0, fs_1.existsSync)(breqPath)) {
            try {
                const content = (0, fs_1.readFileSync)(breqPath, 'utf-8');
                const scripts = [];
                // Extract script filenames from markdown tables and lists
                const pyRe = /`([a-z_]+\.py)`/gi;
                let m;
                while ((m = pyRe.exec(content)) !== null) {
                    if (!m[1].startsWith('_'))
                        scripts.push(m[1]);
                }
                return [...new Set(scripts)];
            }
            catch {
                return [];
            }
        }
    }
    return [];
}
// ─── Build TOON-compressed function reference ──────────────────────
function buildFunctionReference(scripts) {
    const parts = ['[SHARED OS FUNCTIONS]'];
    for (const script of scripts) {
        const scriptPath = (0, path_1.join)(scriptsDir, script);
        const meta = parseScriptMeta(scriptPath);
        if (!meta)
            continue;
        // TOON format: script · func=name(args) · src=chapter · cite=source
        const funcNames = meta.functions.slice(0, 8).map(f => f.name).join(',');
        const cite = meta.citations.slice(0, 2).join('; ');
        if (funcNames) {
            parts.push(`${script.replace('.py', '')} · f=${funcNames} · src=${meta.source.slice(0, 60)}`);
        }
    }
    return parts.join('\n');
}
// ─── Main entry point ──────────────────────────────────────────────
function getSharedOsContext(agentId, taskType, venture) {
    const items = [];
    const scripts = getAgentScripts(agentId);
    if (scripts.length === 0)
        return items;
    // 1. Function reference (what scripts can this agent call?)
    const funcRef = buildFunctionReference(scripts);
    if (funcRef) {
        items.push({
            content: funcRef,
            source: 'shared_os_logical',
            priority: 3, // High priority — formulas are load-bearing
            relevance: 1.0,
            chars: funcRef.length,
            id: `sol-${agentId}-funcs`,
        });
    }
    // 2. Citations block (what sources ground this agent?)
    const citations = [];
    for (const script of scripts) {
        const meta = parseScriptMeta((0, path_1.join)(scriptsDir, script));
        if (meta && meta.citations.length > 0) {
            citations.push(`${script}: ${meta.citations[0]}`);
        }
    }
    if (citations.length > 0) {
        const citeBlock = `[CITABLE SOURCES for ${agentId}]\n` + citations.slice(0, 5).join('\n');
        items.push({
            content: citeBlock,
            source: 'shared_os_logical',
            priority: 4,
            relevance: 0.9,
            chars: citeBlock.length,
            id: `sol-${agentId}-cites`,
        });
    }
    return items;
}
// ─── Export all agent scripts for dashboard/resolver use ───────────
function getAllAgentScriptMappings() {
    const result = {};
    for (const dept of ['Executive Office', 'Governance', 'Engineering', 'Cybersecurity',
        'Product', 'AI & Agents', 'Brand Studio',
        // 2026-08-15 — 6 new departments merged in from origin.
        'Client Success', 'Comms & PR', 'Global Expansion',
        'Growth & Partnerships', 'People & Culture', 'Risk & ESG']) {
        const deptPath = (0, path_1.join)((0, path_1.resolve)(__dirname, '..', '..', '..', 'Teams'), dept);
        if (!(0, fs_1.existsSync)(deptPath))
            continue;
        try {
            for (const agent of require('fs').readdirSync(deptPath)) {
                const scripts = getAgentScripts(agent);
                if (scripts.length > 0)
                    result[agent] = scripts;
            }
        }
        catch { }
    }
    return result;
}
//# sourceMappingURL=shared-os-logical.js.map