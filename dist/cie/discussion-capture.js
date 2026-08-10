"use strict";
// lib/cie/discussion-capture.ts — system-harness/graph-brain/GRAPH-BRAIN-DESIGN.md §15.3: Discussion Capture
//
// "Architecture discussions... become queryable graph nodes, not just chat history that gets
// lost... Written to graphify with the same rigor as any other Decision node."
//
// MAJOR VERIFIED CORRECTION (2026-08-09), affects §4/§5/§6, not just this section: §4's entire
// premise is that graphify parses Node-Zero markdown frontmatter (id/type/scope/applies_to/
// learned_from/mempalace-pointer + [[wikilinks]] as edges) into typed graph nodes (Decision,
// Lesson, Agent, etc.). Checked the LIVE graph.json directly — every node's `file_type` is
// 'code' (6705), 'rationale' (623, extracted from Python docstrings), or 'concept' (93,
// extracted from config/JSON keys) — all `_origin: "ast"`. There is NO node type anywhere in the
// real data corresponding to §5's schema (Decision/Lesson/Agent/Task/etc.), and no evidence
// graphify reads YAML frontmatter as structured fields at all. The installed `graphifyy` package
// is a pure AST/code-structure tool; §4's Node-Zero-frontmatter-to-typed-node pipeline does not
// exist in the real tool, regardless of how many files anyone writes in that shape. This is a
// gap in the design doc's foundational premise, not just an unbuilt feature — flagged here since
// it surfaced while implementing this specific section, but it undermines §4/§5/§6's "graphify
// parses this" claims generally. Worth a dedicated pass; not fully resolved in this one.
//
// Given that, this function does the two things that ARE real:
//   1. Writes a §4-shaped markdown file (frontmatter + body + [[wikilinks]]) to docs/decisions/
//      — for human/Obsidian legibility and forward compatibility if graphify's frontmatter
//      parsing is ever actually built. Not currently graph-queryable through graphify.
//   2. Mines that same file into MemPalace (`mineIntoMemPalace`, real, working) scoped to a
//      `meta-architecture` wing — this IS queryable today, via `searchMemPalace`. This is the
//      genuinely-working half of "queryable graph node."
// It does NOT claim graphify indexes it as a typed Decision node, because verified: it doesn't.
Object.defineProperty(exports, "__esModule", { value: true });
exports.DECISION_WING = void 0;
exports.captureDiscussion = captureDiscussion;
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("../adapters/config");
const mempalace_1 = require("./sources/mempalace");
exports.DECISION_WING = 'meta-architecture';
function decisionsDir() {
    return (0, path_1.join)((0, config_1.getConfig)().projectRoot, 'docs', 'decisions');
}
/**
 * captureDiscussion — §15.3's mechanism. Writes a §4-shaped Decision node file and mines it into
 * MemPalace. Does not touch graphify — see module comment for why that half of the doc's claim
 * isn't real today.
 */
function captureDiscussion(input) {
    const dir = decisionsDir();
    if (!(0, fs_1.existsSync)(dir))
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    const wikilinks = input.appliesTo.map((a) => `[[${a}]]`).join(', ');
    const frontmatter = [
        '---',
        `id: ${input.id}`,
        'type: decision',
        `scope: ${input.scope}`,
        `applies_to: [${input.appliesTo.join(', ')}]`,
        input.learnedFrom ? `learned_from: ${input.learnedFrom}` : null,
        input.supersedes ? `supersedes: ${input.supersedes}` : null,
        `valid_from: ${new Date().toISOString().slice(0, 10)}`,
        '---',
    ].filter((l) => l !== null).join('\n');
    const body = `${input.body}${wikilinks ? `\n\nApplies to: ${wikilinks}` : ''}`;
    const content = `${frontmatter}\n${body}\n`;
    const filePath = (0, path_1.join)(dir, `${input.id}.md`);
    (0, fs_1.writeFileSync)(filePath, content, 'utf-8');
    const memPalace = (0, mempalace_1.mineIntoMemPalace)(filePath, { wing: exports.DECISION_WING });
    return { filePath, written: true, graphifyIndexed: false, memPalace };
}
//# sourceMappingURL=discussion-capture.js.map