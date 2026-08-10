import { type MemPalaceSearchResult } from './sources/mempalace';
export interface BridgeHit {
    sourceVentureSlug: string;
    sourceVentureName: string;
    result: MemPalaceSearchResult;
}
export interface CrossScopeBridgeResult {
    eligible: boolean;
    reason: string;
    hits: BridgeHit[];
}
/**
 * bridgeCrossScopeQuery — §8.3's mechanism. Given the venture slug the session is scoped to and
 * a query, searches every OTHER owned-sibling venture's MemPalace wing and returns results
 * explicitly attributed to their source venture — callers must not merge these into the
 * requesting brand's own results without that attribution, per the doc's isolation requirement.
 */
export declare function bridgeCrossScopeQuery(sourceSlug: string, query: string, opts?: {
    skipCache?: boolean;
    results?: number;
}): Promise<CrossScopeBridgeResult>;
//# sourceMappingURL=cross-scope-bridge.d.ts.map