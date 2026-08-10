"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHermesUserContext = getHermesUserContext;
exports.parseMemorySections = parseMemorySections;
exports.serializeMemorySections = serializeMemorySections;
exports.mergeMemorySections = mergeMemorySections;
exports.getHermesMemoryContext = getHermesMemoryContext;
exports.getHermesStandards = getHermesStandards;
exports.getHermesContextForTask = getHermesContextForTask;
// lib/cie/sources/hermes-memory.ts — Hermes cross-session memory source
//
// Mirrors rag/core/hermes_memory.py so both pipelines read/write the SAME
// MEMORY.md format: `## Section` headers (Fleet + one per agent id, matched
// case-insensitively) containing `- [date#tag] entry` bullet lines.
//
// Fixed 2026-08-10: this file previously split MEMORY.md content on '§',
// a delimiter nothing ever wrote (checked — no writer anywhere in the repo
// emits '§'). The real file (store/hermes/MEMORY.md) uses the `## Section`
// format below; this was silently degrading to "keyword-search the whole
// file as one blob" instead of returning the right agent's section.
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
// ─── Section parsing (mirrors Python's _sections()) ────────────────────────
/**
 * Split a MEMORY.md-shaped string into {section_name_lower: [bullet lines]}.
 * Only lines starting with '-' inside a section are kept as entries — this
 * matches Python's read_memory(), which ignores blank lines and prose.
 */
function parseMemorySections(md) {
    const out = new Map();
    let cur = null;
    for (const rawLine of md.split('\n')) {
        const line = rawLine.trimEnd();
        const m = line.match(/^##\s+(.+?)\s*$/);
        if (m) {
            cur = m[1].trim().toLowerCase();
            if (!out.has(cur))
                out.set(cur, []);
            continue;
        }
        if (cur === null)
            continue;
        const trimmed = line.trim();
        if (trimmed.startsWith('-'))
            out.get(cur).push(trimmed);
    }
    return out;
}
/** Serialize {section_name: [bullets]} back to `## Section\n- bullet\n...` text. Fleet first, then alphabetical — a fixed order keeps merge output deterministic regardless of argument order. */
function serializeMemorySections(sections) {
    const names = [...sections.keys()].filter(n => sections.get(n).length > 0);
    names.sort((a, b) => {
        if (a === 'fleet')
            return -1;
        if (b === 'fleet')
            return 1;
        return a.localeCompare(b);
    });
    return names
        .map(name => {
        const label = name === 'fleet' ? 'Fleet' : name;
        return `## ${label}\n${sections.get(name).join('\n')}`;
    })
        .join('\n\n');
}
/**
 * G-Set CRDT merge of two MEMORY.md-shaped strings: per-section union of
 * bullet lines, deduped on exact text, sorted for determinism.
 *
 * Properties (checked by tests, see hermes-memory.test-manual.mts):
 *   commutative — merge(a,b) === merge(b,a)
 *   associative — merge(merge(a,b),c) === merge(a,merge(b,c))
 *   idempotent  — merge(a,a) === a (modulo whitespace/ordering)
 * A grow-only set is the simplest CRDT that fits this data: entries are
 * append-only and never edited or deleted, so "union, dedup, done" is
 * conflict-free by construction — no vector clocks or op-log needed.
 */
function mergeMemorySections(a, b) {
    const secA = parseMemorySections(a);
    const secB = parseMemorySections(b);
    const merged = new Map();
    const allNames = new Set([...secA.keys(), ...secB.keys()]);
    for (const name of allNames) {
        const bullets = new Set([...(secA.get(name) ?? []), ...(secB.get(name) ?? [])]);
        merged.set(name, [...bullets].sort());
    }
    return serializeMemorySections(merged);
}
// ─── Retrieval (mirrors Python's read_memory(agent_id, keywords)) ──────────
/**
 * One agent's own section + Fleet-wide lessons, optionally keyword-filtered.
 * Fleet lines are always kept; per-agent lines are kept only if `keywords`
 * is empty (no filter requested) or a keyword substring-matches the line.
 *
 * Agent section goes first (fixed 2026-08-10): with a global cap of
 * `maxLines`, a verbose `## Fleet` section (13+ lines in the real file)
 * would otherwise crowd out the very agent-specific match the caller asked
 * for before the loop ever reached it. Same reorder applied to
 * rag/core/hermes_memory.py's read_memory() to keep both sides identical.
 */
function getHermesMemoryContext(agentId, keywords, maxLines = 8) {
    const { content, mtime } = readCachedFile(getMemoryPath(), memoryCache, memoryMtime);
    memoryCache = content;
    memoryMtime = mtime;
    if (!content)
        return '';
    const sections = parseMemorySections(content);
    const picked = [];
    for (const name of [(agentId || '').toLowerCase(), 'fleet']) {
        if (!name || !sections.has(name))
            continue;
        for (const line of sections.get(name)) {
            if (keywords.length > 0) {
                const low = line.toLowerCase();
                const hit = keywords.some(k => k && low.includes(k.toLowerCase()));
                if (!hit && name !== 'fleet')
                    continue;
            }
            picked.push(line);
        }
    }
    return picked.slice(0, maxLines).join('\n');
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
function getHermesContextForTask(taskType, agentId = '') {
    const user = getHermesUserContext();
    const standards = getHermesStandards();
    const kw = TASK_KEYWORDS[taskType] ?? [];
    const mem = getHermesMemoryContext(agentId, kw);
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