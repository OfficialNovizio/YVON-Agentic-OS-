---
name: continuous-attack-loop
type: custom
status: built 2026-07-09 (Fable build)
based_on_catalog_entry: none — new; plan §3 "continuous-attack-loop" and §4's "cypher attacks continuously (in-sandbox, in-scope)"
marketplace_search: 2026-07-09 — the defending-code harness's outer-loop scanning cadence (README §4) is the closest reference and is credited; kept custom because the loop here is a standing adversary bound to caged-scope + quinn intake, not a scan pipeline
assigned_agent: cypher (Engineering / Adversary / Red Team)
portable: true — the cadence is config; targets come from the signed scope
includes: assets/attack-loop-log-template.md
date_added: 2026-07-09
---

## Introduction

continuous-attack-loop is what makes cypher a *standing* red team rather than a one-off pentest: it runs attack-playbooks against in-scope targets on a cadence, tracks what's been tested and what held, prioritizes by aegis's threat model and by recent change, and re-attacks patched findings to confirm they stay closed. The surface is never assumed safe because it passed once — it's under continuous, caged pressure.

## Purpose

Security decays: new code adds surface, patched holes reopen, dependencies rot, and an attacker only needs to be right once. A point-in-time pentest is stale the next deploy. A continuous loop keeps the department's actual security posture measured, not assumed — every deploy quinn passes and ops ships becomes cypher's next target, in the cage.

## When to Use

Triggers: scheduled cadence (config), a new release shipped (ops handoff — fresh surface), a new threat model or threat raised (aegis), a finding patched (re-attack to confirm closure), and "what's our current attack posture."

## Structure / Protocol

```
LOOP (cadence per config; every iteration gated by caged-scope)
  -> PRIORITIZE targets: recent changes (new surface) > high threat-model rank >
     previously-breached classes > untested surface
    -> RUN attack-playbooks against the top targets, in-sandbox
      -> TRACK in the loop log: target · class · held/breached · date (self-annealing coverage map)
        -> BREACH → findings-report → quinn → aegis → fix
          -> RE-ATTACK patched findings (verified-patching check 4): still closed? confirm or reopen
            -> FEED aegis: breached-but-unmodeled classes are threat-model gaps
```

## Instructions

1. **Every iteration passes caged-scope.** The loop does not get a standing exemption — each run re-checks the signed scope, because scope can change and the cage is checked first, always.
2. **Prioritize by change and by model.** Freshly shipped surface is the highest priority (it's never been attacked); then high threat-model rank; then classes that have breached before (they're fertile); then untested surface for coverage. Don't re-run the same easy target every cycle while new code goes untested.
3. **Track coverage honestly.** The loop log records what was attacked, by which class, and whether it held — a living map of "what have we actually tested." Untested surface is visible, not hidden; "we've never attacked the payment flow" is a finding in itself.
4. **Re-attack every patch.** When aegis's verified-patching closes a finding, its fourth check ("can't re-break") IS a cypher re-attack through this loop. A patched class that reopens is a high-severity finding and evidence the fix was cosmetic (feeds ops's recurrence-is-design-pressure rule).
5. **Feed the threat model.** A class that breaches but isn't in aegis's threat model is a modeling gap — routed to aegis to close. Offense and defense co-evolve: cypher's breaches make aegis's model truer.
6. **Cadence is operator-set.** How often the loop runs, and how aggressively, is config (rule 0.5) — cypher proposes, the operator adopts. A continuous adversary running unthrottled is itself a cost/availability risk (the L10 class it tests).

## Output Format

```
## Attack Loop: cycle [n] — [date range]
caged-scope: PASS · Targets prioritized: [by change/model/history/coverage]
Runs: [target · class · held/BREACHED]
Breaches → findings: [ids → quinn]
Re-attacks: [patched finding · still-closed/REOPENED]
Coverage: [surface tested this cycle / untested-and-visible]
Threat-model gaps found: [→ aegis]
```

## Principles

- **Caged every iteration** — no standing exemption; the scope is re-checked each cycle.
- **Prioritize fresh surface** — new code is unattacked code; it goes first.
- **Coverage is tracked and honest** — untested surface is visible, not assumed safe.
- **Every patch gets re-attacked** — closure is confirmed by a real adversary, not asserted.
- **Breaches feed the model** — offense makes defense truer; unmodeled breaches are aegis's gaps.
- **Cadence is operator-set** — an unthrottled adversary is itself a risk (L10).

## Fallback

- No cadence configured → run once to establish a coverage baseline, propose a cadence (labeled reasoning-based), schedule nothing silently.
- Scope shrinks mid-cycle → in-flight attacks on now-out-of-scope targets halt immediately (caged-scope re-check); partial results filed as-is.
- Loop would exceed a cost/rate limit → throttle and flag (it's testing L10 unbounded-consumption, not committing it); the operator sets the ceiling.

## Boundaries with Other Skills

- **caged-scope** (sibling) gates every iteration; the loop has no exemption.
- **attack-playbooks** (sibling) supplies the techniques each cycle runs.
- **findings-report** (sibling) routes breaches to quinn.
- **aegis/verified-patching**: the loop IS the "can't re-break" check-4 mechanism; re-attacks confirm or reopen closures.
- **aegis/threat-model**: breaches feed model gaps back.
- **ops**: new releases trigger a loop run; reopened patches feed ops's recurrence-is-design-pressure escalation to dev.
- **quinn/regression-map**: held/breached history parallels quinn's fragility map; a reopened class is a regression-map recurrence.
