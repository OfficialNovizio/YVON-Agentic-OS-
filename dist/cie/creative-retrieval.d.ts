import { type GraphNode, type GraphEdge } from './sources/graphify';
import { type MemPalaceSearchResult } from './sources/mempalace';
export interface CreativeRetrievalResult {
    looseGraphEdges: {
        node: GraphNode;
        edge: GraphEdge;
    }[];
    scoped: MemPalaceSearchResult;
    distant: MemPalaceSearchResult;
    kaiPerformance: null;
    kaiUnavailableReason: string;
}
/**
 * gatherCreativeContext — §13.1's four-source pull. entityId is the graphify node the loose-edge
 * walk starts from (e.g. the brand/campaign entity being worked on) — pass '' to skip it.
 */
export declare function gatherCreativeContext(query: string, opts?: {
    entityId?: string;
    wing?: string;
    room?: string;
    results?: number;
}): CreativeRetrievalResult;
//# sourceMappingURL=creative-retrieval.d.ts.map