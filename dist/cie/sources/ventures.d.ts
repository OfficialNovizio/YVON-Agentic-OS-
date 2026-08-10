export interface VentureRow {
    id: string;
    name: string;
    slug: string;
    kind: 'core' | 'venture' | 'client';
    repoUrl: string | null;
    localRepoPath: string | null;
    status: string;
}
/**
 * listVentures — all ventures, service-role read. Fails soft (empty array) if Supabase env vars
 * aren't set or the request fails — same posture as every other optional source in src/cie
 * (mempalace.ts's searchMemPalace, etc.): a missing venture registry should degrade the caller,
 * not throw.
 */
export declare function listVentures(opts?: {
    skipCache?: boolean;
}): Promise<VentureRow[]>;
export declare function invalidateVenturesCache(): void;
//# sourceMappingURL=ventures.d.ts.map