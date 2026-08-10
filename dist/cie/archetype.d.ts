export type Archetype = 'SHALLOW_LOOKUP' | 'PRECISION_CRITICAL' | 'DEEP_EXPLORATION' | 'SYNTHESIS_REPORTING' | 'CREATIVE_PRODUCTION' | 'CONTINUOUS_MONITORING' | 'ADVERSARIAL_TESTING';
export interface ArchetypeInfo {
    archetype: Archetype;
    retrievalShape: string;
    passes: string;
    timing: string;
}
export declare const ARCHETYPE_TABLE: Record<Archetype, Omit<ArchetypeInfo, 'archetype'>>;
export declare const DEPARTMENT_ARCHETYPES: Record<string, Archetype[]>;
export interface ClassifiedArchetype extends ArchetypeInfo {
    source: 'keyword' | 'department-default';
}
/**
 * classifyArchetype — picks ONE archetype per task. Keyword match first (per-task, per §14);
 * falls back to the department's first-listed default archetype if nothing matches. Department
 * must be a real department (see DEPARTMENT_ARCHETYPES) — unknown departments fall back to
 * PRECISION_CRITICAL, the safest default (full 5-gate harness, not a shortcut path).
 */
export declare function classifyArchetype(message: string, department: string): ClassifiedArchetype;
//# sourceMappingURL=archetype.d.ts.map