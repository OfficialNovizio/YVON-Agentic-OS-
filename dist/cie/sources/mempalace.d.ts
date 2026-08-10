export interface MemPalaceHit {
    raw: string;
}
export interface MemPalaceSearchResult {
    available: boolean;
    hits: MemPalaceHit[];
    error?: string;
}
/**
 * searchMemPalace — episodic fallback for entity resolution. Returns
 * available:false (never throws) if the `mempalace` binary isn't on PATH,
 * exits non-zero, or times out — callers should treat that as "fallback
 * unavailable," not a pipeline error. This is expected and normal outside a
 * Claude Code session in Phase 1.
 */
export declare function searchMemPalace(query: string, opts?: {
    wing?: string;
    room?: string;
    results?: number;
    timeoutMs?: number;
}): MemPalaceSearchResult;
export interface MemPalaceMineResult {
    available: boolean;
    filed: boolean;
    error?: string;
}
/**
 * mineIntoMemPalace — files a directory's contents into the palace. Used by session-memory.ts to
 * persist a Deep Exploration session as a MemPalace drawer (§14.2). Same fail-soft contract as
 * searchMemPalace: never throws, available:false when the binary/network isn't there.
 *
 * `--wing` is the only scoping flag `mempalace mine` actually has (confirmed via --help,
 * 2026-08-09) — there's no separate "drawer type" flag to mark this as a session vs. regular
 * episodic content. Using a dedicated wing name (see session-memory.ts's SESSION_WING) is the
 * closest real mechanism to the doc's "distinct drawer type" — an approximation, not a literal
 * match, and documented as such rather than silently assumed equivalent.
 */
export declare function mineIntoMemPalace(dir: string, opts?: {
    wing?: string;
    timeoutMs?: number;
}): MemPalaceMineResult;
//# sourceMappingURL=mempalace.d.ts.map