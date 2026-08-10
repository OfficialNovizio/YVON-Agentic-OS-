"use strict";
// src/adapters/hermes-sync.ts — Hermes memory sync module
//
// Reads/writes ~/.hermes/memories/ files for bidirectional
// context synchronization between YVON Engine and Hermes Agent.
//
//   syncWithHermes()     → read USER.md + MEMORY.md, return synced context
//   pushToHermes(...)    → write memories back to Hermes, under an agent's section
//   reconcileWithHermes()→ CRDT-merge this file against a second copy (multi-source sync)
//
// Fixed 2026-08-10: pushToHermes() used to append flat `[timestamp#i] text`
// lines with no `## Section` header at all — incompatible with the real
// MEMORY.md format (`## Section` + `- [date#tag] entry` bullets) that
// rag/core/hermes_memory.py actually reads/writes and that store/hermes/
// MEMORY.md is genuinely populated with. Rewritten to match exactly, plus a
// real CRDT merge path (reconcileWithHermes) for when two copies diverge.
//
// Dependencies: Node.js fs module only.
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncWithHermes = syncWithHermes;
exports.pushToHermes = pushToHermes;
exports.reconcileWithHermes = reconcileWithHermes;
exports.clearHermesMemory = clearHermesMemory;
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("./config");
const hermes_memory_1 = require("../cie/sources/hermes-memory");
// ─── Path resolution ──────────────────────────────────────────────────────────
function getHermesPaths() {
    const dir = (0, config_1.getConfig)().hermesMemoryDir;
    return {
        dir,
        userFile: (0, path_1.join)(dir, 'USER.md'),
        memoryFile: (0, path_1.join)(dir, 'MEMORY.md'),
    };
}
// ─── Helpers ──────────────────────────────────────────────────────────────────
function safeRead(path) {
    try {
        if (!(0, fs_1.existsSync)(path)) {
            return { content: '', error: `File not found: ${path}` };
        }
        const content = (0, fs_1.readFileSync)(path, 'utf-8');
        return { content, error: null };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { content: '', error: `Read error: ${msg}` };
    }
}
function ensureDir(path) {
    if (!(0, fs_1.existsSync)(path)) {
        (0, fs_1.mkdirSync)(path, { recursive: true });
    }
}
// ─── Public API ───────────────────────────────────────────────────────────────
/**
 * Synchronize context from Hermes memory files.
 *
 * Reads USER.md (user identity/preferences) and MEMORY.md (persistent
 * agent memory) from ~/.hermes/memories/. Returns a structured context
 * object suitable for injecting into agent system prompts.
 *
 * The `contextString` field is pre-formatted for LLM injection with
 * minimal token overhead.
 */
function syncWithHermes() {
    const errors = [];
    const filesRead = [];
    const { userFile, memoryFile } = getHermesPaths();
    const userResult = safeRead(userFile);
    if (userResult.error) {
        errors.push(`USER.md: ${userResult.error}`);
    }
    else if (userResult.content) {
        filesRead.push(userFile);
    }
    const memoryResult = safeRead(memoryFile);
    if (memoryResult.error) {
        errors.push(`MEMORY.md: ${memoryResult.error}`);
    }
    else if (memoryResult.content) {
        filesRead.push(memoryFile);
    }
    const userProfile = userResult.content;
    const agentMemory = memoryResult.content;
    const success = errors.length === 0 || filesRead.length > 0;
    // Build a compact context string for LLM injection
    const contextParts = [];
    if (userProfile) {
        const truncated = userProfile.length > 2000
            ? userProfile.slice(0, 2000) + '\n... (truncated)'
            : userProfile;
        contextParts.push(`--- USER PROFILE ---\n${truncated}`);
    }
    if (agentMemory) {
        const truncated = agentMemory.length > 3000
            ? agentMemory.slice(0, 3000) + '\n... (truncated)'
            : agentMemory;
        contextParts.push(`--- AGENT MEMORY ---\n${truncated}`);
    }
    return {
        userProfile,
        agentMemory,
        success,
        filesRead,
        errors,
        contextString: contextParts.join('\n\n'),
    };
}
/**
 * Push memories back to the Hermes memory system, under an agent's section.
 *
 * Each string in `memories` becomes a `- [date#tag] text` bullet inserted
 * right after `## <agentId>` (created if missing, matched case-insensitively
 * — mirrors rag/core/hermes_memory.py's push_lesson() exactly so both
 * pipelines write the same shape). Defaults to the `## Fleet` section when
 * no agentId is given, same default as the Python side.
 *
 * Creates the hermes memory directory if it doesn't exist.
 * Returns a result with count of memories written and total bytes.
 */
