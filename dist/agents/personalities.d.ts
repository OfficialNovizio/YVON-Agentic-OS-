export interface AgentProfile {
    /** Short ID used in API routes (e.g. 'marcus', 'dev') */
    shortId: string;
    /** Full name */
    name: string;
    /** Which department */
    department: string;
    /** Role within the department */
    role: string;
    /** Leader status (playbook §6.1 — leader gets identity content) */
    isLeader: boolean;
    /** Path to identity document (empty string if non-leader) */
    identityPath: string;
    /** Path to operational principles file */
    principlesPath: string;
    /** Path to operational agent config */
    configPath: string;
    /** Shared OS/logical/ scripts this agent owns or inherits */
    logicalScripts: string[];
    /** The department leader for escalation context */
    departmentLeader: string;
}
export declare const AGENT_REGISTRY: AgentProfile[];
/** Lookup by short ID or full name */
export declare function getAgentProfile(id: string): AgentProfile | undefined;
/** Get all agents in a department */
export declare function getDepartmentAgents(department: string): AgentProfile[];
/** Get the department leader */
export declare function getDepartmentLeader(department: string): AgentProfile | undefined;
/** Get all department leaders */
export declare function getLeaders(): AgentProfile[];
/** List all departments */
export declare function getDepartments(): string[];
/**
 * Derive a system prompt extension from the department framework.
 * This REPLACES the old hardcoded personality strings.
 * At runtime, the engine reads identity/principles files and builds the prompt.
 */
export declare function getAgentContext(id: string): {
    profile: AgentProfile | undefined;
    department: string;
    leader: string;
    logicalScriptCount: number;
    /** Paths to read for prompt building */
    paths: {
        identity: string;
        principles: string;
        config: string;
    };
};
/** Count of registered agents */
export declare const AGENT_COUNT: number;
/** Count of departments */
export declare const DEPARTMENT_COUNT: number;
//# sourceMappingURL=personalities.d.ts.map