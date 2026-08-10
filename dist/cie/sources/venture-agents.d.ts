export interface StructureAgent {
    id: string;
    name: string;
}
/**
 * getRealAgentRoster — reads the live, regenerated structure.json rather than hardcoding a count
 * or list anywhere. This IS the "auto-update as agents are added" mechanism: there's no stored
 * agent list in this module to go stale.
 */
export declare function getRealAgentRoster(): StructureAgent[];
export interface VentureAgentRow {
    ventureSlug: string;
    agentId: string;
    enabled: boolean;
}
export interface SyncResult {
    ventureSlug: string;
    totalRealAgents: number;
    alreadyGranted: number;
    newlyGranted: string[];
    error?: string;
}
/**
 * syncVentureAgents — for every kind='core' venture, grant any real agent (from the live
 * structure.json roster) that doesn't already have a venture_agents row. Never revokes — an
 * agent removed from Teams/ still has its historical grant row; that's a separate, deliberate
 * decision this function doesn't make. Safe to re-run anytime (idempotent — only inserts missing
 * rows, `resolution=ignore-duplicates` on the primary key handles races).
 */
export declare function syncVentureAgents(): Promise<SyncResult[]>;
//# sourceMappingURL=venture-agents.d.ts.map