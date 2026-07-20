---
name: eval-harness
description: Formal evaluation framework implementing eval-driven development (EDD) — define pass/fail criteria before implementation, measure agent reliability with pass@k metrics, catch regressions in prompts/agents/skills the way tests catch them in code.
provenance:
  source: marketplace — affaan-m/everything-claude-code (ECC), skills/eval-harness
  adopted: 2026-07-10
  adaptations: >
    Imported near-verbatim. Claude-Code-specific mechanics (slash commands, .claude/evals paths)
    generalized to a configurable eval store (path set in quinn-config). Gate integration added:
    eval reports feed quinn's test-strategy gate; model-based graders NEVER gate a release alone;
    security-relevant evals route to aegis for human/agent review (source's "human review for
    security" rule, mapped). Boundaries section added. Method and metrics unchanged.
assigned_agent: quinn (Engineering / QA)
# yvon-compile metadata (auto-derived from skill content 2026-07-20 — review welcome; body verbatim)
tier: 2
description: "Eval-driven development (EDD): evals are the unit tests of AI-assisted work."
triggers: [eval harness]
---

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
