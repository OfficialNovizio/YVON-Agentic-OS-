interface CacheEntry {
    fingerprint: string;
    agentId: string;
    query: string;
    result: {
        injection_text: string;
        trace: Record<string, unknown>;
        profile?: string;
        chunks?: number;
        computed_formulas?: unknown[];
    };
    hits: number;
    lastAccess: number;
    createdAt: number;
    expiresAt: number;
}
export declare function getCached(fingerprintKey: string): CacheEntry | undefined;
export declare function setCached(query: string, agentId: string, result: CacheEntry['result'], ttlMs?: number): void;
export declare function cacheStats(): {
    size: number;
    totalHits: number;
    oldestEntry: number;
};
export declare function invalidateAgent(agentId: string): number;
export declare function invalidateAll(): void;
export {};
//# sourceMappingURL=cache.d.ts.map