"use strict";
// lib/cie/entity-resolution.ts — CLASSIFY Layer 1.1: "what is this message about?"
//
// Implements system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §8.1's fixed priority exactly:
//   1. graphify.query_graph(entity, scope) — checked FIRST, canonical/deterministic
//        confident unique match -> resolved
//   2. no graphify match -> MemPalace.search(entity, scope) -- episodic fallback
//        match -> resolved, but flagged "not yet a formal node"
//   3. neither resolves -> ambiguous, do not guess -- surface for clarification
//
// This is the first real wiring of MASTER.md §6.3 Layer 1.1 into code — before this, the
// mechanism only existed as prose. classifier.ts's existing keyword->task_type classification is
// unrelated and unchanged; this module is a separate, additional CLASSIFY step.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveEntity = resolveEntity;
const graphify_1 = require("./sources/graphify");
const mempalace_1 = require("./sources/mempalace");
function resolveEntity(entity, scope) {
    // Step 1 — graphify, canonical/deterministic, checked first.
    const graphResult = (0, graphify_1.queryGraph)(entity, scope);
    if (graphResult.exact.length === 1) {
        return {
            status: 'resolved',
            entity,
            scope,
            node: graphResult.exact[0],
            note: `Resolved via graphify (exact match): ${graphResult.exact[0].id}`,
        };
    }
    if (graphResult.exact.length > 1) {
        // Multiple nodes share the same id/label — not confident, don't guess.
        return {
            status: 'ambiguous',
            entity,
            scope,
            candidates: graphResult.exact,
            note: `${graphResult.exact.length} graphify nodes share this exact name — which one? (${graphResult.exact.map((n) => n.source_file).join(', ')})`,
        };
    }
    // Step 2 — no exact graphify match. MemPalace episodic fallback.
    const memResult = (0, mempalace_1.searchMemPalace)(entity, { room: scope, results: 5 });
    if (memResult.available && memResult.hits.length > 0) {
        return {
            status: 'resolved-episodic',
            entity,
            scope,
            episodicHits: memResult.hits,
            note: `No graphify node — resolved from MemPalace episodic memory (not yet a formal node; candidate for promotion). ${memResult.hits.length} hit(s).`,
        };
    }
    // Step 3 — neither resolved. If graphify had fuzzy substring candidates, surface those as the
    // concrete thing to ask about; otherwise it's a flat "nothing found."
    if (graphResult.fuzzy.length > 0) {
        return {
            status: 'ambiguous',
            entity,
            scope,
            candidates: graphResult.fuzzy,
            note: memResult.available
                ? `No exact match, no MemPalace hits. ${graphResult.fuzzy.length} loose graphify candidate(s) — which one, if any?`
                : `No exact match. MemPalace fallback unavailable (${memResult.error}). ${graphResult.fuzzy.length} loose graphify candidate(s) — which one, if any?`,
        };
    }
    return {
        status: 'not-found',
        entity,
        scope,
        note: memResult.available
            ? 'No graphify node, no MemPalace hits, no fuzzy candidates — genuinely unresolved. Ask rather than guess.'
            : `No graphify node, no fuzzy candidates. MemPalace fallback unavailable (${memResult.error}) — cannot rule out an episodic-only match; treat as unresolved, ask rather than guess.`,
    };
}
//# sourceMappingURL=entity-resolution.js.map