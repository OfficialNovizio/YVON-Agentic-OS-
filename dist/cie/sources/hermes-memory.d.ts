import type { TaskType } from '../types';
export declare function getHermesUserContext(): string;
/**
 * Split a MEMORY.md-shaped string into {section_name_lower: [bullet lines]}.
 * Only lines starting with '-' inside a section are kept as entries — this
 * matches Python's read_memory(), which ignores blank lines and prose.
 */
export declare function parseMemorySections(md: string): Map<string, string[]>;
/** Serialize {section_name: [bullets]} back to `## Section\n- bullet\n...` text. Fleet first, then alphabetical — a fixed order keeps merge output deterministic regardless of argument order. */
export declare function serializeMemorySections(sections: Map<string, string[]>): string;
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
export declare function mergeMemorySections(a: string, b: string): string;
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
export declare function getHermesMemoryContext(agentId: string, keywords: string[], maxLines?: number): string;
export declare function getHermesStandards(): string[];
export declare function getHermesContextForTask(taskType: TaskType, agentId?: string): string;
//# sourceMappingURL=hermes-memory.d.ts.map