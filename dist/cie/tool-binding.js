"use strict";
// lib/cie/tool-binding.ts — CLASSIFY Layer 1.4 (Tool Binding) + 1.5 (Tool Location Resolution)
//
// system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §15.2: tool access is two-tier (baseline per department, task-specific
// per phase/archetype), cross-referenced against Teams/Shared OS/tools/shared-tool-registry.md
// "rather than duplicated here" — so LOCATION resolution below parses that file directly instead
// of hardcoding a second copy that could drift from it. BASELINE/task-specific assignment is
// §15.2's own documented prose (the registry doesn't tag rows that way itself), kept as a
// explicit static table sourced from that section, not invented.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCRAPING_ESCALATION_CHAIN = void 0;
exports.invalidateToolRegistryCache = invalidateToolRegistryCache;
exports.resolveToolLocation = resolveToolLocation;
exports.resolveToolBinding = resolveToolBinding;
exports.checkRunningServices = checkRunningServices;
exports.resolveOnDemandService = resolveOnDemandService;
const fs_1 = require("fs");
const child_process_1 = require("child_process");
const path_1 = require("path");
const config_1 = require("../adapters/config");
const SECTION_LOCATION = [
    { match: /node_modules/i, location: 'repo-in-process' },
    { match: /agent skills/i, location: 'repo-in-process' },
    { match: /on-demand services/i, location: 'on-demand-service' },
    { match: /vps python/i, location: 'vps-venv' },
    { match: /mcp servers/i, location: 'mcp-relay' },
    { match: /dropped/i, location: 'dropped' },
];
function cleanToolName(cell) {
    return cell
        .replace(/\*\*/g, '')
        .replace(/`/g, '')
        .replace(/\s*\(.*?\)\s*$/, '') // trailing "(alias)" — kept separately below
        .trim();
}
function extractAlias(cell) {
    const m = cell.match(/\(([^)]+)\)\s*$/);
    return m ? m[1].trim() : null;
}
let cachedRegistry = null;
let cachedRegistryMtime = 0;
/**
 * Parses Teams/Shared OS/tools/shared-tool-registry.md's "## Registry — grouped by install home"
 * section into a flat list of {name, location} — live, not hardcoded, so it can't silently drift
 * from the actual registry the way a second hand-copied table would.
 */
function getRegistry() {
    const config = (0, config_1.getConfig)();
    const path = (0, path_1.join)(config.teamsPath, 'Shared OS', 'tools', 'shared-tool-registry.md');
    if (!(0, fs_1.existsSync)(path))
        return [];
    const mtime = (0, fs_1.statSync)(path).mtimeMs;
    if (cachedRegistry && cachedRegistryMtime === mtime)
        return cachedRegistry;
    const content = (0, fs_1.readFileSync)(path, 'utf-8');
    const lines = content.split('\n');
    const entries = [];
    let currentSection = '';
    let currentLocation = null;
    let insideRegistrySection = false;
    for (const line of lines) {
        // Top-level "## " headings mark entry into (and exit from) the "## Registry — grouped by
        // install home" section — everything outside it (Placement map, Overlap decisions, etc.) is
        // prose/other tables we must not misparse as tool rows.
        if (/^##\s+/.test(line) && !line.startsWith('###')) {
            insideRegistrySection = /^##\s+Registry/i.test(line);
            currentLocation = null;
            continue;
        }
        const heading = line.match(/^###\s+(.+)$/);
        if (heading) {
            currentSection = heading[1].trim();
            const found = insideRegistrySection ? SECTION_LOCATION.find((s) => s.match.test(currentSection)) : undefined;
            currentLocation = found?.location ?? null;
            continue;
        }
        if (!insideRegistrySection || !currentLocation)
            continue;
        if (!line.trim().startsWith('|'))
            continue;
        const cells = line.split('|').map((c) => c.trim()).filter((c) => c.length > 0);
        if (cells.length < 2)
            continue;
        // Skip header/separator rows.
        if (/^-+$/.test(cells[0].replace(/:/g, '')))
            continue;
        if (['tool', 'server'].includes(cells[0].toLowerCase()))
            continue;
        const name = cleanToolName(cells[0]);
        const alias = extractAlias(cells[0]);
        entries.push({ name, location: currentLocation, section: currentSection, raw: line.trim() });
        if (alias)
            entries.push({ name: alias, location: currentLocation, section: currentSection, raw: line.trim() });
    }
    cachedRegistry = entries;
    cachedRegistryMtime = mtime;
    return entries;
}
function invalidateToolRegistryCache() {
    cachedRegistry = null;
}
/**
 * resolveToolLocation — case-insensitive lookup against the live registry. Returns null if the
 * tool isn't registered at all (per the registry's own rule: "register here" before use — an
 * unregistered tool has no known location, and callers should treat that as "don't use it," not
 * guess a default).
 */
function resolveToolLocation(toolName) {
    const registry = getRegistry();
    const needle = toolName.toLowerCase();
    return registry.find((e) => e.name.toLowerCase() === needle) ?? null;
}
// ---------------------------------------------------------------------------
// 1.4 — Tool binding: baseline (always loaded per department) + task-specific
// (per archetype). Source: system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §15.2's prose, verified
// against the registry above — every name here is confirmed present in the
// live registry as of 2026-08-09.
// ---------------------------------------------------------------------------
const BASELINE_TOOLS = {
    'Engineering': ['ponytail', '@playwright/test', 'agentation'], // + sandbox (opensandbox, TIER-1 quarantine mandatory)
    'Brand Studio': ['impeccable', 'taste-skill', 'getdesign'],
};
// Archetype -> task-specific tools. Only archetypes §15.2 actually names get an entry; others
// correctly resolve to an empty task-specific list (baseline only) rather than a guessed one.
const ARCHETYPE_TOOLS = {
    ADVERSARIAL_TESTING: ['strix'],
};
// The scraping/research escalation chain §15.2 documents — not archetype-keyed (cuts across
// several archetypes), exposed separately so callers can pull it in when a task is research-shaped.
exports.SCRAPING_ESCALATION_CHAIN = ['crawl4ai', 'scrapegraphai', 'agent-reach', 'browser-use'];
function withLocation(tools) {
    return tools.map((tool) => {
        const entry = resolveToolLocation(tool);
        return { tool, location: entry?.location ?? 'unregistered' };
    });
}
function resolveToolBinding(department, archetype) {
    const baseline = withLocation(BASELINE_TOOLS[department] ?? []);
    const taskSpecific = withLocation(archetype ? (ARCHETYPE_TOOLS[archetype] ?? []) : []);
    return { department, archetype, baseline, taskSpecific };
}
/**
 * checkRunningServices — shells out to `cli/tool.sh status` (lists all running yvon- Docker
 * containers; no per-tool filter exists in the script itself, verified in cli/tool.sh). Fails
 * soft: this sandbox has no Docker daemon, so `checked: false` is the expected result here —
 * callers should treat that as "couldn't verify, don't assume either way," not as "nothing running."
 */
function checkRunningServices() {
    let proc;
    try {
        proc = (0, child_process_1.spawnSync)('bash', ['cli/tool.sh', 'status'], {
            cwd: (0, config_1.getConfig)().projectRoot,
            encoding: 'utf-8',
            timeout: 10000,
        });
    }
    catch (err) {
        return { checked: false, running: [], error: err.message };
    }
    if (proc.error || proc.status !== 0) {
        const reason = proc.error?.message ?? (proc.stderr || '').trim().slice(0, 300) ?? `exit ${proc.status}`;
        return { checked: false, running: [], error: reason };
    }
    const running = (proc.stdout ?? '')
        .split('\n')
        .slice(1) // header row from `docker ps --format table`
        .map((line) => line.split(/\s+/)[0])
        .filter((name) => name && name.startsWith('yvon-'));
    return { checked: true, running };
}
/**
 * resolveOnDemandService — is a given on-demand-service tool already up? FIFO queueing means: if
 * it's not running and something else heavy is, the caller waits — this function only answers
 * "is it up," the actual queueing/waiting is a runtime concern for whatever invokes the tool, not
 * this resolution step.
 */
function resolveOnDemandService(toolName) {
    const entry = resolveToolLocation(toolName);
    if (!entry || entry.location !== 'on-demand-service') {
        return { registered: false, running: null, note: `${toolName} is not a registered on-demand-service tool.` };
    }
    const status = checkRunningServices();
    if (!status.checked) {
        return { registered: true, running: null, note: `Registered, but status couldn't be checked here: ${status.error}` };
    }
    const running = status.running.some((name) => name.toLowerCase().includes(toolName.toLowerCase()));
    return { registered: true, running, note: running ? 'Already running.' : 'Not running — FIFO queue applies if another heavy service is up (12GB VPS).' };
}
//# sourceMappingURL=tool-binding.js.map