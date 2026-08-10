import { type GraphNode } from './sources/graphify';
import { type MemPalaceHit } from './sources/mempalace';
export type EntityResolutionStatus = 'resolved' | 'resolved-episodic' | 'ambiguous' | 'not-found';
export interface EntityResolutionResult {
    status: EntityResolutionStatus;
    entity: string;
    scope?: string;
    /** Populated when status === 'resolved' — exactly one confident graphify match. */
    node?: GraphNode;
    /** Populated when status === 'resolved-episodic' — MemPalace hits, not a formal graph node yet. */
    episodicHits?: MemPalaceHit[];
    /** Populated when status === 'ambiguous' — 2+ graphify homonyms OR unresolved fuzzy candidates. */
    candidates?: GraphNode[];
    /** Human-readable reason, always set — this is what CLASSIFY should show when asking for clarification. */
    note: string;
}
export declare function resolveEntity(entity: string, scope?: string): EntityResolutionResult;
//# sourceMappingURL=entity-resolution.d.ts.map