---
name: api-standards
agent: raj
department: Engineering
version: 1.0.0
tier: 3
description: |
  Inconsistent APIs are where integrations break and security holes open: one endpoint returns 200-with-error-body, another 500s; one checks authorization, the next forgot; a breaking change ships with… (yvon)
triggers:
  - api standards
  - design this endpoint
  - api design
  - how should errors look
  - version this api
  - is this a breaking change
  - contract test
allowed-tools:
  - Read
  - Write
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/raj/custom/api-standards/SKILL.md
  source_hash: 86a3f4fe4ac5656ca1fa2fb7b1019c57b12c9c844fd25771a205692c3687f31e
  generated: 2026-07-20T03:20:22.904Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/raj/custom/api-standards/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js raj -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: raj — Engineering · skill: api-standards"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"raj\",\"skill\":\"api-standards\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Engineering/raj/operational/agent/raj-config.md"
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

Triggers: "design this endpoint," "API design," "how should errors look," "version this API," "is this a breaking change," "contract test," and any new or changed backend surface.

## Purpose

Inconsistent APIs are where integrations break and security holes open: one endpoint returns 200-with-error-body, another 500s; one checks authorization, the next forgot; a breaking change ships with no version bump and every client shatters. A written standard makes the API predictable — and predictable APIs are testable, secure, and safe to evolve.

## Protocol

```
An API surface to design/change
  -> AUTH: authentication on every non-public route; AUTHORIZATION per-object (not just per-route)
  -> VERSIONING: explicit; a breaking change bumps the version, never mutates a live contract
  -> ERROR SHAPE: one consistent error envelope (code, message, detail) — never 200-with-error
  -> PAGINATION / limits: bounded responses; no unbounded list endpoints (DoS + cost)
  -> CONTRACT TESTS: pin request/response shape so consumers break at CI, not in production
    -> Security-relevant surface (auth, new external input) → aegis secure-code-review
      -> Shape reflects dana's data model; deep data access follows data-access-discipline
```

## Boundaries & handoffs

- "Design an endpoint / API design / errors / versioning / contract test" → **api-standards** (contract authority), which pulls design richness from **marketplace/api-design-principles** (resource modeling, pagination patterns, GraphQL schema/DataLoader, HATEOAS). Conflicts resolve to api-standards.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"raj\",\"skill\":\"api-standards\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
