---
name: code-review-standards
type: custom
status: built 2026-07-08; redesigned 2026-07-09 (Fable pass — agent-authored-code failure modes added as first-class checks; diff-scope discipline adopted from marketplace)
based_on_catalog_entry: code-review-standards (VYON_Skills_Catalog_Full_v2.html, dev/Engineering) — genericized per rule 0.4b off the company name; "01-03 files" consolidated into one checklist-driven skill
marketplace_search: 2026-07-09 skillsmp.com — candidates found (Anthropic official code-review skill; wshobson code-review-excellence). Kept custom for department integration (charter gates, aegis/quinn routing); adopted their diff-scope rule (review the PR's changes only; pre-existing debt is a register entry, not a review item)
assigned_agent: dev (Engineering / Lead Developer)
portable: true — the review dimensions are stack-agnostic; stack-specific lint/patterns come from the stack-profile
includes: assets/review-checklist.md
date_added: 2026-07-08
---

## Introduction

code-review-standards is the department's PR review discipline: every change is reviewed in a fixed order — **integrity → correctness → security → tests → style** — and either approved or returned with specific, actionable requests. It is the quality gate at merge time, upstream of quinn's release gate and aegis's security pass. Integrity comes first because in this department the authors are agents, and agent-authored code has its own failure modes: it can *look* done without *being* done.

## Purpose

Reviews that "look fine, ship it" are how bugs and vulnerabilities enter. A fixed-order checklist means the load-bearing checks (does it work, is it safe, is it tested) always happen before the cosmetic ones, and every "request changes" names the exact problem and fix — never "this feels off."

## When to Use

Triggers: "review this PR," "code review," "is this mergeable," or automatically on every change before it reaches quinn's gate.

## Structure / Protocol

```
Load the change + the stack-profile's conventions — scope = THIS diff only
  -> 0 INTEGRITY (agent-authored code): real APIs? real data? tests intact? no stub-claimed-done?
  -> 1 CORRECTNESS: does it do what it claims? edge cases? error paths?
  -> 2 SECURITY: input validation, authz, secrets, injection surfaces (aegis pass if risky)
  -> 3 TESTS: coverage for the change, meaningful assertions, quinn's tiers satisfied
  -> 4 STYLE: stack-profile conventions, readability, naming
    -> APPROVE / REQUEST CHANGES (each item: file:line · what's wrong · the fix)
      -> Charter check: does the diff touch external-tool calls (Rail 1) or DB writes (Rail 3)?
```

## Instructions

1. **Integrity zero — the agent-code check.** The authors here are agents, and agent-authored code fails in characteristic ways that human-style review misses. Before anything else, check for: **fabricated APIs** (calls to methods/endpoints/params that don't exist — verify against the real dependency, not the diff's claim); **mock or placeholder data left in** (hardcoded fixtures, `example.com`, lorem values presented as wired-up); **weakened or deleted tests** (a diff that edits tests to make gates pass is an automatic block pending justification); **stubs claimed done** (TODO/`NotImplemented`/empty handlers behind a "feature complete" claim); **over-broad diffs** (changes to files the stated task doesn't require — both a quality and a Rail 1-adjacent signal). Any integrity finding blocks before correctness is even assessed.
2. **Scope discipline.** Review only what this diff changes (plus immediate context). Pre-existing debt in untouched code is a tech-debt-register entry (delivery-governance), not a review item — reviews that wander don't finish.
3. **Correctness.** Trace the happy path and the error paths; probe edge cases the tests miss. A beautiful, well-styled wrong answer is still wrong (spark's rule, engineering edition).
4. **Security.** Input validation, authorization checks, secret handling, injection/XSS/SSRF surfaces. Anything touching a new external surface or auth path routes to aegis before approval.
5. **Tests.** Does the change carry tests? Do they assert behavior, not just run? Do quinn's required tiers for this change type exist? No tests on non-trivial logic = request changes.
6. **Style last.** stack-profile conventions, naming, readability — real but subordinate; never block a correct, safe, tested change on taste alone.
7. **Charter gate.** If the diff introduces an external-tool call, confirm it will be plan-locked (Rail 1). If it touches data mutation, confirm it routes through the operator-run-script path (Rail 3) — an agent-executed destructive DB op in a diff is an automatic block.
8. **Verdict.** APPROVE, or REQUEST CHANGES with each item as `file:line · problem · fix`. No generic notes.

## Output Format

```
## Review: [PR/change] 
Integrity: [pass / findings] · Correctness: [pass / findings] · Security: [pass / findings / →aegis] · Tests: [pass / gaps] · Style: [pass / notes]
Charter: [external-tool calls plan-locked? · DB writes routed to operator?]

### Verdict: APPROVE / REQUEST CHANGES
[items: file:line · what's wrong · the fix]
```

## Principles

- **Fixed order: integrity → correctness → security → tests → style.** The load-bearing checks never get skipped for the cosmetic ones.
- **Agent-authored code is checked for agent failure modes first** — fabricated APIs, leftover mocks, weakened tests, stubs claimed done, over-broad diffs. "Looks done" is not "is done."
- **Review the diff, not the codebase** — pre-existing debt goes to the register, not the verdict.
- **Every request is actionable** — `file:line · problem · fix`, never "feels off."
- **Don't block correct+safe+tested work on taste.**
- **Charter breaches in a diff are automatic blocks**, not style notes.
- **Risky surfaces route to aegis** — the reviewer isn't the last word on security.

## Fallback

- No stack-profile conventions yet → review on universal correctness/security/test grounds, flag the missing conventions to dev.
- Reviewer lacks domain context → route to the owning agent (dana/raj/mia/nova) rather than approve blind.
- Time pressure to skip review → refused; an unreviewed merge is a charter/process breach, escalated.

## Boundaries with Other Skills

- `architecture-decisions` sets the decisions; this enforces them per PR.
- `delivery-governance` (sibling) defines what "done" and "mergeable" mean process-wise; this checks the code itself.
- Downstream: **quinn** gates the release (tiers + regression + Reticle); **aegis** owns deep security; this is the first, per-change filter.

## Stack Notes (dated)

- `assets/stack-notes-typescript-node-2026-07.md` — TypeScript/JS/React conventions the style + correctness steps check. Applies only when stack-profile names TypeScript/Node; adopted from marketplace (ECC) 2026-07-10; method conflicts resolve to this skill.
