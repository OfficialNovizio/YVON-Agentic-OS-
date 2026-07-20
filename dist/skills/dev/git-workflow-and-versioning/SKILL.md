---
name: git-workflow-and-versioning
agent: dev
department: Engineering
version: 1.1.0
tier: 2
description: |
  Git is your safety net. (yvon)
triggers:
  - git workflow and versioning
allowed-tools:
  - <FILL_IN: not listed in dev-tool-requirements.md>
owns-paths: []   # filled per work item from the active TASK-SPEC
identity: pragmatic-architect-werner-vogels
provenance:
  source_file: Teams/Engineering/dev/marketplace/git-workflow-and-versioning/SKILL.md
  source_hash: a068e6dcabda9f187fed63321b8bf6e7e49eddb511770d040d05af47a2c1990d
  generated: 2026-07-20T03:20:22.657Z
  generator: cli/skillgen.js
portable: true
---
<!-- AUTO-GENERATED from Teams/Engineering/dev/marketplace/git-workflow-and-versioning/SKILL.md — DO NOT EDIT.
     Edit the source in Teams/, then regenerate: node cli/skillgen.js dev -->

## Preamble (run first)

```bash
# ── T1+: scope announcement (§0.3, mechanical) + invocation log ──
# Failure-tolerant by design: every line degrades with || true, never blocks.
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "OPERATING AS: dev — Engineering · skill: git-workflow-and-versioning"
echo "REPO_ROOT: $_ROOT"
_BRANCH=$(git -C "$_ROOT" branch --show-current 2>/dev/null || echo unknown)
echo "BRANCH: $_BRANCH"
mkdir -p "$_ROOT/store/telemetry" 2>/dev/null || true
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dev\",\"skill\":\"git-workflow-and-versioning\",\"branch\":\"$_BRANCH\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```

**Ground rules in force (Playbook §0 — these outrank speed):**

- Present What / Why (with sources) / How, then WAIT for sign-off before producing any artifact (§0.1).
- One artifact at a time; hard stop after each. Batch approval ≠ batch building (§0.2).
- Genericize: no venture, company, or product names in anything you produce (§0.4).
- Never invent a value. Ask, or emit an explicit `<FILL_IN: what is missing>` (§0.5).
- Triple-counter verify silently before every response: source check, logic check, consistency check (§0.6).
- **Confusion protocol:** on high-stakes ambiguity (architecture, data model, destructive scope, missing context) — STOP, name it in one sentence, present 2–3 options with trade-offs, and wait. Not for routine or obvious calls.

## When to invoke this skill

Always. Every code change flows through git.

## Purpose

Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation. With AI agents generating code at high speed, disciplined version control is the mechanism that keeps changes manageable, reviewable, and reversible.

## Protocol

# Git Workflow and Versioning

## Overview

Git is your safety net. Treat commits as save points, branches as sandboxes, and history as documentation. With AI agents generating code at high speed, disciplined version control is the mechanism that keeps changes manageable, reviewable, and reversible.

## When to Use

Always. Every code change flows through git.

## Core Principles

### Trunk-Based Development (Recommended)

Keep `main` always deployable. Work in short-lived feature branches that merge back within 1-3 days. Long-lived development branches are hidden costs — they diverge, create merge conflicts, and delay integration. DORA research consistently shows trunk-based development correlates with high-performing engineering teams.

```
main ──●──●──●──●──●──●──●──●──●──  (always deployable)
        ╲      ╱  ╲    ╱
         ●──●─╱    ●──╱    ← short-lived feature branches (1-3 days)
```

This is the recommended default. Teams using gitflow or long-lived branches can adapt the principles (atomic commits, small changes, descriptive messages) to their branching model — the commit discipline matters more than the specific branching strategy.

- **Dev branches are costs.** Every day a branch lives, it accumulates merge risk.
- **Release branches are acceptable.** When you need to stabilize a release while main moves forward.
- **Feature flags > long branches.** Prefer deploying incomplete work behind flags rather than keeping it on a branch for weeks.

### 1. Commit Early, Commit Often

Each successful increment gets its own commit. Don't accumulate large uncommitted changes.

```
Work pattern:
  Implement slice → Test → Verify → Commit → Next slice

Not this:
  Implement everything → Hope it works → Giant commit
```

Commits are save points. If the next change breaks something, you can revert to the last known-good state instantly.

### 2. Atomic Commits

Each commit does one logical thing:

```
# Good: Each commit is self-contained
a1b2c3d Add task creation endpoint with validation
d4e5f6g Add task creation form component
h7i8j9k Connect form to API and add loading state
m1n2o3p Add task creation tests (unit + integration)

# Bad: Everything mixed together
x1y2z3a Add task feature, fix sidebar, update deps, refactor utils
```