function pushToHermes(memories, agentId = 'Fleet') {
    const errors = [];
    const { dir, memoryFile, userFile } = getHermesPaths();
    // Ensure the memories directory exists
    try {
        ensureDir(dir);
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            memoriesWritten: 0,
            bytesWritten: 0,
            errors: [`Failed to create directory: ${msg}`],
        };
    }
    const section = (agentId || 'Fleet').trim();
    const header = `## ${section}`;
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD, matches Python's push_lesson
    const entries = memories.map(m => `- [${today}#loop] ${m.trim()}`);
    const bytes = Buffer.byteLength(entries.join('\n'), 'utf-8');
    try {
        let existing = (0, fs_1.existsSync)(memoryFile)
            ? (0, fs_1.readFileSync)(memoryFile, 'utf-8')
            : '# Hermes Agent Memory\n\nPersistent memories synced from YVON Engine.\n';
        const lines = existing.split('\n');
        const idx = lines.findIndex(l => l.trim().toLowerCase() === header.toLowerCase());
        if (idx === -1) {
            // Section doesn't exist — append a new one at the end.
            existing = existing.replace(/\s*$/, '') + `\n\n${header}\n${entries.join('\n')}\n`;
        }
        else {
            // Insert right after the header line, same as Python.
            lines.splice(idx + 1, 0, ...entries);
            existing = lines.join('\n') + (existing.endsWith('\n') ? '' : '\n');
        }
        (0, fs_1.writeFileSync)(memoryFile, existing, 'utf-8');
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return {
            success: false,
            memoriesWritten: 0,
            bytesWritten: 0,
            errors: [`Write error: ${msg}`],
        };
    }
    // Also touch USER.md if it doesn't exist (template)
    if (!(0, fs_1.existsSync)(userFile)) {
        try {
            (0, fs_1.writeFileSync)(userFile, '# User Profile\n\nNo profile configured yet.\n', 'utf-8');
        }
        catch {
            // Non-critical; USER.md template creation can fail silently
        }
    }
    return {
        success: true,
        memoriesWritten: memories.length,
        bytesWritten: bytes,
        errors,
    };
}
/**
 * Reconcile the local MEMORY.md against a second copy (e.g. one synced in
 * from another device or the Hermes agent's own store) using the G-Set CRDT
 * merge in hermes-memory.ts: union bullets per section, dedup exact matches,
 * write the merged result back. Conflict-free by construction — safe to
 * call with the same `otherMemoryMd` twice (idempotent) or in either order
 * relative to another reconcile call (commutative).
 */
function reconcileWithHermes(otherMemoryMd) {
    const { dir, memoryFile } = getHermesPaths();
    try {
        ensureDir(dir);
        const existing = (0, fs_1.existsSync)(memoryFile)
            ? (0, fs_1.readFileSync)(memoryFile, 'utf-8')
            : '# Hermes Agent Memory\n\nPersistent memories synced from YVON Engine.\n';
        const preamble = existing.includes('##') ? existing.slice(0, existing.indexOf('##')) : existing;
        const merged = preamble + (0, hermes_memory_1.mergeMemorySections)(existing, otherMemoryMd) + '\n';
        (0, fs_1.writeFileSync)(memoryFile, merged, 'utf-8');
        return { success: true, bytesWritten: Buffer.byteLength(merged, 'utf-8'), error: null };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, bytesWritten: 0, error: msg };
    }
}
/**
 * Clear all Hermes memory (resets MEMORY.md).
 * USE WITH CAUTION — this is irreversible.
 */
function clearHermesMemory() {
    try {
        const { dir, memoryFile } = getHermesPaths();
        ensureDir(dir);
        (0, fs_1.writeFileSync)(memoryFile, '# Hermes Agent Memory\n\nCleared and reset.\n', 'utf-8');
        return { success: true, error: null };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { success: false, error: msg };
    }
}
//# sourceMappingURL=hermes-sync.js.map