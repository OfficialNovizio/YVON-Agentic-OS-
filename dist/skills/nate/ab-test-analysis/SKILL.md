---
name: ab-test-analysis
agent: nate
department: Brand Studio
version: 1.1.0
tier: 2
description: |
  Evaluate A/B test results with statistical rigor and translate findings into clear product decisions. (yvon)
triggers:
  - ab test analysis
allowed-tools:
  - Read
  - Bash
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Brand Studio/nate/marketplace/ab-test-analysis/SKILL.md
  source_hash: 06c2978c1425c444b44628d23b312e83e096d8e992ba7ab3d37d81f746183a86
  generated: 2026-07-20T03:20:23.709Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Brand Studio/nate/marketplace/ab-test-analysis/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js nate -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: nate — Brand Studio · skill: ab-test-analysis"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nate\",\"skill\":\"ab-test-analysis\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "ab test analysis".

## Purpose

Evaluate A/B test results with statistical rigor and translate findings into clear product decisions.

## A/B Test Analysis

Evaluate A/B test results with statistical rigor and translate findings into clear product decisions.

### Context

You are analyzing A/B test results for **$ARGUMENTS**.

If the user provides data files (CSV, Excel, or analytics exports), read and analyze them directly. Generate Python scripts for statistical calculations when needed.

### Instructions

1. **Understand the experiment**:
   - What was the hypothesis?
   - What was changed (the variant)?
   - What is the primary metric? Any guardrail metrics?
   - How long did the test run?
   - What is the traffic split?

2. **Validate the test setup**:
   - **Sample size**: Is the sample large enough for the expected effect size?
     - Use the formula: n = (Z²α/2 × 2 × p × (1-p)) / MDE²
     - Flag if the test is underpowered (<80% power)
   - **Duration**: Did the test run for at least 1-2 full business cycles?
   - **Randomization**: Any evidence of sample ratio mismatch (SRM)?
   - **Novelty/primacy effects**: Was there enough time to wash out initial behavior changes?

3. **Calculate statistical significance**:
   - **Conversion rate** for control and variant
   - **Relative lift**: (variant - control) / control × 100
   - **p-value**: Using a two-tailed z-test or chi-squared test
   - **Confidence interval**: 95% CI for the difference
   - **Statistical significance**: Is p < 0.05?
   - **Practical significance**: Is the lift meaningful for the business?

   If the user provides raw data, generate and run a Python script to calculate these.

4. **Check guardrail metrics**:
   - Did any guardrail metrics (revenue, engagement, page load time) degrade?
   - A winning primary metric with degraded guardrails may not be a true win

5. **Interpret results**:

   | Outcome | Recommendation |
   |---|---|
   | Significant positive lift, no guardrail issues | **Ship it** — roll out to 100% |
   | Significant positive lift, guardrail concerns | **Investigate** — understand trade-offs before shipping |
   | Not significant, positive trend | **Extend the test** — need more data or larger effect |
   | Not significant, flat | **Stop the test** — no meaningful difference detected |
   | Significant negative lift | **Don't ship** — revert to control, analyze why |

6. **Provide the analysis summary**:
   ```
   ## A/B Test Results: [Test Name]

   **Hypothesis**: [What we expected]
   **Duration**: [X days] | **Sample**: [N control / M variant]

   | Metric | Control | Variant | Lift | p-value | Significant? |
   |---|---|---|---|---|---|
   | [Primary] | X% | Y% | +Z% | 0.0X | Yes/No |
   | [Guardrail] | ... | ... | ... | ... | ... |

   **Recommendation**: [Ship / Extend / Stop / Investigate]
   **Reasoning**: [Why]
   **Next steps**: [What to do]
   ```

Think step by step. Save as markdown. Generate Python scripts for calculations if raw data is provided.

---

### Further Reading

- [A/B Testing 101 + Examples](https://www.productcompass.pm/p/ab-testing-101-for-pms)
- [Testing Product Ideas: The Ultimate Validation Experiments Library](https://www.productcompass.pm/p/the-ultimate-experiments-library)
- [Are You Tracking the Right Metrics?](https://www.productcompass.pm/p/are-you-tracking-the-right-metrics)

## Boundaries & handoffs

ab-test-analysis       (JUDGE — the statistics: power, SRM, significance, guardrails →
- **backlog ↔ ab-test-analysis**: pre-registration enforces the sibling's math *before* launch; analysis delivers the verdict after. One discipline, two moments.
"Where are we losing users" → funnel. "What should we test next / add this idea" → backlog. "Is this significant / did it win" → ab-test-analysis. Ambiguous → aim, queue, or judge?

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"nate\",\"skill\":\"ab-test-analysis\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
