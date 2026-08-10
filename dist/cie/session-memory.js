"use strict";
// lib/cie/session-memory.ts — CLASSIFY Layer 2 / system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §14.2: Session Memory
// (Deep Exploration only)
//
// §14.2's flow:
//   CLASSIFY detects archetype = DEEP EXPLORATION -> spins up a SESSION (not just working memory)
//   EXPLORE PHASE (multiple retrieval rounds, generate N candidates, repeat until diminishing
//     returns or budget hit)
//   CONVERGE PHASE (cluster/dedupe -> score -> shortlist 3-5, not 1)
//   OUTPUT: options + reasoning, not a single answer
//   Session state persisted as a MemPalace session-drawer, so "go deeper on #2" resumes with
//     that branch's context already loaded, no cold restart
//
// Local persistence (store/sessions/<id>.json) is the real, fully-tested source of truth here —
// it's what resumeSession() actually reads. persistToMemPalace() additionally files the same
// state into MemPalace via `mempalace mine` (sources/mempalace.ts) so it becomes searchable
// episodic memory too, per the doc — but per that module's own flags, MemPalace has no literal
// "session-drawer" type, only a `--wing` scope, used here as the closest real approximation
// (SESSION_WING). Treat persistToMemPalace as best-effort filing, not the source of truth: if it
// fails (no `mempalace` on PATH, network-blocked, etc.) the local JSON file is still there and
// resumeSession() still works — same fail-soft posture as every other MemPalace touchpoint this
// session (entity-resolution.ts, team-assignment.ts's episodic branch).
Object.defineProperty(exports, "__esModule", { value: true });
exports.SESSION_WING = void 0;
exports.startSession = startSession;
exports.loadSession = loadSession;
exports.addExploreRound = addExploreRound;
exports.converge = converge;
exports.persistToMemPalace = persistToMemPalace;
exports.resumeSession = resumeSession;
exports.listSessions = listSessions;
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("../adapters/config");
const mempalace_1 = require("./sources/mempalace");
exports.SESSION_WING = 'session-memory';
function sessionPath(sessionId) {
    return (0, path_1.join)((0, config_1.getConfig)().sessionMemoryDir, `${sessionId}.json`);
}
function ensureDir() {
    const dir = (0, config_1.getConfig)().sessionMemoryDir;
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
}
function save(state) {
    ensureDir();
    state.updatedAt = new Date().toISOString();
    (0, fs_1.writeFileSync)(sessionPath(state.sessionId), JSON.stringify(state, null, 2), 'utf-8');
    return state;
}
function newSessionId(topic) {
    const slug = topic.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `${stamp}-${slug || 'session'}`;
}
/** startSession — Layer 2's "spins up a SESSION" step. */
function startSession(topic) {
    const state = {
        sessionId: newSessionId(topic),
        archetype: 'DEEP_EXPLORATION',
        topic,
        status: 'exploring',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        rounds: [],
    };
    return save(state);
}
/** loadSession — the resume path's data source. Returns null if the session doesn't exist. */
function loadSession(sessionId) {
    const path = sessionPath(sessionId);
    if (!(0, fs_1.existsSync)(path))
        return null;
    try {
        return JSON.parse((0, fs_1.readFileSync)(path, 'utf-8'));
    }
    catch {
        return null;
    }
}
/**
 * addExploreRound — EXPLORE PHASE. One round = one retrieval pass generating N candidate
 * directions (not one answer, per §14.2). Caller decides when "diminishing returns or budget
 * hit" — this function just records what happened, it doesn't decide when to stop.
 */
function addExploreRound(sessionId, query, candidates) {
    const state = loadSession(sessionId);
    if (!state)
        return null;
    if (state.status !== 'exploring') {
        throw new Error(`Session ${sessionId} is already ${state.status} — cannot add explore rounds after convergence.`);
    }
    state.rounds.push({
        round: state.rounds.length + 1,
        query,
        candidates,
        timestamp: new Date().toISOString(),
    });
    return save(state);
}
/**
 * converge — CONVERGE PHASE. Caller supplies the already-clustered/scored shortlist (3-5 items
 * per §14.2) — this function doesn't do the clustering/scoring itself, that's a
 * retrieval/generation concern outside this module's scope (it's state management, not the
 * scoring algorithm).
 */
function converge(sessionId, shortlist) {
    const state = loadSession(sessionId);
    if (!state)
        return null;
    if (shortlist.length === 0) {
        throw new Error('Cannot converge with an empty shortlist — §14.2 requires 3-5 options, not zero.');
    }
    state.status = 'converged';
    state.shortlist = shortlist;
    return save(state);
}
/**
 * persistToMemPalace — best-effort filing into MemPalace as episodic memory (the doc's
 * "session-drawer"). Writes the session JSON to its own file (already done by save()) then mines
 * that single file via `mempalace mine`, scoped to SESSION_WING. Safe to call repeatedly —
 * mempalace mine is documented as idempotent per-file upsert.
 */
function persistToMemPalace(sessionId) {
    const state = loadSession(sessionId);
    if (!state)
        return null;
    const result = (0, mempalace_1.mineIntoMemPalace)(sessionPath(sessionId), { wing: exports.SESSION_WING });
    return { localSaved: true, memPalace: result };
}
/**
 * resumeSession — "go deeper on #2" per §14.2: load the persisted state so the caller has the
 * full round/candidate/shortlist history without re-deriving it. Local file is authoritative;
 * MemPalace is not re-queried here (that's entity-resolution.ts's job if the caller wants
 * cross-session recall too — this function only resumes the one named session).
 */
function resumeSession(sessionId) {
    return loadSession(sessionId);
}
/** listSessions — every session-memory JSON file on disk, most recent first. */
function listSessions() {
    const dir = (0, config_1.getConfig)().sessionMemoryDir;
    if (!(0, fs_1.existsSync)(dir))
        return [];
    const files = (0, fs_1.readdirSync)(dir).filter((f) => f.endsWith('.json'));
    const summaries = files
        .map((f) => loadSession(f.replace(/\.json$/, '')))
        .filter((s) => s !== null)
        .map((s) => ({ sessionId: s.sessionId, topic: s.topic, status: s.status, updatedAt: s.updatedAt }));
    return summaries.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}
//# sourceMappingURL=session-memory.js.map