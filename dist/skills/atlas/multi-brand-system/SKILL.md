---
name: multi-brand-system
agent: atlas
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Operators running multiple ventures face a two-sided failure: brands that blur together (customers can't tell them apart, positioning collapses) or brands so unrelated the portfolio gets no halo. (yvon)
triggers:
  - multi brand system
  - cross brand visual
  - brand separation
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/atlas/custom/multi-brand-system/SKILL.md
  source_hash: 437fa6ebbdeb358639427074ba573774bd68c76f55795f60054eacc832599d39
  generated: 2026-07-20T03:20:23.522Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/atlas/custom/multi-brand-system/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js atlas -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: atlas — Brand Studio · skill: multi-brand-system"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"atlas\",\"skill\":\"multi-brand-system\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

# ── T3+: config load + loud degradation (mia-config rule, fleet-wide) ──
_CFG="$_ROOT/Teams/Brand Studio/atlas/operational/agent/atlas-config.md"
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

Triggers: "cross brand visual," "brand separation," "does this look too much like [sibling brand]," or automatically inside brand-guidelines audits whenever the business runs 2+ brands.

Not for: single-brand audits (brand-guidelines alone), or deciding the portfolio strategy itself (which brands exist and how related they *should* be is an operator/marcus call — this skill enforces the documented answer).

## Purpose

Operators running multiple ventures face a two-sided failure: brands that blur together (customers can't tell them apart, positioning collapses) or brands so unrelated the portfolio gets no halo. The middle path needs written rules — which elements are deliberately shared (a corporate mark, a type family), which are exclusive per brand (palettes, imagery styles), and how much distance is enough. This skill enforces that middle path.

## Protocol

```
Load the separation matrix (operator-supplied; part of atlas config)
  -> If single brand or no matrix: dormant — note and pass through
    -> Identify the asset's claimed brand + the sibling set
      -> Distance check: exclusive elements (palette, imagery, type where exclusive)
         appear only for the owning brand
        -> Shared-elements check: anything shared comes from the approved common set only
          -> PASS / BLEED finding (which sibling, which element) → spark review
```

## Boundaries & handoffs

- **brand-guidelines ↔ multi-brand-system**: multi-brand audits run both — own-kit compliance and sibling-territory separation. BLEED findings and repeat-violation drift notes route to **spark**.
- **brand-identity ← multi-brand-system**: creating a sibling brand consumes the separation matrix as a constraint and extends it (operator approves the new row).
"Is this on brand" → brand-guidelines (+ multi-brand-system if 2+ brands). "Make/design our brand" → brand-identity. "Lay this out / why does this feel off" → layout-composition. Ambiguous → ask whether the need is create, audit, separate, or compose.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"atlas\",\"skill\":\"multi-brand-system\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