### 3. Descriptive Messages

Commit messages explain the *why*, not just the *what*.

**Format:**
```
<type>: <short description>

<optional body explaining why, not what>
```

**Types:** `feat` (new feature) · `fix` (bug fix) · `refactor` (neither fixes nor adds) · `test` (tests) · `docs` (documentation) · `chore` (tooling, dependencies, config)

```
# Good: Explains intent
feat: add email validation to registration endpoint

Prevents invalid email formats from reaching the database.
Uses schema validation at the route handler level,
consistent with existing validation patterns.

# Bad: Describes what's obvious from the diff
update auth file
```

### 4. Keep Concerns Separate

Don't combine formatting changes with behavior changes. Don't combine refactors with features. Each type of change is a separate commit — and ideally a separate PR:

```
# Good: Separate concerns
refactor: extract validation logic to shared utility
feat: add phone number validation to registration

# Bad: Mixed concerns
refactor validation and add phone number field
```

Small cleanups (renaming a variable) can be included in a feature commit at reviewer discretion.

### 5. Size Your Changes

Target ~100 lines per commit/PR. Changes over ~1000 lines should be split (splitting strategies: see `code-review-standards`).

```
~100 lines  → Easy to review, easy to revert
~300 lines  → Acceptable for a single logical change
~1000 lines → Split into smaller changes
```

## Branching Strategy

> Branch *policy* (which branches exist, protection rules, who merges) is owned by `delivery-governance` — this section supplies the mechanics.

```
main (always deployable)
  ├── feature/task-creation    ← One feature per branch
  ├── feature/user-settings    ← Parallel work
  └── fix/duplicate-tasks      ← Bug fixes
```

