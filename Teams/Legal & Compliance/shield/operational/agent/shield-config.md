---
agent: shield
department: Legal & Compliance
type: config
purpose: >
  Insurance table, escalation matrix, response-deadline alert thresholds, review
  cadence, litigation-hold policy, work-product header. Read by dispute-log for
  jurisdiction scope, deadline thresholds, insurance notification requirements,
  and exposure escalation triggers.
required_by:
  - custom/dispute-log/SKILL.md
last_updated: 2026-07-29
---

# shield · config

> Fill each `<FILL_IN>` with a real value or `n/a — <reason>`. Section headings are contract with `dispute-log` — do not rename.

## Who's using this

| Field | Value |
|---|---|
| Role of operator | `<FILL_IN — lawyer / paralegal / non-lawyer>` |
| Litigation-department head | `<FILL_IN>` |
| General Counsel | `<FILL_IN>` |

## Jurisdictions in scope

| Jurisdiction | Notes |
|---|---|
| `<FILL_IN — e.g., US-federal>` | `<FILL_IN>` |
| `<FILL_IN — e.g., US-CA>` | `<FILL_IN>` |

No hardcoded jurisdiction (§0.4b).

## Insurance policies

| Policy type | Carrier | Policy number | Coverage limit | Notice-required within | Retention |
|---|---|---|---|---|---|
| D&O | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN — e.g., 60 days>` | `<FILL_IN>` |
| E&O / Professional | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |
| Cyber | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |
| Employment Practices Liability | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |
| Commercial General Liability | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |

Any active dispute that potentially triggers coverage but has `insurance_notified: no` is a defect flagged on every attestation.

## External counsel panel

| Practice area | Firm | Rate range | Matter-approval threshold |
|---|---|---|---|
| Commercial litigation | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN — e.g., $10K matter-cap without further approval>` |
| Employment litigation | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |
| IP litigation | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |
| Regulatory / enforcement | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |
| Insurance-coverage | `<FILL_IN>` | `<FILL_IN>` | `<FILL_IN>` |

## Escalation matrix

| Level | Threshold | Approver | Notes |
|---|---|---|---|
| L1 | Log-only · routine update | shield itself | No external sign-off |
| L2 | New dispute · exposure > `<FILL_IN $X>` · settlement discussion · counsel engagement | `<FILL_IN — GC or role>` | Business-unit or GC review |
| L3 | Exposure > `<FILL_IN $Y>` OR class-action OR regulatory-enforcement OR any dispute-type in "always-L3" list below OR any overdue response deadline OR pattern of ≥ 3 overdues in a quarter | `Governance/board` | Fixed |

## Always-L3 dispute types

Auto-escalate to `Governance/board` regardless of exposure:

- class-action / mass-arbitration
- regulatory-enforcement (SEC / FTC / state AG / non-US equivalent)
- criminal investigation (of the company or an officer)
- injunctive-relief sought (preliminary or permanent)
- IP litigation with ≥ `<FILL_IN>` exposure or seeking injunction against product
- employment class or PAGA-style representative action

Add or remove per operator's risk posture.

## Response-deadline alert thresholds

| Tier | Days-to-deadline |
|---|---|
| 🔴 Overdue | past 0 |
| 🟠 Critical | ≤ 7 |
| 🟡 Warning | ≤ 14 |
| 🟢 Informational | ≤ 30 |

Cadence for the deadline-review scheduled task: `<FILL_IN — daily recommended>`.

## Review cadence

| Cycle | Cadence |
|---|---|
| Dispute-portfolio attestation (Step 4) | `<FILL_IN — quarterly>` |
| Exposure re-estimation (rerun case-assessment) | `<FILL_IN — every 90 days per dispute>` |
| Insurance-notification audit | `<FILL_IN — at every quarterly review>` |

## Litigation-hold policy

| Field | Value |
|---|---|
| Standard trigger | `<FILL_IN — e.g., "receipt of demand letter or reasonable anticipation of litigation">` |
| Hold-notice template | `<FILL_IN — path or slug>` |
| Retention duration for closed disputes | `<FILL_IN — e.g., "7 years post-final judgment / settlement">` |
| Data preservation scope | `<FILL_IN — e.g., "email, Slack, Drive, custom database records, backups">` |

## House style

| Field | Value |
|---|---|
| Work-product header (default) | `<FILL_IN — e.g., "PRIVILEGED AND CONFIDENTIAL — ATTORNEY WORK PRODUCT — PREPARED IN ANTICIPATION OF LITIGATION">` |
| Privilege circle (default distribution) | `<FILL_IN>` |
| Preferred citation style | `<FILL_IN — e.g., Bluebook>` |
| Exposure notation format | `<FILL_IN — e.g., "USD, low-mid-high range">` |

## Config debt summary

| Section | Fields |
|---|---|
| Who's using this | 3 |
| Jurisdictions in scope | ≥1 required |
| Insurance policies | 5 policies × 5 fields |
| External counsel panel | 5 × 4 fields |
| Escalation matrix | 3 fields |
| Always-L3 list | 1 optional customisation |
| Response-deadline cadence | 1 |
| Review cadence | 3 |
| Litigation-hold policy | 4 |
| House style | 4 |

All `<FILL_IN>` announced per §14.7.
