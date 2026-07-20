---
name: gate-bypass-detection
type: custom
status: built from scratch (catalog protocol expanded per 2026-07-07 build)
based_on_catalog_entry: vyon-gate-bypass-detection (VYON_Skills_Catalog_Full_v2.html, sentinel/Governance) — renamed gate-bypass-detection, genericized off "vyon-" prefix; the original's "process fix via flux" (an Ops agent not yet built) replaced with a configured process-owner route
assigned_agent: sentinel (Governance / Compliance Monitor)
portable: true — gate criteria come from board's own config and documents; scan scope and process-owner are config
date_added: 2026-07-07
---

## Introduction

gate-bypass-detection audits for the governance failure no gate can catch by itself: decisions that met the gate criteria but never hit the gate. It scans executed actions — spend, commitments, strategic moves — against board's own gating criteria, flags any qualifying action with no matching gate ruling in the decision log, triggers a retroactive review with root-cause analysis, and, when bypasses form a pattern, routes a process fix to the configured process owner.

## Purpose

A gate's integrity is measured by what goes around it. One bypass is an accident; a pattern is a process defect (unclear criteria, inconvenient process, or an intentional workaround) — and all three answers demand different fixes. This skill closes the loop: every qualifying action either has a ruling, gets a retroactive one, or exposes why the gate was avoidable.

## When to Use

Triggers: "was this gated," "bypass check," "did this go through board," or on the configured recurring cadence (`bypass_scan_cadence`), typically aligned to sweep or monthly financial close, when executed actions become visible.

Not for: reviewing the *content* of outputs against the constitution (constitution-watch), or ruling on the surfaced decision (board's gate, retroactively).

## Structure / Protocol

```
Load gate criteria (from board's config + documents: spend gate, commitment/veto scope, constitutional articles)
  -> Scan executed actions in scope (spend records, signed commitments, strategic moves)
    -> Match each qualifying action against the decision log: was there a ruling?
      -> Match found → verified, count it
      -> No match → BYPASS: trigger retroactive review at board + root cause
        -> Pattern (repeat actor/type/route) → process-fix proposal to the configured process owner
          -> Log everything per audit-trail-design practices
```

## Instructions

### Phase 1 — Load the Criteria

Gate criteria are board's, not sentinel's: the spend approval gate (annualized basis, from board-config), the locked commitments' scope tests, the constitution's articles, and the escalation multiple. If board's thresholds/documents are unset, say so — bypass detection can only be as defined as the gate itself — and scan against whatever subset exists.

### Phase 2 — Scan

Scan executed actions in the configured scope (`bypass_scan_scope`: ledgers/spend records, contract/commitment stores, decision announcements) for the period. For each action, test: *would this have qualified for a gate?* Only qualifying actions proceed; the rest are out of jurisdiction, not silently cleared — the report states scope and criteria used.

### Phase 3 — Match Against the Decision Log

For each qualifying action, look for its ruling in the shared decision log (precedent's schema makes this a search by scope/topic/date). Outcomes:

- **VERIFIED** — a ruling exists and covers this action. Counted, not itemized.
- **PARTIAL** — a ruling exists but the executed action materially exceeds it (approved $8K, spent $15K; approved a pilot, signed a multi-year). Treated as a bypass of the difference.
- **BYPASS** — qualifying action, no ruling.

### Phase 4 — Retroactive Review and Root Cause

Every BYPASS/PARTIAL goes to board for a **retroactive review** — the same gate sequence, run late; its ruling is logged like any other (and if the retroactive ruling is REJECT/VIOLATION, the operator decides remediation — sentinel doesn't unwind actions). Alongside, sentinel runs root cause, distinguishing honestly:

- **Criteria gap** — the actor plausibly didn't know it qualified (unclear threshold, novel action type) → fix the criteria's clarity.
- **Process friction** — the gate was known but slow/painful enough to route around → fix the process.
- **Intentional workaround** — known and avoided → escalate to the operator as a conduct finding, not a process finding.

### Phase 5 — Pattern → Process Fix

Repeat bypasses (same actor, action type, or route) trigger a process-fix proposal routed to the configured `process_owner_contact` (the operator directly until set): what keeps leaking, the root-cause class, and a concrete change (criteria clarification, threshold adjustment via board-config, or gate-process simplification). Fix proposals are recommendations; adopting them is the owner's call.

### Phase 6 — Log

Scan scope, verified counts, bypasses, retroactive outcomes, root causes, and fix proposals — all logged per audit-trail-design's schema, append-only.

## Output Format

```
## Gate Bypass Scan: [period / scope]

**Criteria loaded:** [gate/commitments/articles versions] · **Actions scanned:** [N, qualifying: n]

| Action | Qualified because | Ruling found? | Class | Root cause |
|---|---|---|---|---|
[PARTIAL and BYPASS itemized; VERIFIED as count]

### Retroactive Reviews Triggered
[Item → routed to board → outcome when available]

### Patterns & Process-Fix Proposals
[Repeat findings → proposed fix → routed to process owner]

### Logged
[Audit-trail event IDs]
```

## Principles

- **The gate's integrity is measured by what goes around it.** Verified counts matter as much as bypasses — coverage is the metric.
- **Retroactive review, not retroactive punishment.** The bypassed decision gets the same gate it should have gotten; remediation and conduct are the operator's.
- **Root cause before blame.** Criteria gap, friction, and workaround are different failures with different fixes — misclassifying friction as misconduct teaches people to hide better.
- **Exceeding an approval is a bypass of the difference.** PARTIAL is not a technicality.
- **Patterns route to process, not just to files.** A logged pattern nobody owns fixing is surveillance, not governance.
- **Sentinel detects; it doesn't rule or unwind.** Board rules retroactively; the operator remediates.

## Fallback

- Gate criteria largely unset (board-config unfilled) → scan against what exists, and lead the report with the criteria gap itself as the top finding.
- Action records unavailable/incomplete → state coverage honestly; unscanned is never verified.
- Decision log missing/unsearchable → every qualifying action is unmatchable; report that the bottleneck is the log, not the actors.
- Disputed qualification ("this didn't need a gate") → the dispute goes to board with both readings; sentinel doesn't arbitrate its own jurisdiction.

## Boundaries with Other sentinel Skills

- `constitution-watch` reads output *content* against articles; this skill reads executed *actions* against gate criteria. Watch hands suspected ungated decisions here; this skill hands content concerns back.
- `audit-trail-design` defines the trail this skill both consumes (action records, decision log) and writes to.
- Boundary with board/precedent: gate criteria and rulings are theirs; sentinel only detects absences and mismatches. Retroactive rulings are board's and get logged by precedent like any ruling.
