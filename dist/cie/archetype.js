"use strict";
// lib/cie/archetype.ts — CLASSIFY Layer 1.7 / Layer 2: Task Archetype Mapping
//
// system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §14.1 defines seven archetypes with distinct retrieval shapes; §14.3 maps
// departments to their primary archetype(s) as a default/fallback, since "department alone
// doesn't determine the right retrieval/gate pipeline — the specific task does."
//
// VERIFIED DISCREPANCY (2026-08-09): §14.3's table has 19 rows, but only 7 correspond to a real
// department in this repo (Executive Office, Governance, Brand Studio, Engineering, AI & Agents,
// Product, Cybersecurity — cross-checked against classifier.ts's DEPT_TASK_TYPE and CLAUDE.md's
// routing table). The other 12 (Legal & Compliance, Finance & Treasury, Market Intelligence, Data
// Analytics, Behavioural Science, Ops & Delivery, People & Culture, Comms & PR, Global Expansion,
// Client Success, Growth & Partnerships, Risk & ESG) are a generic business-department template
// that doesn't map to anything in Teams/ — excluded here, not silently included. The doc also
// spells "Cyber Security" (two words); normalized to classifier.ts's "Cybersecurity" below.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEPARTMENT_ARCHETYPES = exports.ARCHETYPE_TABLE = void 0;
exports.classifyArchetype = classifyArchetype;
// §14.1's table, verbatim.
exports.ARCHETYPE_TABLE = {
    SHALLOW_LOOKUP: {
        retrievalShape: 'narrow, scoped, single query',
        passes: '1',
        timing: 'sync, seconds',
    },
    PRECISION_CRITICAL: {
        retrievalShape: 'standard §8 retrieval, 5-gate harness',
        passes: '1-2 + verify',
        timing: 'sync/near-sync',
    },
    DEEP_EXPLORATION: {
        retrievalShape: 'wide, AMBIGUOUS edges + MemPalace distant recall',
        passes: 'multi-pass: generate -> cluster -> shortlist',
        timing: 'async, needs session (§14.2)',
    },
    SYNTHESIS_REPORTING: {
        retrievalShape: 'cross-graph aggregation, wide gather',
        passes: '1 generation, wide gather phase',
        timing: 'async if source count large',
    },
    CREATIVE_PRODUCTION: {
        retrievalShape: '§13 Creative Retrieval Mode',
        passes: 'multi-pass, §13.2 gate chain',
        timing: 'async (C5 outcome capture delayed)',
    },
    CONTINUOUS_MONITORING: {
        retrievalShape: 'recurring scan vs. MemPalace temporal KG baseline',
        passes: 'scheduled, not message-triggered',
        timing: 'async, cron-driven',
    },
    ADVERSARIAL_TESTING: {
        retrievalShape: 'same rigor as precision-critical, inverted goal',
        passes: '1+ pass, explicit adversarial framing',
        timing: 'sync or triggered-phase',
    },
};
// §14.3's real-department rows only (see module comment).
exports.DEPARTMENT_ARCHETYPES = {
    'Executive Office': ['SYNTHESIS_REPORTING', 'DEEP_EXPLORATION'],
    'Governance': ['PRECISION_CRITICAL'],
    'Brand Studio': ['CREATIVE_PRODUCTION'],
    'Engineering': ['PRECISION_CRITICAL', 'DEEP_EXPLORATION', 'ADVERSARIAL_TESTING'],
    'AI & Agents': ['PRECISION_CRITICAL', 'DEEP_EXPLORATION'],
    'Product': ['DEEP_EXPLORATION', 'SYNTHESIS_REPORTING'],
    'Cybersecurity': ['CONTINUOUS_MONITORING', 'ADVERSARIAL_TESTING'],
};
// Keyword heuristics, same zero-token regex style as classifier.ts — CLASSIFY selects per-task,
// not per-department, so this is checked BEFORE falling back to the department default.
const ARCHETYPE_PATTERNS = {
    SHALLOW_LOOKUP: /\b(?:what is|what's|current|lookup|look up|quick question|price of|status of)\b/i,
    DEEP_EXPLORATION: /\b(?:brainstorm|explore|dig for|new ideas|what feature|what's next|ideate|options for)\b/i,
    SYNTHESIS_REPORTING: /\b(?:report|summary|summarize|aggregate|quarterly|rollup|roll-up|digest)\b/i,
    CREATIVE_PRODUCTION: /\b(?:write copy|campaign|social media|creative|design a|draft (?:a |an )?(?:post|ad|headline))\b/i,
    CONTINUOUS_MONITORING: /\b(?:monitor|track|alert|watch for|threat detection|drift)\b/i,
    ADVERSARIAL_TESTING: /\b(?:pentest|penetration test|vulnerability|exploit|attack|red.?team|adversarial)\b/i,
    // PRECISION_CRITICAL has no distinct keyword set of its own — it's the default for
    // engineering/governance-flavored asks that don't hit a more specific pattern above.
};
/**
 * classifyArchetype — picks ONE archetype per task. Keyword match first (per-task, per §14);
 * falls back to the department's first-listed default archetype if nothing matches. Department
 * must be a real department (see DEPARTMENT_ARCHETYPES) — unknown departments fall back to
 * PRECISION_CRITICAL, the safest default (full 5-gate harness, not a shortcut path).
 */
function classifyArchetype(message, department) {
    for (const [archetype, pattern] of Object.entries(ARCHETYPE_PATTERNS)) {
        if (pattern.test(message)) {
            return { archetype, ...exports.ARCHETYPE_TABLE[archetype], source: 'keyword' };
        }
    }
    const normalizedDept = department === 'Cyber Security' ? 'Cybersecurity' : department;
    const deptDefaults = exports.DEPARTMENT_ARCHETYPES[normalizedDept];
    const archetype = deptDefaults?.[0] ?? 'PRECISION_CRITICAL';
    return { archetype, ...exports.ARCHETYPE_TABLE[archetype], source: 'department-default' };
}
//# sourceMappingURL=archetype.js.map