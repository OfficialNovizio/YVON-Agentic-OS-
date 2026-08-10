export interface GraphifyCommunity {
    name: string;
    cohesion: number;
    nodes: string[];
}
export declare function getGraphifyReport(): {
    communities: GraphifyCommunity[];
};
export declare function queryGraphify(keywords: string[]): string;
export declare function invalidateGraphifyCache(): void;
export interface GraphNode {
    id: string;
    label: string;
    file_type?: string;
    source_file?: string;
    source_location?: string;
    community?: number;
    community_name?: string;
    metadata?: Record<string, unknown>;
}
export interface GraphEdge {
    source: string;
    target: string;
    relation: string;
    confidence?: string;
    confidence_score?: number;
    weight?: number;
    source_file?: string;
    source_location?: string;
}
export interface QueryGraphResult {
    /** Exact id or exact (case-insensitive) label matches — "confident unique" per §8.1 if length===1. */
    exact: GraphNode[];
    /** Label-substring matches, only populated when exact is empty — fuzzy, never "confident." */
    fuzzy: GraphNode[];
}
/**
 * queryGraph — canonical/deterministic entity lookup, Layer 1.1 step 1.
 * Exact id/label matches and substring matches are returned separately so
 * callers can implement §8.1's actual rule ("confident unique match →
 * resolved") without re-deriving exactness themselves: exact.length === 1
 * is the only case that's confident; anything else (0 exact, or >1 exact
 * homonyms) falls through to the caller's next step.
 */
export declare function queryGraph(entity: string, scope?: string): QueryGraphResult;
/**
 * getNeighbors — Layer 1.2/1.3's underlying primitive. edgeTypes filters by
 * the `relation` field; omit to get all real edge types. direction controls
 * whether we walk outgoing edges (this node → others), incoming (others →
 * this node), or both. hops=2 only for explicitly requested high-fanout
 * cases per §8.2 — default is 1-hop. confidence filters by the `confidence`
 * field (real live values, verified 2026-08-09: 'EXTRACTED' | 'INFERRED' —
 * omit for both).
 */
export declare function getNeighbors(entityId: string, edgeTypes?: string[], opts?: {
    direction?: 'out' | 'in' | 'both';
    hops?: 1 | 2;
    confidence?: string[];
}): {
    node: GraphNode;
    edge: GraphEdge;
}[];
/**
 * getLooseNeighbors — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §13.1's "graphify: include
 * AMBIGUOUS-confidence edges (normally excluded from precision retrieval)".
 * VERIFIED CORRECTION (2026-08-09): there is no 'AMBIGUOUS' confidence value
 * anywhere in the live graph.json — real values are only 'EXTRACTED'
 * (15436 edges) and 'INFERRED' (421 edges). 'INFERRED' is the closest real
 * equivalent (lower-certainty than a directly-parsed AST edge) and is what
 * this function returns. Also worth noting: getImpactRadius() (§8.2,
 * precision retrieval) does NOT currently filter by confidence at all — it
 * includes both EXTRACTED and INFERRED edges today. So this function's real
 * contribution isn't "the complement of a precision filter that already
 * excludes these" (no such filter exists yet) — it's "explicitly surface
 * the lower-confidence edges creative work wants," which precision callers
 * simply don't ask for.
 */
export declare function getLooseNeighbors(entityId: string, opts?: {
    direction?: 'out' | 'in' | 'both';
    hops?: 1 | 2;
}): {
    node: GraphNode;
    edge: GraphEdge;
}[];
export declare function getImpactRadius(entityId: string, opts?: {
    hops?: 1 | 2;
}): {
    node: GraphNode;
    edge: GraphEdge;
}[];
//# sourceMappingURL=graphify.d.ts.map