---
name: release-discipline
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none in catalog (production ownership was the catalog's #1 gap per ENGINEERING-REDESIGN-PLAN §1) — new, per plan §3
marketplace_search: 2026-07-09 mcpmarket.com / skillsmp.com — candidates found (Deploy Strategies & Rollback; Deployment Rollback Manager). Kept custom for department integration (quinn's gate as precondition, plan-lock, Rail 3 on migrations); adopted with credit: blue-green / canary / rolling strategy patterns
assigned_agent: ops (Engineering / DevOps & Reliability)
portable: true — the discipline is host-agnostic; the actual deploy mechanics live in platform-playbooks per the business's stack-profile
includes: assets/deploy-checklist.md
date_added: 2026-07-09
---

## Introduction

release-discipline is ops's shipping law: **no deploy without a tested rollback.** Every release enters production through a fixed checklist — quinn's GATE PASS in hand, rollback path exercised *before* the deploy, deploy executed via the strategy the playbook prescribes, health verified after, and a clean abort path at every step. The rollback is tested first because a rollback that has never run is a hope, not a path.

## Purpose

The operator's stated goal is "maintain everything without breaking stuff" — and production is where breakage becomes real. Most production disasters aren't bad code; they're bad *shipping*: no rollback, no health check, a migration run mid-deploy by an agent, a Friday-evening push nobody watched. This skill makes shipping boring, reversible, and observed.

## When to Use

Triggers: "deploy," "ship it," "release to production," "rollback," "canary," "is it safe to deploy," post-GATE-PASS handoff from quinn, and any hotfix (which follows the same discipline, faster — never a different one).

## Structure / Protocol

```
Release candidate arrives
  -> PRECONDITIONS: quinn GATE PASS (quality) + no open rail violation (security) — both, always
    -> ROLLBACK FIRST: identify the rollback path (previous artifact / migration down-script /
       flag-off) and EXERCISE it in staging — a documented-but-untested rollback fails this step
      -> Rail 3 check: any DB migration in this release → dana's prepared script, OPERATOR runs it,
         sequenced explicitly (expand-migrate-contract; deploy never auto-runs destructive migrations)
        -> DEPLOY per playbook strategy (blue-green / canary / rolling — credited patterns; which one,
           per platform-playbook + change risk)
          -> VERIFY: health checks green · monitoring baselines steady (maintenance-hygiene's numbers)
             · smoke of critical flows
            -> HOLD the watch window (config) → done
            -> Any verify step fails → ROLL BACK NOW, then diagnose (incident-response if user-facing)
```

## Instructions

1. **Both verdicts, no exceptions.** quinn's GATE PASS and a clean charter state are preconditions — a deploy is an external tool call sequence, so it runs under a locked plan (Rail 1) like everything else. The deploy plan lists its steps; an off-plan action mid-deploy halts.
2. **Exercise the rollback before deploying.** In staging: roll the previous version back in, confirm it serves, confirm data compatibility (schema N-1 tolerance for expand-contract). Record the evidence in the checklist. "We have a rollback script" without a run is a FAIL.
3. **Migrations are sequenced, operator-run.** Expand-migrate-contract: additive schema changes ship first (operator runs dana's script), code that tolerates both schemas deploys, contraction comes later — so every deploy stays independently rollback-able. An agent-executed destructive migration is a Rail 3 breach, top severity.
4. **Pick the strategy by risk, per playbook.** Blue-green for swap-and-verify, canary for gradual user-facing risk, rolling for stateless routine (patterns credited to marketplace; the business's actual mechanics live in its platform-playbook). The choice is recorded on the checklist, not improvised.
5. **Verify, then watch.** Health endpoints, error rates and latency against maintenance-hygiene's baselines, smoke of the operator's critical flows. Then hold the watch window (`deploy_watch_window`, config) before calling it done — most regressions surface in the first window, not the first minute.
6. **Roll back first, diagnose second.** When verification fails, restoring service beats understanding the failure. Roll back, then open incident-response if users were affected; the post-mortem finds the why.
7. **Hotfixes follow the same discipline.** The matrix's hotfix row (quinn) covers reduced pre-ship tiers; nothing reduces the rollback requirement or the verify steps. Speed comes from the checklist being short, not from skipping it.

## Output Format

```
## Deploy Record: [release] — [date]
Preconditions: quinn GATE PASS [ref] · charter clean ✓ · locked plan [plan id]
Rollback: path [artifact/script/flag] · exercised in staging ✓ [evidence]
Migrations: [none / dana script ref → operator-run ✓, sequenced]
Strategy: [blue-green/canary/rolling] per [playbook §] · Deployed: [time]
Verify: health ✓ · baselines ✓ · smoke ✓ · watch window [duration] → CLOSED / ROLLED BACK [reason]
```

## Principles

- **No deploy without a tested rollback** — untested rollback = no rollback.
- **Both gates precede every ship** — quality (quinn) and security (charter), independently.
- **Deploys run under locked plans** — an off-plan step mid-deploy halts, same as any agent.
- **Migrations are operator-run and sequenced** — expand-migrate-contract; deploys never auto-run destructive DB changes (Rail 3).
- **Roll back first, diagnose second** — service restoration outranks root-causing in the moment.
- **Hotfix = same checklist, faster** — never a different discipline.

## Fallback

- No staging environment → the rollback is exercised against a production-shaped local/ephemeral environment, labeled as such; the gap is flagged to the operator as infrastructure debt.
- Rollback genuinely impossible for a change (rare: irreversible data transform) → the change requires explicit operator sign-off *before* deploy, a written recovery plan in place of the rollback, and a tech-debt/risk entry — never a silent exception.
- No playbook yet for the business's host → deploy manually WITH the checklist, method-only, and start the playbook from what was learned (platform-playbooks sibling).

## Boundaries with Other Skills

- **quinn/test-strategy** decides *whether* it ships (GATE PASS); this skill decides *how* it ships safely.
- **incident-response** (sibling) takes over when a deploy (or anything else) hurts users; this skill's rollback is often its first action.
- **maintenance-hygiene** (sibling) owns the monitoring baselines this skill verifies against.
- **platform-playbooks** (sibling) holds the dated, host-specific mechanics (commands, consoles, pipelines) — this skill is the invariant discipline over them.
- **dev/delivery-governance**: "rollback-ready" in the definition of done is this skill's requirement surfacing upstream.
- **dana** (when built) authors migration scripts; the operator executes them (Rail 3).
