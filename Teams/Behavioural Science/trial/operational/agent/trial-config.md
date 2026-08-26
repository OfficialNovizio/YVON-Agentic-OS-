---
agent: trial
department: Behavioural Science
type: config
required_by: [custom/behavioural-experiment-design/SKILL.md, custom/field-experiments/SKILL.md, custom/behavioural-audit-lit/SKILL.md]
last_updated: 2026-07-29
---

# trial · config

## Who's using this
| Field | Value |
|---|---|
| Role | `<FILL_IN>` |
| Ethics-review contact | `<FILL_IN — bias>` |

## Ethics + consent
| Field | Value |
|---|---|
| Consent template | `<FILL_IN>` |
| Adverse-event threshold | `<FILL_IN>` |
| Data retention | `<FILL_IN>` |

## Sample sizing
References `Shared OS/logical/sample_size.py`.

## Escalation
| Level | Threshold | Approver |
|---|---|---|
| L1 | Routine design / lit review | trial |
| L2 | Field deployment · adverse event within pre-set threshold | `<FILL_IN — bias>` |
| L3 | Adverse-event stopping-rule triggered · ethics-fail · vulnerable-population issue | `Governance/board` |
