"use strict";
// lib/cie/tool-context.ts — CLASSIFY Layer 4 / RETRIEVE: tool-augmented retrieval
//
// MASTER.md §6.3 Layer 4: "tool-augmented retrieval (live tool calls treated as freshly-generated
// context, subject to Gate 1 same as any other source)". Checked rag/harness/gates.py's
// gate_authenticate() directly (2026-08-09) rather than assume: Check 1 requires
// chunk['source_file'] to exist ON DISK, relative to project_root — a live tool-call result has
// no such file by definition, so "subject to Gate 1 same as any other source" only actually holds
// if the tool output is first MATERIALIZED to a real file. That's what this module does — it
// doesn't just shape tool output to look like a chunk, it writes it to disk so Gate 1's real
// existence check can genuinely pass, not just superficially match the field names. Check 2
// (hash) is optional in gate_authenticate (only runs if `_source_hash` is set) — left unset here,
// so it's skipped rather than faked.
Object.defineProperty(exports, "__esModule", { value: true });
exports.materializeToolContext = materializeToolContext;
const fs_1 = require("fs");
const path_1 = require("path");
const crypto_1 = require("crypto");
const config_1 = require("../adapters/config");
function toolCacheDir() {
    return (0, path_1.join)((0, config_1.getConfig)().projectRoot, 'store', 'tool-context-cache');
}
/**
 * materializeToolContext — writes a live tool call's output to disk under
 * store/tool-context-cache/ and returns a chunk-shaped object pointing at that real file, so it
 * can be passed into GATE the same way any retrieved chunk is (Gate 1's source_file existence
 * check will find a real file, not a synthetic path).
 */
function materializeToolContext(toolName, output, opts = {}) {
    const dir = toolCacheDir();
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    const calledAt = new Date().toISOString();
    const shortHash = (0, crypto_1.createHash)('sha256').update(`${toolName}:${output}:${calledAt}`).digest('hex').slice(0, 12);
    const safeName = toolName.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const filename = `${safeName}-${shortHash}.md`;
    const fullPath = (0, path_1.join)(dir, filename);
    (0, fs_1.writeFileSync)(fullPath, output, 'utf-8');
    const sourceFile = (0, path_1.relative)((0, config_1.getConfig)().projectRoot, fullPath);
    return {
        chunk_id: `tool-${safeName}-${shortHash}`,
        source_file: sourceFile,
        chunk_text: output,
        citation: opts.citation ?? `live tool call: ${toolName}, ${calledAt}`,
        department: opts.department,
        tool_name: toolName,
        called_at: calledAt,
    };
}
//# sourceMappingURL=tool-context.js.map