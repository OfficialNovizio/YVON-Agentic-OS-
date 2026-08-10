"use strict";
// lib/cie/sources/mempalace.ts — MemPalace episodic-memory fallback (CLASSIFY Layer 1.1 step 2)
//
// Phase 1 (ADR-001, system-harness/adr/ADR-001-mempalace-episodic-backend.md): MemPalace runs as a CLI,
// installed per Claude Code session, NOT a resident service. This module is a subprocess bridge
// — same pattern as rag/core/bridge.py's VPS-venv bridging (Layer 1.5's "VPS venv / subprocess
// bridge" tool-location category) — except the binary is expected on THIS process's PATH, not a
// remote venv. That only holds where `mempalace` is actually installed and configured
// (MEMPALACE_BACKEND=pgvector, MEMPALACE_PGVECTOR_DSN set) — a Claude Code session today, not yet
// a deployed dashboard server. Phase 2 (vps-scripts/mempalace-serve-install.md) replaces this
// subprocess call with an HTTP MCP call once it exists; this module's public shape
// (searchMemPalace's return type) is deliberately Phase-2-compatible so that swap doesn't ripple
// into entity-resolution.ts's callers.
//
// UNVERIFIED — flagged per rule 0.6: `mempalace search` has no --json flag (confirmed via
// --help, 2026-08-09), so this parses human-formatted stdout. The exact live output shape could
// not be confirmed end-to-end in this session — the dev sandbox's egress allowlist blocks
// huggingface.co (needed for the first embedding-model download), so a real search never
// completed here. The parser below is a conservative best-effort (non-empty stdout lines minus
// known noise prefixes) — re-verify against real output the first time this runs somewhere with
// network access, and tighten the parser then. Until verified, treat hits as "something came
// back," not as structured, citation-grade data — GATE (rag/harness/gates.py) should still apply
// its normal reliability scoring to whatever this returns.
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchMemPalace = searchMemPalace;
exports.mineIntoMemPalace = mineIntoMemPalace;
const child_process_1 = require("child_process");
// Lines that are pure environment noise, never actual content or the real
// error reason — safe to drop from both parsed hits and error messages.
const ENV_NOISE_PREFIXES = ['onnxruntime', 'warning:'];
// Additionally dropped only from parsed *hits* (stdout) — these ARE the
// real content when parsing an *error* off stderr, so kept there.
const HIT_NOISE_PREFIXES = ['Search error', 'Mine aborted'];
function isEnvNoise(line) {
    const trimmed = line.trim();
    if (trimmed.length === 0)
        return true;
    return ENV_NOISE_PREFIXES.some((p) => trimmed.startsWith(p));
}
function looksLikeNoise(line) {
    return isEnvNoise(line) || HIT_NOISE_PREFIXES.some((p) => line.trim().startsWith(p));
}
/**
 * searchMemPalace — episodic fallback for entity resolution. Returns
 * available:false (never throws) if the `mempalace` binary isn't on PATH,
 * exits non-zero, or times out — callers should treat that as "fallback
 * unavailable," not a pipeline error. This is expected and normal outside a
 * Claude Code session in Phase 1.
 */
function searchMemPalace(query, opts = {}) {
    const args = ['search', query];
    if (opts.wing)
        args.push('--wing', opts.wing);
    if (opts.room)
        args.push('--room', opts.room);
    args.push('--results', String(opts.results ?? 5));
    let proc;
    try {
        proc = (0, child_process_1.spawnSync)('mempalace', args, {
            encoding: 'utf-8',
            timeout: opts.timeoutMs ?? 15000,
        });
    }
    catch (err) {
        return { available: false, hits: [], error: `spawn failed: ${err.message}` };
    }
    if (proc.error) {
        // ENOENT (binary not installed/on PATH) is the expected case outside Phase 1's
        // Claude-Code-session scope — not an error worth surfacing loudly.
        const code = proc.error.code;
        return {
            available: false,
            hits: [],
            error: code === 'ENOENT' ? 'mempalace not on PATH (expected outside a Phase 1 Claude Code session)' : proc.error.message,
        };
    }
    if (proc.signal === 'SIGTERM') {
        return { available: false, hits: [], error: `timed out after ${opts.timeoutMs ?? 15000}ms` };
    }
    if (proc.status !== 0) {
        // Verified 2026-08-09: mempalace prints its actual error text ("Search
        // error: ...") to STDOUT, not stderr — stderr carries only ONNX/env
        // warnings. Check both, stdout first, so the real reason surfaces.
        const stdoutLines = (proc.stdout || '').split('\n').filter((line) => !isEnvNoise(line));
        const stderrLines = (proc.stderr || '').split('\n').filter((line) => !isEnvNoise(line));
        const message = (stdoutLines.join(' ').trim() || stderrLines.join(' ').trim()).slice(0, 500);
        return { available: false, hits: [], error: message || `exit ${proc.status}` };
    }
    const hits = (proc.stdout ?? '')
        .split('\n')
        .filter((line) => !looksLikeNoise(line))
        .map((raw) => ({ raw: raw.trim() }));
    return { available: true, hits };
}
/**
 * mineIntoMemPalace — files a directory's contents into the palace. Used by session-memory.ts to
 * persist a Deep Exploration session as a MemPalace drawer (§14.2). Same fail-soft contract as
 * searchMemPalace: never throws, available:false when the binary/network isn't there.
 *
 * `--wing` is the only scoping flag `mempalace mine` actually has (confirmed via --help,
 * 2026-08-09) — there's no separate "drawer type" flag to mark this as a session vs. regular
 * episodic content. Using a dedicated wing name (see session-memory.ts's SESSION_WING) is the
 * closest real mechanism to the doc's "distinct drawer type" — an approximation, not a literal
 * match, and documented as such rather than silently assumed equivalent.
 */
function mineIntoMemPalace(dir, opts = {}) {
    const args = ['mine', dir];
    if (opts.wing)
        args.push('--wing', opts.wing);
    let proc;
    try {
        proc = (0, child_process_1.spawnSync)('mempalace', args, {
            encoding: 'utf-8',
            timeout: opts.timeoutMs ?? 30000,
        });
    }
    catch (err) {
        return { available: false, filed: false, error: `spawn failed: ${err.message}` };
    }
    if (proc.error) {
        const code = proc.error.code;
        return {
            available: false,
            filed: false,
            error: code === 'ENOENT' ? 'mempalace not on PATH (expected outside a Phase 1 Claude Code session)' : proc.error.message,
        };
    }
    if (proc.signal === 'SIGTERM') {
        return { available: false, filed: false, error: `timed out after ${opts.timeoutMs ?? 30000}ms` };
    }
    if (proc.status !== 0) {
        const stdoutLines = (proc.stdout || '').split('\n').filter((line) => !isEnvNoise(line));
        const stderrLines = (proc.stderr || '').split('\n').filter((line) => !isEnvNoise(line));
        const message = (stdoutLines.join(' ').trim() || stderrLines.join(' ').trim()).slice(0, 500);
        return { available: false, filed: false, error: message || `exit ${proc.status}` };
    }
    return { available: true, filed: true };
}
//# sourceMappingURL=mempalace.js.map