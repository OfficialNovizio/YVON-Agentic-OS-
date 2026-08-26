---
name: ip-routing
agent: guard
department: Legal & Compliance
version: 1.0.0
tier: 3
description: |
  guard's single entry point for IP-legal requests — routes to clearance / oss-review / infringement-triage based on intent, loads shared config from guard-config.md, binds it to the marketplace skills' common plugin config path. Bounces or [PROVISIONAL] on missing config. (yvon)
triggers:
  - ip routing
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Legal & Compliance/guard/custom/ip-routing/SKILL.md
  source_hash: 25d8caa9ebc6a9c4cb5a7f4ccc2493b763c8168cffc38dfaab5cd0c7e177ff04
  generated: 2026-07-30T18:50:06.799Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Legal & Compliance/guard/custom/ip-routing/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js guard -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: guard — Legal & Compliance · skill: ip-routing"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"ip-routing\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

- Any of the marketplace skills' triggers (see the `triggers:` frontmatter list).
- Ambiguous IP request that could match more than one marketplace skill — this skill classifies and routes.

Do NOT use for:

- IP-registry maintenance — that's `ip-registry` (guard's other custom skill).
- Cross-agent IP handoffs (e.g., trademarks in contracts) — that's `scribe`'s domain via the boundary.

## Purpose

Take an inbound IP-legal request, do three things the marketplace skills assume are already done, and hand off:

1. **Detect intent** — trademark clearance / OSS license review / infringement triage.
2. **Load shared config** — jurisdictions, integrations, enforcement posture, decision posture, work-product header from `operational/agent/guard-config.md`.
3. **Bind context** and hand off to the right marketplace skill.

After the handoff, the marketplace skill's own workflow runs unaltered.

## Protocol

```
1. INTAKE      confirm intent is one of the three IP-legal marketplace scopes
2. CLASSIFY    decide: clearance / oss-review / infringement-triage
3. CONFIG      load guard-config.md; if missing/placeholder → BOUNCE
4. BIND        pass resolved config to the selected marketplace skill
5. HANDOFF     invoke the marketplace skill with bound context
6. RETURN      surface the memo with a preamble and passthrough postamble
```

## Boundaries & handoffs

| "trademark clearance" / "can we use this mark" | `ip-routing` → `clearance` | Pre-adoption question |
| "review our dependencies" / "AGPL check" | `ip-routing` → `oss-review` | OSS license question |
| "is this infringing" / "knockoff surfaced" | `ip-routing` → `infringement-triage` | Post-observation analysis |
- name: ip-routing

## Output format

The marketplace skill owns the memo format. This skill adds only the preamble in Step 6.

If the run bounces at Step 3, the output is the bounce message alone — no memo.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"guard\",\"skill\":\"ip-routing\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
