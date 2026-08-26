---
name: oss-review
agent: guard
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  > (yvon)
triggers:
  - oss review
allowed-tools:
  - Write
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/guard/marketplace/oss-review/SKILL.md
  source_hash: d0107ced46148755e68083a8af0388fa05745a55336f7b78e11d4949428c5a0e
  generated: 2026-07-30T18:50:06.804Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/guard/marketplace/oss-review/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js guard -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: guard — Legal & Compliance · skill: oss-review"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"oss-review\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Legal & Compliance/guard/operational/agent/guard-config.md"
if [ -f "$_CFG" ]; then
  _FILLS=$(grep -c "<FILL_IN>" "$_CFG" 2>/dev/null || echo 0)
  echo "CONFIG: $_CFG"
  echo "CONFIG_UNFILLED_FIELDS: $_FILLS"
  if [ "$_FILLS" -gt 0 ]; then
    echo "⚠️ DEGRADE LOUDLY: $_FILLS config fields are <FILL_IN>. Ask the operator before relying on any of them — do NOT improvise values."
    grep -n "<FILL_IN>" "$_CFG" 2>/dev/null | head -10 || true
  fi
else
  echo "⚠️ CONFIG MISSING: $_CFG — every config-dependent decision must be asked, not assumed."
fi
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "oss review".

## Purpose

Tell the user what licenses are in their dependency tree, what obligations those licenses trigger given how the code will be deployed, and what to do about each one. The output is a memo the lawyer (or the engineer with attorney access) can act on — comply, replace, remove, seek legal review, seek commercial license.

**This is a first-pass classification.** Copyleft analysis depends on the deployment model, the degree of linking, the jurisdiction, and sometimes on legal questions that have not been tested in court (notably AGPL's "interacts over a network," GPL-3.0's patent clause). For anything that classifies as strong copyleft or license-unknown, an attorney evaluates before the dependency ships or the code is released. The skill reports what it found; the lawyer decides what to do.

## Protocol

1. **Load `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md`.** If placeholders present, stop and prompt: "Run `/ip-legal:cold-start-interview` first — I need to learn your practice profile (and OSS policy, if any) before I can review." If the practice profile points at an uploaded OSS policy, read that too — it is the source of truth for accepted / review / banned licenses on this team.

2. **Establish the scope:** a dependency list (package.json, requirements.txt, go.mod, Gemfile, Cargo.toml, pom.xml, SBOM), a single library, or outbound code the team is preparing to open-source. If the user passed a path, infer from the file; otherwise ask.

3. **Establish the deployment model** before classifying obligations — SaaS, distributed binary, internal only, or embedded. The same dependency list triggers different obligations depending on this.

4. **Follow the workflow below.** In particular:
   - Read the actual license text, not just metadata — LICENSE files can be wrong, package metadata can be stale.
   - Classify each package into permissive / weak copyleft / strong copyleft / public domain / non-OSI / unknown.
   - Flag license-unknown as "needs review," not permissive by default.
   - Flag non-OSI source-available licenses (SSPL, BUSL, Commons Clause, Elastic License, fair-source) — these are not open source.
   - For outbound code, check that the chosen outbound license is compatible with every embedded dependency.

5. **Output the memo** per the template below — work-product header first, bottom line, top-of-memo flags, per-package blocks grouped by severity, jurisdiction note, outbound check (if applicable), approval routing.

6. **Respect the decision posture.** When a copyleft-trigger analysis turns on a contested question (AGPL's "interacts over a network," GPL-3.0's "conveying," LGPL linking scope), flag for attorney review and surface the factors cutting both ways. Anything flagged as strong copyleft or license-unknown goes to an attorney before the dependency ships or the code is released.

## Boundaries & handoffs

| "review our dependencies" / "AGPL check" | `ip-routing` → `oss-review` | OSS license question |
- oss-review
- name: oss-review

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"oss-review\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
