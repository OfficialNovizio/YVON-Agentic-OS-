export interface HermesSyncContext {
    /** Raw content of USER.md (user identity, preferences, bio) */
    userProfile: string;
    /** Raw content of MEMORY.md (persistent agent memory) */
    agentMemory: string;
    /** Whether the sync was successful */
    success: boolean;
    /** Paths read */
    filesRead: string[];
    /** Any errors encountered */
    errors: string[];
    /** Combined token-efficient context string for injection */
    contextString: string;
}
export interface HermesPushResult {
    success: boolean;
    memoriesWritten: number;
    bytesWritten: number;
    errors: string[];
}
/**
 * Synchronize context from Hermes memory files.
 *
 * Reads USER.md (user identity/preferences) and MEMORY.md (persistent
 * agent memory) from ~/.hermes/memories/. Returns a structured context
 * object suitable for injecting into agent system prompts.
 *
 * The `contextString` field is pre-formatted for LLM injection with
 * minimal token overhead.
 */
export declare function syncWithHermes(): HermesSyncContext;
/**
 * Push memories back to the Hermes memory system, under an agent's section.
 *
 * Each string in `memories` becomes a `- [date#tag] text` bullet inserted
 * right after `## <agentId>` (created if missing, matched case-insensitively
 * — mirrors rag/core/hermes_memory.py's push_lesson() exactly so both
 * pipelines write the same shape). Defaults to the `## Fleet` section when
 * no agentId is given, same default as the Python side.
 *
 * Creates the hermes memory directory if it doesn't exist.
 * Returns a result with count of memories written and total bytes.
 */
export declare function pushToHermes(memories: string[], agentId?: string): HermesPushResult;
/**
 * Reconcile the local MEMORY.md against a second copy (e.g. one synced in
 * from another device or the Hermes agent's own store) using the G-Set CRDT
 * merge in hermes-memory.ts: union bullets per section, dedup exact matches,
 * write the merged result back. Conflict-free by construction — safe to
 * call with the same `otherMemoryMd` twice (idempotent) or in either order
 * relative to another reconcile call (commutative).
 */
export declare function reconcileWithHermes(otherMemoryMd: string): {
    success: boolean;
    bytesWritten: number;
    error: string | null;
};
/**
 * Clear all Hermes memory (resets MEMORY.md).
 * USE WITH CAUTION — this is irreversible.
 */
export declare function clearHermesMemory(): {
    success: boolean;
    error: string | null;
};
//# sourceMappingURL=hermes-sync.d.ts.map