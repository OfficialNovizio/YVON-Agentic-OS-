---
name: clearance
agent: guard
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  > (yvon)
triggers:
  - clearance
allowed-tools:
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/guard/marketplace/clearance/SKILL.md
  source_hash: 01e7a70cf1f68e9b8492aeebbe076d82fc76d5477d5b4b77a17d5e203b229b32
  generated: 2026-07-30T18:50:06.801Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/guard/marketplace/clearance/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js guard -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: guard — Legal & Compliance · skill: clearance"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"clearance\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Use when the request matches: "clearance".

## Purpose

**This is a triage, not a clearance opinion.** A trademark clearance opinion
requires a full professional search and registered trademark counsel's
judgment. A "no obvious conflicts" result means the triage
didn't find anything — it does not mean the mark is clear. Clients have been
sued over marks that passed a knockout search.

## Protocol

1. Read `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md`. If it
   contains `[PLACEHOLDER]`, stop and direct to `/ip-legal:cold-start-interview`.
2. Follow the workflow below.
3. Run intake (mark, goods/services, classes, jurisdictions, visual/stylization).
4. Knockout check for intrinsic bars — generic, descriptive, deceptive,
   geographic, surname, false connection, prohibited matter, functional.
5. Similar-marks search against what's connected (Solve Intelligence, CourtListener, Descrybe, or whatever MCP is available). If nothing is
   connected, say so in the output and proceed with the factor analysis only.
6. Walk the applicable circuit's likelihood-of-confusion factors — du Pont /
   Polaroid / Sleekcraft / other. Flag each; never conclude.
7. Write the triage memo to the matter folder (if a matter is active) or the
   practice outputs folder. Apply the work-product header per role.
8. End with recommended next steps and the non-lawyer gate if the role is
   non-lawyer.

This skill never concludes a mark is clear. If uncertain, flag — the attorney
decides.

## Boundaries & handoffs

| "trademark clearance" / "can we use this mark" | `ip-routing` → `clearance` | Pre-adoption question |
- clearance
- name: clearance
- trigger: "trademark clearance"

## Output format

Prepend the work-product header from `~/.claude/plugins/config/claude-for-legal/ip-legal/CLAUDE.md` `## Outputs`.

```markdown
[WORK-PRODUCT HEADER]

# Trademark Clearance — First Pass (NOT AN OPINION)

**This is a first pass, not a clearance opinion.** A clearance opinion requires
a full professional search and attorney judgment. A "no obvious conflicts"
result here means the triage didn't find anything — it does not mean the mark
is clear. A registered trademark attorney evaluates before anyone adopts, files,
or invests in this mark.

**Triage result:** [GREEN / YELLOW / RED — one sentence why]

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"clearance\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
