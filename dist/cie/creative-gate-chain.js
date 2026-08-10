"use strict";
// lib/cie/creative-gate-chain.ts — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §13.2: Creative Gate Chain
//
// "Runs alongside, not instead of, the standard harness." Five checks, C1-C5. Verified against
// real code/config/CLI (2026-08-09) rather than assumed; each function documents what's real vs.
// approximated vs. genuinely unavailable, same posture as every other module built this session.
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkBrandVoiceConformance = checkBrandVoiceConformance;
exports.checkNoveltyRepetition = checkNoveltyRepetition;
exports.checkPremortemRisk = checkPremortemRisk;
exports.checkPredictedPerformance = checkPredictedPerformance;
exports.recordCreativeOutcome = recordCreativeOutcome;
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("../adapters/config");
const mempalace_1 = require("./sources/mempalace");
function readFillInField(configPath, brandId, field) {
    if (!(0, fs_1.existsSync)(configPath))
        return undefined;
    const text = (0, fs_1.readFileSync)(configPath, 'utf-8');
    // Config templates are one YAML fenced block, `brands:` list of `{brand_id, <field>}`. A real
    // YAML parser would be overkill for a two-key-per-entry template file — line-scoped regex
    // matches the documented shape (brand_id: <val> immediately followed by the field line).
    const blockMatch = text.match(/```yaml([\s\S]*?)```/);
    if (!blockMatch)
        return undefined;
    const lines = blockMatch[1].split('\n');
    for (let i = 0; i < lines.length; i++) {
        const idMatch = lines[i].match(/brand_id:\s*(.+?)\s*(?:#|$)/);
        if (idMatch && idMatch[1].trim() === brandId) {
            for (let j = i + 1; j < lines.length && j < i + 4; j++) {
                const fieldMatch = lines[j].match(new RegExp(`${field}:\\s*(.+?)\\s*(?:#|$)`));
                if (fieldMatch)
                    return fieldMatch[1].trim();
            }
        }
    }
    return undefined;
}
function checkBrandVoiceConformance(brandId) {
    const config = (0, config_1.getConfig)();
    const atlasConfigPath = (0, path_1.join)(config.teamsPath, 'Brand Studio', 'atlas', 'operational', 'agent', 'atlas-config.md');
    const lenaConfigPath = (0, path_1.join)(config.teamsPath, 'Brand Studio', 'lena', 'operational', 'agent', 'lena-config.md');
    const brandKitPath = readFillInField(atlasConfigPath, brandId, 'brand_kit_path');
    const voiceGuidePath = readFillInField(lenaConfigPath, brandId, 'voice_guide_path');
    const kitUnset = !brandKitPath || brandKitPath === '<FILL_IN>';
    const voiceUnset = !voiceGuidePath || voiceGuidePath === '<FILL_IN>';
    if (kitUnset || voiceUnset) {
        return {
            status: 'not_configured',
            brandKitPath: kitUnset ? undefined : brandKitPath,
            voiceGuidePath: voiceUnset ? undefined : voiceGuidePath,
            reason: `brand_kit_path/voice_guide_path unset for brand_id="${brandId}" — per atlas's own ` +
                `brand-guidelines protocol, STOP and offer assets/brand-kit-template.md (or ` +
                `voice-guide-template.md), not audit against remembered/inferred rules`,
        };
    }
    // Both paths configured — read them if they exist on disk. This function does not implement
    // the element-by-element audit itself (logo/color/type/imagery rules) — that's
    // brand-guidelines' own multi-phase protocol, agent-executed, not a deterministic function.
    // This confirms whether there's something real to audit against.
    const kitExists = (0, fs_1.existsSync)(brandKitPath);
    const voiceExists = (0, fs_1.existsSync)(voiceGuidePath);
    return {
        status: 'checked',
        brandKitPath,
        voiceGuidePath,
        reason: kitExists && voiceExists
            ? 'both files configured and present on disk — ready for atlas/lena to audit'
            : `configured but missing on disk (kit exists: ${kitExists}, voice guide exists: ${voiceExists})`,
    };
}
function checkNoveltyRepetition(draftSummary, wing, opts = {}) {
    const result = (0, mempalace_1.searchMemPalace)(draftSummary, { wing, room: opts.room, results: opts.recentN ?? 5 });
    if (!result.available) {
        return { flag: 'unscored', hitCount: 0, available: false, note: result.error ?? 'MemPalace unavailable' };
    }
    // No similarity score to threshold — "too similar" (>=3 hits on a draft summary search) vs.
    // "no comparable history" (0 hits) is the only real signal the CLI contract supports.
    // Mid-range hit counts are reported as unscored rather than guessed at as "fine."
    if (result.hits.length >= 3) {
        return { flag: 'repetitive', hitCount: result.hits.length, available: true, note: 'multiple similar past posts found in this wing/room' };
    }
    if (result.hits.length === 0) {
        return { flag: 'brand_drift_check', hitCount: 0, available: true, note: 'no comparable history in this wing/room — could be novel or off-brand, needs atlas/spark review either way' };
    }
    return { flag: 'unscored', hitCount: result.hits.length, available: true, note: `${result.hits.length} hit(s) — not enough signal to call repetitive or drift without a real similarity score` };
}
function checkPremortemRisk(ragResult) {
    const adversaryChunks = (ragResult.selected_chunks ?? []).filter((c) => c.adversary);
    return {
        hasAdversaryChunk: adversaryChunks.length > 0,
        adversaryChunkIds: adversaryChunks.map((c) => c.chunk_id),
        note: adversaryChunks.length > 0
            ? 'standard retrieval surfaced a counter-evidence/risk chunk for this draft — spark should review before publish'
            : 'no adversary chunk surfaced by standard retrieval — does not mean risk-free, only that P5 found nothing to flag',
    };
}
function checkPredictedPerformance() {
    return {
        available: false,
        reason: 'kai has no code model or scored performance dataset in this repo — agent-only, not implementable as a deterministic function without building an entire prediction system out of scope here',
    };
}
function recordCreativeOutcome(outcome) {
    const dir = (0, path_1.join)((0, config_1.getConfig)().projectRoot, 'store', 'creative-outcomes');
    (0, fs_1.mkdirSync)(dir, { recursive: true });
    const path = (0, path_1.join)(dir, `${outcome.postId}.json`);
    (0, fs_1.writeFileSync)(path, JSON.stringify(outcome, null, 2), 'utf-8');
    const result = (0, mempalace_1.mineIntoMemPalace)(path, { wing: outcome.wing });
    return { filed: result.filed, error: result.error };
}
//# sourceMappingURL=creative-gate-chain.js.map