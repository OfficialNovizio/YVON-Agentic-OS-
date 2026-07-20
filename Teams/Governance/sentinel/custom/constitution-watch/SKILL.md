---
name: constitution-watch
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 build)
based_on_catalog_entry: vyon-constitution-watch (VYON_Skills_Catalog_Full_v2.html, sentinel/Governance) — renamed constitution-watch, genericized off "vyon-" prefix; the original's "L3 escalate" level-code replaced with an explicit freeze-and-escalate protocol routed per config
assigned_agent: sentinel (Governance / Compliance Monitor)
portable: true — violation patterns derive from each business's own constitution; sampling cadence and escalation contacts are config
date_added: 2026-07-07
---

## Introduction

constitution-watch is the proactive half of constitutional enforcement: where board's constitution-enforcement rules on decisions *submitted* to the gate, this skill continuously samples the outputs and actions of all agents for constitutional boundary approaches — catching drift and violations in work that never asked for review. Warnings for near-boundary behavior; freeze-and-escalate for clear violations.

## Purpose

A constitution only enforced at the gate protects only gated decisions. Most of what agents do daily — drafts, recommendations, communications, spend-adjacent actions — never passes through board, and constitutional erosion happens exactly there: each output slightly closer to the line, none reviewed. This skill is the smoke detector: cheap, always on, and loud early rather than precise late.

## When to Use

Triggers: "compliance sweep," "constitution check on recent work," or — primarily — on the configured recurring cadence (continuous/daily by design; in practice, per `sweep_cadence` in sentinel's config, or the operator's scheduled runs until automation exists).

Not for: ruling on a submitted decision (board's constitution-enforcement), or auditing whether decisions skipped the gate (gate-bypass-detection).

## Structure / Protocol

```
Load the constitution + derive violation patterns (per article, from its operational test)
  -> Sample recent agent outputs/actions per the configured cadence and scope
    -> Classify each sampled item: CLEAR / NEAR-BOUNDARY / VIOLATION
      -> NEAR-BOUNDARY → warn the producing agent's operator context + log
      -> VIOLATION → freeze recommendation + immediate escalation to board & operator
        -> Log everything to the audit trail (per audit-trail-design practices)
```

## Instructions

### Phase 1 — Derive Patterns

From the constitution (same configured path as board): for each article, derive observable violation patterns from its operational test — what would an output *look like* if it approached or crossed this article? Patterns are documented per article and re-derived whenever the constitution changes version. No constitution → stop, same as board's skill: nothing to watch for.

### Phase 2 — Sample

Sample recent outputs/actions across agents per `sweep_cadence` and `sweep_scope` (which output stores/logs to read — config). Sampling, not total review: breadth and regularity over depth. Record what was sampled so coverage gaps are visible.

### Phase 3 — Classify

- **CLEAR** — no article approached. Logged in aggregate (counts, not content).
- **NEAR-BOUNDARY** — approaches an article's line without crossing (e.g., a draft commitment just under a categorical limit, language edging toward a banned representation). Judgment call, made conservatively: when unsure between CLEAR and NEAR-BOUNDARY, choose NEAR-BOUNDARY.
- **VIOLATION** — an article's operational test is met by the sampled item. When unsure between NEAR-BOUNDARY and VIOLATION, classify NEAR-BOUNDARY *and* escalate the ambiguity to board — sentinel warns cheaply, but a violation call triggers freezes and must be right.

### Phase 4 — Act

- **NEAR-BOUNDARY** → a warning to the producing agent's context and the operator: article quoted, the approaching element named, no action forced. Warnings are logged; three warnings on the same article/agent pattern escalate to board as a drift finding.
- **VIOLATION** → **freeze recommendation**: the affected output/action should not proceed or propagate until board rules. Sentinel cannot technically freeze anything itself — it issues the freeze recommendation to the operator (who can actually stop things) and simultaneously escalates to board's constitution-enforcement for a formal ruling. Escalation is immediate, not batched into the next sweep report.

### Phase 5 — Log and Report

Every sweep produces a report (sampled scope, counts by class, warnings issued, escalations); every warning and escalation is an audit-trail event per audit-trail-design's schema (who/what/when/basis, append-only). Sweep reports over time are the drift curve — trending near-boundary counts are the early signal even when nothing ever crosses.

## Output Format

```
## Constitution Sweep: [date / cadence window]

**Constitution version:** [loaded] · **Scope sampled:** [stores/agents, N items]

| Class | Count | Items (near-boundary and violations only) |
|---|---|---|
| CLEAR | n | — (aggregate only) |
| NEAR-BOUNDARY | n | [item → article approached → warning issued] |
| VIOLATION | n | [item → article → freeze recommended + escalated] |

### Drift Notes
[Repeat-warning patterns; trend vs prior sweeps]

### Logged
[Audit-trail event IDs]
```

## Principles

- **Proactive, not gated.** This skill exists for the work that never asks permission.
- **Warn cheaply, escalate carefully.** NEAR-BOUNDARY is deliberately easy to trigger; VIOLATION triggers freezes and must meet the article's actual test.
- **Sentinel recommends freezes; it freezes nothing.** The operator holds the stop button; board holds the ruling.
- **Sample honestly.** Coverage is recorded; a sweep that only samples the easy stores is a false comfort.
- **Trends are findings.** Rising near-boundary counts get reported even when no single item crosses.
- **No constitution, no watch.** Same as board: patterns derive from written articles, never from inferred values.

## Fallback

- No constitution → stop; note that both enforcement *and* watch are dormant until the operator writes one.
- Sweep scope unset → sweep whatever the operator hands over per-run, and flag the config gap — partial watch beats none, stated as partial.
- Ambiguous classification → conservative class + escalate the ambiguity (Phase 3 rule).
- Output stores unreadable at sweep time → report the coverage gap explicitly; never mark unsampled as CLEAR.

## Boundaries with Other sentinel Skills

- `audit-trail-design` defines the logging practices this skill's events follow; this skill is a producer of audit events, not a designer of trails.
- `gate-bypass-detection` audits *decisions that skipped the gate*; this skill watches *content of outputs* against articles. A sampled item that looks like an ungated qualifying decision gets handed to gate-bypass-detection.
- Boundary with board: sentinel detects and escalates; board rules (constitution-enforcement). Sentinel never issues PASS/VIOLATION rulings — its "VIOLATION" classification is an escalation trigger, and board's formal ruling supersedes it.
