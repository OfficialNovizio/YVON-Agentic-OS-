---
name: eval-harness
agent: quinn
department: Engineering
version: 1.1.0
tier: 2
description: |
  Eval-driven development (EDD): evals are the unit tests of AI-assisted work. (yvon)
triggers:
  - eval harness
allowed-tools:
  - <FILL_IN: not listed in quinn-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: none
provenance:
  source_file: Teams/Engineering/quinn/marketplace/eval-harness/SKILL.md
  source_hash: 0fb57dab16be35d9ca0cd1ffc715d577f07146406ada3efc67c0a7d0948fce60
  generated: 2026-07-20T03:20:22.863Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/quinn/marketplace/eval-harness/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js quinn -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: quinn — Engineering · skill: eval-harness"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"eval-harness\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Use when the request matches: "eval harness".

## Purpose

Eval-driven development (EDD): evals are the unit tests of AI-assisted work. Define expected behavior BEFORE implementation, run continuously, track regressions, measure reliability with pass@k.

## Protocol

# Eval Harness

Eval-driven development (EDD): evals are the unit tests of AI-assisted work. Define expected behavior BEFORE implementation, run continuously, track regressions, measure reliability with pass@k.

## When to Activate

- Setting up EDD for agent-assisted workflows
- Defining pass/fail criteria for task completion before work starts
- Measuring agent reliability (pass@k) on repeated tasks
- Creating regression suites for prompt/agent/skill changes
- Benchmarking behavior across model or skill versions

## Eval Types

**Capability evals** — can the system do something it couldn't before?
```markdown
[CAPABILITY EVAL: <feature>]
Task: what should be accomplished
Success Criteria: [ ] criterion 1  [ ] criterion 2  [ ] criterion 3
Expected Output: description
```

**Regression evals** — did a change break what worked?
```markdown
[REGRESSION EVAL: <feature>]
Baseline: SHA or checkpoint
Tests: existing-test-1: PASS/FAIL · existing-test-2: PASS/FAIL
Result: X/Y passed (previously Y/Y)
```

## Grader Types

1. **Code grader** — deterministic assertions (grep for expected exports, test suite exit code, build exit 0). Preferred wherever possible.
2. **Rule grader** — regex/schema constraints on outputs.
3. **Model grader** — LLM-as-judge with a rubric (solves problem? structured? edge cases? error handling? score 1–5 + reasoning). **Never gates a release alone** — flaky graders in release gates are an anti-pattern (source) and a quinn principle.
4. **Human grader** — manual adjudication for ambiguous outputs; **mandatory for security-relevant evals** (route via aegis).

## Metrics

- **pass@1** — first-attempt success rate (direct reliability)
- **pass@3** — success within 3 attempts (practical reliability; typical target ≥ 90%)
- **pass^3** — all 3 runs succeed (stability bar; **1.00 for release-critical paths**)

## Workflow

**1. Define (before any work):** capability evals + regression evals + success thresholds, written to the eval store.
**2. Implement:** the work is done to pass the defined evals.
**3. Evaluate:** run capability evals (record PASS/FAIL per attempt) + regression evals (existing suites).
**4. Report:**

```markdown
EVAL REPORT: <feature>
Capability: 3/3 passed (pass@1: 67%, pass@3: 100%)
Regression: 3/3 passed (pass^3: 100%)
Status: READY FOR REVIEW   ← feeds quinn's gate; never self-certifies "SHIP"
```

## Eval Storage

Configurable per business (`quinn-config`): a project-local eval store, e.g.
```
<eval_store>/<feature>.md       # definition
<eval_store>/<feature>.log      # run history
<eval_store>/baseline.json      # regression baselines
<releases>/<version>/eval-summary.md   # release snapshot
```
Evals are versioned with the code — first-class artifacts.

## Best Practices

Define evals BEFORE coding (forces clear success criteria) · run frequently · track pass@k trends over time · prefer code graders (deterministic > probabilistic) · human/aegis review for security, never fully automated · keep evals fast (slow evals don't get run) · version evals with code.

## Anti-Patterns

Overfitting prompts to known eval examples · measuring only happy paths · chasing pass rates while cost/latency drift · **flaky graders in release gates** · treating a model-grader score as gate evidence on its own.

## Boundaries with other skills

- **test-strategy (quinn, custom):** the GATE authority — tiers, floors, release verdicts. Eval reports are evidence INTO that gate; this skill never issues the verdict. Conflicts → test-strategy.
- **regression-map (quinn):** failed evals on previously-passing behavior create regression-map entries; fragile areas get standing regression evals.
- **verification-before-completion (Shared OS):** an eval report IS the fresh evidence that skill demands — "READY FOR REVIEW" without an attached run is a violation of both.
- **charter-enforcement (quinn):** eval runs that execute tools follow Rails 1–2 like any other run.
- **aegis:** security-relevant evals (auth, injection, data exposure) require aegis's review; model graders are insufficient there.
- **skill-creator evals (platform):** building/benchmarking VYON skills themselves can reuse this harness's metrics (pass@k) — platform-level usage, same method.

## Boundaries & handoffs

- "Define success criteria first / pass@k / eval this agent's work / EDD / prompt regression" → **marketplace/eval-harness**; its reports are evidence INTO test-strategy's gate, never a verdict; model graders never gate alone; security evals route to aegis.

## Voice



## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"quinn\",\"skill\":\"eval-harness\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
