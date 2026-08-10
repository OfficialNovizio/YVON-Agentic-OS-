import type { Archetype } from './archetype';
export type ToolLocation = 'repo-in-process' | 'vps-venv' | 'on-demand-service' | 'mcp-relay' | 'dropped';
interface RegistryEntry {
    name: string;
    location: ToolLocation;
    section: string;
    raw: string;
}
export declare function invalidateToolRegistryCache(): void;
/**
 * resolveToolLocation — case-insensitive lookup against the live registry. Returns null if the
 * tool isn't registered at all (per the registry's own rule: "register here" before use — an
 * unregistered tool has no known location, and callers should treat that as "don't use it," not
 * guess a default).
 */
export declare function resolveToolLocation(toolName: string): RegistryEntry | null;
export declare const SCRAPING_ESCALATION_CHAIN: string[];
export interface ToolBindingResult {
    department: string;
    archetype?: Archetype;
    baseline: {
        tool: string;
        location: ToolLocation | 'unregistered';
    }[];
    taskSpecific: {
        tool: string;
        location: ToolLocation | 'unregistered';
    }[];
}
export declare function resolveToolBinding(department: string, archetype?: Archetype): ToolBindingResult;
export interface ServiceStatusResult {
    checked: boolean;
    running: string[];
    error?: string;
}
/**
 * checkRunningServices — shells out to `cli/tool.sh status` (lists all running yvon- Docker
 * containers; no per-tool filter exists in the script itself, verified in cli/tool.sh). Fails
 * soft: this sandbox has no Docker daemon, so `checked: false` is the expected result here —
 * callers should treat that as "couldn't verify, don't assume either way," not as "nothing running."
 */
export declare function checkRunningServices(): ServiceStatusResult;
/**
 * resolveOnDemandService — is a given on-demand-service tool already up? FIFO queueing means: if
 * it's not running and something else heavy is, the caller waits — this function only answers
 * "is it up," the actual queueing/waiting is a runtime concern for whatever invokes the tool, not
 * this resolution step.
 */
export declare function resolveOnDemandService(toolName: string): {
    registered: boolean;
    running: boolean | null;
    note: string;
};
export {};
//# sourceMappingURL=tool-binding.d.ts.map