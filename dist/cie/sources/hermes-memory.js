"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHermesUserContext = getHermesUserContext;
exports.getHermesMemoryContext = getHermesMemoryContext;
exports.getHermesStandards = getHermesStandards;
exports.getHermesContextForTask = getHermesContextForTask;
// lib/cie/sources/hermes-memory.ts — Hermes cross-session memory source
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("../../adapters/config");
let userCache = null;
let memoryCache = null;
let userMtime = 0;
let memoryMtime = 0;
function getUserPath() { return (0, path_1.join)((0, config_1.getConfig)().hermesMemoryDir, 'USER.md'); }
function getMemoryPath() { return (0, path_1.join)((0, config_1.getConfig)().hermesMemoryDir, 'MEMORY.md'); }
function readCachedFile(path, cacheVal, cacheMtime) {
    if (!(0, fs_1.existsSync)(path))
        return { content: '', mtime: 0 };
    const mtime = (0, fs_1.statSync)(path).mtimeMs;
    if (cacheVal !== null && cacheMtime === mtime)
        return { content: cacheVal, mtime };
    return { content: (0, fs_1.readFileSync)(path, 'utf-8'), mtime };
}
function getHermesUserContext() {
    const { content, mtime } = readCachedFile(getUserPath(), userCache, userMtime);
    userCache = content;
    userMtime = mtime;
    return content.slice(0, 300);
}
function getHermesMemoryContext(keywords) {
    const { content, mtime } = readCachedFile(getMemoryPath(), memoryCache, memoryMtime);
    memoryCache = content;
    memoryMtime = mtime;
    if (!content)
        return '';
    const entries = content.split('§').filter(Boolean);
    const matches = entries.filter(entry => keywords.some(k => entry.toLowerCase().includes(k.toLowerCase())));
    return matches.join('\n\n').slice(0, 400);
}
function getHermesStandards() {
    return [
        'AUDIT GATE — run tsc+build+lint before every push',
        'NO FAKE DATA — real Supabase data or honest empty states only',
        'TOON FORMAT STANDARD — all agent data injection uses toon.dense()',
        'PLAN FIRST — present structured plan before writing code',
        'ADDITIVE ONLY — merge features into existing codebase, never delete',
    ];
}
function getHermesContextForTask(taskType) {
    const user = getHermesUserContext();
    const standards = getHermesStandards();
    const kw = TASK_KEYWORDS[taskType] ?? [];
    const mem = getHermesMemoryContext(kw);
    return [
        user ? `[User Preferences]\n${user}` : '',
        standards.length ? `[Standards]\n${standards.map(s => `- ${s}`).join('\n')}` : '',
        mem ? `[Task Memory]\n${mem}` : '',
    ].filter(Boolean).join('\n\n');
}
const TASK_KEYWORDS = {
    engineering: ['build', 'error', 'type', 'typescript', 'tsc', 'lint', 'import', 'API', 'database'],
    strategy: ['decision', 'direction', 'price', 'revenue', 'investor', 'valuation', 'OKR'],
    governance: ['board', 'policy', 'compliance', 'audit', 'fiduciary', 'gate'],
    brand_marketing: ['campaign', 'brand', 'copy', 'social', 'content', 'ad', 'creative', 'story'],
    cybersecurity: ['security', 'breach', 'vulnerability', 'CVE', 'patch', 'auth', 'token'],
    product_analytics: ['experiment', 'A/B', 'metric', 'retention', 'cohort', 'pricing', 'WTP'],
    ai_agents: ['agent', 'model', 'LLM', 'prompt', 'skill', 'fleet', 'benchmark'],
    general: ['project', 'codebase', 'architecture', 'workflow'],
};
//# sourceMappingURL=hermes-memory.js.map