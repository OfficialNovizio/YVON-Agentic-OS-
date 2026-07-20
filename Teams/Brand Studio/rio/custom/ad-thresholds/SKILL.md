---
name: ad-thresholds
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 Brand Studio v3 build)
based_on_catalog_entry: vyon-ad-thresholds (VYON_Skills_Catalog_Full_v2.html, rio/Brand Studio) — renamed ad-thresholds, genericized per rules 0.4b/0.5: the original's hardcoded rules ("below floor 3 days → kill; above 2x → +20%; >$1K/day → escalate L2") become operator-set config values, cited here only as suggestion shapes
assigned_agent: rio (Brand Studio / Ads)
portable: true — every threshold is per-business config; nothing defaulted or invented
date_added: 2026-07-07
---

## Introduction

ad-thresholds is rio's spend-guardrail engine: every active campaign is checked on cadence against the operator's configured rules — daily caps, ROAS floors, kill criteria, scaling rules — with deterministic verdicts (HOLD / KILL-recommend / SCALE-recommend / ESCALATE) and every recommendation carrying its numbers. It is fiduciary-guard's fast-loop sibling: board gates the *budget*; this skill patrols how it burns, day by day.

## Purpose

Paid ads fail through unattended arithmetic: a campaign three days under its ROAS floor bleeding quietly, a winner starved because nobody scaled it, a "small" daily raise compounding past what anyone approved. The guardrails make each of those a triggered event instead of a month-end discovery — at whatever thresholds fit the business (a $20/day local shop and a $2K/day venture run the same engine).

## When to Use

Triggers: "scale this ad," "kill threshold," "how are the campaigns doing against the rules," or on the configured check cadence (typically daily while campaigns run).

## Structure / Protocol

```
Load the rules (config: caps, floors, kill/scale criteria, escalation lines — never defaulted)
  -> Pull current campaign metrics (ad-platform connector or operator export; as-of dated)
    -> Check each campaign against each applicable rule
      -> Verdicts: WITHIN RULES / KILL-recommend (criteria met, numbers shown)
         / SCALE-recommend (criteria met; increment per config) / ESCALATE
         (spend-change or total-spend lines → operator, and board's fiduciary gate
          where its approval-gate applies)
        -> Log every verdict + the operator's call; attribution caveats attached
```

## Instructions

### Phase 1 — Load Rules

From rio's config: `daily_cap`, `roas_floor` (+ the consecutive-days window that triggers kill), `scale_rule` (what "winning" means + the increment), `spend_change_escalation_line`, `attribution_basis` (which ROAS counts — click-through vs view-through, per the retargeting skill's honesty note). **Any unset rule → that check reports NOT CONFIGURED, never a made-up threshold** — same law as fiduciary-guard.

### Phase 2 — Check

Per campaign: spend vs cap; ROAS (on the configured attribution basis) vs floor, tracked across the consecutive-days window; scale criteria; learning-phase protection (per the ad-platform playbook — don't thrash a campaign the platform is still calibrating).

### Phase 3 — Verdicts

- **KILL-recommend** — floor breached for the configured window. Numbers shown; the operator decides (config may authorize auto-pause for small spends — an explicit grant, never assumed).
- **SCALE-recommend** — win criteria met; the increment per config, never improvised. Repeated scaling that crosses the escalation line goes up even mid-streak.
- **ESCALATE** — any single-day spend change or cumulative spend crossing the configured lines routes to the operator, and through board's fiduciary gate where the budget's approval scope is exceeded (an ad campaign is a spend like any other).

### Phase 4 — Log and Learn

Every verdict and the operator's call logs (append-only). Kill/scale outcomes feed kai's channel analysis; creative fatigue signals route to pixel/pulse for refresh; the ROAS caveat rides every report: **platform-reported ROAS is the platform grading its own homework** — incrementality and view-through inflation per the retargeting skill's gotchas, and kai's independent numbers are the reconciliation point.

## Output Format

```
## Guardrail Check: [date] — [brand]

| Campaign | Spend/day (cap) | ROAS basis: [config] (floor) | Days under | Verdict |
|---|---|---|---|---|

### Recommendations
[Per KILL/SCALE/ESCALATE: the rule, the numbers, the action, who decides]

### Caveats
[Attribution basis; platform-reported figures pending kai reconciliation]
Logged: [refs]
```

## Principles

- **No configured rule, no check — never a default.** Thresholds are the operator's risk appetite (fiduciary-guard's law, daily edition).
- **Recommend; the operator decides.** Auto-pause only by explicit config grant, for small spends.
- **Scaling rules are rules.** The increment is config; "it's crushing, double it" is an escalation, not a reflex.
- **Platform ROAS is flagged as self-graded.** Kai reconciles; incrementality caveats ride along.
- **Learning phases are protected.** Thrashing calibrating campaigns is a known own-goal (playbook layer).
- **Every verdict logs, both ways.** Overrides included — precedent's discipline.

## Fallback

- No connector → operator exports on cadence; checks run on supplied numbers, as-of dated.
- Rules unset → NOT CONFIGURED per check + a proposal session using the catalog's shapes as discussion starters (never silent defaults).
- Metrics gap (platform outage, attribution break) → verdicts suspend for affected campaigns, stated; never guessed.

## Boundaries with Other Skills

- **board's fiduciary-guard** gates the budget envelope; this skill patrols within it; crossing the envelope goes back through board.
- `sales-retargeting` (sibling) owns strategy/segmentation; `ad-platform-mechanics` (sibling) owns the volatile platform layer this skill's learning-phase and attribution notes cite.
- **pulse** hands the proven-organic shortlist (the best creative candidates); **pixel** produces ad creative (spark-gated); **kai** owns independent measurement and reconciliation; **nate** owns experiments (a new channel test is nate's until it's a standing campaign).
