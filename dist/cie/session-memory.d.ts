export declare const SESSION_WING = "session-memory";
export interface ExploreRound {
    round: number;
    query: string;
    candidates: string[];
    timestamp: string;
}
export interface ShortlistItem {
    candidate: string;
    score: number;
    reasoning: string;
}
export type SessionStatus = 'exploring' | 'converged';
export interface SessionState {
    sessionId: string;
    archetype: 'DEEP_EXPLORATION';
    topic: string;
    status: SessionStatus;
    createdAt: string;
    updatedAt: string;
    rounds: ExploreRound[];
    shortlist?: ShortlistItem[];
}
/** startSession — Layer 2's "spins up a SESSION" step. */
export declare function startSession(topic: string): SessionState;
/** loadSession — the resume path's data source. Returns null if the session doesn't exist. */
export declare function loadSession(sessionId: string): SessionState | null;
/**
 * addExploreRound — EXPLORE PHASE. One round = one retrieval pass generating N candidate
 * directions (not one answer, per §14.2). Caller decides when "diminishing returns or budget
 * hit" — this function just records what happened, it doesn't decide when to stop.
 */
export declare function addExploreRound(sessionId: string, query: string, candidates: string[]): SessionState | null;
/**
 * converge — CONVERGE PHASE. Caller supplies the already-clustered/scored shortlist (3-5 items
 * per §14.2) — this function doesn't do the clustering/scoring itself, that's a
 * retrieval/generation concern outside this module's scope (it's state management, not the
 * scoring algorithm).
 */
export declare function converge(sessionId: string, shortlist: ShortlistItem[]): SessionState | null;
export interface PersistResult {
    localSaved: true;
    memPalace: {
        available: boolean;
        filed: boolean;
        error?: string;
    };
}
/**
 * persistToMemPalace — best-effort filing into MemPalace as episodic memory (the doc's
 * "session-drawer"). Writes the session JSON to its own file (already done by save()) then mines
 * that single file via `mempalace mine`, scoped to SESSION_WING. Safe to call repeatedly —
 * mempalace mine is documented as idempotent per-file upsert.
 */
export declare function persistToMemPalace(sessionId: string): PersistResult | null;
/**
 * resumeSession — "go deeper on #2" per §14.2: load the persisted state so the caller has the
 * full round/candidate/shortlist history without re-deriving it. Local file is authoritative;
 * MemPalace is not re-queried here (that's entity-resolution.ts's job if the caller wants
 * cross-session recall too — this function only resumes the one named session).
 */
export declare function resumeSession(sessionId: string): SessionState | null;
/** listSessions — every session-memory JSON file on disk, most recent first. */
export declare function listSessions(): {
    sessionId: string;
    topic: string;
    status: SessionStatus;
    updatedAt: string;
}[];
//# sourceMappingURL=session-memory.d.ts.map