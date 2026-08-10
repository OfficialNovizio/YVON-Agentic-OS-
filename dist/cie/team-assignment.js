"use strict";
// lib/cie/team-assignment.ts — CLASSIFY Layer 1.3: "who works on this?"
//
// MASTER.md §6.3 Layer 1.3 pseudocode:
//   primary_agent = graphify.get_neighbors(entity, "belongs_to")
//   team = [primary_agent] + [owner of each node touched by 1.2's impact radius]
//
// That literal edge type doesn't exist (see sources/graphify.ts's module comment — graphify's
// edges are AST-only). The belongs_to mechanism was already resolved 2026-08-09 (Open Issues,
// Issue 3) to NOT be a graph edge at all:
//   - code entities -> folder-derived (Teams/<department>/<agent>/... path convention)
//   - business/content nodes -> auto-stamped at write time by the producing/last-touching agent
// The second half needs something to actually write that stamp (MASTER-PLAN.md P10, chat's
// write-path) — not built yet, verified zero live data for it today. This module implements the
// first half for real and is explicit, not silent, about the second half being unavailable.
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveOwnerFromPath = resolveOwnerFromPath;
exports.resolveTeam = resolveTeam;
const entity_resolution_1 = require("./entity-resolution");
const graphify_1 = require("./sources/graphify");
// Teams/<Department>/<agent-folder>/... — agent-folder IS the agent id by this repo's convention
// (e.g. Teams/AI & Agents/anneal/custom/... -> anneal). Verified against graph.json's real paths.
const TEAMS_PATH_RE = /^Teams\/([^/]+)\/([^/]+)\//;
function resolveOwnerFromPath(sourceFile) {
    if (!sourceFile)
        return null;
    const match = sourceFile.match(TEAMS_PATH_RE);
    if (!match)
        return null;
    const [, department, agentFolder] = match;
    return { agent: agentFolder.toLowerCase(), department };
}
function resolveTeam(entity, scope) {
    const resolution = (0, entity_resolution_1.resolveEntity)(entity, scope);
    if (resolution.status === 'resolved-episodic') {
        return {
            status: 'unresolved',
            entity,
            primaryOwner: null,
            team: [],
            note: 'Resolved only via MemPalace episodic memory — not a formal node, no folder to derive '
                + 'an owner from. The business/content belongs_to auto-stamp (MASTER-PLAN.md P10) isn\'t '
                + 'built yet, so there is no other source to check. Cannot assign a team — ask, don\'t guess.',
        };
    }
    if (resolution.status !== 'resolved' || !resolution.node) {
        return {
            status: 'unresolved',
            entity,
            primaryOwner: null,
            team: [],
            note: `Entity resolution status: ${resolution.status} — ${resolution.note}`,
        };
    }
    const node = resolution.node;
    const primaryOwner = resolveOwnerFromPath(node.source_file);
    if (!primaryOwner) {
        return {
            status: 'unresolved',
            entity,
            primaryOwner: null,
            team: [],
            note: `Node resolved (${node.id}, ${node.source_file}) but its path isn't under `
                + `Teams/<department>/<agent>/ — infra code (dashboard/, rag/, cli/, src/) isn't `
                + `agent-owned the same way and has no owner to derive here.`,
        };
    }
    const neighbors = (0, graphify_1.getImpactRadius)(node.id);
    const extraOwners = neighbors
        .map((n) => resolveOwnerFromPath(n.node.source_file))
        .filter((o) => o !== null);
    const seen = new Set([primaryOwner.agent]);
    const team = [primaryOwner];
    for (const owner of extraOwners) {
        if (!seen.has(owner.agent)) {
            seen.add(owner.agent);
            team.push(owner);
        }
    }
    return {
        status: 'resolved',
        entity,
        primaryOwner,
        team,
        note: `${team.length} agent(s): primary ${primaryOwner.agent} (${primaryOwner.department})`
            + (team.length > 1 ? ` + ${team.length - 1} from impact radius (${neighbors.length} neighbor edge(s) checked).` : ', no other agents touch this via impact radius.'),
    };
}
//# sourceMappingURL=team-assignment.js.map