- Branch from `main` (or the team's default branch); merge within 1-3 days; delete after merge.
- Naming: `feature/<desc>` · `fix/<desc>` · `chore/<desc>` · `refactor/<desc>`.
- Prefer feature flags over long-lived branches for incomplete features.

## Working with Worktrees

For parallel agent work, use git worktrees to run multiple branches simultaneously:

```bash
git worktree add ../project-feature-a feature/task-creation
git worktree add ../project-feature-b feature/user-settings
# ... each worktree is a separate directory with its own branch
git worktree remove ../project-feature-a   # when done
```

Benefits: multiple agents work in parallel without interfering; no branch switching; a failed experiment is just a deleted worktree; changes stay isolated until explicitly merged.

## The Save Point Pattern

```
Agent starts work
    ├── Makes a change
    │   ├── Test passes? → Commit → Continue
    │   └── Test fails?  → Revert to last commit → Investigate
    └── Feature complete → All commits form a clean history
```

You never lose more than one increment. If an agent goes off the rails, `git reset --hard HEAD` returns to the last successful state.

## Change Summaries

After any modification, provide a structured summary:

```
CHANGES MADE:
- <file>: <what and why>

THINGS I DIDN'T TOUCH (intentionally):
- <file>: <related gap, out of scope — separate task>

POTENTIAL CONCERNS:
- <assumption or trade-off the reviewer should confirm>
```

The "DIDN'T TOUCH" section is especially important — it shows scope discipline, and it maps directly to code-review-standards' over-broad-diff check.

## Pre-Commit Hygiene

Before every commit: (1) review the staged diff, (2) scan it for secrets (`password|secret|api_key|token`), (3) run tests, (4) run the linter, (5) run type checks. The concrete commands (`npm test`, `eslint`, `tsc --noEmit`, hook tooling like husky/lint-staged) are **stack examples — bind the real ones via `stack-profile`**. Automate with git hooks where the stack supports it.

## Handling Generated Files

- **Commit generated files** only if the project expects them (lockfiles, committed migrations).
- **Don't commit** build output, environment files (`.env*`), or personal IDE config.
- **Have a `.gitignore`** covering dependencies, build dirs, env files, and keys from day one.

## Using Git for Debugging

```bash
git bisect start && git bisect bad HEAD && git bisect good <known-good>   # find the breaking commit
git log --oneline -20 · git diff HEAD~5..HEAD -- <path>                   # what changed recently
git blame <file>                                                          # who last changed a line
git log --grep="<keyword>" --oneline                                      # search messages
```

## Release & Versioning

Commits are how *you* track change; a **version** is how your *consumers* track it. Once anything depends on your code, a version number and changelog are the contract answering "what am I running, and is it safe to upgrade?"

### Semantic Versioning

`MAJOR.MINOR.PATCH`: **MAJOR** = breaking (consumers must change code) · **MINOR** = new, backward-compatible · **PATCH** = fix, backward-compatible.

The number is a promise. A "patch" that changes behavior consumers relied on is a major in disguise (Hyrum's Law — see raj's `api-standards`). When unsure whether a change is breaking, assume it is.

### Tag the release; the tag is the source of truth

```bash
git tag -a v1.4.0 -m "Release 1.4.0" && git push origin v1.4.0
```

Derive the version from the tag rather than hand-editing scattered files, so artifact, tag, and changelog can never disagree.

### Keep a changelog written for humans

A changelog is not `git log`. Group by `Added / Changed / Fixed / Deprecated / Removed / Security`, newest on top, phrased by user impact. Write the entry **in the same change that makes the change** — not reconstructed at release time. Breaking changes get a migration note and deprecation window (data-shape migrations: dana's `migration-discipline`); shipping the release is ops's `release-discipline` — this section is the versioning contract that feeds it.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| "I'll commit when the feature is done" | One giant commit is impossible to review, debug, or revert. Commit each slice. |
| "The message doesn't matter" | Messages are documentation for future agents and humans. |
| "I'll squash it all later" | Squashing destroys the development narrative. |
| "Branches add overhead" | Short-lived branches are free; long-lived ones are the problem. |
| "I'll split this change later" | Split before submitting, not after. |
| "I don't need a .gitignore" | Until `.env` with production secrets gets committed. |
| "It's just a small fix, bump the patch" | Check what consumers can observe. Behavior change = major, whatever the diff size. |
| "The changelog is just the commit log" | Commits are for you; the changelog is curated for consumers. |
| "We'll write the changelog at release time" | By then half the impact is forgotten. Write it with the change. |

## Red Flags

Large uncommitted changes · messages like "fix"/"update"/"misc" · formatting mixed with behavior · no `.gitignore` · committed secrets/build artifacts · long-lived divergent branches · force-pushing shared branches · breaking change under a minor/patch bump · untagged release or hand-edited version drift · changelog that's dumped commit messages.

## Verification

Per commit: one logical thing · message explains why, follows types · tests pass first · no secrets in diff · no mixed formatting/behavior · `.gitignore` covers exclusions.
Per release: bump matches the change · tagged, version derived from tag · curated changelog entry grouped by impact.

## Boundaries with other skills

- **delivery-governance (dev):** owns branch *policy*, DoD, and the Rail 1 execution-plan artifact; this skill supplies commit/branch/release *mechanics*. Conflict → delivery-governance wins.
- **code-review-standards (dev):** consumes atomic commits + change summaries; over-broad diffs flagged there trace back to violations here.
- **stack-profile (dev):** binds all tooling examples (test/lint/typecheck commands, hook tooling) per business.
- **api-standards (raj):** breaking-change judgment for API surfaces (Hyrum's Law) lives there.
- **migration-discipline (dana):** versioned data-shape changes and reversibility (Rail 3) live there.
- **release-discipline (ops):** consumes the tag + changelog contract; owns deploy/rollback.
- **Security Charter:** senior to this skill; commits/pushes by agents follow Rails 1–2 (plan-locked, sandboxed).

## Boundaries & handoffs

- **git-workflow-and-versioning → all build agents + ops**: commit/branch/release mechanics every code change follows; branch *policy* conflicts resolve to delivery-governance; the tag+changelog contract feeds ops's release-discipline; tooling examples bind via stack-profile.
"Should we use X / why did we choose Y" → architecture-decisions. "What are we built with" → stack-profile. "Review this / mergeable?" → code-review-standards. "Is this done" → delivery-governance. "How do I commit/branch/version/release this" → git-workflow-and-versioning. Ambiguous → decide, document, or done-check?

## Voice

Active identity: pragmatic-architect-werner-vogels — see `identity/pragmatic-architect-werner-vogels.md`.

## Completion (run last)

```bash
# ── Completion: verification + outcome telemetry (feeds anneal) ──
# 1) Before claiming done, route through Teams/Shared OS/skills/verification-before-completion/
# 2) Set _OUTCOME honestly, then run. partial/blocked are respectable answers; false "done" is not.
_OUTCOME="${_OUTCOME:-done}"   # done | partial | blocked
_ROOT=$(pwd); while [ "$_ROOT" != "/" ] && [ ! -d "$_ROOT/Teams" ]; do _ROOT=$(dirname "$_ROOT"); done
echo "{\"ts\":\"$(date -u +%FT%TZ)\",\"agent\":\"dev\",\"skill\":\"git-workflow-and-versioning\",\"event\":\"complete\",\"outcome\":\"$_OUTCOME\"}" >> "$_ROOT/store/telemetry/skill-invocations.jsonl" 2>/dev/null || true
```
