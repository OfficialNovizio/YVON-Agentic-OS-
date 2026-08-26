---
name: incident-triage-data
type: custom
status: built from scratch
assigned_agent: anomaly (Data & Analytics / Anomaly Detection)
portable: true
date_added: 2026-07-29
tier: 3
description: "Investigates a fired data-anomaly alert. Descriptive-first Tukey EDA on the affected metric window · upstream dataset check via query/dataset-lineage · pipeline-health cross-check via dana · triage verdict + assignee. Distinct from cortex (security) and warden (system risk)."
triggers:
  - triage this alert
  - investigate anomaly
  - why did X spike
  - data alert investigation
  - is this a real anomaly
  - false-positive triage
---

# Incident Triage — Data

## Introduction
Built 2026-07-29 as anomaly's investigator. Distinct from `cortex` (security incident) and `warden` (system risk) — this skill investigates data-anomaly alerts specifically.

## Purpose
Given a fired alert, run structured investigation → verdict → assignee.

Verdicts: **real anomaly** (assign) · **false positive** (tune rule) · **known event** (annotate + suppress this instance) · **data-quality issue** (route to `dana`).

## When to Use
- Alert fires and needs investigation before routing further.
- Manual: "why did X spike" · "is this real" · "triage this alert".

## Structure / Protocol
```
1. CONTEXT   pull alert + rule + metric + affected window
2. DESCRIBE  Tukey 5-number summary on window + wider baseline
3. UPSTREAM  dataset-lineage → check pipeline health via dana
4. KNOWN     check known-events log (deploys, campaigns, holidays)
5. VERDICT   real / false-positive / known / data-quality
6. HANDOFF   per verdict
```

## Instructions
### Step 4: Known events
Cross-reference operator-declared known-events log — product launches, marketing pushes, deploys, holidays, external events. If the anomaly aligns with a known event, annotate + suppress this instance (not the rule).

### Step 5: Verdicts

| Verdict | Action |
|---|---|
| real anomaly | Assign per rule.route_to; escalate per severity |
| false-positive | Route back to `anomaly-detection-rules` for tuning |
| known event | Annotate the anomaly log; suppress this fire only |
| data-quality | Route to `dana` (Engineering) for pipeline check |

## Output Format
Investigation memo: alert · context · descriptive stats · upstream check · known-events check · verdict · assignee + rationale.

## Principles
- **Descriptive before conclusion** (Tukey via insight identity).
- **Every verdict has a rationale.**
- **Known-event suppression is per-instance**, never per-rule.
- **False-positive routes to rule tuning**, not silent dismissal.
- **Data-quality is dana's**, not anomaly's fix.

## Fallback
| Failure | Response |
|---|---|
| Upstream unreachable | Partial investigation; flag |
| Ambiguous verdict | Escalate to insight (dept leader) |

## Boundaries
- `anomaly-detection-rules` (this agent) — supplies fired alerts + rule config.
- `alert-routing` (this agent) — routes final verdict.
- `insight/ad-hoc-analysis` (D&A) — deeper analysis if verdict = real anomaly.
- `dataset-lineage` (D&A/query) — upstream check.
- `dana` (Engineering) — data-quality remediation.
- `cortex` (Cybersecurity) — security-incident version of triage (not this).
- Shared OS: `verification-before-completion`.

## Tool declaration
| Skill | Required | Optional | Source line |
|---|---|---|---|
| incident-triage-data | File read (alert log · lineage · known-events) · Historical data query | File write (investigation memo) | All steps |
