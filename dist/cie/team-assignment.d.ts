export interface OwnerInfo {
    agent: string;
    department: string;
}
export declare function resolveOwnerFromPath(sourceFile: string | undefined): OwnerInfo | null;
export type TeamAssignmentStatus = 'resolved' | 'unresolved';
export interface TeamAssignmentResult {
    status: TeamAssignmentStatus;
    entity: string;
    primaryOwner: OwnerInfo | null;
    /** Deduped, primary owner first, then owners of impact-radius neighbors. */
    team: OwnerInfo[];
    note: string;
}
export declare function resolveTeam(entity: string, scope?: string): TeamAssignmentResult;
//# sourceMappingURL=team-assignment.d.ts.map