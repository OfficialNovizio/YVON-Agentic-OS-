---
name: brand-guidelines
agent: atlas
department: Brand Studio
version: 1.0.0
tier: 3
description: |
  Brand erosion happens one asset at a time: a slightly-off green here, a stretched logo there, a new font someone liked. (yvon)
triggers:
  - brand guidelines
  - on brand check
  - visual identity check
  - is this on brand
  - audit this asset
allowed-tools:
  - Read
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/atlas/custom/brand-guidelines/SKILL.md
  source_hash: 652205df53e0e2c05f72be3be8f095bbd7d2dcd6a8db928cca10d4d30e23013b
  generated: 2026-07-20T03:20:23.517Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/atlas/custom/brand-guidelines/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js atlas -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: atlas — Brand Studio · skill: brand-guidelines"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"atlas\",\"skill\":\"brand-guidelines\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true

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

Triggers: "on brand check," "visual identity check," "is this on brand," "audit this asset," or automatically when pixel's asset-pipeline QA step runs, and as spark's coherence gate's visual component.

Not for: *creating* an identity (that's `brand-identity`, whose output populates the kit), layout craft judgments beyond the kit's rules (that's `layout-composition`), or brand-to-brand separation (that's `multi-brand-system`).

## Purpose

Brand erosion happens one asset at a time: a slightly-off green here, a stretched logo there, a new font someone liked. Each is small; the sum is a brand nobody recognizes. This skill makes every outbound asset auditable against one written kit, so consistency is enforced by process rather than by whoever happens to notice.

## Protocol

```
Load the brand kit (configured path, per brand)
  -> If none exists: STOP — offer assets/brand-kit-template.md, or route to brand-identity
     to create the system first; nothing to enforce
    -> Identify which kit sections apply to this asset type
      -> Audit element by element, quoting the kit rule per finding
        -> PASS or itemized fix list (rule violated → what's wrong → the fix)
          -> Repeat findings feed the drift note to spark
```

## Boundaries & handoffs

- **brand-identity → brand-guidelines**: creation output fills `assets/brand-kit-template.md`; from then on the kit is law and brand-identity is only re-run for redesigns (operator sign-off — identity changes post-rollout cost 10×).
- **brand-guidelines ↔ multi-brand-system**: multi-brand audits run both — own-kit compliance and sibling-territory separation. BLEED findings and repeat-violation drift notes route to **spark**.
- **layout-composition ↔ brand-guidelines**: the kit legislates spacing/clear-space; composition craft beyond that (focal points, hierarchy levels, grid choice) is layout-composition's. An audit never fails an asset on unlegislated craft — it may *recommend* via layout-composition.
- **pixel** calls brand-guidelines inside its asset-pipeline QA step — pixel produces, atlas judges.
"Is this on brand" → brand-guidelines (+ multi-brand-system if 2+ brands). "Make/design our brand" → brand-identity. "Lay this out / why does this feel off" → layout-composition. Ambiguous → ask whether the need is create, audit, separate, or compose.
No kit and the request is an audit → brand-guidelines' own Phase-1 stop (offer template or brand-identity). Anything else unclear → ask.

## Output format

```

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"atlas\",\"skill\":\"brand-guidelines\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
